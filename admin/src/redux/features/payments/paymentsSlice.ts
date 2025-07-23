import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  paymentMethod: "RAZORPAY" | "PAYLATER";
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paidAt?: string;
  createdAt: string;
  student: {
    id: string;
    fullName: string;
    user: {
      email: string;
    };
  };
}

interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  paidPayments: number;
  pendingPayments: number;
  todayPayments: number;
  todayAmount: number;
  uniqueStudentsPaid: number;
}

interface PaymentsState {
  payments: Payment[];
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: PaymentsState = {
  payments: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null,
};

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// Fetch all payments
export const fetchPayments = createAsyncThunk(
  "payments/fetchPayments",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `${BASE_URL}/admin/payments?page=${page}&limit=${limit}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payments");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payments";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch payment statistics
export const fetchPaymentStats = createAsyncThunk(
  "payments/fetchPaymentStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/stats`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payment stats");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch payment stats";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

// Fetch payment by ID
export const fetchPaymentById = createAsyncThunk(
  "payments/fetchPaymentById",
  async (paymentId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BASE_URL}/admin/payments/${paymentId}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch payment");
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch payment";
      toast.error(errorMessage);
      return rejectWithValue(errorMessage);
    }
  }
);

const paymentsSlice = createSlice({
  name: "payments",
  initialState,
  reducers: {
    clearPayments: (state) => {
      state.payments = [];
      state.error = null;
      state.loading = false;
      state.pagination = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch payments
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch payment stats
      .addCase(fetchPaymentStats.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.stats = action.payload;
        state.error = null;
      })
      .addCase(fetchPaymentStats.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch payment by ID
      .addCase(fetchPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        // Update the specific payment in the list or add it if not present
        const index = state.payments.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.payments[index] = action.payload;
        } else {
          state.payments.unshift(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPayments, clearError } = paymentsSlice.actions;
export default paymentsSlice.reducer;
