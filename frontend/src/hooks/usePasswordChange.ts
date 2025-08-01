import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";

export const usePasswordChange = () => {
  const [isLoading, setIsLoading] = useState(false);

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    try {
      await apiClient.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully!");
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to change password";
      toast.error(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    changePassword,
    isLoading,
  };
}; 