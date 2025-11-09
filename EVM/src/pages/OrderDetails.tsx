import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWarehouses } from "@/hooks/use-warehouses";
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
} from "lucide-react";
import { toast } from "sonner";
import { customerService } from "@/services/api-customers";
import { orderService, OrderStatus, type OrderDepositRequest } from "@/services/api-orders";
import type { WarehouseStockResponse, VehicleSerialResponse } from "@/services/api-warehouse";
import { electricVehicleService, type ElectricVehicleResponse } from "@/services/api-electric-vehicle";

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
  
  // Use the warehouse hook to get API data
  const { fetchWarehouse, loading, selectedWarehouse } = useWarehouses();
  const [selectedVehicle, setSelectedVehicle] = useState<IndividualVehicle | null>(null);
  const [electricVehicles, setElectricVehicles] = useState<ElectricVehicleResponse[]>([]);

  // Firebase fallback image URL
  const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

  // Fetch warehouse data and set selected vehicle
  useEffect(() => {
    fetchWarehouse(1); // Fetch warehouse ID 1
  }, [fetchWarehouse]);

  // Fetch electric vehicles data for images
  useEffect(() => {
    const fetchElectricVehicles = async () => {
      try {
        const vehicles = await electricVehicleService.getAllElectricVehicles();
        setElectricVehicles(vehicles);
      } catch (error) {
        console.error('Error fetching electric vehicles:', error);
      }
    };

    fetchElectricVehicles();
  }, []);

  // Function to get the correct image for a vehicle based on model code and color
  const getVehicleImage = (vehicle: IndividualVehicle): string => {
    // Find matching electric vehicle by model code and color
    const matchingEV = electricVehicles.find(ev => 
      ev.modelCode === vehicle.modelCode && 
      ev.color === vehicle.color
    );
    
    // Return the image URL from electric vehicle data, or fallback to firebase image
    return matchingEV?.imageUrl || firebaseImageUrl;
  };

  const formatVnd = (amount: number) => `${amount.toLocaleString('vi-VN')}₫`;

  const selectedVehiclePrice = selectedVehicle
    ? (electricVehicles.find(ev => ev.modelCode === selectedVehicle.modelCode && ev.color === selectedVehicle.color)?.price)
    : undefined;

  useEffect(() => {
    if (selectedWarehouse?.items && selectedWarehouse.items.length > 0) {
      // Flatten warehouse items into individual vehicles
      const individualVehicles = selectedWarehouse.items.flatMap(item => 
        (item.serials || []).map(serial => ({
          ...item,
          serial: serial,
          status: serial.status,
          holdUntil: serial.holdUntil,
          vin: serial.vin
        }))
      );

      if (vin) {
        // First priority: Find exact vehicle by VIN
        const foundVehicle = individualVehicles.find(v => v.vin === vin);
        setSelectedVehicle(foundVehicle);
        
        if (!foundVehicle) {
          console.warn(`Vehicle with VIN ${vin} not found`);
          // Fallback to model and color if VIN not found
          if (modelCode && color) {
            const fallbackVehicle = individualVehicles.find(v => 
              v.modelCode === modelCode && v.color === color && v.status === 'AVAILABLE'
            );
            setSelectedVehicle(fallbackVehicle || individualVehicles.find(v => v.status === 'AVAILABLE') || individualVehicles[0]);
          } else {
            setSelectedVehicle(individualVehicles.find(v => v.status === 'AVAILABLE') || individualVehicles[0]);
          }
        }
      } else if (modelCode && color) {
        // Second priority: Find by model and color
        const foundVehicle = individualVehicles.find(v => 
          v.modelCode === modelCode && v.color === color && v.status === 'AVAILABLE'
        );
        setSelectedVehicle(foundVehicle || individualVehicles.find(v => v.status === 'AVAILABLE') || individualVehicles[0]);
      } else {
        // Default: First available vehicle
        setSelectedVehicle(individualVehicles.find(v => v.status === 'AVAILABLE') || individualVehicles[0]);
      }
    }
  }, [selectedWarehouse, modelCode, color, vin]);

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
    depositAmount: "",
    notes: ""
  });

  // Reset form function to clear any corrupted data
  const resetForm = () => {
    setOrderForm({
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      selectedColor: selectedVehicle?.color || "",
      depositAmount: selectedVehiclePrice ? Math.floor(selectedVehiclePrice * 0.1).toString() : "",
      notes: ""
    });
  };

  // Update order form when vehicle is loaded
  useEffect(() => {
    if (selectedVehicle && selectedVehicle.color && !orderForm.selectedColor) {
      setOrderForm(prev => ({
        ...prev,
        selectedColor: selectedVehicle.color
      }));
    }
  }, [selectedVehicle, orderForm.selectedColor]);

  // Update deposit amount when vehicle price is available
  useEffect(() => {
    if (selectedVehiclePrice && !orderForm.depositAmount) {
      const suggestedDeposit = Math.floor(selectedVehiclePrice * 0.1);
      setOrderForm(prev => ({
        ...prev,
        depositAmount: suggestedDeposit.toString()
      }));
    }
  }, [selectedVehiclePrice, orderForm.depositAmount]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePhoneNumberChange = async (phoneNumber: string) => {
    setOrderForm({...orderForm, customerPhone: phoneNumber});
    
    // If phone number has reasonable length, try to fetch customer
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
    
    console.log(' ORDER SUBMISSION STARTED');
    console.log(' Order Form Data:', orderForm);
    console.log(' Selected Vehicle:', selectedVehicle);
    
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

    // Additional validations
    if (!orderForm.depositAmount || parseFloat(orderForm.depositAmount) <= 0) {
      errors.push("Số tiền đặt cọc");
    }

    // Check if vehicle price is available
    if (!selectedVehiclePrice) {
      errors.push("Giá xe chưa có trong hệ thống");
    }

    // Show error if any required fields are missing
    if (errors.length > 0) {
      const errorMessage = errors.length === 1
        ? `Vui lòng điền ${errors[0]}`
        : `Vui lòng điền các trường bắt buộc: ${errors.join(", ")}`;
      toast.error(errorMessage);
      return;
    }

    try {
        // Step 1: Find or create customer
        let customerId: number;
        
        console.log(' CUSTOMER LOOKUP/CREATION');
        console.log(' Looking up customer by phone:', orderForm.customerPhone.trim());
        
        try {
          // Try to find existing customer
          const existingCustomer = await customerService.getCustomerByPhone(orderForm.customerPhone.trim());
          customerId = existingCustomer.customerId;
          console.log(' Found existing customer:', existingCustomer);
          
          // Update customer name if it's different (in case user manually changed it)
          if (existingCustomer.name !== orderForm.customerName.trim()) {
            const updateData = {
              vehicleId: 1, // Default vehicle ID since we're using warehouse system
              name: orderForm.customerName.trim(),
              phoneNumber: orderForm.customerPhone.trim(),
              interestVehicle: selectedVehicle.modelCode || 'Electric Vehicle',
              status: "CUSTOMER"
            };
            console.log('🔄 Updating customer with data:', updateData);
            await customerService.updateCustomer(customerId, updateData);
          }
        } catch (error) {
          // Customer doesn't exist, create new one
          const newCustomerData = {
            vehicleId: 1, // Default vehicle ID since we're using warehouse system
            name: orderForm.customerName.trim(),
            phoneNumber: orderForm.customerPhone.trim(),
            interestVehicle: selectedVehicle.modelCode || 'Electric Vehicle',
            status: "CUSTOMER"
          };
          console.log('➕ Creating new customer with data:', newCustomerData);
          const newCustomer = await customerService.createCustomer(newCustomerData);
          customerId = newCustomer.customerId;
          console.log(' Created new customer:', newCustomer);
        }      
        // Step 2: Create deposit order with specific vehicle serial
        // Get the price from the electric-vehicle data (fetched earlier).
        const matchingEV = electricVehicles.find(ev => 
          ev.modelCode === selectedVehicle.modelCode && ev.color === selectedVehicle.color
        );
        
        if (!matchingEV?.price) {
          throw new Error(`Không tìm thấy giá xe cho model ${selectedVehicle.modelCode} màu ${selectedVehicle.color}`);
        }
        
        const vehiclePrice = matchingEV.price;
        const depositAmount = parseFloat(orderForm.depositAmount); // Use user-entered deposit amount
        const orderDepositRequest: OrderDepositRequest = {
          customerId: customerId,
          vin: selectedVehicle.vin, // Use the VIN code as vehicle serial ID
          depositAmount: depositAmount,
          userId: undefined, // Optional: Can be set to current sales person ID if available
          orderDate: new Date().toISOString()
        };

        console.log(' SENDING ORDER DEPOSIT REQUEST TO API:');
        console.log('OrderDepositRequest data:', {
          customerId: orderDepositRequest.customerId,
          vin: orderDepositRequest.vin,
          depositAmount: orderDepositRequest.depositAmount,
          userId: orderDepositRequest.userId,
          orderDate: orderDepositRequest.orderDate
        });
        console.log(' Full Request Object:', orderDepositRequest);

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
                src={getVehicleImage(selectedVehicle)} 
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
                <p className="text-muted-foreground">{selectedVehicle.brand || ''}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedVehicle.color} - Năm sản xuất {selectedVehicle.productionYear}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  VIN: {selectedVehicle.vin}
                </p>
                {selectedVehicle.holdUntil && (
                  <p className="text-xs text-yellow-600 mt-1">
                    Giữ đến: {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </div>

              <div className="text-2xl font-bold text-primary mb-6">
                {selectedVehiclePrice ? formatVnd(selectedVehiclePrice) : 'Giá chưa có'}
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
                      <p className="text-xs text-muted-foreground">{selectedVehicle.brand}</p>
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
                    <span className="text-sm text-muted-foreground">Thương hiệu {selectedVehicle.brand}</span>
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
                  placeholder={selectedVehiclePrice ? `Đề xuất: ${Math.floor(selectedVehiclePrice * 0.1).toLocaleString('vi-VN')} ₫` : "Nhập số tiền đặt cọc"}
                />
                {selectedVehiclePrice && (
                  <p className="text-xs text-muted-foreground">
                    Đề xuất 10%: {Math.floor(selectedVehiclePrice * 0.1).toLocaleString('vi-VN')} ₫
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
                  <span className="font-medium">{selectedVehiclePrice ? formatVnd(selectedVehiclePrice) : 'Giá chưa có'}</span>
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
                    {selectedVehiclePrice && orderForm.depositAmount && parseFloat(orderForm.depositAmount) > 0
                      ? formatVnd(selectedVehiclePrice - parseFloat(orderForm.depositAmount))
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