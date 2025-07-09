import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchStudentProfile,
  updateStudentProfile,
  clearProfile,
} from "@/redux/features/studentProfile/studentProfile";

interface StudentProfileData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  profileImage?: string;
  profilePictureUrl?: string;
}

export const useStudentProfile = () => {
  const dispatch = useAppDispatch();
  const { profileData, status, error } = useAppSelector(
    (state) => state.studentProfile
  );

  const loadProfile = () => {
    dispatch(fetchStudentProfile());
  };

  const updateProfile = (profileData: StudentProfileData | FormData) => {
    dispatch(updateStudentProfile(profileData));
  };

  const clearProfileData = () => {
    dispatch(clearProfile());
  };

  return {
    profileData,
    status,
    error,
    loadProfile,
    updateProfile,
    clearProfileData,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches profile on mount
export const useAutoStudentProfile = () => {
  const dispatch = useAppDispatch();
  const { profileData, status, error } = useAppSelector(
    (state) => state.studentProfile
  );

  useEffect(() => {
    dispatch(fetchStudentProfile());

    return () => {
      dispatch(clearProfile());
    };
  }, [dispatch]);

  return {
    profileData,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
