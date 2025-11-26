
import { useEffect, useState } from "react";
import { usePayments } from "@/hooks/use-payments";
import type { PaymentHistoryResponse } from "@/services/api-payment";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { customerService } from "@/services/api-customers";
import type { CustomerResponse } from "@/services/api-customers";

import { ArrowLeft } from "lucide-react";

export default function PaymentHistory() {

  const { history, loading, error, getPaymentHistory } = usePayments();
  const [customerId, setCustomerId] = useState<string>("");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");
  const [filters, setFilters] = useState<{ customerId?: number; from?: string; to?: string }>({});
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);

  // Fetch customers for dropdown
  useEffect(() => {
    customerService.getCustomers().then(setCustomers).catch(() => setCustomers([]));
  }, []);

  // Fetch on mount and when filters change
  useEffect(() => {
    getPaymentHistory({
      ...filters,
      page: 0,
      size: 20,
    });
    // eslint-disable-next-line
  }, [filters]);

  // Tag system for filters
  const tags = [];
  if (filters.customerId) {
    const customer = customers.find(c => c.customerId === filters.customerId);
    tags.push({ key: "customerId", label: customer ? `Khách hàng: ${customer.name}` : `Khách hàng: ${filters.customerId}` });
  }
  if (filters.from) tags.push({ key: "from", label: `Từ ngày: ${filters.from}` });
  if (filters.to) tags.push({ key: "to", label: `Đến ngày: ${filters.to}` });

  const removeTag = (key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key as keyof typeof newFilters];
      return newFilters;
    });
  }

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...(customerId ? { customerId: Number(customerId) } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/showroom')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Lịch sử thanh toán
              </h1>
              <p className="text-muted-foreground">Tra cứu các giao dịch thanh toán của khách hàng</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <form className="flex flex-col md:flex-row justify-start items-end" onSubmit={handleFilter}>
              <div className="flex flex-col md:flex-row gap-4 items-end justify-start">
                <div>
                  <label className="block text-sm mb-1">Khách hàng</label>
                  <Select
                    value={customerId}
                    onValueChange={setCustomerId}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Tất cả khách hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((c) => (
                        <SelectItem key={c.customerId} value={c.customerId.toString()}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm mb-1">Từ ngày</label>
                  <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm mb-1">Đến ngày</label>
                  <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
                <Button type="submit" className="h-10">Lọc</Button>
              </div>
            </form>
            {/* Tag system */}
            <div className="flex gap-2 mt-4 flex-wrap">
              {tags.map(tag => (
                <span key={tag.key} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-base font-medium flex items-center gap-3 min-h-[2.25rem]">
                  {tag.label}
                  <button
                    type="button"
                    className="ml-1 text-blue-600 hover:text-red-500"
                    onClick={() => removeTag(tag.key)}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Lịch sử giao dịch</CardTitle>
            <CardDescription>
              {history && history.content ? history.content.length : 0} giao dịch được hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded shadow">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border">ID thanh toán</th>
                    <th className="px-3 py-2 border">ID Khách hàng</th>
                    <th className="px-3 py-2 border">Khách hàng</th>
                    <th className="px-3 py-2 border">Số tiền</th>
                    <th className="px-3 py-2 border">Loại</th>
                    <th className="px-3 py-2 border">Phương thức</th>
                    <th className="px-3 py-2 border">Ngày thanh toán</th>
                    <th className="px-3 py-2 border">Trạng thái</th>
                    <th className="px-3 py-2 border">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} className="text-center py-6">Đang tải...</td></tr>
                  ) : error ? (
                    <tr><td colSpan={10} className="text-center text-red-500 py-6">{error}</td></tr>
                  ) : history && history.content.length > 0 ? (
                    history.content.map((row: PaymentHistoryResponse) => (
                      <tr key={row.paymentId} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2 border text-center">{row.paymentId}</td>
                        <td className="px-3 py-2 border text-center">{row.customerId}</td>
                        <td className="px-3 py-2 border">{row.customerName}</td>
                        <td className="px-3 py-2 border text-right">{row.amount.toLocaleString()}₫</td>
                        <td className="px-3 py-2 border text-center">{row.type}</td>
                        <td className="px-3 py-2 border text-center">{row.method}</td>
                        <td className="px-3 py-2 border text-center">{row.paymentDate?.slice(0, 10)}</td>
                        <td className="px-3 py-2 border text-center">{row.status}</td>
                        <td className="px-3 py-2 border">{row.message}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={10} className="text-center py-6">Không có dữ liệu</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
