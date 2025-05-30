import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  requestPasswordReset,
  completePasswordReset,
} from "./passwordResetSlice";

interface PasswordResetRequest {
  email: string;
}

interface PasswordResetComplete {
  resetId: string;
  verificationCode: string;
  newPassword: string;
}

export const usePasswordReset = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { status, error } = useAppSelector((state) => state.passwordReset);

  const handleRequestPasswordReset = async (data: PasswordResetRequest) => {
    try {
      await dispatch(requestPasswordReset(data.email)).unwrap();
      toast.success("Password reset instructions have been sent to your email");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to request password reset"
      );
      throw error;
    }
  };

  const handleCompletePasswordReset = async (data: PasswordResetComplete) => {
    try {
      await dispatch(completePasswordReset(data)).unwrap();
      toast.success("Your password has been reset successfully");
      router.push("/my-learning");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete password reset"
      );
      throw error;
    }
  };

  return {
    requestPasswordReset: handleRequestPasswordReset,
    completePasswordReset: handleCompletePasswordReset,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
