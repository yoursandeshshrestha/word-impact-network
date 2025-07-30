import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated, AuthService } from "@/utils/auth";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

export const useAuth = (requireAuth: boolean = true) => {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = await isAuthenticated();
        setAuthStatus(authenticated);

        if (authenticated) {
          // Fetch user data if authenticated
          const userData = await AuthService.getCurrentUser();
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              fullName: userData.fullName,
              role: userData.role,
            });
          }
        }

        if (requireAuth && !authenticated) {
          router.push("/auth/login");
        } else if (!requireAuth && authenticated) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("useAuth: Error checking authentication", error);
        setAuthStatus(false);
        if (requireAuth) {
          router.push("/auth/login");
        }
      }
    };

    checkAuth();
  }, [router, requireAuth]);

  return {
    isAuthenticated: authStatus,
    user,
  };
};
