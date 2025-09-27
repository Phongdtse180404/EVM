import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Plus, Search, Edit, Trash2, Car, Battery, Zap, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ElectricVehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  batteryCapacity: number;
  range: number;
  price: number;
  stock: number;
  status: 'available' | 'reserved' | 'sold' | 'maintenance';
  vin: string;
  description?: string;
}

const InventoryManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingVehicle, setEditingVehicle] = useState<ElectricVehicle | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [vehicles, setVehicles] = useState<ElectricVehicle[]>([
    {
      id: '1',
      brand: 'Tesla',
      model: 'Model 3',
      year: 2024,
      color: 'Trắng Ngọc Trai',
      batteryCapacity: 75,
      range: 520,
      price: 1200000000,
      stock: 5,
      status: 'available',
      vin: 'TESLA2024001',
      description: 'Xe điện sedan cao cấp với công nghệ Autopilot'
    },
    {
      id: '2',
      brand: 'VinFast',
      model: 'VF8',
      year: 2024,
      color: 'Xanh Đại Dương',
      batteryCapacity: 87.7,
      range: 471,
      price: 1291000000,
      stock: 8,
      status: 'available',
      vin: 'VINFAST2024002',
      description: 'SUV điện Việt Nam với công nghệ tiên tiến'
    },
    {
      id: '3',
      brand: 'BYD',
      model: 'Atto 3',
      year: 2024,
      color: 'Đỏ Rượu Vang',
      batteryCapacity: 60.48,
      range: 420,
      price: 768000000,
      stock: 3,
      status: 'reserved',
      vin: 'BYD2024003',
      description: 'Crossover điện thông minh từ Trung Quốc'
    },
    {
      id: '4',
      brand: 'Hyundai',
      model: 'IONIQ 5',
      year: 2024,
      color: 'Bạc Titanium',
      batteryCapacity: 77.4,
      range: 481,
      price: 1475000000,
      stock: 2,
      status: 'available',
      vin: 'HYUNDAI2024004',
      description: 'SUV điện với thiết kế tương lai và sạc siêu nhanh'
    }
  ]);

  const [newVehicle, setNewVehicle] = useState<Partial<ElectricVehicle>>({
    brand: '',
    model: '',
    year: 2024,
    color: '',
    batteryCapacity: 0,
    range: 0,
    price: 0,
    stock: 0,
    status: 'available',
    vin: '',
    description: ''
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || vehicle.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'reserved':
        return <Badge className="bg-warning/20 text-warning border-warning">Đã đặt</Badge>;
      case 'sold':
        return <Badge className="bg-muted text-muted-foreground">Đã bán</Badge>;
      case 'maintenance':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Bảo trì</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddVehicle = () => {
    if (!newVehicle.brand || !newVehicle.model || !newVehicle.vin) {
      toast.error('Vui lòng nhập đầy đủ thông tin bắt buộc');
      return;
    }

    const vehicle: ElectricVehicle = {
      id: Date.now().toString(),
      brand: newVehicle.brand!,
      model: newVehicle.model!,
      year: newVehicle.year || 2024,
      color: newVehicle.color || '',
      batteryCapacity: newVehicle.batteryCapacity || 0,
      range: newVehicle.range || 0,
      price: newVehicle.price || 0,
      stock: newVehicle.stock || 0,
      status: newVehicle.status as ElectricVehicle['status'] || 'available',
      vin: newVehicle.vin!,
      description: newVehicle.description || ''
    };

    setVehicles([...vehicles, vehicle]);
    setNewVehicle({
      brand: '',
      model: '',
      year: 2024,
      color: '',
      batteryCapacity: 0,
      range: 0,
      price: 0,
      stock: 0,
      status: 'available',
      vin: '',
      description: ''
    });
    setIsAddDialogOpen(false);
    toast.success('Đã thêm xe mới vào kho');
  };

  const handleEditVehicle = () => {
    if (!editingVehicle) return;

    setVehicles(vehicles.map(v => v.id === editingVehicle.id ? editingVehicle : v));
    setEditingVehicle(null);
    setIsEditDialogOpen(false);
    toast.success('Đã cập nhật thông tin xe');
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicles(vehicles.filter(v => v.id !== id));
    toast.success('Đã xóa xe khỏi kho');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalStock = vehicles.reduce((sum, vehicle) => sum + vehicle.stock, 0);
  const availableStock = vehicles.filter(v => v.status === 'available').reduce((sum, vehicle) => sum + vehicle.stock, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Quản lý Kho Xe Điện
              </h1>
              <p className="text-muted-foreground">Quản lý tồn kho và thông tin xe điện</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Car className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng xe trong kho</p>
                  <p className="text-2xl font-bold">{totalStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <Zap className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Xe có sẵn</p>
                  <p className="text-2xl font-bold text-success">{availableStock}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Battery className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Số mẫu xe</p>
                  <p className="text-2xl font-bold">{vehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Filter className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã lọc</p>
                  <p className="text-2xl font-bold">{filteredVehicles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm theo hãng, mẫu xe, VIN..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Lọc theo trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="available">Có sẵn</SelectItem>
                    <SelectItem value="reserved">Đã đặt</SelectItem>
                    <SelectItem value="sold">Đã bán</SelectItem>
                    <SelectItem value="maintenance">Bảo trì</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm xe mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Thêm xe điện mới</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div>
                      <Label htmlFor="brand">Hãng xe *</Label>
                      <Input
                        id="brand"
                        value={newVehicle.brand}
                        onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})}
                        placeholder="Tesla, VinFast, BYD..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="model">Mẫu xe *</Label>
                      <Input
                        id="model"
                        value={newVehicle.model}
                        onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                        placeholder="Model 3, VF8, Atto 3..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="year">Năm sản xuất</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newVehicle.year}
                        onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="color">Màu sắc</Label>
                      <Input
                        id="color"
                        value={newVehicle.color}
                        onChange={(e) => setNewVehicle({...newVehicle, color: e.target.value})}
                        placeholder="Trắng, Đen, Xanh..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="battery">Dung lượng pin (kWh)</Label>
                      <Input
                        id="battery"
                        type="number"
                        value={newVehicle.batteryCapacity}
                        onChange={(e) => setNewVehicle({...newVehicle, batteryCapacity: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="range">Quãng đường (km)</Label>
                      <Input
                        id="range"
                        type="number"
                        value={newVehicle.range}
                        onChange={(e) => setNewVehicle({...newVehicle, range: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Giá bán (VNĐ)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newVehicle.price}
                        onChange={(e) => setNewVehicle({...newVehicle, price: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Số lượng tồn kho</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newVehicle.stock}
                        onChange={(e) => setNewVehicle({...newVehicle, stock: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vin">Số VIN *</Label>
                      <Input
                        id="vin"
                        value={newVehicle.vin}
                        onChange={(e) => setNewVehicle({...newVehicle, vin: e.target.value})}
                        placeholder="Số khung xe"
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select
                        value={newVehicle.status}
                        onValueChange={(value) => setNewVehicle({...newVehicle, status: value as ElectricVehicle['status']})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Có sẵn</SelectItem>
                          <SelectItem value="reserved">Đã đặt</SelectItem>
                          <SelectItem value="sold">Đã bán</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Textarea
                        id="description"
                        value={newVehicle.description}
                        onChange={(e) => setNewVehicle({...newVehicle, description: e.target.value})}
                        placeholder="Mô tả chi tiết về xe..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleAddVehicle}>Thêm xe</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Table */}
        <Card className="bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle>Danh sách xe điện</CardTitle>
            <CardDescription>
              {filteredVehicles.length} xe được hiển thị
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Xe</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Pin & Phạm vi</TableHead>
                    <TableHead>Giá bán</TableHead>
                    <TableHead>Tồn kho</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{vehicle.brand} {vehicle.model}</div>
                          <div className="text-sm text-muted-foreground">
                            {vehicle.year} • {vehicle.color}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{vehicle.vin}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center gap-1">
                            <Battery className="w-3 h-3" />
                            {vehicle.batteryCapacity} kWh
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Zap className="w-3 h-3" />
                            {vehicle.range} km
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(vehicle.price)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {vehicle.stock}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingVehicle(vehicle);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin xe</DialogTitle>
            </DialogHeader>
            {editingVehicle && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="edit-brand">Hãng xe</Label>
                  <Input
                    id="edit-brand"
                    value={editingVehicle.brand}
                    onChange={(e) => setEditingVehicle({...editingVehicle, brand: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-model">Mẫu xe</Label>
                  <Input
                    id="edit-model"
                    value={editingVehicle.model}
                    onChange={(e) => setEditingVehicle({...editingVehicle, model: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-year">Năm sản xuất</Label>
                  <Input
                    id="edit-year"
                    type="number"
                    value={editingVehicle.year}
                    onChange={(e) => setEditingVehicle({...editingVehicle, year: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-color">Màu sắc</Label>
                  <Input
                    id="edit-color"
                    value={editingVehicle.color}
                    onChange={(e) => setEditingVehicle({...editingVehicle, color: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-battery">Dung lượng pin (kWh)</Label>
                  <Input
                    id="edit-battery"
                    type="number"
                    value={editingVehicle.batteryCapacity}
                    onChange={(e) => setEditingVehicle({...editingVehicle, batteryCapacity: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-range">Quãng đường (km)</Label>
                  <Input
                    id="edit-range"
                    type="number"
                    value={editingVehicle.range}
                    onChange={(e) => setEditingVehicle({...editingVehicle, range: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-price">Giá bán (VNĐ)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editingVehicle.price}
                    onChange={(e) => setEditingVehicle({...editingVehicle, price: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-stock">Số lượng tồn kho</Label>
                  <Input
                    id="edit-stock"
                    type="number"
                    value={editingVehicle.stock}
                    onChange={(e) => setEditingVehicle({...editingVehicle, stock: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-vin">Số VIN</Label>
                  <Input
                    id="edit-vin"
                    value={editingVehicle.vin}
                    onChange={(e) => setEditingVehicle({...editingVehicle, vin: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={editingVehicle.status}
                    onValueChange={(value) => setEditingVehicle({...editingVehicle, status: value as ElectricVehicle['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Có sẵn</SelectItem>
                      <SelectItem value="reserved">Đã đặt</SelectItem>
                      <SelectItem value="sold">Đã bán</SelectItem>
                      <SelectItem value="maintenance">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={editingVehicle.description}
                    onChange={(e) => setEditingVehicle({...editingVehicle, description: e.target.value})}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditVehicle}>Cập nhật</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default InventoryManagement;