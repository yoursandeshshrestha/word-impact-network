import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { api } from "@/lib/api";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  vimeoId: string;
  embedUrl: string;
  duration: number; // in seconds
  orderIndex: number;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

interface VideosState {
  videos: Video[];
  video: Video | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  message: string;
  uploadProgress: number;
  isUploading: boolean;
  shouldCloseModal: boolean;
  shouldCloseDeleteModal: boolean;
}

interface AddVideoPayload {
  message: string;
  data: Video;
}

const initialState: VideosState = {
  videos: [],
  video: null,
  loading: false,
  error: null,
  success: false,
  message: "",
  uploadProgress: 0,
  isUploading: false,
  shouldCloseModal: false,
  shouldCloseDeleteModal: false,
};

// Add video to chapter
export const addVideo = createAsyncThunk<
  AddVideoPayload,
  { chapterId: string; videoData: FormData }
>(
  "videos/addVideo",
  async (
    { chapterId, videoData },
    { rejectWithValue, dispatch }
  ): Promise<AddVideoPayload | ReturnType<typeof rejectWithValue>> => {
    try {
      // Set isUploading to true
      dispatch(setIsUploading(true));

      const response = await api.upload<Video>(
        `/chapters/${chapterId}/videos`,
        videoData
      );

      // Reset upload progress and isUploading once done
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));

      if (!response.data) {
        throw new Error("Failed to upload video");
      }

      // Transform the response to match AddVideoPayload structure
      return {
        message: response.message,
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Error uploading video:", error);
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));

      // Handle authentication errors specifically
      if (error instanceof Error) {
        if (
          error.message.includes("Authentication failed") ||
          error.message.includes("401")
        ) {
          return rejectWithValue(
            "Your session has expired. Please refresh the page and try uploading again."
          );
        }
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Failed to upload video");
    }
  }
);

// Add video to chapter with Vimeo ID (for direct-to-Vimeo uploads)
export const addVideoWithVimeo = createAsyncThunk<
  AddVideoPayload,
  { chapterId: string; videoData: FormData }
>(
  "videos/addVideoWithVimeo",
  async (
    { chapterId, videoData },
    { rejectWithValue }
  ): Promise<AddVideoPayload | ReturnType<typeof rejectWithValue>> => {
    try {
      // Convert FormData to JSON object
      const jsonData = {
        title: videoData.get("title"),
        description: videoData.get("description"),
        orderIndex: videoData.get("orderIndex"),
        duration: videoData.get("duration"),
        vimeoId: videoData.get("vimeoId"),
      };

      const response = await api.post<Video>(
        `/chapters/${chapterId}/videos/vimeo`,
        jsonData
      );

      if (!response.data) {
        throw new Error("Failed to add video with Vimeo");
      }

      // Transform the response to match AddVideoPayload structure
      return {
        message: response.message,
        data: response.data,
      };
    } catch (error: unknown) {
      console.error("Error adding video with Vimeo:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to add video"
      );
    }
  }
);

// Get all videos for a chapter
export const getVideosByChapter = createAsyncThunk(
  "videos/getVideosByChapter",
  async (chapterId: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Video[]>(`/chapters/${chapterId}/videos`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching videos:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch videos"
      );
    }
  }
);

// Get video by ID
export const getVideoById = createAsyncThunk(
  "videos/getVideoById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Video>(`/videos/${id}`);
      return response;
    } catch (error: unknown) {
      console.error("Error fetching video:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch video"
      );
    }
  }
);

// Update video
export const updateVideo = createAsyncThunk(
  "videos/updateVideo",
  async (
    { id, videoData }: { id: string; videoData: FormData | Partial<Video> },
    { rejectWithValue, dispatch }
  ) => {
    try {
      let response;

      // Check if videoData is FormData (for file uploads) or plain object
      if (videoData instanceof FormData) {
        // Set isUploading to true
        dispatch(setIsUploading(true));

        response = await api.uploadWithMethod<Video>(
          `/videos/${id}`,
          videoData,
          "PUT"
        );

        // Reset upload progress and isUploading once done
        dispatch(setUploadProgress(0));
        dispatch(setIsUploading(false));
      } else {
        // For regular JSON data updates
        response = await api.put<Video>(`/videos/${id}`, videoData);
      }

      return response;
    } catch (error: unknown) {
      console.error("Error updating video:", error);
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));

      // Handle authentication errors specifically
      if (error instanceof Error) {
        if (
          error.message.includes("Authentication failed") ||
          error.message.includes("401")
        ) {
          return rejectWithValue(
            "Your session has expired. Please refresh the page and try updating again."
          );
        }
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Failed to update video");
    }
  }
);

// Delete video
export const deleteVideo = createAsyncThunk(
  "videos/deleteVideo",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete<{ id: string }>(`/videos/${id}`);
      return response;
    } catch (error: unknown) {
      console.error("Error deleting video:", error);
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete video"
      );
    }
  }
);

const videosSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    resetVideoStatus: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
      state.loading = false;
      state.isUploading = false;
      state.uploadProgress = 0;
      state.shouldCloseModal = false;
      state.shouldCloseDeleteModal = false;
    },
    resetVideoStatusOnly: (state) => {
      state.error = null;
      state.success = false;
      state.message = "";
      state.loading = false;
      state.isUploading = false;
      state.uploadProgress = 0;
    },
    setVideo: (state, action: PayloadAction<Video | null>) => {
      state.video = action.payload;
    },
    clearVideos: (state) => {
      state.videos = [];
    },
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload;
    },
    setIsUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
    setShouldCloseModal: (state, action: PayloadAction<boolean>) => {
      state.shouldCloseModal = action.payload;
    },
    setShouldCloseDeleteModal: (state, action: PayloadAction<boolean>) => {
      state.shouldCloseDeleteModal = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add video
      .addCase(addVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addVideo.fulfilled,
        (state, action: PayloadAction<AddVideoPayload>) => {
          console.log("addVideo fulfilled:", action.payload);
          state.loading = false;
          state.success = true;
          state.message = action.payload?.message || "";
          state.shouldCloseModal = true;
          if (action.payload?.data) {
            state.videos.push(action.payload.data);
            console.log(
              "Video added to state, total videos:",
              state.videos.length
            );
          }
        }
      )
      .addCase(addVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.shouldCloseModal = false;
      })
      // Add video with Vimeo
      .addCase(addVideoWithVimeo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addVideoWithVimeo.fulfilled,
        (state, action: PayloadAction<AddVideoPayload>) => {
          console.log("addVideoWithVimeo fulfilled:", action.payload);
          state.loading = false;
          state.success = true;
          state.message = action.payload?.message || "";
          state.shouldCloseModal = true;
          if (action.payload?.data) {
            state.videos.push(action.payload.data);
            console.log(
              "Video added to state, total videos:",
              state.videos.length
            );
          }
        }
      )
      .addCase(addVideoWithVimeo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.shouldCloseModal = false;
      })
      // Get videos by chapter
      .addCase(getVideosByChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideosByChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.data || [];
      })
      .addCase(getVideosByChapter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get video by ID
      .addCase(getVideoById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideoById.fulfilled, (state, action) => {
        state.loading = false;
        state.video = action.payload.data || null;
      })
      .addCase(getVideoById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update video
      .addCase(updateVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.shouldCloseModal = true;
        if (action.payload.data) {
          state.videos = state.videos.map((video) =>
            video.id === action.payload.data?.id ? action.payload.data : video
          );
          state.video = action.payload.data;
        }
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.shouldCloseModal = false;
      })
      // Delete video
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message || "";
        state.shouldCloseDeleteModal = true;
        if (action.payload.data?.id) {
          state.videos = state.videos.filter(
            (video) => video.id !== action.payload.data?.id
          );
        }
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.shouldCloseDeleteModal = false;
      });
  },
});

// Selectors
export const selectVideos = (state: RootState) => state.videos.videos;
export const selectVideo = (state: RootState) => state.videos.video;
export const selectVideosLoading = (state: RootState) => state.videos.loading;
export const selectVideosError = (state: RootState) => state.videos.error;
export const selectVideosSuccess = (state: RootState) => state.videos.success;
export const selectVideosMessage = (state: RootState) => state.videos.message;
export const selectUploadProgress = (state: RootState) =>
  state.videos.uploadProgress;
export const selectIsUploading = (state: RootState) => state.videos.isUploading;
export const selectShouldCloseModal = (state: RootState) =>
  state.videos.shouldCloseModal;
export const selectShouldCloseDeleteModal = (state: RootState) =>
  state.videos.shouldCloseDeleteModal;

export const {
  resetVideoStatus,
  resetVideoStatusOnly,
  setVideo,
  clearVideos,
  setUploadProgress,
  setIsUploading,
  setShouldCloseModal,
  setShouldCloseDeleteModal,
} = videosSlice.actions;

export default videosSlice.reducer;
