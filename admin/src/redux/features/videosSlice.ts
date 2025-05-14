import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";
import { getAuthToken } from "@/utils/auth";

export interface Video {
  id: string;
  title: string;
  description: string | null;
  backblazeUrl: string;
  duration: number; // in seconds
  orderIndex: number;
  chapterId: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string;
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
};

// Add video to chapter
export const addVideo = createAsyncThunk<
  AddVideoPayload,
  { chapterId: string; videoData: FormData }
>(
  "videos/addVideo",
  async ({ chapterId, videoData }, { rejectWithValue, dispatch }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      // Create a new XMLHttpRequest to track upload progress
      const xhr = new XMLHttpRequest();

      const promise: Promise<AddVideoPayload> = new Promise(
        (resolve, reject) => {
          xhr.open("POST", `${apiUrl}/chapters/${chapterId}/videos`);

          // Set authorization header
          xhr.setRequestHeader("Authorization", `Bearer ${getAuthToken()}`);

          // Track progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              dispatch(setUploadProgress(progress));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const responseData = JSON.parse(xhr.responseText);
              resolve({
                message: responseData.message || "Video added successfully",
                data: responseData.data,
              });
            } else {
              let errorMessage;
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMessage = errorData?.message || "Failed to upload video";
              } catch {
                errorMessage = "Failed to upload video";
              }
              reject(new Error(errorMessage));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error"));
          };

          // Send the FormData
          xhr.send(videoData);
        }
      );

      // Set isUploading to true
      dispatch(setIsUploading(true));

      const data = await promise;

      // Reset upload progress and isUploading once done
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));

      return data;
    } catch (error: unknown) {
      console.error("Error uploading video:", error);
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to upload video"
      );
    }
  }
);

// Get all videos for a chapter
export const getVideosByChapter = createAsyncThunk(
  "videos/getVideosByChapter",
  async (chapterId: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/chapters/${chapterId}/videos`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch videos");
      }

      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/videos/${id}`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to fetch video");
      }

      return data;
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      let response;

      // Check if videoData is FormData (for file uploads) or plain object
      if (videoData instanceof FormData) {
        // Create a new XMLHttpRequest to track upload progress
        const xhr = new XMLHttpRequest();

        const promise = new Promise((resolve, reject) => {
          xhr.open("PUT", `${apiUrl}/videos/${id}`);

          // Set authorization header
          xhr.setRequestHeader("Authorization", `Bearer ${getAuthToken()}`);

          // Track progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              dispatch(setUploadProgress(progress));
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(JSON.parse(xhr.responseText));
            } else {
              let errorMessage;
              try {
                const errorData = JSON.parse(xhr.responseText);
                errorMessage = errorData?.message || "Failed to update video";
              } catch {
                errorMessage = "Failed to update video";
              }
              reject(new Error(errorMessage));
            }
          };

          xhr.onerror = () => {
            reject(new Error("Network error"));
          };

          // Send the FormData
          xhr.send(videoData);
        });

        // Set isUploading to true
        dispatch(setIsUploading(true));

        response = await promise;

        // Reset upload progress and isUploading once done
        dispatch(setUploadProgress(0));
        dispatch(setIsUploading(false));
      } else {
        // For regular JSON data updates
        response = await fetch(`${apiUrl}/videos/${id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(videoData),
        }).then((res) => res.json());

        if (!response.success) {
          throw new Error(response?.message || "Failed to update video");
        }
      }

      return response;
    } catch (error: unknown) {
      console.error("Error updating video:", error);
      dispatch(setUploadProgress(0));
      dispatch(setIsUploading(false));
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update video"
      );
    }
  }
);

// Delete video
export const deleteVideo = createAsyncThunk(
  "videos/deleteVideo",
  async (id: string, { rejectWithValue }) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

      const response = await fetch(`${apiUrl}/videos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete video");
      }

      return { ...data, id };
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
          state.loading = false;
          state.success = true;
          state.message = action.payload.message;
          state.videos.push(action.payload.data);
        }
      )
      .addCase(addVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get videos by chapter
      .addCase(getVideosByChapter.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getVideosByChapter.fulfilled, (state, action) => {
        state.loading = false;
        state.videos = action.payload.data;
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
        state.video = action.payload.data;
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
        state.message = action.payload.message;
        state.videos = state.videos.map((video) =>
          video.id === action.payload.data.id ? action.payload.data : video
        );
        state.video = action.payload.data;
      })
      .addCase(updateVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete video
      .addCase(deleteVideo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteVideo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload.message;
        state.videos = state.videos.filter(
          (video) => video.id !== action.payload.id
        );
      })
      .addCase(deleteVideo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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

export const {
  resetVideoStatus,
  setVideo,
  clearVideos,
  setUploadProgress,
  setIsUploading,
} = videosSlice.actions;

export default videosSlice.reducer;
