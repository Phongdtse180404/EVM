import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Car, 
  Battery, 
  Gauge, 
  Fuel, 
  Users, 
  Calendar, 
  Zap,
  Timer,
  Shield,
  ShoppingCart,
  CheckCircle,
  CreditCard,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import { toast } from "sonner";
import { customerService } from "@/services/api-customers";
import { orderService, OrderStatus, type OrderRequest } from "@/services/api-orders";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";


export default function OrderDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle');
  
  // Use the electric vehicle hook to get API data
  const { fetchElectricVehicles, loading, electricVehicles } = useElectricVehicle();
  const [selectedVehicle, setSelectedVehicle] = useState<ElectricVehicleResponse | null>(null);

  // Firebase fallback image URL
  const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

  // Fetch vehicles and set selected vehicle
  useEffect(() => {
    fetchElectricVehicles();
  }, [fetchElectricVehicles]);

  useEffect(() => {
    if (electricVehicles.length > 0) {
      if (vehicleId) {
        // Try to find the specific vehicle by ID
        const foundVehicle = electricVehicles.find(v => v.vehicleId?.toString() === vehicleId);
        setSelectedVehicle(foundVehicle || electricVehicles[0]);
      } else {
        // Default to first vehicle if no ID specified
        setSelectedVehicle(electricVehicles[0]);
      }
    }
  }, [electricVehicles, vehicleId]);

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

  const [orderForm, setOrderForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    selectedColor: "",
    paymentMethod: "",
    deliveryDate: "",
    notes: ""
  });

  const [orderType, setOrderType] = useState<"showroom" | "online" | "direct">("showroom");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneNumberChange = async (phoneNumber: string) => {
    setOrderForm({...orderForm, customerPhone: phoneNumber});
    
    // If phone number is valid length (assume Vietnamese phone number), try to fetch customer
    if (phoneNumber.length >= 10) {
      try {
        const customer = await customerService.getCustomerByPhone(phoneNumber);
        if (customer && customer.name) {
          setOrderForm(prev => ({
            ...prev, 
            customerPhone: phoneNumber,
            customerName: customer.name
          }));
          toast.success(`Tìm thấy khách hàng: ${customer.name}`);
        }
      } catch (error) {
        // Customer not found, don't show error as this is expected for new customers
        console.log('Customer not found for phone number:', phoneNumber);
      }
    }
  };

  const handleSubmitOrder = async () => {
    if (isSubmitting || !selectedVehicle) return;
    
    setIsSubmitting(true);
    // Validate required fields
    const errors = [];
    
    if (!orderForm.customerName.trim()) {
      errors.push("Tên khách hàng");
    }
    
    if (!orderForm.customerPhone.trim()) {
      errors.push("Số điện thoại");
    }
    
    if (!orderForm.selectedColor) {
      errors.push("Màu xe");
    }
    
    // Additional validations for non-showroom orders
    if (orderType !== 'showroom') {
      if (!orderForm.paymentMethod) {
        errors.push("Phương thức thanh toán");
      }
      
      if (!orderForm.deliveryDate) {
        errors.push("Ngày giao xe mong muốn");
      }
    }
    
    // Show error if any required fields are missing
    if (errors.length > 0) {
      const errorMessage = errors.length === 1 
        ? `Vui lòng điền ${errors[0]}`
        : `Vui lòng điền các trường bắt buộc: ${errors.join(", ")}`;
      toast.error(errorMessage);
      return;
    }
    
    // Validate phone number format (Vietnamese phone numbers)
    const phoneRegex = /^(0|\+84)[3-9]\d{8}$/;
    if (!phoneRegex.test(orderForm.customerPhone.trim())) {
      toast.error("Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Find or create customer
      let customerId: number;
      
      try {
        // Try to find existing customer
        const existingCustomer = await customerService.getCustomerByPhone(orderForm.customerPhone.trim());
        customerId = existingCustomer.customerId;
        
        // Update customer name if it's different (in case user manually changed it)
        if (existingCustomer.name !== orderForm.customerName.trim()) {
          await customerService.updateCustomer(customerId, {
            vehicleId: selectedVehicle.vehicleId || 1, // Use API vehicle ID
            name: orderForm.customerName.trim(),
            phoneNumber: orderForm.customerPhone.trim(),
            interestVehicle: selectedVehicle.modelCode || 'Electric Vehicle',
            status: "CUSTOMER"
          });
        }
      } catch (error) {
        // Customer doesn't exist, create new one
        const newCustomer = await customerService.createCustomer({
          vehicleId: selectedVehicle.vehicleId || 1, // Use API vehicle ID
          name: orderForm.customerName.trim(),
          phoneNumber: orderForm.customerPhone.trim(),
          interestVehicle: selectedVehicle.modelCode || 'Electric Vehicle',
          status: "CUSTOMER"
        });
        customerId = newCustomer.customerId;
      }

      // Step 2: Determine order status based on order type
      let orderStatus: OrderStatus;
      switch (orderType) {
        case "direct":
          orderStatus = OrderStatus.CONFIRMED;
          break;
        case "online":
          orderStatus = OrderStatus.NEW;
          break;
        case "showroom":
        default:
          orderStatus = OrderStatus.NEW;
          break;
      }

      // Step 3: Create order
      const orderRequest: OrderRequest = {
        customerId: customerId,
        vehicleId: selectedVehicle.vehicleId || 1, // Use API vehicle ID
        totalAmount: selectedVehicle.price || 0,
        depositAmount: orderType === "direct" ? (selectedVehicle.price || 0) : undefined,
        status: orderStatus,
        deliveryDate: orderForm.deliveryDate || undefined
      };

      const createdOrder = await orderService.createOrder(orderRequest);

      const successMessage = orderType === "direct" ? 
        "Chốt hợp đồng thành công!" : 
        "Tạo đơn hàng thành công!";
      
      toast.success(successMessage);
      navigate("/sales");

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error("Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Return loading state if data is not ready
  if (loading || !selectedVehicle) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải thông tin xe...</p>
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
              Nhập đơn khi khách tới showroom, chốt hợp đồng trực tiếp/online, chỉnh sửa/hủy đơn khi xe giao trễ
            </p>
          </div>
        </div>
        
        <Badge className="bg-success/20 text-success border-success px-3 py-1">
          Đang hoạt động
        </Badge>
      </div>

      {/* Order Type Selection */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Chọn luồng đặt hàng</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              orderType === 'showroom' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setOrderType('showroom')}
          >
            <div className="text-center">
              <Car className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h4 className="font-medium">Khách tới showroom</h4>
              <p className="text-sm text-muted-foreground">Tạo đơn nháp để theo dõi</p>
            </div>
          </Card>
          
          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              orderType === 'online' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setOrderType('online')}
          >
            <div className="text-center">
              <CreditCard className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <h4 className="font-medium">Đặt hàng online</h4>
              <p className="text-sm text-muted-foreground">Khách đặt qua website</p>
            </div>
          </Card>

          <Card 
            className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              orderType === 'direct' ? 'ring-2 ring-primary bg-primary/5' : ''
            }`}
            onClick={() => setOrderType('direct')}
          >
            <div className="text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-accent" />
              <h4 className="font-medium">Chốt trực tiếp</h4>
              <p className="text-sm text-muted-foreground">Ký hợp đồng ngay</p>
            </div>
          </Card>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicle Details */}
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative">
              <img 
                src={selectedVehicle.imageUrl || firebaseImageUrl} 
                alt={selectedVehicle.modelCode || 'Electric Vehicle'}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                {getStatusBadge(selectedVehicle.status || '')}
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{selectedVehicle.modelCode || 'Electric Vehicle'}</h2>
                <p className="text-muted-foreground">{selectedVehicle.brand || ''}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Electric vehicle {selectedVehicle.productionYear ? `from ${selectedVehicle.productionYear}` : ''}
                </p>
              </div>
              
              <div className="text-2xl font-bold text-primary mb-6">
                {(selectedVehicle.price || 0).toLocaleString('vi-VN')}₫
              </div>

              {/* Vehicle Specs */}
              <div className="space-y-4">
                <h4 className="font-medium">Thông số kỹ thuật</h4>
                <div className="grid grid-cols-2 gap-4">
                  {selectedVehicle.batteryCapacity && (
                    <div className="flex items-center space-x-2">
                      <Battery className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Dung lượng pin</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.batteryCapacity} kWh</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.brand && (
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Thương hiệu</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.brand}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.modelCode && (
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Mã model</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.modelCode}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.productionYear && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Năm sản xuất</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.productionYear}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.color && (
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Màu sắc</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.color}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedVehicle.status && (
                    <div className="flex items-center space-x-2">
                      <Timer className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-medium">Trạng thái</p>
                        <p className="text-xs text-muted-foreground">{selectedVehicle.status}</p>
                      </div>
                    </div>
                  )}
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
                  {selectedVehicle.batteryCapacity && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Dung lượng pin {selectedVehicle.batteryCapacity} kWh</span>
                    </div>
                  )}
                  {selectedVehicle.brand && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">Thương hiệu {selectedVehicle.brand}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Form */}
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-card border-border/50">
            <h3 className="text-lg font-semibold mb-4">
              {orderType === 'direct' ? 'Thông tin hợp đồng' : 'Thông tin đặt hàng'}
            </h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Số điện thoại *</Label>
                  <Input
                    id="customerPhone"
                    value={orderForm.customerPhone}
                    onChange={(e) => handlePhoneNumberChange(e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">Tên khách hàng *</Label>
                  <Input
                    id="customerName"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
              </div>

              

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Địa chỉ giao xe</Label>
                <Input
                  id="customerAddress"
                  value={orderForm.customerAddress}
                  onChange={(e) => setOrderForm({...orderForm, customerAddress: e.target.value})}
                  placeholder="Nhập địa chỉ giao xe"
                />
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <Label>Màu xe *</Label>
                <div className="flex space-x-3 mb-3">
                  {selectedVehicle.color ? (
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
                  ) : (
                    // Default color options if vehicle doesn't have a specific color
                    ['Đen', 'Trắng', 'Xám', 'Xanh'].map((color) => (
                      <div 
                        key={color} 
                        className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${
                          orderForm.selectedColor === color ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setOrderForm({...orderForm, selectedColor: color})}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${
                          color === 'Đen' ? 'bg-black' :
                          color === 'Trắng' ? 'bg-white border-gray-300' :
                          color === 'Xám' ? 'bg-gray-500' :
                          color === 'Xanh' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                        <span className="text-xs">{color}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {orderType !== 'showroom' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Phương thức thanh toán</Label>
                    <Select value={orderForm.paymentMethod} onValueChange={(value) => setOrderForm({...orderForm, paymentMethod: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn phương thức thanh toán" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Tiền mặt</SelectItem>
                        <SelectItem value="bank_transfer">Chuyển khoản</SelectItem>
                        <SelectItem value="installment">Trả góp</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryDate">Ngày giao xe mong muốn</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={orderForm.deliveryDate}
                      onChange={(e) => setOrderForm({...orderForm, deliveryDate: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={orderForm.notes}
                  onChange={(e) => setOrderForm({...orderForm, notes: e.target.value})}
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
                  <span>Màu:</span>
                  <span className="font-medium">{orderForm.selectedColor || "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loại đơn:</span>
                  <span className="font-medium">
                    {orderType === 'showroom' ? 'Khách tới showroom' : 
                     orderType === 'online' ? 'Đặt hàng online' : 'Chốt trực tiếp'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng giá:</span>
                  <span className="text-primary">{selectedVehicle.price.toLocaleString('vi-VN')}₫</span>
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
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {isSubmitting 
                  ? 'Đang xử lý...' 
                  : orderType === 'direct' ? 'Chốt hợp đồng' : 'Tạo đơn hàng'
                }
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}