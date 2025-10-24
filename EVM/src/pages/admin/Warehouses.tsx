import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, WarehouseResponse, ModelResponse, WarehouseStockRequest } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui_admin/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui_admin/alert-dialog";
import { Label } from "@/components/ui_admin/label";
import { Input } from "@/components/ui_admin/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui_admin/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui_admin/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui_admin/card";
import { Button } from "@/components/ui_admin/button";

export default function Warehouses() {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponse | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<number | null>(null);
  const [deleteStockModelId, setDeleteStockModelId] = useState<number | null>(null);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [stockModelId, setStockModelId] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [newModelCode, setNewModelCode] = useState("");
  const [newModelBrand, setNewModelBrand] = useState("");
  const { toast } = useToast();

  // Get unique locations from all warehouses
  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const warehouses = await apiService.getWarehouses();
      const uniqueLocations = [...new Set(warehouses.map(w => w.warehouseLocation))];
      return uniqueLocations;
    },
  });

  const { data: warehouses, refetch: refetchWarehouses } = useQuery({
    queryKey: ["warehouses", selectedLocation],
    queryFn: () => {
      if (!selectedLocation) return Promise.resolve([]);
      return apiService.getWarehouses().then(warehouses => 
        warehouses.filter(w => w.warehouseLocation === selectedLocation)
      );
    },
    enabled: !!selectedLocation,
  });

  const { data: selectedWarehouseData, refetch: refetchWarehouseData } = useQuery({
    queryKey: ["warehouse", selectedWarehouse],
    queryFn: () => selectedWarehouse ? apiService.getWarehouse(selectedWarehouse) : Promise.resolve(null),
    enabled: !!selectedWarehouse,
  });

  const { data: models, refetch: refetchModels } = useQuery({
    queryKey: ["models"],
    queryFn: () => apiService.getModels(),
  });

  const openWarehouseDialog = (warehouse?: WarehouseResponse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseLocation(warehouse.warehouseLocation);
    } else {
      setEditingWarehouse(null);
      setWarehouseLocation("");
    }
    setIsWarehouseDialogOpen(true);
  };

  const openStockDialog = (modelId?: number, quantity?: number) => {
    if (modelId !== undefined) {
      setStockModelId(modelId);
      setStockQuantity(quantity || 0);
    } else {
      setStockModelId(null);
      setStockQuantity(0);
    }
    setIsStockDialogOpen(true);
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseLocation.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập địa điểm kho",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingWarehouse) {
        await apiService.updateWarehouse(editingWarehouse.warehouseId, {
          warehouseLocation: warehouseLocation,
        });
        toast({
          title: "Thành công",
          description: "Cập nhật kho thành công",
        });
      } else {
        await apiService.createWarehouse({
          warehouseLocation: warehouseLocation,
        });
        toast({
          title: "Thành công",
          description: "Thêm kho mới thành công",
        });
      }
      setIsWarehouseDialogOpen(false);
      refetchWarehouses();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu kho",
        variant: "destructive",
      });
    }
  };

  const handleSaveStock = async () => {
    if (!stockModelId || stockQuantity < 0) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn model và nhập số lượng hợp lệ",
        variant: "destructive",
      });
      return;
    }

    if (!selectedWarehouse) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn kho",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.upsertWarehouseStock(selectedWarehouse, {
        modelId: stockModelId,
        quantity: stockQuantity,
      });
      toast({
        title: "Thành công",
        description: "Cập nhật tồn kho thành công",
      });
      setIsStockDialogOpen(false);
      refetchWarehouseData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật tồn kho",
        variant: "destructive",
      });
    }
  };

  const handleAddModel = async () => {
    if (!newModelCode.trim() || !newModelBrand.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã model và thương hiệu",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.createModel({ 
        modelCode: newModelCode,
        brand: newModelBrand 
      });
      toast({
        title: "Thành công",
        description: "Thêm model mới thành công",
      });
      setNewModelCode("");
      setNewModelBrand("");
      setIsModelDialogOpen(false);
      refetchModels();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm model",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!deleteWarehouseId) return;

    try {
      await apiService.deleteWarehouse(deleteWarehouseId);
      toast({
        title: "Thành công",
        description: "Xóa kho thành công",
      });
      refetchWarehouses();
      if (selectedWarehouse === deleteWarehouseId) {
        setSelectedWarehouse(null);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa kho",
        variant: "destructive",
      });
    } finally {
      setDeleteWarehouseId(null);
    }
  };

  const handleDeleteStock = async () => {
    if (!deleteStockModelId || !selectedWarehouse) return;

    try {
      await apiService.removeWarehouseStock(selectedWarehouse, deleteStockModelId);
      toast({
        title: "Thành công",
        description: "Xóa tồn kho thành công",
      });
      refetchWarehouseData();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa tồn kho",
        variant: "destructive",
      });
    } finally {
      setDeleteStockModelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Kho</h1>
        <p className="text-muted-foreground mt-2">
          Chọn địa điểm và kho để xem xe điện
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chọn Địa điểm</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLocation} onValueChange={(value) => {
            setSelectedLocation(value);
            setSelectedWarehouse(null);
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {locations?.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedLocation && !selectedWarehouse && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle>Danh sách Kho</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Nhấp vào kho để xem xe điện
              </p>
            </div>
            <Button onClick={() => openWarehouseDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Kho
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Địa điểm Kho</TableHead>
                  <TableHead>Số lượng xe</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses && warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                    <TableRow key={warehouse.warehouseId}>
                      <TableCell 
                        className="font-mono text-sm cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.warehouseId)}
                      >
                        {warehouse.warehouseId}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.warehouseId)}
                      >
                        {warehouse.warehouseLocation}
                      </TableCell>
                      <TableCell 
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.warehouseId)}
                      >
                        {warehouse.vehicleQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              openWarehouseDialog(warehouse);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteWarehouseId(warehouse.warehouseId);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedWarehouse(warehouse.warehouseId)}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Không có kho trong địa điểm này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {selectedWarehouse && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedWarehouse(null)}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Tồn kho</CardTitle>
            </div>
            <Button onClick={() => openStockDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm tồn kho
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Model ID</TableHead>
                  <TableHead>Mã Model</TableHead>
                  <TableHead>Thương hiệu</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedWarehouseData?.items && selectedWarehouseData.items.length > 0 ? (
                  selectedWarehouseData.items.map((item) => (
                    <TableRow key={item.modelId}>
                      <TableCell className="font-mono text-sm">
                        {item.modelId}
                      </TableCell>
                      <TableCell>{item.modelCode}</TableCell>
                      <TableCell>{item.brand}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openStockDialog(item.modelId, item.quantity)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteStockModelId(item.modelId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Không có tồn kho trong kho này
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Warehouse Dialog */}
      <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingWarehouse ? "Chỉnh sửa Kho" : "Thêm Kho mới"}
            </DialogTitle>
            <DialogDescription>
              {editingWarehouse ? "Cập nhật thông tin kho" : "Nhập thông tin kho mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="warehouse-location">Địa điểm Kho</Label>
              <Input
                id="warehouse-location"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                placeholder="Nhập địa điểm kho"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWarehouseDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveWarehouse}>
              {editingWarehouse ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Dialog */}
      <Dialog open={isStockDialogOpen} onOpenChange={setIsStockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {stockModelId ? "Cập nhật tồn kho" : "Thêm tồn kho mới"}
            </DialogTitle>
            <DialogDescription>
              {stockModelId ? "Cập nhật số lượng tồn kho" : "Thêm model và số lượng vào kho"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-model">Model</Label>
              <div className="flex gap-2">
                <Select value={stockModelId?.toString() || ""} onValueChange={(value) => setStockModelId(Number(value))}>
                  <SelectTrigger id="stock-model" className="flex-1">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {models?.map((model) => (
                      <SelectItem key={model.modelId} value={model.modelId.toString()}>
                        {model.brand} - {model.modelCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsModelDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock-quantity">Số lượng</Label>
              <Input
                id="stock-quantity"
                type="number"
                min="0"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(Number(e.target.value))}
                placeholder="Nhập số lượng"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStockDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveStock}>
              {stockModelId ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Dialog */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm Model mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin model xe điện mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-code">Mã Model</Label>
              <Input
                id="model-code"
                value={newModelCode}
                onChange={(e) => setNewModelCode(e.target.value)}
                placeholder="Nhập mã model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-brand">Thương hiệu</Label>
              <Input
                id="model-brand"
                value={newModelBrand}
                onChange={(e) => setNewModelBrand(e.target.value)}
                placeholder="Nhập thương hiệu"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModelDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAddModel}>Thêm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Warehouse Alert */}
      <AlertDialog open={!!deleteWarehouseId} onOpenChange={() => setDeleteWarehouseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa kho này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWarehouse}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Stock Alert */}
      <AlertDialog open={!!deleteStockModelId} onOpenChange={() => setDeleteStockModelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tồn kho này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteStock}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
