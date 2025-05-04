import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuthToken } from "@/src/utils/auth";

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();

  useEffect(() => {
    const token = getAuthToken();

    if (requireAuth && !token) {
      router.push("/auth/login");
    } else if (!requireAuth && token) {
      router.push("/");
    }
  }, [router, requireAuth]);

  return {
    isAuthenticated: !!getAuthToken(),
  };
};
