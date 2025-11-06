import { useState, useEffect } from "react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
  ChevronDown,
  Warehouse
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";


// Firebase fallback image URL
const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

export default function VehicleShowroom() {
  const navigate = useNavigate();
  const { fetchWarehouse, loading, selectedWarehouse } = useWarehouses();
  const [selectedVehicle, setSelectedVehicle] = useState<IndividualVehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(null);
  const [electricVehicles, setElectricVehicles] = useState<ElectricVehicleResponse[]>([]);

  // Fetch warehouse data on component mount (using warehouse ID 1)
  useEffect(() => {
    fetchWarehouse(1);
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

  // Set selected vehicle when warehouse data is loaded
  useEffect(() => {
    if (selectedWarehouse?.items && selectedWarehouse.items.length > 0 && !selectedVehicle) {
      // Get first individual vehicle from flattened list
      const firstItem = selectedWarehouse.items[0];
      if (firstItem.serials && firstItem.serials.length > 0) {
        setSelectedVehicle({
          ...firstItem,
          serial: firstItem.serials[0],
          status: firstItem.serials[0].status,
          holdUntil: firstItem.serials[0].holdUntil,
          vin: firstItem.serials[0].vin
        });
      }
    }
  }, [selectedWarehouse, selectedVehicle]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    //  Kiểm tra kỹ trước khi parse
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error(" Lỗi khi parse user từ localStorage:", err);
        localStorage.removeItem("user"); // Xoá dữ liệu lỗi để tránh lặp lại
      }
    } else {
      console.warn("⚠️ Không có user hợp lệ trong localStorage");
    }
  }, []);



  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Đăng xuất thành công!");
    navigate("/login");
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

  const warehouseItems = selectedWarehouse?.items || [];
  
  // Flatten warehouse items into individual vehicle serials
  const individualVehicles = warehouseItems.flatMap(item => 
    (item.serials || []).map(serial => ({
      ...item,
      serial: serial,
      status: serial.status,
      holdUntil: serial.holdUntil,
      vin: serial.vin
    }))
  );
  
  const filteredVehicles = individualVehicles.filter(vehicle => {
    const matchesSearch = (vehicle.modelCode?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.color?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "available" && vehicle.status === 'AVAILABLE') ||
      (filterStatus === "out-of-stock" && vehicle.status === 'SOLD_OUT') ||
      (filterStatus === "limited" && vehicle.status === 'HOLD');
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (vehicle: IndividualVehicle) => {
    if (vehicle.status === 'AVAILABLE') {
      return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
    } else if (vehicle.status === 'HOLD') {
      return <Badge className="bg-warning/20 text-warning border-warning">Đang giữ</Badge>;
    } else if (vehicle.status === 'SOLD_OUT') {
      return <Badge className="bg-destructive/20 text-destructive border-destructive">Đã bán</Badge>;
    }
    return <Badge className="bg-gray-200 text-gray-600">Không rõ</Badge>;
  };

  const totalVehicles = individualVehicles.length;
  const availableVehicles = individualVehicles.filter(vehicle => vehicle.status === 'AVAILABLE').length;
  const totalModels = new Set(warehouseItems.map(item => `${item.modelCode}-${item.color}`)).size;

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
              <Button
                variant="outline"
                className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                Liên hệ tư vấn
              </Button>

              {/* Button Đăng nhập */}
              {currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center space-x-2 hover:bg-accent transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>{currentUser.email}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-50 bg-background border border-border shadow-lg">
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-destructive cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Đăng xuất
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : null}

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
                  <DropdownMenuItem
                    onClick={() => navigate("/admin/users")}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {loading ? "..." : totalModels}
            </div>
            <p className="text-sm text-muted-foreground">Mẫu xe</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {loading ? "..." : totalVehicles}
            </div>
            <p className="text-sm text-muted-foreground">Tổng xe</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {loading ? "..." : availableVehicles}
            </div>
            <p className="text-sm text-muted-foreground">Xe có sẵn</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-accent">
              <Warehouse className="w-6 h-6 mx-auto mb-1" />
              {loading ? "..." : selectedWarehouse?.warehouseName || "Kho 1"}
            </div>
            <p className="text-sm text-muted-foreground">Kho hiện tại</p>
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
                  <SelectItem value="limited">Đang giữ</SelectItem>
                  <SelectItem value="out-of-stock">Đã bán</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Vehicle List */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            <h3 className="font-semibold text-lg">
              Danh sách xe ({loading ? 'Đang tải...' : filteredVehicles.length})
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Đang tải xe điện...</p>
              </div>
            ) : filteredVehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Không có xe điện nào</p>
              </div>
            ) : (
              filteredVehicles.map((vehicle, index) => (
                <Card
                  key={`${vehicle.vin}`}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedVehicle?.vin === vehicle.vin ? 'ring-2 ring-primary bg-gradient-card' : ''
                    }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      <img
                        src={getVehicleImage(vehicle)}
                        alt={`${vehicle.modelCode} - ${vehicle.color}`}
                        className="w-20 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          // Fallback to firebase image if the API image fails to load
                          const target = e.target as HTMLImageElement;
                          target.src = firebaseImageUrl;
                        }}
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{vehicle.modelCode}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{vehicle.brand}</p>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-blue-600">
                            Màu: {vehicle.color}
                          </span>
                          {getStatusBadge(vehicle)}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            VIN: {vehicle.vin.slice(-8)}
                          </span>
                          <span className="text-xs font-semibold">
                            Năm: {vehicle.productionYear}
                          </span>
                        </div>
                        {vehicle.holdUntil && (
                          <div className="mt-1">
                            <span className="text-xs text-yellow-600">
                              Giữ đến: {new Date(vehicle.holdUntil).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Vehicle Details */}
          <div className="lg:col-span-2 overflow-y-auto">
            {selectedVehicle ? (
              <div className="space-y-6">
                {/* Main Image and Basic Info */}
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img
                      src={getVehicleImage(selectedVehicle)}
                      alt={`${selectedVehicle.modelCode} - ${selectedVehicle.color}`}
                      className="w-full h-[400px] object-contain p-1"
                      onError={(e) => {
                        // Fallback to firebase image if the API image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = firebaseImageUrl;
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(selectedVehicle)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedVehicle.modelCode}</h2>
                        <p className="text-muted-foreground">{selectedVehicle.brand}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Màu: {selectedVehicle.color} | Năm sản xuất: {selectedVehicle.productionYear}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          VIN: {selectedVehicle.vin}
                        </div>
                        <p className="text-sm text-muted-foreground">Số khung</p>
                        {selectedVehicle.holdUntil && (
                          <p className="text-sm text-yellow-600">
                            Giữ đến: {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Color and Status */}
                    {selectedVehicle.color && (
                      <div className="mb-6">
                        <h4 className="font-medium mb-3">Màu sắc:</h4>
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full border-2 border-border ${
                            selectedVehicle.color.toLowerCase().includes('đen') || selectedVehicle.color.toLowerCase().includes('black') ? 'bg-black' :
                            selectedVehicle.color.toLowerCase().includes('trắng') || selectedVehicle.color.toLowerCase().includes('white') ? 'bg-white' :
                            selectedVehicle.color.toLowerCase().includes('xám') || selectedVehicle.color.toLowerCase().includes('gray') ? 'bg-gray-500' :
                            selectedVehicle.color.toLowerCase().includes('xanh') || selectedVehicle.color.toLowerCase().includes('blue') ? 'bg-blue-500' :
                            selectedVehicle.color.toLowerCase().includes('đỏ') || selectedVehicle.color.toLowerCase().includes('red') ? 'bg-red-500' : 'bg-gray-300'
                          }`} />
                          <span className="text-sm">{selectedVehicle.color}</span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("Tạo đơn hàng clicked", selectedVehicle.vin);
                          navigate(`/order-details?model=${selectedVehicle.modelCode}&color=${selectedVehicle.color}&vin=${selectedVehicle.vin}`);
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Tạo đơn hàng
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/inventory')}
                        className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        <Warehouse className="w-4 h-4 mr-2" />
                        Xem kho
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Tabs defaultValue="specs" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specs">Thông tin xe</TabsTrigger>
                    <TabsTrigger value="features">Chi tiết & Xe cùng loại</TabsTrigger>
                  </TabsList>

                  <TabsContent value="specs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Gauge className="w-5 h-5" />
                          <span>Thông tin xe</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <Car className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Mã model</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.modelCode}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Shield className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Thương hiệu</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.brand}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Battery className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Màu sắc</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.color}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Năm sản xuất</p>
                              <p className="text-sm text-muted-foreground">{selectedVehicle.productionYear}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Zap className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">VIN</p>
                              <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.vin}</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <Timer className="w-4 h-4 text-primary" />
                            <div>
                              <p className="text-sm font-medium">Trạng thái</p>
                              <p className="text-sm text-muted-foreground">
                                {selectedVehicle.status === 'AVAILABLE' ? 'Có sẵn' : 
                                 selectedVehicle.status === 'HOLD' ? 'Đang giữ' : 'Đã bán'}
                              </p>
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
                          <span>Chi tiết xe này</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Số VIN</p>
                              <p className="text-sm font-mono">{selectedVehicle.vin}</p>
                              
                              <p className="text-sm font-medium">Trạng thái</p>
                              <Badge 
                                className={
                                  selectedVehicle.status === 'AVAILABLE' 
                                    ? "bg-success/20 text-success border-success" 
                                    : selectedVehicle.status === 'HOLD'
                                    ? "bg-warning/20 text-warning border-warning"
                                    : "bg-destructive/20 text-destructive border-destructive"
                                }
                              >
                                {selectedVehicle.status === 'AVAILABLE' ? "Có sẵn" : 
                                 selectedVehicle.status === 'HOLD' ? "Đang giữ" : "Đã bán"}
                              </Badge>
                              
                              {selectedVehicle.holdUntil && (
                                <>
                                  <p className="text-sm font-medium">Giữ đến</p>
                                  <p className="text-sm text-yellow-600">
                                    {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Show other vehicles of same model/color */}
                          {(() => {
                            const sameModelVehicles = individualVehicles.filter(v => 
                              v.modelCode === selectedVehicle.modelCode && 
                              v.color === selectedVehicle.color &&
                              v.vin !== selectedVehicle.vin
                            );
                            
                            if (sameModelVehicles.length > 0) {
                              return (
                                <div>
                                  <p className="text-sm font-medium mb-2">
                                    Xe cùng loại ({sameModelVehicles.length} xe)
                                  </p>
                                  <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {sameModelVehicles.map(vehicle => (
                                      <div key={vehicle.vin} className="flex items-center justify-between p-2 bg-muted/30 rounded text-xs">
                                        <span className="font-mono">{vehicle.vin}</span>
                                        <Badge 
                                          className={
                                            vehicle.status === 'AVAILABLE' 
                                              ? "bg-success/20 text-success border-success text-xs px-2 py-1" 
                                              : vehicle.status === 'HOLD'
                                              ? "bg-warning/20 text-warning border-warning text-xs px-2 py-1"
                                              : "bg-destructive/20 text-destructive border-destructive text-xs px-2 py-1"
                                          }
                                        >
                                          {vehicle.status === 'AVAILABLE' ? "Có sẵn" : 
                                           vehicle.status === 'HOLD' ? "Giữ" : "Bán"}
                                        </Badge>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
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


    </div>
  );
}