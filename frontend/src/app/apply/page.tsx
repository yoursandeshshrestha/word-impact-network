"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/src/components/Homepage/Header";
import Footer from "@/src/components/Homepage/Footer";
import { Upload, ArrowRight } from "lucide-react";

const ApplyPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    gender: "",
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

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
      if (type === "certificate") {
        setCertificateFile(file);
      } else {
        setRecommendationFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

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
      router.push("/application-submitted");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0eee6] pt-32">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-4">
              Apply to WIN
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Begin your journey with Word Impact Network. Fill out the
              application form below to start your educational journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-xl shadow-lg"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-gray-700 mb-2">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Academic Qualification *
                </label>
                <input
                  type="text"
                  name="academicQualification"
                  value={formData.academicQualification}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
                  Desired Degree *
                </label>
                <input
                  type="text"
                  name="desiredDegree"
                  value={formData.desiredDegree}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Referred By</label>
                <input
                  type="text"
                  name="referredBy"
                  value={formData.referredBy}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Referrer Contact
                </label>
                <input
                  type="text"
                  name="referrerContact"
                  value={formData.referrerContact}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
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
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {certificateFile
                      ? certificateFile.name
                      : "Upload Certificate"}
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 mb-2">
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
                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    {recommendationFile
                      ? recommendationFile.name
                      : "Upload Recommendation Letter"}
                  </label>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="agreesToTerms"
                    checked={formData.agreesToTerms}
                    onChange={handleChange}
                    required
                    className="w-4 h-4 text-gray-800 border-gray-300 rounded focus:ring-gray-800"
                  />
                  <span className="text-gray-700">
                    I agree to the terms and conditions *
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium flex items-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    Submit Application
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
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
