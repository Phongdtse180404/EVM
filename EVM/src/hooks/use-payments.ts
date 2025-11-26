import { useState } from "react";
import { paymentService } from "@/services/api-payment";
import type { PaymentHistoryResponse, Page } from "@/services/api-payment";

export function usePayments() {
  const [history, setHistory] = useState<Page<PaymentHistoryResponse> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentHistory = async (params: {
    customerId?: number;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await paymentService.getPaymentHistory(params);
      setHistory(data);
      return data;
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải lịch sử thanh toán");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    history,
    loading,
    error,
    getPaymentHistory,
  };
}
