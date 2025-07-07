import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

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
  vimeoId: string;
  vimeoUrl: string;
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
  videoId: string;
  watchedPercent: number;
  isCompleted: boolean;
  nextVideoUnlocked: boolean;
  nextVideo?: {
    id: string;
    title: string;
    orderIndex: number;
  };
  chapterProgress: {
    videosCompleted: number;
    totalVideos: number;
    allVideosCompleted: boolean;
    examUnlocked: boolean;
  };
  shouldUpdateUI: boolean;
  milestones: {
    justCompleted: boolean;
    chapterCompleted: boolean;
  };
}

interface ChapterDetailState {
  chapterDetail: ChapterDetailData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}/videos/${videoId}/heartbeat`,
        {
          method: "POST",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentTime,
            duration,
            watchedPercent,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to track video progress";
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return {
        ...data.data,
        videoId, // Include videoId in response for state updates
      } as VideoProgressResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to track video progress";
      return rejectWithValue(errorMessage);
    }
  }
);

export const markVideoAsCompleted = createAsyncThunk(
  "chapterDetail/markVideoAsCompleted",
  async (
    {
      videoId,
      videoTitle,
    }: {
      videoId: string;
      videoTitle?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/student/videos/${videoId}/progress`,
        {
          method: "POST",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            watchedPercent: 100,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to mark video as completed";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      toast.success(
        `"${
          videoTitle || "Video"
        }" marked as completed! 🎉 Next video is now unlocked.`
      );
      return {
        videoId,
        watchedPercent: 100,
        isCompleted: true,
        ...data.data,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark video as completed";
      toast.error(errorMessage);
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
      const response = await fetch(
        `${BASE_URL}/mylearning/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "GET",
          credentials: "include", // This will automatically send cookies
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch chapter details";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else if (response.status === 404) {
          toast.error("Chapter not found.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as ChapterDetailData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch chapter details";
      toast.error(errorMessage);
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
        if (action.payload?.shouldUpdateUI && state.chapterDetail) {
          const videoIndex = state.chapterDetail.videos.findIndex(
            (video) => video.id === action.payload.videoId
          );
          if (videoIndex !== -1) {
            // Update current video progress
            state.chapterDetail.videos[videoIndex].progress = {
              watchedPercent: action.payload.watchedPercent,
              isCompleted: action.payload.isCompleted,
            };

            // Update overall chapter progress from backend response
            if (action.payload.chapterProgress) {
              state.chapterDetail.progress.videosCompleted =
                action.payload.chapterProgress.videosCompleted || 0;
              state.chapterDetail.progress.totalVideos =
                action.payload.chapterProgress.totalVideos || 0;
              state.chapterDetail.progress.allVideosCompleted =
                action.payload.chapterProgress.allVideosCompleted || false;
              state.chapterDetail.progress.canTakeExam =
                action.payload.chapterProgress.examUnlocked || false;

              // Update exam lock status
              if (state.chapterDetail.exam) {
                state.chapterDetail.exam.isLocked =
                  !action.payload.chapterProgress.examUnlocked;
              }
            }

            // Update next video lock status if applicable
            if (action.payload.nextVideoUnlocked && action.payload.nextVideo) {
              const nextVideoIndex = state.chapterDetail.videos.findIndex(
                (video) => video.id === action.payload.nextVideo!.id
              );
              if (nextVideoIndex !== -1) {
                state.chapterDetail.videos[nextVideoIndex].isLocked = false;
              }
            }

            // Log milestone achievements
            if (action.payload.milestones?.justCompleted) {
              console.log(
                `🎉 Video "${state.chapterDetail.videos[videoIndex].title}" completed!`
              );
            }
            if (action.payload.milestones?.chapterCompleted) {
              console.log(
                `🎊 Chapter "${state.chapterDetail.chapter.title}" completed!`
              );
            }
          }
        }
      })
      .addCase(markVideoAsCompleted.pending, () => {
        // Optional: Add loading state for manual completion
      })
      .addCase(markVideoAsCompleted.fulfilled, (state, action) => {
        // Update video progress in state
        if (state.chapterDetail) {
          const videoIndex = state.chapterDetail.videos.findIndex(
            (video) => video.id === action.payload.videoId
          );
          if (videoIndex !== -1) {
            // Update current video progress
            state.chapterDetail.videos[videoIndex].progress = {
              watchedPercent: 100,
              isCompleted: true,
            };

            // Update overall chapter progress
            const completedVideos = state.chapterDetail.videos.filter(
              (video) => video.progress.isCompleted
            ).length;
            state.chapterDetail.progress.videosCompleted = completedVideos;
            state.chapterDetail.progress.allVideosCompleted =
              completedVideos === state.chapterDetail.progress.totalVideos;

            // Update exam lock status if all videos are completed
            if (
              state.chapterDetail.exam &&
              state.chapterDetail.progress.allVideosCompleted
            ) {
              state.chapterDetail.exam.isLocked = false;
              state.chapterDetail.progress.canTakeExam = true;
            }

            // Update next video lock status if applicable
            const currentVideo = state.chapterDetail.videos[videoIndex];
            const nextVideoIndex = state.chapterDetail.videos.findIndex(
              (video) => video.orderIndex === currentVideo.orderIndex + 1
            );
            if (nextVideoIndex !== -1) {
              state.chapterDetail.videos[nextVideoIndex].isLocked = false;
            }

            console.log(
              `🎉 Video "${state.chapterDetail.videos[videoIndex].title}" manually marked as completed!`
            );
          }
        }
      })
      .addCase(markVideoAsCompleted.rejected, (state, action) => {
        // Handle error state if needed
        console.error("Failed to mark video as completed:", action.payload);
      });
  },
});

export const { clearChapterDetail, updateVideoProgress } =
  chapterDetailSlice.actions;
export default chapterDetailSlice.reducer;
