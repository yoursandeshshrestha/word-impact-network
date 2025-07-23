import React, { useState, useEffect } from "react";
import { X, CreditCard, IndianRupee } from "lucide-react";
import { toast } from "sonner";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  courseTitle?: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  modal: {
    ondismiss: () => void;
  };
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => {
      open: () => void;
    };
  }
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  courseTitle = "Course",
}) => {
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [amountError, setAmountError] = useState<string>("");

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);



  const validateAmount = (value: string): string => {
    if (!value || value.trim() === "") {
      return "Please enter an amount";
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return "Please enter a valid number";
    }
    
    if (numValue < 1) {
      return "Minimum amount is ₹1";
    }
    
    if (numValue > 100000) {
      return "Maximum amount is ₹1,00,000";
    }
    
    if (!Number.isInteger(numValue)) {
      return "Please enter a whole number (no decimals)";
    }
    
    return "";
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    
    // Clear error when user starts typing
    if (amountError) {
      setAmountError("");
    }
    
    // Validate in real-time
    const error = validateAmount(value);
    setAmountError(error);
  };

  const handlePayment = async () => {
    const error = validateAmount(amount);
    if (error) {
      setAmountError(error);
      toast.error(error);
      return;
    }

    setIsLoading(true);

    try {
      // Create payment order
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/create-order`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: "INR",
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessage = "Failed to create payment order";
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (response.status === 400) {
          errorMessage = "Invalid amount. Please check your input.";
        } else if (response.status === 401) {
          errorMessage = "Please log in to make a payment.";
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later.";
        }
        
        throw new Error(errorMessage);
      }

      const { data } = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: data.keyId,
        amount: Math.round(parseFloat(amount) * 100), // Convert to paise
        currency: data.currency,
        name: "Word Impact Network",
        description: `Payment for ${courseTitle}`,
        order_id: data.orderId,
        handler: async function (response: RazorpayResponse) {
          setIsProcessing(true);
          try {
            // Verify payment
            const verifyResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/payments/verify`,
              {
                method: "POST",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            if (!verifyResponse.ok) {
              const errorData = await verifyResponse.json();
              let errorMessage = "Payment verification failed";
              
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (verifyResponse.status === 400) {
                errorMessage = "Payment verification failed. Please contact support.";
              } else if (verifyResponse.status === 500) {
                errorMessage = "Server error during verification. Please contact support.";
              }
              
              throw new Error(errorMessage);
            }

            toast.success(
              "Payment successful! Thank you for your contribution."
            );
            onClose();
            onSuccess();
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        theme: {
          color: "#1f2937",
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading || isProcessing}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Make a Contribution
          </h2>
          <p className="text-gray-600">
            Support our educational mission by making a voluntary contribution.
            Any amount is appreciated!
          </p>
        </div>

        {/* Amount input */}
        <div className="mb-6">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Amount (₹)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IndianRupee className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Enter amount (₹1 - ₹1,00,000)"
              min="1"
              max="100000"
              step="1"
              className={`block w-full pl-10 pr-3 py-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 text-black ${
                amountError 
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              disabled={isLoading || isProcessing}
            />
          </div>
          
          {/* Error message */}
          {amountError && (
            <p className="text-sm text-red-600 mt-1 flex items-center">
              <span className="mr-1">⚠️</span>
              {amountError}
            </p>
          )}
          
          {/* Help text */}
          {!amountError && (
            <p className="text-sm text-gray-500 mt-1">
              Enter an amount between ₹1 and ₹1,00,000
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handlePayment}
            disabled={
              !amount || 
              parseFloat(amount) <= 0 || 
              isLoading || 
              isProcessing ||
              !!amountError
            }
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </>
            ) : isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying Payment...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5 mr-2" />
                Pay ₹{amount || "0"}
              </>
            )}
          </button>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
