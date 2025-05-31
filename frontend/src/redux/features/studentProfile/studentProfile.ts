import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getAuthToken } from "@/common/services/auth";

interface ErrorResponse {
  message: string;
}

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
  process.env.NEXT_PUBLIC_BACKEND_API || "http://localhost:8080/api/v1";

export const fetchStudentProfile = createAsyncThunk(
  "studentProfile/fetchStudentProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.get(`${BASE_URL}/student/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data.data as StudentProfileData;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to fetch student profile";

      if ((error as AxiosError).response?.status === 401) {
        toast.error("Session expired. Please login again.");
      } else {
        toast.error(errorMessage);
      }

      return rejectWithValue(errorMessage);
    }
  }
);

export const updateStudentProfile = createAsyncThunk(
  "studentProfile/updateStudentProfile",
  async (profileData: Partial<StudentProfile>, { rejectWithValue }) => {
    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication required");
        return rejectWithValue("No authentication token found");
      }

      const response = await axios.put(
        `${BASE_URL}/student/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Profile updated successfully");
      return response.data.data as StudentProfileData;
    } catch (error) {
      const errorMessage =
        (error as AxiosError<ErrorResponse>).response?.data?.message ||
        "Failed to update profile";

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
      });
  },
});

export const { clearProfile } = studentProfileSlice.actions;
export default studentProfileSlice.reducer;
