import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useWarehouseDetail } from "@/hooks/use-warehouse-detail";
import { useModels } from "@/hooks/use-models";
import { useToast } from "@/hooks/use-toast";
import type { WarehouseResponse } from "@/services/api-warehouse";
import Models from "./Models";
import AddModelDialog from "@/components/AddModelDialog";
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
import { Folder } from "@/components/ui/folder";
import { WarehouseStatusBadge } from "@/components/ui/warehouse-status-badge";

export default function Warehouses() {
  const [selectedWarehouse, setSelectedWarehouse] = useState<number | null>(null);
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isStockDialogOpen, setIsStockDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponse | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<number | null>(null);
  const [deleteStockModelCode, setDeleteStockModelCode] = useState<string | null>(null);
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [stockModelCode, setStockModelCode] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  
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

  const openStockDialog = (modelCode?: string, quantity?: number) => {
    if (modelCode !== undefined) {
      setStockModelCode(modelCode);
      setStockQuantity(quantity || 0);
    } else {
      setStockModelCode("");
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
    // Validate inputs - much simpler now!
    if (!selectedWarehouse) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn kho",
        variant: "destructive",
      });
      return;
    }

    if (!stockModelCode.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã model",
        variant: "destructive",
      });
      return;
    }

    if (stockQuantity < 0) {
      toast({
        title: "Lỗi",
        description: "Số lượng phải >= 0",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Request details:', {
        warehouseId: selectedWarehouse,
        modelCode: stockModelCode.trim(),
        quantity: stockQuantity
      });
      
      await upsertWarehouseStock(selectedWarehouse, {
        modelCode: stockModelCode.trim(),
        quantity: stockQuantity,
      });
      
      // Reset form and close dialog
      setStockModelCode("");
      setStockQuantity(0);
      setIsStockDialogOpen(false);
      
      toast({
        title: "Thành công",
        description: `Đã thêm ${stockQuantity} xe model ${stockModelCode} vào kho`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tồn kho",
        variant: "destructive",
      });
    }
  };

  const handleModelCreated = (modelCode: string) => {
    // Auto-select the newly created model in the stock dialog
    setStockModelCode(modelCode);
    // Refresh models list
    fetchModels();
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
    if (!deleteStockModelCode || !selectedWarehouse) return;

    try {
      await removeWarehouseStock(selectedWarehouse, deleteStockModelCode);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa tồn kho",
        variant: "destructive",
      });
    } finally {
      setDeleteStockModelCode(null);
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
              <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Mã Model</TableHead>
                    <TableHead>Thương hiệu</TableHead>
                    <TableHead>Màu</TableHead>
                    <TableHead>Năm SX</TableHead>
                    <TableHead className="text-right">Tổng SL</TableHead>
                    <TableHead className="text-right">Xe có sẵn</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouseDetail?.items && Array.isArray(warehouseDetail.items) && warehouseDetail.items.length > 0 ? (
                    warehouseDetail.items.map((item, index) => {
                      const modelKey = `${item.modelCode}-${item.color}-${index}`;
                      const availableCount = item.serials ? item.serials.filter(serial => serial.status === 'AVAILABLE').length : 0;
                      
                      return (
                        <Folder
                          key={modelKey}
                          id={modelKey}
                          colSpan={8}
                          expandedContent={
                            <div>
                              {item.serials && item.serials.length > 0 ? (
                                <div className="space-y-3">
                                  <div className="text-sm font-medium text-muted-foreground mb-3">
                                    Chi tiết xe - {item.brand} {item.modelCode} ({item.color})
                                  </div>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>VIN</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Giữ chỗ đến</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {item.serials.map((serial, serialIndex) => (
                                        <TableRow key={`${serial.vin}-${serialIndex}`} className="hover:bg-muted/50">
                                          <TableCell className="font-mono text-sm">
                                            {serial.vin}
                                          </TableCell>
                                          <TableCell>
                                            <WarehouseStatusBadge vehicleStatus={serial.status} />
                                          </TableCell>
                                          <TableCell className="text-sm text-muted-foreground">
                                            {serial.holdUntil ? new Date(serial.holdUntil).toLocaleString('vi-VN') : '-'}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground text-sm">
                                  Không có xe nào trong model này
                                </div>
                              )}
                            </div>
                          }
                        >
                          <TableCell className="font-mono text-sm font-medium">
                            {item.modelCode}
                          </TableCell>
                          <TableCell className="font-medium">{item.brand}</TableCell>
                          <TableCell>
                            <WarehouseStatusBadge variant="secondary">
                              {item.color}
                            </WarehouseStatusBadge>
                          </TableCell>
                          <TableCell>{item.productionYear}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            <WarehouseStatusBadge count={availableCount} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteStockModelCode(item.modelCode)}
                              title="Xóa tồn kho"
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </Folder>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">
                        Không có tồn kho trong kho này
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              </>
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
              {stockModelCode ? "Cập nhật tồn kho" : "Thêm tồn kho mới"}
            </DialogTitle>
            <DialogDescription>
              {stockModelCode ? "Cập nhật số lượng tồn kho" : "Thêm model và số lượng vào kho"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stock-model">Chọn Model</Label>
              <div className="flex gap-2">
                <Select 
                  value={stockModelCode} 
                  onValueChange={setStockModelCode}
                  disabled={modelsLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={modelsLoading ? "Đang tải models..." : "Chọn model"} />
                  </SelectTrigger>
                  <SelectContent>
                    {models && models.length > 0 ? (
                      models.map((model) => (
                        <SelectItem key={model.modelId} value={model.modelCode}>
                          {model.modelCode}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        Không có model nào
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setIsModelDialogOpen(true)}
                  title="Thêm model mới"
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
              {stockModelCode ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Model Dialog */}
      <AddModelDialog 
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        onModelCreated={handleModelCreated}
      />

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
      <AlertDialog open={!!deleteStockModelCode} onOpenChange={() => setDeleteStockModelCode(null)}>
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
