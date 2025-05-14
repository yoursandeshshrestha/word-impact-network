"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import { Upload, ArrowRight, Check } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useLoading } from "@/src/common/contexts/LoadingContext";

// Define Gender type to match Prisma schema
type Gender = "MALE" | "FEMALE" | "OTHER";

const ApplyPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    gender: "" as Gender | "",
    dateOfBirth: "",
    phoneNumber: "",
    country: "",
    academicQualification: "",
    desiredDegree: "",
    referredBy: "",
    referrerContact: "",
    agreesToTerms: false,
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(
    null
  );
  const [error, setError] = useState("");
  const { setLoading } = useLoading();

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
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

      if (type === "certificate") {
        setCertificateFile(file);
        toast.success("Certificate uploaded successfully");
      } else {
        setRecommendationFile(file);
        toast.success("Recommendation letter uploaded successfully");
      }
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-32">
      <Toaster position="top-right" expand={false} richColors closeButton />
      <Header />
      <main className="py-16 px-4">
        <div className=" mx-auto w-[1240px]">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Apply to <span className="text-blue-600">WIN</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Begin your journey with Word Impact Network. Fill out the
              application form below to start your educational journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-xl border border-gray-100"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">
                <p className="font-medium">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Personal Information Section */}
              <div className="md:col-span-2 mb-2">
                <h3 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Personal Information
                </h3>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="for example: Sandesh Shrestha"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="for example: sandeshshrestha@gmail.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="+91 8597831451"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="India"
                />
              </div>

              {/* Academic Information Section */}
              <div className="md:col-span-2 mt-4 mb-2">
                <h3 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Academic Information
                </h3>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Academic Qualification <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="academicQualification"
                  value={formData.academicQualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="10th pass, 12th pass, graduation, post graduation, etc."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Desired Course <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="desiredDegree"
                  value={formData.desiredDegree}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="what course you want to study"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
                  Academic Certificate
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
                    className={`flex items-center px-4 py-3 ${
                      certificateFile
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors`}
                  >
                    {certificateFile ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    {certificateFile
                      ? certificateFile.name
                      : "Upload Certificate (PDF/DOC, max 5MB)"}
                  </label>
                </div>
                <p className="mt-1 text-gray-500 text-sm">
                  Optional: Upload your most recent academic certificate
                </p>
              </div>

              {/* Referral Information Section */}
              <div className="md:col-span-2 mt-4 mb-2">
                <h3 className="text-xl font-semibold text-gray-800 pb-2 border-b border-gray-200">
                  Referral Information (Optional)
                </h3>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Referred By
                </label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="for example: Ps. Amitabh Ghosh "
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Referrer Contact
                </label>
                <input
                  type="text"
                  name="referrerContact"
                  value={formData.referrerContact}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:outline-none transition-all duration-200"
                  placeholder="for example: +91 8597831451"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">
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
                    className={`flex items-center px-4 py-3 ${
                      recommendationFile
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-gray-50 text-gray-700 border border-gray-200"
                    } rounded-lg cursor-pointer hover:bg-opacity-80 transition-colors`}
                  >
                    {recommendationFile ? (
                      <Check className="w-5 h-5 mr-2" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    {recommendationFile
                      ? recommendationFile.name
                      : "Upload Recommendation Letter (PDF/DOC, max 5MB)"}
                  </label>
                </div>
                <p className="mt-1 text-gray-500 text-sm">
                  Optional: Upload a recommendation letter from a teacher or
                  employer
                </p>
              </div>

              {/* Terms and Conditions */}
              <div className="md:col-span-2 mt-4">
                <label className="flex items-start space-x-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      name="agreesToTerms"
                      checked={formData.agreesToTerms}
                      onChange={handleChange}
                      required
                      className="appearance-none w-5 h-5 border border-gray-300 rounded-md checked:bg-blue-600 checked:border-blue-600 transition-colors duration-200"
                    />
                    {formData.agreesToTerms && (
                      <Check className="w-4 h-4 text-white absolute pointer-events-none" />
                    )}
                  </div>
                  <span className="text-gray-700">
                    I agree to the{" "}
                    <a href="#" className="text-blue-600 hover:underline">
                      terms and conditions
                    </a>{" "}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-center mt-6">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium flex items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 shadow-lg"
              >
                Submit Application
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplyPage;
