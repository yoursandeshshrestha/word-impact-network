"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Homepage/Header";
import Footer from "@/components/Homepage/Footer";
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";

const ApplicationSubmitted = () => {
  const router = useRouter();

  useEffect(() => {
    // Check if application was submitted
    const applicationSubmitted = sessionStorage.getItem("applicationSubmitted");
    if (!applicationSubmitted) {
      router.push("/apply");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f0eee6] pt-32">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-white p-8 rounded-xl shadow-lg text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 tracking-tight mb-6">
              Application Submitted Successfully!
            </h2>

            <div className="max-w-2xl mx-auto space-y-6 text-gray-600 text-lg mb-12">
              <p>
                Thank you for submitting your application to Word Impact
                Network. We have received your application and will review it
                shortly.
              </p>

              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center justify-center mb-4">
                  <Mail className="w-8 h-8 text-gray-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-800">
                    Check Your Email
                  </h3>
                </div>
                <p>
                  We have sent a confirmation email to the address you provided.
                  This email contains:
                </p>
                <ul className="mt-4 space-y-2 text-left">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3"></span>
                    A copy of your application details
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3"></span>
                    Your application reference number
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-gray-600 rounded-full mt-2 mr-3"></span>
                    Next steps in the application process
                  </li>
                </ul>
              </div>

              <p>
                Our admissions team will review your application and get back to
                you within 5-7 business days. If you have any questions in the
                meantime, please don&apos;t hesitate to contact us.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-300"
              >
                <ArrowLeft className="mr-2 w-5 h-5" />
                Return to Homepage
              </Link>
              <Link
                href="/contact"
                className="border border-gray-300 text-gray-800 hover:bg-gray-50 px-8 py-3 rounded-lg font-medium flex items-center justify-center transition-all duration-300"
              >
                Contact Admissions
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ApplicationSubmitted;
