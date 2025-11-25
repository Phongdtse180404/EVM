import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";
import type { WarehouseStockResponse, VehicleSerialResponse } from "@/services/api-warehouse";
import React from "react";

type IndividualVehicle = WarehouseStockResponse & {
  serial: VehicleSerialResponse;
  status: string;
  holdUntil?: string;
  vin: string;
  imageUrl?: string;
};

type OrderFormType = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  selectedColor: string;
  depositAmount: string;
  notes: string;
};

type OrderDetailsFormProps = {
  orderForm: OrderFormType;
  setOrderForm: React.Dispatch<React.SetStateAction<OrderFormType>>;
  selectedVehicle: IndividualVehicle | null;
  electricVehicle: ElectricVehicleResponse | null;
  isLookingUpCustomer: boolean;
  handlePhoneNumberChange: (phone: string) => void;
  formatNumberInput: (value: string) => string;
  parseFormattedNumber: (value: string) => string;
};

const OrderDetailsForm: React.FC<OrderDetailsFormProps> = ({
  orderForm,
  setOrderForm,
  selectedVehicle,
  electricVehicle,
  isLookingUpCustomer,
  handlePhoneNumberChange,
  formatNumberInput,
  parseFormattedNumber,
}) => {
  if (!selectedVehicle) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customerPhone">Số điện thoại *</Label>
          <div className="relative">
            <Input
              id="customerPhone"
              value={orderForm.customerPhone}
              onChange={(e) => handlePhoneNumberChange(e.target.value)}
              placeholder="Nhập số điện thoại"
              disabled={isLookingUpCustomer}
            />
            {isLookingUpCustomer && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          {isLookingUpCustomer && (
            <p className="text-xs text-muted-foreground">Đang tìm kiếm thông tin khách hàng...</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerName">Tên khách hàng *</Label>
          <Input
            id="customerName"
            value={orderForm.customerName}
            onChange={(e) => setOrderForm({ ...orderForm, customerName: e.target.value })}
            placeholder="Nhập tên khách hàng"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="customerAddress">Địa chỉ giao xe</Label>
        <Input
          id="customerAddress"
          value={orderForm.customerAddress}
          onChange={(e) => setOrderForm({ ...orderForm, customerAddress: e.target.value })}
          placeholder="Nhập địa chỉ giao xe"
        />
      </div>
      {/* Color Selection */}
      <div className="space-y-2">
        <Label>Màu xe *</Label>
        <div className="flex space-x-3 mb-3">
          <div
            className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${
              orderForm.selectedColor === selectedVehicle.color ? "border-primary bg-primary/10" : "border-border"
            }`}
            onClick={() => setOrderForm({ ...orderForm, selectedColor: selectedVehicle.color! })}
          >
            <div
              className={`w-8 h-8 rounded-full mx-auto mb-1 border ${
                selectedVehicle.color?.toLowerCase().includes("đen") || selectedVehicle.color?.toLowerCase().includes("black")
                  ? "bg-black"
                  : selectedVehicle.color?.toLowerCase().includes("trắng") || selectedVehicle.color?.toLowerCase().includes("white")
                  ? "bg-white border-gray-300"
                  : selectedVehicle.color?.toLowerCase().includes("xám") || selectedVehicle.color?.toLowerCase().includes("gray")
                  ? "bg-gray-500"
                  : selectedVehicle.color?.toLowerCase().includes("xanh") || selectedVehicle.color?.toLowerCase().includes("blue")
                  ? "bg-blue-500"
                  : selectedVehicle.color?.toLowerCase().includes("đỏ") || selectedVehicle.color?.toLowerCase().includes("red")
                  ? "bg-red-500"
                  : "bg-gray-300"
              }`}
            />
            <span className="text-xs">{selectedVehicle.color}</span>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="depositAmount">Số tiền đặt cọc *</Label>
        <Input
          id="depositAmount"
          type="text"
          value={formatNumberInput(orderForm.depositAmount)}
          onChange={(e) => {
            const rawValue = parseFormattedNumber(e.target.value);
            setOrderForm({ ...orderForm, depositAmount: rawValue });
          }}
          placeholder={
            electricVehicle?.price
              ? `Đề xuất: ${Math.floor(electricVehicle.price * 0.1).toLocaleString("vi-VN")} ₫`
              : "Nhập số tiền đặt cọc"
          }
        />
        {electricVehicle?.price && (
          <p className="text-xs text-muted-foreground">
            Đề xuất 10%: {Math.floor(electricVehicle.price * 0.1).toLocaleString("vi-VN")} ₫
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Ghi chú</Label>
        <Textarea
          id="notes"
          value={orderForm.notes}
          onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })}
          placeholder="Nhập ghi chú (tùy chọn)"
          rows={3}
        />
      </div>
    </div>
  );
};

export default OrderDetailsForm;