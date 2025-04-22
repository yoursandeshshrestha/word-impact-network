"use client";
import React, { useState } from "react";
import { Calendar, Upload, Info } from "lucide-react";

interface ApplyPageProps {
  isVisible: boolean;
}

const ApplyPage: React.FC<ApplyPageProps> = ({ isVisible }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    country: "",
    qualification: "",
    desiredDegree: "",
    wasReferred: "no",
    referrerInfo: "",
  });

  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(
    null
  );

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fileType: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === "certificate") {
        setCertificateFile(e.target.files[0]);
      } else if (fileType === "recommendation") {
        setRecommendationFile(e.target.files[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", {
      formData,
      certificateFile,
      recommendationFile,
    });
    // Add your form submission logic here
  };

  return (
    <section className="pt-20 pb-20 md:pt-32 md:pb-32 min-h-screen flex justify-center items-center bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900 mb-6 leading-tight">
              Begin Your <span className="font-semibold">Application</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Complete the form below to apply for admission to
              Word-Impact-Network. Your journey to excellence starts here.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 md:p-10 relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-gradient-to-r from-purple-50 to-blue-50 blur-3xl -z-10 opacity-40"></div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {/* Full Name */}
                <div className="col-span-1">
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Gender */}
                <div className="col-span-1">
                  <label
                    htmlFor="gender"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Date of Birth */}
                <div className="col-span-1">
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Date of Birth
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      required
                    />
                    </div>
                </div>

                {/* Email Address */}
                <div className="col-span-1">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div className="col-span-1">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Country */}
                <div className="col-span-1">
                  <label
                    htmlFor="country"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Academic Qualification */}
                <div className="col-span-2">
                  <label
                    htmlFor="qualification"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Your Academic Qualification
                  </label>
                  <textarea
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  ></textarea>
                </div>

                {/* Desired Degree */}
                <div className="col-span-2">
                  <label
                    htmlFor="desiredDegree"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Which degree do you want to pursue at Word-Impact-Network?
                  </label>
                  <select
                    id="desiredDegree"
                    name="desiredDegree"
                    value={formData.desiredDegree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Select Degree</option>
                    <option value="certificate">Certificate Program</option>
                    <option value="diploma">Diploma</option>
                    <option value="bachelors">Bachelor's Degree</option>
                    <option value="masters">Master's Degree</option>
                    <option value="doctorate">Doctorate</option>
                  </select>
                </div>

                {/* Upload Certificate */}
                <div className="col-span-1">
                  <label
                    htmlFor="certificate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Upload Certificate
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="certificate"
                      name="certificate"
                      onChange={(e) => handleFileChange(e, "certificate")}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <label
                      htmlFor="certificate"
                      className="flex items-center justify-center w-full px-4 py-3 rounded-md border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-600">
                        {certificateFile ? certificateFile.name : "Choose file"}
                      </span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG or PNG (Max 5MB)
                  </p>
                </div>

                {/* Upload Recommendation Letter */}
                <div className="col-span-1">
                  <label
                    htmlFor="recommendation"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Upload Recommendation Letter
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      id="recommendation"
                      name="recommendation"
                      onChange={(e) => handleFileChange(e, "recommendation")}
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    <label
                      htmlFor="recommendation"
                      className="flex items-center justify-center w-full px-4 py-3 rounded-md border border-gray-300 bg-white cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <Upload className="h-5 w-5 mr-2 text-gray-500" />
                      <span className="text-gray-600">
                        {recommendationFile
                          ? recommendationFile.name
                          : "Choose file"}
                      </span>
                    </label>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    PDF, JPG or PNG (Max 5MB)
                  </p>
                </div>

                {/* Referral Question */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Were you referred or recommended by someone? (You may
                    qualify for a referral scholarship)
                  </label>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="referral-yes"
                        name="wasReferred"
                        value="yes"
                        checked={formData.wasReferred === "yes"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <label
                        htmlFor="referral-yes"
                        className="ml-2 text-gray-700"
                      >
                        Yes
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="referral-no"
                        name="wasReferred"
                        value="no"
                        checked={formData.wasReferred === "no"}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-black focus:ring-black border-gray-300"
                      />
                      <label
                        htmlFor="referral-no"
                        className="ml-2 text-gray-700"
                      >
                        No
                      </label>
                    </div>
                  </div>
                </div>

                {/* Referrer Information - Conditional rendering */}
                {formData.wasReferred === "yes" && (
                  <div className="col-span-2">
                    <label
                      htmlFor="referrerInfo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Please Provide the Name and Contact of the Person Who
                      Referred You
                    </label>
                    <textarea
                      id="referrerInfo"
                      name="referrerInfo"
                      value={formData.referrerInfo}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      required={formData.wasReferred === "yes"}
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Confirmation Statement */}
              <div className="mt-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="agreement"
                      name="agreement"
                      type="checkbox"
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                      required
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="agreement" className="text-gray-700">
                      I hereby affirm that I filled out this form and that all
                      the statements mentioned are true. I promise to abide by
                      the rules and regulations set by the Seminary during my
                      course at Word-Impact-Network.
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="bg-black hover:bg-gray-800 text-white px-10 py-3 rounded-md text-base font-medium flex items-center justify-center group transition-all"
                >
                  Submit Application
                  <svg
                    className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Additional Information */}
          <div className="mt-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
            <div className="flex items-start">
              <Info className="h-6 w-6 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Application Process
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  After submitting your application, our admissions team will
                  review your qualifications and reach out within 5-7 business
                  days. You may be asked to participate in an interview as part
                  of the evaluation process.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApplyPage;
