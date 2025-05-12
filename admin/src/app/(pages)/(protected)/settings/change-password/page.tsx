"use client";

import React from "react";
import { useAdminProfile } from "@/hooks/useAdminProfile";
import PasswordResetForm from "@/components/profile/PasswordResetForm";
import VerificationForm from "@/components/profile/VerificationForm";
import { Check } from "lucide-react";

const ChangePasswordPage: React.FC = () => {
  const {
    passwordResetStatus,
    passwordResetMessage,
    passwordVerificationNeeded,
    resetId,
    changePassword,
    verifyPassword,
  } = useAdminProfile();

  const handlePasswordReset = (oldPassword: string, newPassword: string) => {
    changePassword({
      oldPassword,
      newPassword,
    });
  };

  const handleVerification = (resetId: string, verificationCode: string) => {
    verifyPassword({
      resetId,
      verificationCode,
    });
  };

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-gray-50">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Change Password
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Update your account password
        </p>
      </div>
      <div className="px-4 py-5 sm:p-6">
        {/* Password Reset Success Message */}
        {passwordResetStatus === "success" && !passwordVerificationNeeded && (
          <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 flex items-center space-x-2 mb-6">
            <Check className="h-5 w-5 text-green-500" />
            <span>
              {passwordResetMessage || "Password updated successfully"}
            </span>
          </div>
        )}

        {/* Password Reset Form or Verification Form */}
        {passwordVerificationNeeded && resetId ? (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Verify Password Change
            </h3>
            <VerificationForm
              resetId={resetId}
              onSubmit={handleVerification}
              isLoading={passwordResetStatus === "pending"}
              errorMessage={
                passwordResetStatus === "error"
                  ? passwordResetMessage || undefined
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            {passwordResetStatus !== "success" && (
              <div>
                <PasswordResetForm
                  onSubmit={handlePasswordReset}
                  isLoading={passwordResetStatus === "pending"}
                  errorMessage={
                    passwordResetStatus === "error"
                      ? passwordResetMessage || undefined
                      : undefined
                  }
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChangePasswordPage;
