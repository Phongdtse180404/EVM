import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useWarehouseDetail } from "@/hooks/use-warehouse-detail";
import { useModels } from "@/hooks/use-models";
import { useToast } from "@/hooks/use-toast";
import type { WarehouseResponse } from "@/services/api-warehouse";
import type { ModelResponse } from "@/services/api-model";
import Models from "./Models";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Warehouses() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponse | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<number | null>(null);
  const [deleteStockModelId, setDeleteStockModelId] = useState<number | null>(null);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [stockModelId, setStockModelId] = useState<number | null>(null);
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [newModelCode, setNewModelCode] = useState("");
  const [newModelBrand, setNewModelBrand] = useState("");
  
  const { toast } = useToast();
  
  // Custom hooks
  const { 
    allWarehouses, 
    loading, 
    fetchWarehouses, 
    createWarehouse, 
    updateWarehouse, 
    deleteWarehouse 
  } = useWarehouses();
  
  const { 
    warehouseDetail, 
    warehouseDetailLoading, 
    fetchWarehouseDetail, 
    upsertWarehouseStock, 
    removeWarehouseStock, 
    clearWarehouseDetail 
  } = useWarehouseDetail();
  
  const { 
    models, 
    modelsLoading, 
    fetchModels, 
    createModel 
  } = useModels();
  

  // Initial data fetch
  useEffect(() => {
    fetchWarehouses();
    fetchModels();
  }, [fetchWarehouses, fetchModels]);

  // Fetch warehouse detail when selectedWarehouse changes
  useEffect(() => {
    if (selectedWarehouse) {
      fetchWarehouseDetail(selectedWarehouse);
    } else {
      clearWarehouseDetail();
    }
  }, [selectedWarehouse, fetchWarehouseDetail, clearWarehouseDetail]);

  const openWarehouseDialog = (warehouse?: WarehouseResponse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseLocation(warehouse.warehouseLocation);
      setWarehouseName(warehouse.warehouseName);
    } else {
      setEditingWarehouse(null);
      setWarehouseLocation("");
      setWarehouseName("");
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
    if (!warehouseLocation.trim() || !warehouseName.trim()) {
      toast({
        title: "Lỗi",
        description: !warehouseLocation.trim() 
          ? "Vui lòng nhập địa điểm kho"
          : "Vui lòng nhập tên kho",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.warehouseId, {
          warehouseLocation: warehouseLocation,
          warehouseName: warehouseName,
        });
      } else {
        await createWarehouse({
          warehouseLocation: warehouseLocation,
          warehouseName: warehouseName,
        });
      }
      setIsWarehouseDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu kho",
        variant: "destructive",
      });
    }
  };

  const handleSaveStock = async () => {
    // Validate inputs
    if (!stockModelId || stockQuantity < 0 || !selectedWarehouse) {
      toast({
        title: "Lỗi",
        description: !selectedWarehouse 
          ? "Vui lòng chọn kho" 
          : "Vui lòng chọn model và nhập số lượng hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      await upsertWarehouseStock(selectedWarehouse, {
        modelId: stockModelId,
        quantity: stockQuantity,
      });
      setIsStockDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tồn kho",
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
      await createModel({ 
        modelCode: newModelCode,
        brand: newModelBrand 
      });
      setNewModelCode("");
      setNewModelBrand("");
      setIsModelDialogOpen(false);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm model",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWarehouse = async () => {
    if (!deleteWarehouseId) return;

    try {
      await deleteWarehouse(deleteWarehouseId);
      if (selectedWarehouse === deleteWarehouseId) {
        setSelectedWarehouse(null);
      }
    } finally {
      setDeleteWarehouseId(null);
    }
  };

  const handleDeleteStock = async () => {
    if (!deleteStockModelId || !selectedWarehouse) return;

    try {
      await removeWarehouseStock(selectedWarehouse, deleteStockModelId);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tồn kho",
        variant: "destructive",
      });
    } finally {
      setDeleteStockModelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Kho & Model</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý kho hàng và các model xe điện
        </p>
      </div>

      <Tabs defaultValue="warehouses" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="warehouses">Quản lý Kho</TabsTrigger>
          <TabsTrigger value="models">Quản lý Model</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouses" className="space-y-6">
          {!selectedWarehouse && (
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải danh sách kho...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên Kho</TableHead>
                    <TableHead>Địa điểm Kho</TableHead>
                    <TableHead>Số lượng xe</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allWarehouses && allWarehouses.length > 0 ? (
                  allWarehouses.map((warehouse) => (
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
                        {warehouse.warehouseName}
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
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        Không có kho nào
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
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
            {warehouseDetailLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Đang tải thông tin kho...
              </div>
            ) : (
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
                  {warehouseDetail?.items && Array.isArray(warehouseDetail.items) && warehouseDetail.items.length > 0 ? (
                  warehouseDetail.items
                    .filter((item) => {
                      if (!item) {
                        console.warn('Found null/undefined item in warehouse items');
                        return false;
                      }
                      if (!item.model) {
                        console.warn('Found item without model:', item);
                        return false;
                      }
                      if (!item.model.modelId) {
                        console.warn('Found item with model without modelId:', item);
                        return false;
                      }
                      return true;
                    })
                    .map((item) => (
                      <TableRow key={item.model.modelId}>
                        <TableCell className="font-mono text-sm">
                          {item.model.modelId}
                        </TableCell>
                        <TableCell>{item.model.modelCode || 'N/A'}</TableCell>
                        <TableCell>{item.model.brand || 'N/A'}</TableCell>
                        <TableCell className="text-right">
                          {item.quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openStockDialog(item.model.modelId, item.quantity)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteStockModelId(item.model.modelId)}
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
            )}
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
              <Label htmlFor="warehouse-name">Tên Kho</Label>
              <Input
                id="warehouse-name"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="Nhập tên kho"
              />
            </div>
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
                <Select 
                  value={stockModelId?.toString() || ""} 
                  onValueChange={(value) => setStockModelId(Number(value))}
                  disabled={modelsLoading}
                >
                  <SelectTrigger id="stock-model" className="flex-1">
                    <SelectValue placeholder={modelsLoading ? "Đang tải..." : "Chọn model"} />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {models && Array.isArray(models) && models.length > 0 ? (
                      models
                        .filter((model: ModelResponse) => model && typeof model.modelId !== 'undefined' && model.modelId !== null)
                        .map((model: ModelResponse) => (
                          <SelectItem key={model.modelId} value={model.modelId.toString()}>
                            {model.brand || 'Unknown'} - {model.modelCode || 'Unknown'}
                          </SelectItem>
                        ))
                    ) : (
                      <SelectItem value="no-models" disabled>
                        {modelsLoading ? "Đang tải..." : "Không có model nào"}
                      </SelectItem>
                    )}
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
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Models />
        </TabsContent>
      </Tabs>


    </div>
  );
}
