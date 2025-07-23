"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/hooks";
import {
  fetchPayments,
  fetchPaymentStats,
} from "@/redux/features/payments/paymentsSlice";
import Loading from "@/components/common/Loading";
import NoDataFound from "@/components/common/NoDataFound";
import ResponsiveTable from "@/components/common/ResponsiveTable";
import ResponsiveTableRow from "@/components/common/ResponsiveTableRow";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

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

const PaymentsPage = () => {
  const dispatch = useAppDispatch();
  const { payments, stats, loading, pagination } = useAppSelector(
    (state) => state.payments
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);
  const loadingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchPaymentStats());
    dispatch(fetchPayments({ page: 1, limit: 20 }));
  }, [dispatch]);

  useEffect(() => {
    if (pagination) {
      setHasMore(currentPage < pagination.totalPages);
    }
  }, [pagination, currentPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      dispatch(fetchPayments({ page: nextPage, limit: 20 }));
    }
  }, [loading, hasMore, currentPage, dispatch]);

  useEffect(() => {
    const currentObserver = observer.current;
    if (loading) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadingRef.current) {
      observer.current.observe(loadingRef.current);
    }

    return () => {
      if (currentObserver) currentObserver.disconnect();
    };
  }, [loading, hasMore, loadMore]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PAID: { color: "bg-green-100 text-green-800", label: "Paid" },
      PENDING: { color: "bg-yellow-100 text-yellow-800", label: "Pending" },
      FAILED: { color: "bg-red-100 text-red-800", label: "Failed" },
      CANCELLED: { color: "bg-gray-100 text-gray-800", label: "Cancelled" },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === "RAZORPAY" ? (
      <CreditCard className="w-4 h-4" />
    ) : (
      <Calendar className="w-4 h-4" />
    );
  };

  if (loading && !payments.length) {
    return <Loading />;
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Payments</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats?.totalAmount || 0, "INR")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                From {stats?.totalPayments || 0} payments
              </p>
            </div>
            <DollarSign className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Successful Payments
              </p>
              <p className="text-lg font-bold text-gray-900">
                {stats?.paidPayments || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.pendingPayments || 0} pending
              </p>
            </div>
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Today&apos;s Revenue
              </p>
              <p className="text-lg font-bold text-gray-900">
                {formatCurrency(stats?.todayAmount || 0, "INR")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.todayPayments || 0} payments today
              </p>
            </div>
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Active Students
              </p>
              <p className="text-lg font-bold text-gray-900">
                {stats?.uniqueStudentsPaid || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Students who have paid
              </p>
            </div>
            <Users className="h-6 w-6 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading && !payments.length ? (
          <Loading />
        ) : payments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <NoDataFound message="No payments found" />
          </div>
        ) : (
          <ResponsiveTable
            headers={[
              "Student",
              "Amount",
              "Status",
              "Method",
              "Date",
              "Transaction ID",
            ]}
          >
            {payments.map((payment: Payment) => (
              <ResponsiveTableRow
                key={payment.id}
                mobileCardContent={
                  <div className="space-y-3">
                    {/* Student Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {payment.student.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.student.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.student.user.email}
                        </div>
                      </div>
                      {getStatusBadge(payment.status)}
                    </div>

                    {/* Payment Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Amount:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Method:</span>
                        <div className="flex items-center gap-2">
                          {getPaymentMethodIcon(payment.paymentMethod)}
                          <span className="text-sm text-gray-900">
                            {payment.paymentMethod === "RAZORPAY"
                              ? "Razorpay"
                              : "Pay Later"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date:</span>
                        <span className="text-sm text-gray-900">
                          {payment.paidAt
                            ? formatDate(payment.paidAt)
                            : formatDate(payment.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Transaction ID:
                        </span>
                        <span className="text-sm text-gray-500 font-mono truncate max-w-24">
                          {payment.transactionId ||
                            payment.razorpayPaymentId ||
                            "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {payment.student.fullName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payment.student.user.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(payment.amount, payment.currency)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(payment.paymentMethod)}
                    <span className="text-sm text-gray-900">
                      {payment.paymentMethod === "RAZORPAY"
                        ? "Razorpay"
                        : "Pay Later"}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {payment.paidAt
                    ? formatDate(payment.paidAt)
                    : formatDate(payment.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 font-mono">
                    {payment.transactionId ||
                      payment.razorpayPaymentId ||
                      "N/A"}
                  </div>
                </td>
              </ResponsiveTableRow>
            ))}
          </ResponsiveTable>
        )}

        {/* Infinite Scroll Loading */}
        {hasMore && (
          <div ref={loadingRef} className="flex justify-center py-4">
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">
                  Loading more payments...
                </span>
              </div>
            ) : (
              <div className="h-6"></div>
            )}
          </div>
        )}

        {/* End of list indicator */}
        {!hasMore && payments.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">No more payments to load</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;
