import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  Battery, 
  Gauge, 
  Fuel, 
  Users, 
  Calendar, 
  Star,
  Zap,
  Timer,
  Shield
} from "lucide-react";

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
  status: "available" | "out-of-stock" | "limited";
  stock: number;
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

interface VehicleShowcaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const vehicles: Vehicle[] = [
  {
    id: "vf8",
    name: "VinFast VF8",
    model: "VF8 Plus",
    image: vf8Image,
    price: 1200000000,
    colors: ["Đen", "Trắng", "Xám", "Xanh"],
    status: "available",
    stock: 15,
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
    status: "available",
    stock: 8,
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
    status: "limited",
    stock: 3,
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
    status: "available",
    stock: 12,
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

export function VehicleShowcase({ open, onOpenChange }: VehicleShowcaseProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const getStatusBadge = (status: Vehicle['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'limited':
        return <Badge className="bg-warning/20 text-warning border-warning">Số lượng hạn chế</Badge>;
      case 'out-of-stock':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Hết hàng</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Car className="w-6 h-6 text-primary" />
            <span>Tổng quan xe điện trong kho</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[75vh] space-x-6">
          {/* Vehicle List */}
          <div className="w-1/3 overflow-y-auto space-y-4">
            <h3 className="font-semibold text-lg mb-4">Danh sách xe ({vehicles.length})</h3>
            {vehicles.map((vehicle) => (
              <Card 
                key={vehicle.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedVehicle?.id === vehicle.id ? 'ring-2 ring-primary bg-gradient-card' : ''
                }`}
                onClick={() => setSelectedVehicle(vehicle)}
              >
                <CardContent className="p-4">
                  <div className="flex space-x-3">
                    <img 
                      src={vehicle.image} 
                      alt={vehicle.name}
                      className="w-20 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{vehicle.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{vehicle.model}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {vehicle.price.toLocaleString('vi-VN')}₫
                        </span>
                        {getStatusBadge(vehicle.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Tồn kho: {vehicle.stock}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Vehicle Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedVehicle ? (
              <div className="space-y-6">
                {/* Main Image and Basic Info */}
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={selectedVehicle.image} 
                      alt={selectedVehicle.name}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(selectedVehicle.status)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedVehicle.name}</h2>
                        <p className="text-muted-foreground">{selectedVehicle.model}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {selectedVehicle.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {selectedVehicle.price.toLocaleString('vi-VN')}₫
                        </div>
                        <p className="text-sm text-muted-foreground">Tồn kho: {selectedVehicle.stock}</p>
                      </div>
                    </div>

                    {/* Colors */}
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Màu sắc có sẵn:</h4>
                      <div className="flex space-x-2">
                        {selectedVehicle.colors.map((color) => (
                          <Badge key={color} variant="outline" className="text-xs">
                            {color}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Tabs defaultValue="specs" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
                    <TabsTrigger value="features">Tính năng</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="specs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Gauge className="w-5 h-5" />
                          <span>Thông số kỹ thuật</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <Battery className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Dung lượng pin</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.batteryCapacity}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Fuel className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Quãng đường</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.range}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Zap className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Công suất</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.power}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Timer className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Tăng tốc</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.acceleration}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Battery className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Thời gian sạc</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.chargingTime}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Users className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Số ghế</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.seats} chỗ</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Năm sản xuất</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.year}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Bảo hành</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.specs.warranty}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="features">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Star className="w-5 h-5" />
                          <span>Tính năng nổi bật</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedVehicle.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chọn một xe để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}