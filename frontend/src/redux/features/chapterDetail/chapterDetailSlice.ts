import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

interface VideoProgress {
  watchedPercent: number;
  isCompleted: boolean;
}

interface Video {
  id: string;
  title: string;
  description: string;
  duration: number;
  orderIndex: number;
  backblazeUrl: string;
  isLocked: boolean;
  progress: VideoProgress;
}

interface Exam {
  id: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit: number;
  isLocked: boolean;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  courseYear: number;
  isLocked: boolean;
}

interface Course {
  id: string;
  title: string;
}

interface ChapterProgress {
  videosCompleted: number;
  totalVideos: number;
  allVideosCompleted: boolean;
  canTakeExam: boolean;
}

interface Prerequisites {
  previousChapterCompleted: boolean;
  canAccess: boolean;
}

interface ChapterDetailData {
  chapter: Chapter;
  course: Course;
  videos: Video[];
  exam: Exam;
  progress: ChapterProgress;
  prerequisites: Prerequisites;
}

interface VideoProgressResponse {
  watchedPercent: number;
  isCompleted: boolean;
  nextVideoUnlocked: boolean;
  shouldUpdateUI: boolean;
}

interface ChapterDetailState {
  chapterDetail: ChapterDetailData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const trackVideoProgress = createAsyncThunk(
  "chapterDetail/trackVideoProgress",
  async (
    {
      courseId,
      chapterId,
      videoId,
      currentTime,
      duration,
      watchedPercent,
    }: {
      courseId: string;
      chapterId: string;
      videoId: string;
      currentTime: number;
      duration: number;
      watchedPercent: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.post(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/videos/${videoId}/heartbeat`,
        {
          currentTime,
          duration,
          watchedPercent,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return {
        ...response.data.data,
        videoId, // Include videoId in response for state updates
      } as VideoProgressResponse & { videoId: string };
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to track video progress";

      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchChapterDetail = createAsyncThunk(
  "chapterDetail/fetchChapterDetail",
  async (
    { courseId, chapterId }: { courseId: string; chapterId: string },
    { rejectWithValue }
  ) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.data as ChapterDetailData;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch chapter details";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else if ((error as AxiosError).response?.status === 404) {
        toast.error("Chapter not found.");
      } else {
        toast.error(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

const chapterDetailSlice = createSlice({
  name: "chapterDetail",
  initialState: {
    chapterDetail: null,
    status: "idle",
    error: null as string | null,
  } as ChapterDetailState,
  reducers: {
    clearChapterDetail: (state) => {
      state.chapterDetail = null;
      state.error = null;
      state.status = "idle";
    },
    updateVideoProgress: (state, action) => {
      if (state.chapterDetail) {
        const { videoId, progress } = action.payload;
        const videoIndex = state.chapterDetail.videos.findIndex(
          (video) => video.id === videoId
        );
        if (videoIndex !== -1) {
          state.chapterDetail.videos[videoIndex].progress = progress;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChapterDetail.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchChapterDetail.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.chapterDetail = action.payload;
        state.error = null;
      })
      .addCase(fetchChapterDetail.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(trackVideoProgress.fulfilled, (state, action) => {
        // Update video progress in state if shouldUpdateUI is true
        if (action.payload.shouldUpdateUI && state.chapterDetail) {
          const videoIndex = state.chapterDetail.videos.findIndex(
            (video) => video.id === action.payload.videoId
          );
          if (videoIndex !== -1) {
            state.chapterDetail.videos[videoIndex].progress = {
              watchedPercent: action.payload.watchedPercent,
              isCompleted: action.payload.isCompleted,
            };

            // Update overall chapter progress
            const completedVideos = state.chapterDetail.videos.filter(
              (v) => v.progress.isCompleted
            ).length;
            state.chapterDetail.progress.videosCompleted = completedVideos;
            state.chapterDetail.progress.allVideosCompleted =
              completedVideos === state.chapterDetail.videos.length;
            state.chapterDetail.progress.canTakeExam =
              state.chapterDetail.progress.allVideosCompleted;

            // Update exam lock status
            if (state.chapterDetail.exam) {
              state.chapterDetail.exam.isLocked =
                !state.chapterDetail.progress.allVideosCompleted;
            }

            // Update next video lock status if applicable
            if (
              action.payload.nextVideoUnlocked &&
              videoIndex < state.chapterDetail.videos.length - 1
            ) {
              state.chapterDetail.videos[videoIndex + 1].isLocked = false;
            }
          }
        }
      });
  },
});

export const { clearChapterDetail, updateVideoProgress } =
  chapterDetailSlice.actions;
export default chapterDetailSlice.reducer;
