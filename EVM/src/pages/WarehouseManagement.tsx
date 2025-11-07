import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VehicleDetailModal from "@/components/VehicleDetailModal";
import AddInventoryModal from "@/components/AddInventoryModal";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";
import type { WarehouseStockResponse, VehicleSerialResponse } from "@/services/api-warehouse";
import type { VehicleStatus, ElectricVehicleResponse } from "@/services/api-electric-vehicle";
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

// Type for individual vehicle with serial info (similar to VehicleShowroom)
type IndividualVehicle = WarehouseStockResponse & {
  serial: VehicleSerialResponse;
  status: string;
  holdUntil?: string;
  vin: string;
};

// Legacy interface for compatibility with existing modals
interface WarehouseItem {
  id: string;
  vehicleName: string;
  model: string;
  vin: string;
  color: string;
  location: string;
  zone: string;
  status: 'available' | 'reserved' | 'maintenance' | 'shipping';
  batteryLevel: number;
  lastChecked: string;
  price: number;
  notes?: string;
  image: string;
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
  const { fetchWarehouse, loading, selectedWarehouse } = useWarehouses();
  const { fetchElectricVehicles, electricVehicles, loading: electricVehicleLoading } = useElectricVehicle();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Fetch warehouse and electric vehicle data on component mount
  useEffect(() => {
    fetchWarehouse(1);
    fetchElectricVehicles();
  }, [fetchWarehouse, fetchElectricVehicles]);

  const handleViewDetails = (item: WarehouseItem) => {
    setSelectedItem(item);
    setIsDetailModalOpen(true);
  };

  const handleAddInventory = (newItem: WarehouseItem) => {
    // Here you would typically update your inventory state
    console.log("Adding new item:", newItem);
  };

  // Convert API data to individual vehicles
  const warehouseItems = selectedWarehouse?.items || [];
  const individualVehicles = warehouseItems.flatMap(item => 
    (item.serials || []).map(serial => ({
      ...item,
      serial: serial,
      status: serial.status,
      holdUntil: serial.holdUntil,
      vin: serial.vin
    }))
  );

  // Helper function to find electric vehicle data by model code
  const findElectricVehicleByModelCode = (modelCode: string): ElectricVehicleResponse | undefined => {
    return electricVehicles.find(ev => ev.modelCode === modelCode);
  };

  // Convert to legacy format for existing components
  const warehouseInventory: WarehouseItem[] = individualVehicles.map((vehicle, index) => {
    // Find matching electric vehicle data for image and price
    const electricVehicle = findElectricVehicleByModelCode(vehicle.modelCode);
    
    return {
      id: vehicle.vin || `vehicle-${index}`,
      vehicleName: `${vehicle.brand} ${vehicle.modelCode}`,
      model: vehicle.modelCode,
      vin: vehicle.vin,
      color: vehicle.color,
      location: `A-${Math.floor(Math.random() * 10) + 1}`, // Mock location
      zone: `${Math.floor(Math.random() * 5) + 1}`, // Mock zone
      status: vehicle.status === 'AVAILABLE' ? 'available' : 
             vehicle.status === 'HOLD' ? 'reserved' : 'maintenance',
      batteryLevel: Math.floor(Math.random() * 100), // Mock battery level
      lastChecked: new Date().toLocaleDateString('vi-VN'), // Mock last checked
      price: electricVehicle?.price || 800000000, // Use real price from electric-vehicle API
      notes: vehicle.holdUntil ? `Giữ đến ${new Date(vehicle.holdUntil).toLocaleDateString('vi-VN')}` : '',
      image: electricVehicle?.imageUrl || "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b" // Use real image from electric-vehicle API
    };
  });

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
                
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                
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
                  <TableHead className="w-24">Trạng thái</TableHead>
                  <TableHead className="w-32">Giá</TableHead>
                  <TableHead className="w-64">Ghi chú</TableHead>
                  <TableHead className="w-24">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(loading || electricVehicleLoading) ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Đang tải dữ liệu kho và xe điện...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Không có xe nào trong kho</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
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
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
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
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Detail Modal */}
      <VehicleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        vehicle={selectedItem ? (() => {
          // Find the original warehouse vehicle data
          const warehouseVehicle = individualVehicles.find(v => v.vin === selectedItem.id);
          // Find matching electric vehicle data
          const electricVehicle = warehouseVehicle ? findElectricVehicleByModelCode(warehouseVehicle.modelCode) : undefined;
          
          return {
            vehicleId: parseInt(selectedItem.id),
            modelCode: selectedItem.vehicleName,
            color: selectedItem.color,
            price: electricVehicle?.price || selectedItem.price,
            cost: electricVehicle?.cost || selectedItem.price,
            status: selectedItem.status as VehicleStatus,
            imageUrl: electricVehicle?.imageUrl || selectedItem.image,
            batteryCapacity: electricVehicle?.batteryCapacity || 75,
            modelId: electricVehicle?.modelId || 1,
            brand: warehouseVehicle?.brand || "VinFast",
            productionYear: warehouseVehicle?.productionYear || 2024,
            warehouseId: electricVehicle?.warehouseId || 1,
            holdUntil: undefined,
            selectableNow: true
          };
        })() : undefined}
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