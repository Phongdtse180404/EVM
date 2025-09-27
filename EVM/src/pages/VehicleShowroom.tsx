import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VehicleDetailModal from "@/components/VehicleDetailModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  ArrowLeft,
  Car, 
  Battery, 
  Gauge, 
  Fuel, 
  Users, 
  Calendar, 
  Star,
  Zap,
  Timer,
  Shield,
  Search,
  Filter,
  Eye,
  ShoppingCart,
  Phone,
  Menu,
  ChevronDown
} from "lucide-react";
import { useNavigate } from "react-router-dom";
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

export default function VehicleShowroom() {
  const navigate = useNavigate();
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(vehicles[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleViewDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDetailModalOpen(true);
  };

  const handleNavigateToSales = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNavigating(true);
    
    try {
      console.log("Navigating to sales management...");
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for visual feedback
      navigate("/sales");
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Có lỗi khi chuyển trang");
    } finally {
      setIsNavigating(false);
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || vehicle.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const totalVehicles = vehicles.reduce((sum, v) => sum + v.stock, 0);
  const availableVehicles = vehicles.filter(v => v.status === "available").reduce((sum, v) => sum + v.stock, 0);
  const totalValue = vehicles.reduce((sum, v) => sum + (v.price * v.stock), 0);

  return (
    <div className="min-h-screen">
      {/* Top Navigation Bar */}
      <div className="bg-background border-b border-border sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                VinFast Showroom
              </h1>
              <p className="text-sm text-muted-foreground">
                Khám phá và trải nghiệm các mẫu xe điện hiện đại
              </p>
            </div>
            
            <div className="flex space-x-2">
              {/* Management Menu Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className="bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                  >
                    <Menu className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-56 z-50 bg-background border border-border shadow-lg" 
                  align="end"
                >
                  <DropdownMenuItem 
                    onClick={() => navigate("/sales")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Quản lý bán hàng</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/inventory")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Car className="w-4 h-4" />
                    <span>Quản lý tồn kho</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/customers")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Quản lý khách hàng</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/reports")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Báo cáo</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem 
                    onClick={() => navigate("/service")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Dịch vụ</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline"
                className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Liên hệ tư vấn
              </Button>
              <Button 
                onClick={() => navigate("/login")}
                className="bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
              >
                Đăng nhập
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
            <p className="text-sm text-muted-foreground">Mẫu xe</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{totalVehicles}</div>
            <p className="text-sm text-muted-foreground">Tổng xe trong kho</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{availableVehicles}</div>
            <p className="text-sm text-muted-foreground">Xe có sẵn</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              {(totalValue / 1000000000).toFixed(1)}B₫
            </div>
            <p className="text-sm text-muted-foreground">Giá trị kho</p>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex space-x-4">
          <Card className="p-3 flex-1">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên xe hoặc model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0"
              />
            </div>
          </Card>
          
          <Card className="p-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 border-0 bg-transparent focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="available">Có sẵn</SelectItem>
                  <SelectItem value="limited">Số lượng hạn chế</SelectItem>
                  <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-400px)]">
          {/* Vehicle List */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-lg">Danh sách xe ({filteredVehicles.length})</h3>
            {filteredVehicles.map((vehicle) => (
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
          <div className="lg:col-span-2 overflow-y-auto">
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
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Màu sắc có sẵn:</h4>
                      <div className="flex space-x-3">
                        {selectedVehicle.colors.map((color) => (
                          <div key={color} className="text-center">
                            <div className={`w-8 h-8 rounded-full border-2 border-border cursor-pointer hover:border-primary transition-colors ${
                              color === 'Đen' ? 'bg-black' :
                              color === 'Trắng' ? 'bg-white' :
                              color === 'Xám' ? 'bg-gray-500' :
                              color === 'Xanh' ? 'bg-blue-500' :
                              color === 'Đỏ' ? 'bg-red-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-xs text-muted-foreground mt-1 block">{color}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button 
                        className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Tạo đơn hàng clicked", selectedVehicle.id);
                          navigate(`/order-details?vehicle=${selectedVehicle.id}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Tạo đơn hàng
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleViewDetails(selectedVehicle)}
                        className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
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
                              <p className="text-sm font-medium">Phạm vi hoạt động</p>
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
                              <p className="text-sm font-medium">Số chỗ ngồi</p>
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
      </div>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal 
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vehicle={selectedVehicle || undefined}
      />
    </div>
  );
}