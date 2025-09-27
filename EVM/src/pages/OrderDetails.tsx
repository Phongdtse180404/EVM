import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

// Import vehicle images
import vf8Image from "@/assets/vinfast-vf8.jpg";
import vf9Image from "@/assets/vinfast-vf9.jpg";
import vf6Image from "@/assets/vinfast-vf6.jpg";
import vf7Image from "@/assets/vinfast-vf7.jpg";

interface Vehicle {
  id: string;
  name: string;
  model: string;
  image: string;
  price: number;
  colors: string[];
  specs: {
    batteryCapacity: string;
    range: string;
    power: string;
    acceleration: string;
    chargingTime: string;
    seats: number;
    year: number;
    warranty: string;
  };
  features: string[];
  description: string;
}

const vehicles: Vehicle[] = [
  {
    id: "vf8",
    name: "VinFast VF8",
    model: "VF8 Plus",
    image: vf8Image,
    price: 1200000000,
    colors: ["Đen", "Trắng", "Xám", "Xanh"],
    specs: {
      batteryCapacity: "87.7 kWh",
      range: "420 km",
      power: "300 kW",
      acceleration: "5.9s (0-100km/h)",
      chargingTime: "31 phút (10-70%)",
      seats: 7,
      year: 2024,
      warranty: "10 năm/200,000km"
    },
    features: [
      "Hệ thống lái tự động Level 2",
      "Màn hình cảm ứng 15.6 inch",
      "Âm thanh 13 loa Harman Kardon",
      "Sạc không dây",
      "Hệ thống an toàn 5 sao",
      "Cửa sổ trời toàn cảnh"
    ],
    description: "SUV điện cao cấp 7 chỗ với thiết kế hiện đại và công nghệ tiên tiến."
  },
  {
    id: "vf9",
    name: "VinFast VF9",
    model: "VF9 Plus",
    image: vf9Image,
    price: 1500000000,
    colors: ["Trắng", "Đen", "Xám", "Đỏ"],
    specs: {
      batteryCapacity: "123 kWh",
      range: "594 km",
      power: "300 kW",
      acceleration: "6.5s (0-100km/h)",
      chargingTime: "35 phút (10-70%)",
      seats: 7,
      year: 2024,
      warranty: "10 năm/200,000km"
    },
    features: [
      "Hệ thống lái tự động Level 2+",
      "Màn hình cảm ứng 15.6 inch",
      "Âm thanh 14 loa Harman Kardon",
      "Sạc không dây cao cấp",
      "Hệ thống an toàn 5 sao EURO NCAP",
      "Cửa sổ trời toàn cảnh điện tử"
    ],
    description: "SUV điện flagship hạng sang với không gian rộng rãi và hiệu suất vượt trội."
  },
  {
    id: "vf6",
    name: "VinFast VF6",
    model: "VF6 S",
    image: vf6Image,
    price: 800000000,
    colors: ["Đỏ", "Trắng", "Đen", "Xanh"],
    specs: {
      batteryCapacity: "59.6 kWh",
      range: "388 km",
      power: "130 kW",
      acceleration: "8.9s (0-100km/h)",
      chargingTime: "45 phút (10-80%)",
      seats: 5,
      year: 2024,
      warranty: "8 năm/160,000km"
    },
    features: [
      "Hệ thống hỗ trợ lái xe thông minh",
      "Màn hình cảm ứng 12.9 inch",
      "Âm thanh 8 loa",
      "Sạc không dây",
      "Cảm biến hỗ trợ đỗ xe",
      "Đèn LED ma trận"
    ],
    description: "SUV điện compact thông minh, phù hợp cho gia đình trẻ năng động."
  },
  {
    id: "vf7",
    name: "VinFast VF7",
    model: "VF7 Plus",
    image: vf7Image,
    price: 999000000,
    colors: ["Xanh", "Trắng", "Đen", "Xám"],
    specs: {
      batteryCapacity: "75.3 kWh",
      range: "450 km",
      power: "260 kW",
      acceleration: "6.8s (0-100km/h)",
      chargingTime: "38 phút (10-70%)",
      seats: 5,
      year: 2024,
      warranty: "10 năm/200,000km"
    },
    features: [
      "Hệ thống lái tự động Level 2",
      "Màn hình cảm ứng 12.9 inch",
      "Âm thanh 10 loa Harman Kardon",
      "Sạc không dây thông minh",
      "Hệ thống an toàn 5 sao",
      "Đèn LED thích ứng"
    ],
    description: "SUV điện cao cấp 5 chỗ với thiết kế thể thao và công nghệ hiện đại."
  }
];

export default function OrderDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vehicleId = searchParams.get('vehicle') || 'vf8';
  
  const selectedVehicle = vehicles.find(v => v.id === vehicleId) || vehicles[0];
  
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

  const handleSubmitOrder = () => {
    if (!orderForm.customerName || !orderForm.customerPhone || !orderForm.selectedColor) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const newOrder = {
      id: `ORD${Date.now()}`,
      customerName: orderForm.customerName,
      customerPhone: orderForm.customerPhone,
      customerEmail: orderForm.customerEmail,
      customerAddress: orderForm.customerAddress,
      vehicleModel: selectedVehicle.name,
      vehicleColor: orderForm.selectedColor,
      price: selectedVehicle.price,
      status: orderType === "direct" ? "confirmed" : "draft",
      createdAt: new Date().toISOString().split('T')[0],
      paymentMethod: orderForm.paymentMethod,
      deliveryDate: orderForm.deliveryDate,
      notes: orderForm.notes,
      orderType: orderType
    };

    // Save to localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    existingOrders.unshift(newOrder);
    localStorage.setItem('orders', JSON.stringify(existingOrders));

    const successMessage = orderType === "direct" ? 
      "Chốt hợp đồng thành công!" : 
      "Tạo đơn hàng thành công!";
    
    toast.success(successMessage);
    navigate("/sales");
  };

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
                src={selectedVehicle.image} 
                alt={selectedVehicle.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-bold">{selectedVehicle.name}</h2>
                <p className="text-muted-foreground">{selectedVehicle.model}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedVehicle.description}
                </p>
              </div>
              
              <div className="text-2xl font-bold text-primary mb-6">
                {selectedVehicle.price.toLocaleString('vi-VN')}₫
              </div>

              {/* Vehicle Specs */}
              <div className="space-y-4">
                <h4 className="font-medium">Thông số kỹ thuật</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Battery className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Dung lượng pin</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.batteryCapacity}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Fuel className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Quãng đường</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.range}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Công suất</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.power}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Gauge className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Tăng tốc</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.acceleration}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Sạc nhanh</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.chargingTime}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-medium">Số chỗ ngồi</p>
                      <p className="text-xs text-muted-foreground">{selectedVehicle.specs.seats} chỗ</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Features */}
              <div className="space-y-3">
                <h4 className="font-medium">Tính năng nổi bật</h4>
                <div className="grid grid-cols-1 gap-2">
                  {selectedVehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
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
                  <Label htmlFor="customerName">Tên khách hàng *</Label>
                  <Input
                    id="customerName"
                    value={orderForm.customerName}
                    onChange={(e) => setOrderForm({...orderForm, customerName: e.target.value})}
                    placeholder="Nhập tên khách hàng"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Số điện thoại *</Label>
                  <Input
                    id="customerPhone"
                    value={orderForm.customerPhone}
                    onChange={(e) => setOrderForm({...orderForm, customerPhone: e.target.value})}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={orderForm.customerEmail}
                  onChange={(e) => setOrderForm({...orderForm, customerEmail: e.target.value})}
                  placeholder="Nhập email khách hàng"
                />
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
                  {selectedVehicle.colors.map((color) => (
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
                        color === 'Xanh' ? 'bg-blue-500' :
                        color === 'Đỏ' ? 'bg-red-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-xs">{color}</span>
                    </div>
                  ))}
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
                  <span className="font-medium">{selectedVehicle.name}</span>
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
                className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {orderType === 'direct' ? 'Chốt hợp đồng' : 'Tạo đơn hàng'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}