"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getCurrentUser } from "@/common/services/auth";
import { setUser, setHydrated } from "@/redux/features/userSlice";

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Load user data from cookies on app start
    const user = getCurrentUser();
    dispatch(setUser(user));
    dispatch(setHydrated());
  }, [dispatch]);

  return <>{children}</>;
};
