import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useDealerships } from "@/hooks/use-dealerships";
import type { DealershipResponse } from "@/services/api-dealership";
import {
  Building2,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Warehouse,
  Users,
  Eye
} from "lucide-react";


interface DealershipForm {
  name: string;
  address: string;
  phoneNumber: string;
}

export default function Dealerships() {
  // API Hook
  const {
    dealerships,
    loading,
    selectedDealership,
    setSelectedDealership,
    fetchDealerships,
    createDealership,
    updateDealership,
    deleteDealership,
  } = useDealerships();

  // Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState<DealershipForm>({
    name: "",
    address: "",
    phoneNumber: ""
  });

  // Load dealerships on mount
  useEffect(() => {
    fetchDealerships();
  }, [fetchDealerships]);

  // Filter dealerships
  const filteredDealerships = dealerships.filter(dealership =>
    dealership.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dealership.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dealership.phoneNumber && dealership.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handlers
  const handleCreateDealership = async () => {
    if (!formData.name.trim() || !formData.address.trim()) {
      return;
    }

    const dealershipData = {
      name: formData.name,
      address: formData.address,
      phoneNumber: formData.phoneNumber || undefined,
    };

    await createDealership(dealershipData, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        resetForm();
      }
    });
  };

  const handleEditDealership = async () => {
    if (!selectedDealership || !formData.name.trim() || !formData.address.trim()) {
      return;
    }

    const dealershipData = {
      name: formData.name,
      address: formData.address,
      phoneNumber: formData.phoneNumber || undefined,
    };

    await updateDealership(selectedDealership.dealershipId, dealershipData, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedDealership(null);
        resetForm();
      }
    });
  };

  const handleDeleteDealership = async (dealershipId: number) => {
    await deleteDealership(dealershipId);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (dealership: DealershipResponse) => {
    setSelectedDealership(dealership);
    setFormData({
      name: dealership.name,
      address: dealership.address,
      phoneNumber: dealership.phoneNumber || ""
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (dealership: DealershipResponse) => {
    setSelectedDealership(dealership);
    setIsViewDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phoneNumber: ""
    });
  };

  const getTotalWarehouses = (dealership: DealershipResponse) => {
    return dealership.warehouses?.length || 0;
  };

  const getTotalVehicles = (dealership: DealershipResponse) => {
    return dealership.warehouses?.reduce((sum, warehouse) => sum + warehouse.vehicleQuantity, 0) || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý đại lý</h2>
          <p className="text-muted-foreground">
            Quản lý thông tin và hoạt động của các đại lý xe điện
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-gradient-primary">
          <Plus className="w-4 h-4 mr-2" />
          Thêm đại lý mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng đại lý
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealerships.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng kho
            </CardTitle>
            <Warehouse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dealerships.reduce((sum, dealership) => sum + getTotalWarehouses(dealership), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng xe
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dealerships.reduce((sum, dealership) => sum + getTotalVehicles(dealership), 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <Badge className="bg-success/20 text-success border-success">
              {dealerships.length}
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Tìm kiếm theo tên, địa chỉ, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Dealerships Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đại lý ({filteredDealerships.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên đại lý</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead className="text-center">Kho</TableHead>
                  <TableHead className="text-center">Xe</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-sm text-muted-foreground mt-2">Đang tải...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredDealerships.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">Không có đại lý nào</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDealerships.map((dealership) => (
                    <TableRow key={dealership.dealershipId}>
                      <TableCell>
                        <div className="font-medium">{dealership.name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span className="text-sm">{dealership.address}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {dealership.phoneNumber && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                            <span className="text-sm">{dealership.phoneNumber}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{getTotalWarehouses(dealership)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{getTotalVehicles(dealership)}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openViewDialog(dealership)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Xem chi tiết
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(dealership)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa đại lý "{dealership.name}"?
                                    Hành động này không thể hoàn tác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteDealership(dealership.dealershipId)}
                                    className="bg-destructive hover:bg-destructive/90"
                                  >
                                    Xóa
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Dealership Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Thêm đại lý mới</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Tên đại lý *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên đại lý"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-address">Địa chỉ *</Label>
              <Textarea
                id="create-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ đại lý"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-phone">Số điện thoại</Label>
              <Input
                id="create-phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleCreateDealership}
              disabled={!formData.name.trim() || !formData.address.trim() || loading}
              className="bg-gradient-primary"
            >
              {loading ? "Đang tạo..." : "Tạo đại lý"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dealership Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đại lý</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Tên đại lý *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên đại lý"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-address">Địa chỉ *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Nhập địa chỉ đại lý"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Số điện thoại</Label>
              <Input
                id="edit-phone"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleEditDealership}
              disabled={!formData.name.trim() || !formData.address.trim() || loading}
              className="bg-gradient-primary"
            >
              {loading ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dealership Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đại lý</DialogTitle>
          </DialogHeader>
          {selectedDealership && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{selectedDealership.name}</h3>
                <p className="text-sm text-muted-foreground">ID: {selectedDealership.dealershipId}</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Địa chỉ</Label>
                  <div className="flex items-start mt-1">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <p className="text-sm">{selectedDealership.address}</p>
                  </div>
                </div>
                
                {selectedDealership.phoneNumber && (
                  <div>
                    <Label className="text-sm font-medium">Số điện thoại</Label>
                    <div className="flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                      <p className="text-sm">{selectedDealership.phoneNumber}</p>
                    </div>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Thống kê</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="text-center p-3 border rounded">
                      <div className="text-xl font-bold">{getTotalWarehouses(selectedDealership)}</div>
                      <div className="text-xs text-muted-foreground">Kho</div>
                    </div>
                    <div className="text-center p-3 border rounded">
                      <div className="text-xl font-bold">{getTotalVehicles(selectedDealership)}</div>
                      <div className="text-xs text-muted-foreground">Xe</div>
                    </div>
                  </div>
                </div>

                {selectedDealership.warehouses && selectedDealership.warehouses.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Kho hàng</Label>
                    <div className="mt-2 space-y-2">
                      {selectedDealership.warehouses.map((warehouse) => (
                        <div key={warehouse.warehouseId} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="text-sm font-medium">{warehouse.warehouseName}</p>
                            <p className="text-xs text-muted-foreground">{warehouse.warehouseLocation}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{warehouse.vehicleQuantity} xe</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}