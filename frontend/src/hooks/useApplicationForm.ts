import { useState, useEffect } from "react";

// Define Gender type to match Prisma schema
type Gender = "MALE" | "FEMALE" | "OTHER";

interface ApplicationData {
  email: string;
  fullName: string;
  gender: Gender | "";
  dateOfBirth: string;
  countryCode: string;
  phoneNumber: string;
  country: string;
  academicQualification: string;
  desiredDegree: string;
  referredBy: string;
  referrerContact: string;
  agreesToTerms: boolean;
}

interface FileData {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

interface StepData {
  certificateFile: FileData | null;
  recommendationFile: FileData | null;
}

const STORAGE_KEY = "application_form_data";
const FILE_STORAGE_KEY = "application_files_data";

// Utility function to create a mock file from stored metadata
const createMockFile = (fileData: FileData): File => {
  const blob = new Blob([""], { type: fileData.type });
  const file = new File([blob], fileData.name, {
    type: fileData.type,
    lastModified: fileData.lastModified,
  });
  return file;
};

export const useApplicationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ApplicationData>({
    email: "",
    fullName: "",
    gender: "" as Gender | "",
    dateOfBirth: "",
    countryCode: "",
    phoneNumber: "",
    country: "",
    academicQualification: "",
    desiredDegree: "",
    referredBy: "",
    referrerContact: "",
    agreesToTerms: false,
  });
  const [stepData, setStepData] = useState<StepData>({
    certificateFile: null,
    recommendationFile: null,
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [recommendationFile, setRecommendationFile] = useState<File | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedFiles = localStorage.getItem(FILE_STORAGE_KEY);

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }

    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setStepData(parsedFiles);

        // Restore files from metadata if they exist
        if (parsedFiles.certificateFile) {
          try {
            const mockFile = createMockFile(parsedFiles.certificateFile);
            setCertificateFile(mockFile);
          } catch (error) {
            console.error("Error restoring certificate file:", error);
          }
        }

        if (parsedFiles.recommendationFile) {
          try {
            const mockFile = createMockFile(parsedFiles.recommendationFile);
            setRecommendationFile(mockFile);
          } catch (error) {
            console.error("Error restoring recommendation file:", error);
          }
        }
      } catch (error) {
        console.error("Error parsing saved file data:", error);
      }
    }

    setIsLoaded(true);
  }, []);

  // Save data to localStorage whenever form data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  // Save file data to localStorage whenever step data changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(stepData));
    }
  }, [stepData, isLoaded]);

  const updateFormData = (updates: Partial<ApplicationData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateStepData = (updates: Partial<StepData>) => {
    setStepData((prev) => ({ ...prev, ...updates }));
  };

  const clearSavedData = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(FILE_STORAGE_KEY);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) return false;
        if (!formData.email.trim()) return false;
        if (!formData.gender) return false;
        if (!formData.dateOfBirth) return false;
        return true;
      case 2:
        if (!formData.countryCode.trim()) return false;
        if (!formData.phoneNumber.trim()) return false;
        if (!formData.country.trim()) return false;
        return true;
      case 3:
        if (!formData.academicQualification.trim()) return false;
        if (!formData.desiredDegree.trim()) return false;
        return true;
      case 4:
        if (!formData.agreesToTerms) return false;
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      return true;
    }
    return false;
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step);
    }
  };

  return {
    currentStep,
    formData,
    stepData,
    certificateFile,
    recommendationFile,
    isLoaded,
    updateFormData,
    updateStepData,
    setCertificateFile,
    setRecommendationFile,
    clearSavedData,
    validateStep,
    nextStep,
    prevStep,
    goToStep,
  };
};
