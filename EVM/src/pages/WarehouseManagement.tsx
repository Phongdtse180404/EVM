import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VehicleDetailModal from "@/components/VehicleDetailModal";
import AddInventoryModal from "@/components/AddInventoryModal";
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Truck,
  BarChart3,
  MapPin,
  Calendar,
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import vehicle images
import vf8Image from "@/assets/vinfast-vf8.jpg";
import vf9Image from "@/assets/vinfast-vf9.jpg";
import vf6Image from "@/assets/vinfast-vf6.jpg";
import vf7Image from "@/assets/vinfast-vf7.jpg";

interface WarehouseItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  model: string;
  image: string;
  vin: string;
  color: string;
  price: number;
  location: string;
  zone: string;
  status: "available" | "reserved" | "maintenance" | "shipping";
  batteryLevel: number;
  lastChecked: string;
  notes?: string;
}

interface InventoryStats {
  totalVehicles: number;
  availableVehicles: number;
  reservedVehicles: number;
  maintenanceVehicles: number;
  shippingVehicles: number;
  totalValue: number;
}

export default function WarehouseManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleViewDetails = (item: WarehouseItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleAddInventory = (newItem: WarehouseItem) => {
    // Here you would typically update your inventory state
    console.log("Adding new item:", newItem);
  };

  const [warehouseInventory] = useState<WarehouseItem[]>([
    {
      id: "WH001",
      vehicleId: "vf8",
      vehicleName: "VinFast VF8",
      model: "VF8 Plus",
      image: vf8Image,
      vin: "VF8A123456789",
      color: "Đen",
      price: 1200000000,
      location: "A1-01",
      zone: "A",
      status: "available",
      batteryLevel: 85,
      lastChecked: "2024-01-20",
      notes: "Kiểm tra định kỳ hoàn thành"
    },
    {
      id: "WH002",
      vehicleId: "vf8",
      vehicleName: "VinFast VF8",
      model: "VF8 Plus",
      image: vf8Image,
      vin: "VF8A123456790",
      color: "Trắng",
      price: 1200000000,
      location: "A1-02",
      zone: "A",
      status: "reserved",
      batteryLevel: 92,
      lastChecked: "2024-01-20",
      notes: "Đã đặt cọc - Khách hàng Nguyễn Văn A"
    },
    {
      id: "WH003",
      vehicleId: "vf9",
      vehicleName: "VinFast VF9",
      model: "VF9 Plus",
      image: vf9Image,
      vin: "VF9B987654321",
      color: "Trắng",
      price: 1500000000,
      location: "B2-05",
      zone: "B",
      status: "available",
      batteryLevel: 78,
      lastChecked: "2024-01-19",
    },
    {
      id: "WH004",
      vehicleId: "vf9",
      vehicleName: "VinFast VF9",
      model: "VF9 Plus",
      image: vf9Image,
      vin: "VF9B987654322",
      color: "Đen",
      price: 1500000000,
      location: "B2-06",
      zone: "B",
      status: "shipping",
      batteryLevel: 95,
      lastChecked: "2024-01-18",
      notes: "Đang giao cho khách hàng tại TP.HCM"
    },
    {
      id: "WH005",
      vehicleId: "vf6",
      vehicleName: "VinFast VF6",
      model: "VF6 S",
      image: vf6Image,
      vin: "VF6C456789123",
      color: "Đỏ",
      price: 800000000,
      location: "C3-10",
      zone: "C",
      status: "maintenance",
      batteryLevel: 45,
      lastChecked: "2024-01-15",
      notes: "Bảo trì hệ thống pin"
    },
    {
      id: "WH006",
      vehicleId: "vf6",
      vehicleName: "VinFast VF6",
      model: "VF6 S",
      image: vf6Image,
      vin: "VF6C456789124",
      color: "Xanh",
      price: 800000000,
      location: "C3-11",
      zone: "C",
      status: "available",
      batteryLevel: 88,
      lastChecked: "2024-01-20",
    },
    {
      id: "WH007",
      vehicleId: "vf7",
      vehicleName: "VinFast VF7",
      model: "VF7 Plus",
      image: vf7Image,
      vin: "VF7D789123456",
      color: "Xanh",
      price: 999000000,
      location: "D4-15",
      zone: "D",
      status: "available",
      batteryLevel: 91,
      lastChecked: "2024-01-20",
    },
    {
      id: "WH008",
      vehicleId: "vf7",
      vehicleName: "VinFast VF7",
      model: "VF7 Plus",
      image: vf7Image,
      vin: "VF7D789123457",
      color: "Trắng",
      price: 999000000,
      location: "D4-16",
      zone: "D",
      status: "reserved",
      batteryLevel: 87,
      lastChecked: "2024-01-19",
      notes: "Đặt trước online"
    }
  ]);

  const filteredInventory = warehouseInventory.filter(item => {
    const matchesSearch = item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;
    const matchesZone = filterZone === "all" || item.zone === filterZone;
    return matchesSearch && matchesStatus && matchesZone;
  });

  const stats: InventoryStats = {
    totalVehicles: warehouseInventory.length,
    availableVehicles: warehouseInventory.filter(item => item.status === "available").length,
    reservedVehicles: warehouseInventory.filter(item => item.status === "reserved").length,
    maintenanceVehicles: warehouseInventory.filter(item => item.status === "maintenance").length,
    shippingVehicles: warehouseInventory.filter(item => item.status === "shipping").length,
    totalValue: warehouseInventory.reduce((sum, item) => sum + item.price, 0)
  };

  const getStatusBadge = (status: WarehouseItem['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'reserved':
        return <Badge className="bg-warning/20 text-warning border-warning">Đã đặt</Badge>;
      case 'maintenance':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Bảo trì</Badge>;
      case 'shipping':
        return <Badge className="bg-accent/20 text-accent border-accent">Đang giao</Badge>;
    }
  };

  const getBatteryStatus = (level: number) => {
    if (level >= 80) return { color: "text-success", icon: CheckCircle };
    if (level >= 50) return { color: "text-warning", icon: Clock };
    return { color: "text-destructive", icon: AlertCircle };
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/showroom")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quản lý kho xe
            </h1>
            <p className="text-muted-foreground">
              Theo dõi tồn kho, vị trí và trạng thái xe trong kho
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            Báo cáo kho
          </Button>
          <Button className="bg-gradient-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nhập kho
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.totalVehicles}</div>
          <p className="text-sm text-muted-foreground">Tổng xe</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.availableVehicles}</div>
          <p className="text-sm text-muted-foreground">Có sẵn</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.reservedVehicles}</div>
          <p className="text-sm text-muted-foreground">Đã đặt</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-destructive">{stats.maintenanceVehicles}</div>
          <p className="text-sm text-muted-foreground">Bảo trì</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-accent">{stats.shippingVehicles}</div>
          <p className="text-sm text-muted-foreground">Đang giao</p>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-lg font-bold text-primary">
            {(stats.totalValue / 1000000000).toFixed(1)}B₫
          </div>
          <p className="text-sm text-muted-foreground">Giá trị</p>
        </Card>
      </div>

      {/* Search & Filter */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-3 col-span-2">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, VIN, hoặc vị trí..."
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
              <SelectTrigger className="border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="available">Có sẵn</SelectItem>
                <SelectItem value="reserved">Đã đặt</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                <SelectItem value="shipping">Đang giao</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-3">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <Select value={filterZone} onValueChange={setFilterZone}>
              <SelectTrigger className="border-0 bg-transparent focus:ring-0">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                <SelectItem value="A">Khu A</SelectItem>
                <SelectItem value="B">Khu B</SelectItem>
                <SelectItem value="C">Khu C</SelectItem>
                <SelectItem value="D">Khu D</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Package className="w-5 h-5" />
            <span>Danh sách xe trong kho ({filteredInventory.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ảnh</TableHead>
                  <TableHead className="w-32">Xe</TableHead>
                  <TableHead className="w-32">VIN</TableHead>
                  <TableHead className="w-20">Màu</TableHead>
                  <TableHead className="w-24">Vị trí</TableHead>
                  <TableHead className="w-20">Khu vực</TableHead>
                  <TableHead className="w-24">Trạng thái</TableHead>
                  <TableHead className="w-24">Pin (%)</TableHead>
                  <TableHead className="w-28">Kiểm tra</TableHead>
                  <TableHead className="w-32">Giá</TableHead>
                  <TableHead className="w-64">Ghi chú</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => {
                  const batteryStatus = getBatteryStatus(item.batteryLevel);
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <img
                          src={item.image}
                          alt={item.vehicleName}
                          className="w-12 h-8 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.vehicleName}</p>
                          <p className="text-xs text-muted-foreground">{item.model}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{item.vin}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{item.color}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.location}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          Khu {item.zone}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <batteryStatus.icon className={`w-3 h-3 ${batteryStatus.color}`} />
                          <span className={`text-sm ${batteryStatus.color}`}>
                            {item.batteryLevel}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{item.lastChecked}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {(item.price / 1000000).toFixed(0)}M₫
                      </TableCell>
                      <TableCell className="max-w-64">
                        <p className="text-xs text-muted-foreground truncate">
                          {item.notes || "-"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(item)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vehicle={selectedItem || undefined}
        isWarehouseItem={true}
      />

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddInventory}
      />
    </div>
  );
}