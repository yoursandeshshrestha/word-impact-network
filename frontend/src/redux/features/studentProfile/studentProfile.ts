import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface StudentProfile {
  id: string;
  email: string;
  fullName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth: string;
  phoneNumber: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface EnrolledCourse {
  id: string;
  title: string;
  description: string;
  durationYears: number;
  enrollmentDate: string;
  isActive: boolean;
  progress: {
    completedChapters: number;
    totalChapters: number;
    percentComplete: number;
  };
}

interface ExamAttempt {
  id: string;
  examTitle: string;
  score: number;
  maxScore: number;
  passed: boolean;
  attemptDate: string;
}

interface Certificate {
  id: string;
  courseTitle: string;
  issuedDate: string;
  certificateUrl: string;
}

interface RecentVideo {
  id: string;
  title: string;
  courseTitle: string;
  watchedAt: string;
  progress: number;
}

interface StudentProfileData {
  profile: StudentProfile;
  enrollments: {
    total: number;
    active: number;
    courses: EnrolledCourse[];
  };
  examAttempts: {
    total: number;
    passed: number;
    recent: ExamAttempt[];
  };
  certifications: {
    total: number;
    certificates: Certificate[];
  };
  videoProgress: {
    totalWatched: number;
    inProgress: number;
    recentlyWatched: RecentVideo[];
  };
}

interface StudentProfileState {
  profileData: StudentProfileData | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const fetchStudentProfile = createAsyncThunk(
  "studentProfile/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/student/profile`, {
        method: "GET",
        credentials: "include", // This will automatically send cookies
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || "Failed to fetch student profile";

        if (response.status === 401) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error(errorMessage);
        }

        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      return data.data as StudentProfileData;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch student profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  "studentProfile/updateStudentProfile",
  async (
    profileData: Partial<StudentProfile> | FormData,
    { rejectWithValue }
  ) => {
    try {
      let response: Response;

      if (profileData instanceof FormData) {
        // Handle FormData (for image uploads)
        response = await fetch(`${BASE_URL}/student/profile`, {
          method: "PUT",
          credentials: "include",
          body: profileData,
        });
      } else {
        // Handle regular JSON data
        response = await fetch(`${BASE_URL}/student/profile`, {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || "Failed to update profile";
        toast.error(errorMessage);
        return rejectWithValue(errorMessage);
      }

      const data = await response.json();
      toast.success("Profile updated successfully");
      return data.data as StudentProfileData;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update profile";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);



const studentProfileSlice = createSlice({
  name: "studentProfile",
  initialState: {
    profileData: null,
    status: "idle",
    error: null as string | null,
  } as StudentProfileState,
  reducers: {
    clearProfile: (state) => {
      state.profileData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })

      // Update Profile
      .addCase(updateStudentProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload as string;
      })


  },
});

export const { clearProfile } = studentProfileSlice.actions;
export default studentProfileSlice.reducer;
