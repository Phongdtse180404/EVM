import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Car,
  Battery,
  Calendar,
  Zap,
  Timer,
  Shield,
  ShoppingCart,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { customerService } from "@/services/api-customers";
import { orderService, OrderStatus, type OrderDepositRequest } from "@/services/api-orders";
import type { WarehouseStockResponse, VehicleSerialResponse } from "@/services/api-warehouse";
import { type ElectricVehicleResponse } from "@/services/api-electric-vehicle";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";

// Type for individual vehicle with serial info
type IndividualVehicle = WarehouseStockResponse & {
  serial: VehicleSerialResponse;
  status: string;
  holdUntil?: string;
  vin: string;
  imageUrl?: string;
};


export default function OrderDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const modelCode = searchParams.get('model');
  const color = searchParams.get('color');
  const vin = searchParams.get('vin');
  const warehouseName = searchParams.get('warehouseName');
  
  // Create vehicle object from URL params
  const [selectedVehicle] = useState<IndividualVehicle | null>(() => {
    if (!modelCode || !color || !vin) return null;
    return {
      modelCode,
      color,
      vin,
      brand: '', // Brand will come from electric vehicle data
      productionYear: new Date().getFullYear(), // Default to current year
      quantity: 1,
      serial: {
        vin,
        status: 'AVAILABLE', // Assume available for ordering
        holdUntil: undefined
      },
      status: 'AVAILABLE',
      holdUntil: undefined
    } as IndividualVehicle;
  });
  
  // Use the electric vehicle hook
  const { findElectricVehiclesByModelCode, loading: electricVehicleLoading } = useElectricVehicle();
  const [electricVehicle, setElectricVehicle] = useState<ElectricVehicleResponse | null>(null);

  // Firebase fallback image URL
  const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

  // Order form state - Initialize first before using in useEffect
  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    selectedColor: "",
    depositAmount: "",
    notes: ""
  });

  // Fetch electric vehicle data for pricing and images by model code
  useEffect(() => {
    if (modelCode) {
      findElectricVehiclesByModelCode(modelCode).then(vehicles => {
        setElectricVehicle(vehicles[0] || null);
      });
    }
  }, [findElectricVehiclesByModelCode, modelCode]);

  // Automatically set deposit amount when electric vehicle data loads
  useEffect(() => {
    if (electricVehicle?.price) {
      const suggestedDeposit = Math.floor(electricVehicle.price * 0.1);
      setOrderForm(prev => ({
        ...prev,
        depositAmount: prev.depositAmount || suggestedDeposit.toString(),
        selectedColor: prev.selectedColor || selectedVehicle?.color || ""
      }));
    }
  }, [electricVehicle?.price, selectedVehicle?.color]);

  // Function to get the correct image for a vehicle based on electric vehicle data
  const getVehicleImage = (): string => {
    return electricVehicle?.imageUrl || firebaseImageUrl;
  };

  const formatVnd = (amount: number) => `${amount.toLocaleString('vi-VN')}₫`;


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'HOLD':
        return <Badge className="bg-warning/20 text-warning border-warning">Đang giữ</Badge>;
      case 'SOLD_OUT':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Đã bán</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Reset form function to clear any corrupted data
  const resetForm = () => {
    const suggestedDeposit = electricVehicle?.price ? Math.floor(electricVehicle.price * 0.1).toString() : "";
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      selectedColor: selectedVehicle?.color || "",
      depositAmount: suggestedDeposit,
      notes: ""
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUpCustomer, setIsLookingUpCustomer] = useState(false);

  const handlePhoneNumberChange = async (phone: string) => {
    // Update phone number immediately
    setOrderForm({ ...orderForm, customerPhone: phone });
    
    // Only lookup customer if phone number is complete (at least 10 digits)
    if (phone.length >= 10) {
      setIsLookingUpCustomer(true);
      
      try {
        console.log('Auto-looking up customer with phone:', phone);
        const existingCustomer = await customerService.getCustomerByPhone(phone);
        
        if (existingCustomer) {
          console.log('Found existing customer, auto-filling form:', existingCustomer);
          
          // Auto-fill the form with existing customer data
          setOrderForm(prev => ({
            ...prev,
            customerPhone: phone,
            customerName: existingCustomer.name || prev.customerName,
            customerEmail: '', // Don't auto-fill email as it's not in CustomerResponse
            customerAddress: existingCustomer.address || prev.customerAddress
          }));
          
          toast.success(`Đã tìm thấy khách hàng: ${existingCustomer.name}`, {
            description: "Thông tin đã được điền tự động",
            duration: 3000,
          });
        }
      } catch (error) {
        // Customer not found - this is normal, don't show error
        console.log('Customer not found for phone:', phone, '- user can enter new customer info');
      } finally {
        setIsLookingUpCustomer(false);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedVehicle) {
      toast.error("Không có thông tin xe được chọn");
      return;
    }

    if (!orderForm.customerName || !orderForm.customerPhone) {
      toast.error("Vui lòng nhập đầy đủ thông tin khách hàng");
      return;
    }

    if (!orderForm.depositAmount || parseFloat(orderForm.depositAmount) <= 0) {
      toast.error("Vui lòng nhập số tiền đặt cọc hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Find existing customer by phone
      console.log('=== CUSTOMER LOOKUP ===');
      console.log('Searching for customer with phone:', orderForm.customerPhone);
      
      let customer;
      let customerId;
      
      try {
        // Try to find existing customer by phone number
        customer = await customerService.getCustomerByPhone(orderForm.customerPhone);
        customerId = customer.customerId;
        console.log('Found existing customer:', customer);
        console.log('Using existing customer ID:', customerId);
      } catch (error) {
        console.log('Customer not found by phone');
      }
        
      // Step 2: Create deposit order with specific vehicle serial
        // Get the price from the electric-vehicle data (fetched earlier).
        if (!electricVehicle?.price) {
          throw new Error(`Không tìm thấy giá xe cho model ${selectedVehicle.modelCode} màu ${selectedVehicle.color}`);
        }
        
        const vehiclePrice = electricVehicle.price;
        const depositAmount = parseFloat(orderForm.depositAmount); // Use user-entered deposit amount
        const orderDepositRequest: OrderDepositRequest = {
          customerId: customerId,
          vin: selectedVehicle.vin, // Use the VIN code as vehicle serial ID
          depositAmount: depositAmount,
          userId: undefined, // Optional: Can be set to current sales person ID if available
          orderDate: new Date().toISOString()
        };

        console.log('=== ORDER REQUEST CREATION ===');
        console.log('Order Request Object:', orderDepositRequest);
        console.log('Order Request Details:');
        console.log('  - Customer ID:', orderDepositRequest.customerId, '(type:', typeof orderDepositRequest.customerId, ')');
        console.log('  - Vehicle VIN:', orderDepositRequest.vin, '(type:', typeof orderDepositRequest.vin, ')');
        console.log('  - Deposit Amount:', orderDepositRequest.depositAmount, '(type:', typeof orderDepositRequest.depositAmount, ')');
        console.log('  - User ID:', orderDepositRequest.userId, '(type:', typeof orderDepositRequest.userId, ')');
        console.log('  - Order Date:', orderDepositRequest.orderDate, '(type:', typeof orderDepositRequest.orderDate, ')');
        console.log('Order Request JSON:', JSON.stringify(orderDepositRequest, null, 2));
        console.log('=== SENDING TO API ===');

        const createdOrder = await orderService.createDeposit(orderDepositRequest);
        console.log(' ORDER CREATED SUCCESSFULLY:', createdOrder);

      toast.success("Tạo đơn hàng thành công!");
      navigate("/sales");

    } catch (error) {
      console.error(' ERROR CREATING ORDER:', error);
      console.error(' Error Details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        orderForm,
        selectedVehicle: selectedVehicle ? {
          modelCode: selectedVehicle.modelCode,
          vin: selectedVehicle.vin,
          serial: selectedVehicle.serial,
          status: selectedVehicle.status
        } : null
      });
      toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      console.log(' ORDER SUBMISSION FINISHED');
      setIsSubmitting(false);
    }
  };

  // Return loading state if data is not ready
  if (electricVehicleLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin xe...</p>
        </div>
      </div>
    );
  }

  // Return error state if required vehicle data is missing
  if (!selectedVehicle) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Không tìm thấy thông tin xe</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Chi tiết đặt hàng
            </h1>
            <p className="text-muted-foreground">
              Tạo đơn hàng và đặt cọc cho khách hàng
            </p>
          </div>
        </div>

        <Badge className="bg-success/20 text-success border-success px-3 py-1">
          Đang hoạt động
        </Badge>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Details */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={getVehicleImage()} 
                alt={`${selectedVehicle.modelCode || 'Electric Vehicle'} - ${selectedVehicle.color}`}
                className="w-full h-64 object-cover"
                onError={(e) => {
                  // Fallback to firebase image if the API image fails to load
                  const target = e.target as HTMLImageElement;
                  target.src = firebaseImageUrl;
                }}
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(selectedVehicle.status || '')}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{selectedVehicle.modelCode || 'Electric Vehicle'}</h2>
                <p className="text-muted-foreground">{electricVehicle?.brand || ''}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedVehicle.color} - Năm sản xuất {selectedVehicle.productionYear}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  VIN: {selectedVehicle.vin}
                </p>
                {warehouseName && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Kho: {warehouseName}
                  </p>
                )}
                {selectedVehicle.holdUntil && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Giữ đến: {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

              <div className="text-2xl font-bold text-primary mb-6">
                {electricVehicle?.price ? formatVnd(electricVehicle.price) : 'Giá chưa có'}
              </div>

              {/* Vehicle Specs */}
              <div className="space-y-4">
                <h4 className="font-medium">Thông tin xe</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Car className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Mã model</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.modelCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Shield className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Thương hiệu</p>
                      <p className="text-xs text-muted-foreground">{electricVehicle?.brand || ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Màu sắc</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.color}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Năm sản xuất</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.productionYear}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">VIN</p>
                      <p className="text-xs text-muted-foreground font-mono">{selectedVehicle.vin}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Trạng thái</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedVehicle.status === 'AVAILABLE' ? 'Có sẵn' : 
                         selectedVehicle.status === 'HOLD' ? 'Đang giữ' : 'Đã bán'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium">Tính năng nổi bật</h4>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Xe điện thân thiện với môi trường</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Tiết kiệm chi phí vận hành</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Thương hiệu {electricVehicle?.brand || ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Năm sản xuất {selectedVehicle.productionYear}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">VIN: {selectedVehicle.vin}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Form */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border/50">

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
                      orderForm.selectedColor === selectedVehicle.color ? 'border-primary bg-primary/10' : 'border-border'
                    }`}
                    onClick={() => setOrderForm({...orderForm, selectedColor: selectedVehicle.color!})}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${
                      selectedVehicle.color?.toLowerCase().includes('đen') || selectedVehicle.color?.toLowerCase().includes('black') ? 'bg-black' :
                      selectedVehicle.color?.toLowerCase().includes('trắng') || selectedVehicle.color?.toLowerCase().includes('white') ? 'bg-white border-gray-300' :
                      selectedVehicle.color?.toLowerCase().includes('xám') || selectedVehicle.color?.toLowerCase().includes('gray') ? 'bg-gray-500' :
                      selectedVehicle.color?.toLowerCase().includes('xanh') || selectedVehicle.color?.toLowerCase().includes('blue') ? 'bg-blue-500' :
                      selectedVehicle.color?.toLowerCase().includes('đỏ') || selectedVehicle.color?.toLowerCase().includes('red') ? 'bg-red-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-xs">{selectedVehicle.color}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>VIN: {selectedVehicle.vin}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Màu sắc được chọn dựa trên xe cụ thể (VIN: {selectedVehicle.vin.slice(-8)})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="depositAmount">Số tiền đặt cọc *</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  value={orderForm.depositAmount}
                  onChange={(e) => setOrderForm({ ...orderForm, depositAmount: e.target.value })}
                  placeholder={electricVehicle?.price ? `Đề xuất: ${Math.floor(electricVehicle.price * 0.1).toLocaleString('vi-VN')} ₫` : "Nhập số tiền đặt cọc"}
                />
                {electricVehicle?.price && (
                  <p className="text-xs text-muted-foreground">
                    Đề xuất 10%: {Math.floor(electricVehicle.price * 0.1).toLocaleString('vi-VN')} ₫
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

            <Separator className="my-6" />

            {/* Order Summary */}
            <div className="space-y-3">
              <h4 className="font-medium">Tóm tắt đơn hàng</h4>
              <div className="bg-background rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Xe:</span>
                  <span className="font-medium">{selectedVehicle.modelCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>VIN:</span>
                  <span className="font-medium font-mono text-xs">{selectedVehicle.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mã số xe:</span>
                  <span className="font-medium text-xs">#{selectedVehicle.serial.vin}</span>
                </div>
                <div className="flex justify-between">
                  <span>Màu:</span>
                  <span className="font-medium">{orderForm.selectedColor || selectedVehicle.color}</span>
                </div>
                <div className="flex justify-between">
                  <span>Trạng thái:</span>
                  <span className="font-medium">
                    {selectedVehicle.status === 'AVAILABLE' ? 'Có sẵn' : 
                     selectedVehicle.status === 'HOLD' ? 'Đang giữ' : 'Đã bán'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Tổng giá xe:</span>
                  <span className="font-medium">{electricVehicle?.price ? formatVnd(electricVehicle.price) : 'Giá chưa có'}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Đặt cọc:</span>
                  <span className="text-primary">
                    {orderForm.depositAmount && parseFloat(orderForm.depositAmount) > 0 
                      ? formatVnd(parseFloat(orderForm.depositAmount)) 
                      : 'Chưa nhập'}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Còn lại:</span>
                  <span>
                    {electricVehicle?.price && orderForm.depositAmount && parseFloat(orderForm.depositAmount) > 0
                      ? formatVnd(electricVehicle.price - parseFloat(orderForm.depositAmount))
                      : 'Chưa có'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Hủy
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="flex-1"
              >
                Làm mới
              </Button>
              <Button 
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isSubmitting 
                  ? 'Đang xử lý...' 
                  : 'Đặt cọc xe'
                }
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}