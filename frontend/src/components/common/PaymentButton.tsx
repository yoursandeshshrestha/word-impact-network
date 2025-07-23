import React, { useState } from "react";
import { CreditCard } from "lucide-react";
import PaymentModal from "./PaymentModal";

interface PaymentButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  text?: string;
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  className = "",
  variant = "primary",
  size = "md",
  text = "Make a Contribution",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePaymentSuccess = () => {
    // Refresh the page or update payment status
    window.location.reload();
  };

  const getButtonClasses = () => {
    const baseClasses =
      "inline-flex items-center justify-center font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

    const variantClasses = {
      primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
      secondary:
        "bg-gray-100 hover:bg-gray-200 text-gray-700 focus:ring-gray-500",
    };

    const sizeClasses = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={getButtonClasses()}
      >
        <CreditCard className="w-4 h-4 mr-2" />
        {text}
      </button>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        courseTitle="Word Impact Network"
      />
    </>
  );
};

export default PaymentButton;
