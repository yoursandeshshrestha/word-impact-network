"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading, setHydrated } from "@/redux/features/userSlice";
import { getCurrentUser, isAuthenticated } from "@/common/services/auth";

const UserInitializer: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check if user is authenticated
        if (isAuthenticated()) {
          dispatch(setLoading(true));

          // Fetch current user data
          const user = await getCurrentUser();

          if (user && user.fullName && user.email) {
            dispatch(setUser(user));
          } else {
            dispatch(setUser(null));
          }
        } else {
          dispatch(setUser(null));
        }
      } catch (error) {
        console.error("Failed to initialize user:", error);
        dispatch(setUser(null));
      } finally {
        dispatch(setHydrated());
      }
    };

    initializeUser();
  }, [dispatch]);

  // This component doesn't render anything
  return null;
};

export default UserInitializer;
