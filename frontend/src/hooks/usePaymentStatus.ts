import { useState, useEffect } from "react";
import { toast } from "sonner";

interface PaymentStatus {
  hasPaid: boolean;
  paymentStatus: string;
  lastPayment: {
    id: string;
    amount: number;
    currency: string;
    paidAt: string;
  } | null;
  totalContribution: number;
  totalPayments: number;
}

export const usePaymentStatus = () => {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payments/status`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, this is normal
          setPaymentStatus(null);
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payment status");
      }

      const { data } = await response.json();
      setPaymentStatus(data);
    } catch (err) {
      console.error("Error fetching payment status:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch payment status"
      );
      toast.error("Failed to fetch payment status");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  const refreshPaymentStatus = () => {
    fetchPaymentStatus();
  };

  return {
    paymentStatus,
    isLoading,
    error,
    refreshPaymentStatus,
    hasPaid: paymentStatus?.hasPaid || false,
  };
};
