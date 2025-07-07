"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ArrowRight,
  Check,
  ArrowLeft,
  User,
  GraduationCap,
  CheckCircle,
} from "lucide-react";
import { useLoading } from "@/common/contexts/LoadingContext";
import { toast } from "sonner";
import { useApplicationForm } from "@/hooks/useApplicationForm";
import StepProgress from "@/components/common/StepProgress";

// Define Gender type to match Prisma schema

const ApplyPage = () => {
  const router = useRouter();
  const { setLoading } = useLoading();
  const [error, setError] = useState("");

  const {
    currentStep,
    formData,
    stepData,
    certificateFile,
    recommendationFile,
    updateFormData,
    updateStepData,
    setCertificateFile,
    setRecommendationFile,
    clearSavedData,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
  } = useApplicationForm();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      updateFormData({
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "certificate" | "recommendation"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(
          `${
            type === "certificate" ? "Certificate" : "Recommendation letter"
          } file size exceeds 5MB limit`
        );
        return;
      }

      // Check file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          `Please upload a PDF or Word document for ${
            type === "certificate" ? "certificate" : "recommendation letter"
          }`
        );
        return;
      }

      // Save file metadata for persistence
      const fileData = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      };

      if (type === "certificate") {
        setCertificateFile(file);
        updateStepData({ certificateFile: fileData });
        toast.success("Certificate uploaded successfully");
      } else {
        setRecommendationFile(file);
        updateStepData({ recommendationFile: fileData });
        toast.success("Recommendation letter uploaded successfully");
      }
    }
  };

  const handleNextStep = () => {
    const isValid = validateStep(currentStep);
    if (!isValid) {
      // Show specific error messages
      switch (currentStep) {
        case 1:
          if (!formData.fullName.trim()) {
            toast.error("Full name is required");
          } else if (!formData.email.trim()) {
            toast.error("Email is required");
          } else if (!formData.gender) {
            toast.error("Gender is required");
          } else if (!formData.dateOfBirth) {
            toast.error("Date of birth is required");
          }
          break;
        case 2:
          if (!formData.phoneNumber.trim()) {
            toast.error("Phone number is required");
          } else if (!formData.country.trim()) {
            toast.error("Country is required");
          }
          break;
        case 3:
          if (!formData.academicQualification.trim()) {
            toast.error("Academic qualification is required");
          } else if (!formData.desiredDegree.trim()) {
            toast.error("Desired degree is required");
          }
          break;
        case 4:
          if (!formData.agreesToTerms) {
            toast.error("You must agree to the terms and conditions");
          }
          break;
      }
      return;
    }

    nextStep();
  };

  const handleStepClick = (step: number) => {
    // Only allow navigation to completed steps or the current step
    if (step <= currentStep || step === 1) {
      goToStep(step);
    } else {
      toast.error("Please complete the current step first");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();

      // Add required fields
      formDataToSend.append("email", formData.email);
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("country", formData.country);
      formDataToSend.append(
        "academicQualification",
        formData.academicQualification
      );
      formDataToSend.append("desiredDegree", formData.desiredDegree);
      formDataToSend.append("agreesToTerms", String(formData.agreesToTerms));

      // Add optional fields only if they have values
      if (formData.referredBy) {
        formDataToSend.append("referredBy", formData.referredBy);
      }

      if (formData.referrerContact) {
        formDataToSend.append("referrerContact", formData.referrerContact);
      }

      if (certificateFile) {
        formDataToSend.append("certificate", certificateFile);
      }

      if (recommendationFile) {
        formDataToSend.append("recommendationLetter", recommendationFile);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_API}/student/register`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit application");
      }

      // Clear saved data after successful submission
      clearSavedData();

      // Set application submitted flag in session storage
      sessionStorage.setItem("applicationSubmitted", "true");
      toast.success("Application submitted successfully!");

      // Delay navigation to allow toast to be seen
      setTimeout(() => {
        router.push("/application-submitted");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: "Personal Information", icon: User },
    { id: 2, title: "Contact Details", icon: User },
    { id: 3, title: "Academic Information", icon: GraduationCap },
    { id: 4, title: "Review & Submit", icon: CheckCircle },
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors appearance-none bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Your country of residence"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Academic Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="academicQualification"
                  value={formData.academicQualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Your highest qualification (e.g., High School, Bachelor's, Master's)"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Desired Course{" "}
                  <span className="text-red-500">
                    * (can add from listed courses)
                  </span>
                </label>
                <input
                  type="text"
                  name="desiredDegree"
                  value={formData.desiredDegree}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                  placeholder="Which course are you interested in?"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Academic Certificate (optional)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "certificate")}
                    className="hidden"
                    id="certificate"
                  />
                  <label
                    htmlFor="certificate"
                    className={`flex items-center px-4 py-2.5 ${
                      certificateFile || stepData.certificateFile
                        ? "bg-gray-100 text-gray-800 border border-gray-300"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } rounded-md cursor-pointer hover:bg-opacity-90 transition-colors text-sm w-full`}
                  >
                    {certificateFile || stepData.certificateFile ? (
                      <Check className="w-4 h-4 mr-2 text-gray-700" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2 text-gray-500" />
                    )}
                    {certificateFile
                      ? certificateFile.name
                      : stepData.certificateFile
                      ? stepData.certificateFile.name
                      : "Upload Certificate (PDF/DOC, max 5MB)"}
                  </label>
                </div>
                <p className="mt-1 text-gray-500 text-xs">
                  Optional: Upload your most recent academic certificate
                </p>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Recommendation Letter
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleFileChange(e, "recommendation")}
                    className="hidden"
                    id="recommendation"
                  />
                  <label
                    htmlFor="recommendation"
                    className={`flex items-center px-4 py-2.5 ${
                      recommendationFile || stepData.recommendationFile
                        ? "bg-gray-100 text-gray-800 border border-gray-300"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } rounded-md cursor-pointer hover:bg-opacity-90 transition-colors text-sm w-full`}
                  >
                    {recommendationFile || stepData.recommendationFile ? (
                      <Check className="w-4 h-4 mr-2 text-gray-700" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2 text-gray-500" />
                    )}
                    {recommendationFile
                      ? recommendationFile.name
                      : stepData.recommendationFile
                      ? stepData.recommendationFile.name
                      : "Upload Recommendation Letter (PDF/DOC, max 5MB)"}
                  </label>
                </div>
                <p className="mt-1 text-gray-500 text-xs">
                  Optional: Upload a recommendation letter from a teacher or
                  employer
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Referred By
                  </label>
                  <input
                    type="text"
                    name="referredBy"
                    value={formData.referredBy}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Name of person who referred you"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Referrer Contact
                  </label>
                  <input
                    type="text"
                    name="referrerContact"
                    value={formData.referrerContact}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="Referrer's phone or email"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Your Application
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Personal Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      {formData.fullName}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {formData.email}
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {formData.gender}
                    </p>
                    <p>
                      <span className="font-medium">Date of Birth:</span>{" "}
                      {formData.dateOfBirth}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Contact Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Phone:</span>{" "}
                      {formData.phoneNumber}
                    </p>
                    <p>
                      <span className="font-medium">Country:</span>{" "}
                      {formData.country}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Academic Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Qualification:</span>{" "}
                      {formData.academicQualification}
                    </p>
                    <p>
                      <span className="font-medium">Desired Course:</span>{" "}
                      {formData.desiredDegree}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Additional Information
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>
                      <span className="font-medium">Referred By:</span>{" "}
                      {formData.referredBy || "Not specified"}
                    </p>
                    <p>
                      <span className="font-medium">Certificate:</span>{" "}
                      {certificateFile || stepData.certificateFile
                        ? "Uploaded"
                        : "Not uploaded"}
                    </p>
                    <p>
                      <span className="font-medium">Recommendation:</span>{" "}
                      {recommendationFile || stepData.recommendationFile
                        ? "Uploaded"
                        : "Not uploaded"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-start space-x-2 cursor-pointer">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    name="agreesToTerms"
                    checked={formData.agreesToTerms}
                    onChange={handleChange}
                    required
                    className="appearance-none w-5 h-5 border border-gray-300 rounded checked:bg-gray-800 checked:border-gray-800 transition-colors"
                  />
                  {formData.agreesToTerms && (
                    <Check className="w-3 h-3 text-white absolute pointer-events-none" />
                  )}
                </div>
                <span className="text-gray-700 text-sm">
                  I agree to the{" "}
                  <a href="#" className="text-gray-900 hover:underline">
                    terms and conditions
                  </a>{" "}
                  <span className="text-red-500">*</span>
                </span>
              </label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white pt-32">
      <main className="py-12 px-4">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Application Form
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Complete the form below to begin your educational journey with
              Word Impact Network.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <StepProgress
              steps={steps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              clickable={true}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-6 rounded-md shadow-sm border border-gray-200"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
                {error}
              </div>
            )}

            {renderStepContent()}

            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                  currentStep === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:text-gray-900"
                }`}
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors text-sm"
                >
                  Next
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.agreesToTerms}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium flex items-center transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Application
                  <ArrowRight className="ml-2 w-4 h-4" />
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ApplyPage;
