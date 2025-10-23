import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiService, Warehouse, EV } from "@/services/api";
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
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);
  const [isEVDialogOpen, setIsEVDialogOpen] = useState(false);
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [editingEV, setEditingEV] = useState<EV | null>(null);
  const [deleteWarehouseId, setDeleteWarehouseId] = useState<string | null>(null);
  const [deleteEVId, setDeleteEVId] = useState<string | null>(null);
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [evModel, setEvModel] = useState("");
  const [evPrice, setEvPrice] = useState("");
  const [evColor, setEvColor] = useState("");
  const [evStatus, setEvStatus] = useState<"có sẵn" | "đã đặt" | "đang giao" | "bảo trì">("có sẵn");
  const [evNotes, setEvNotes] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const { toast } = useToast();

  const { data: locations } = useQuery({
    queryKey: ["locations"],
    queryFn: () => apiService.getLocations(),
  });

  const { data: warehouses, refetch: refetchWarehouses } = useQuery({
    queryKey: ["warehouses", selectedLocation],
    queryFn: () => selectedLocation ? apiService.getWarehouses(selectedLocation) : Promise.resolve([]),
    enabled: !!selectedLocation,
  });

  const { data: evs, refetch: refetchEVs } = useQuery({
    queryKey: ["evs", selectedWarehouse],
    queryFn: () => selectedWarehouse ? apiService.getEVs(selectedWarehouse) : Promise.resolve([]),
    enabled: !!selectedWarehouse,
  });

  const { data: models, refetch: refetchModels } = useQuery({
    queryKey: ["models"],
    queryFn: () => apiService.getModels(),
  });

  const openWarehouseDialog = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setWarehouseName(warehouse.name);
      setWarehouseAddress(warehouse.address || "");
    } else {
      setEditingWarehouse(null);
      setWarehouseName("");
      setWarehouseAddress("");
    }
    setIsWarehouseDialogOpen(true);
  };

  const openEVDialog = (ev?: EV) => {
    if (ev) {
      setEditingEV(ev);
      setEvModel(ev.model_id);
      setEvPrice(ev.price);
      setEvColor(ev.color || "");
      setEvStatus(ev.status || "có sẵn");
      setEvNotes(ev.notes || "");
    } else {
      setEditingEV(null);
      setEvModel("");
      setEvPrice("");
      setEvColor("");
      setEvStatus("có sẵn");
      setEvNotes("");
    }
    setIsEVDialogOpen(true);
  };

  const handleSaveWarehouse = async () => {
    if (!warehouseName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên kho",
        variant: "destructive",
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn địa điểm",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingWarehouse) {
        await apiService.updateWarehouse(editingWarehouse.id, {
          name: warehouseName,
          address: warehouseAddress
        });
        toast({
          title: "Thành công",
          description: "Cập nhật kho thành công",
        });
      } else {
        await apiService.createWarehouse({
          name: warehouseName,
          address: warehouseAddress,
          location_id: selectedLocation
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

  const handleSaveEV = async () => {
    if (!evModel || !evPrice) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const priceNumber = parseFloat(evPrice);
    if (isNaN(priceNumber) || priceNumber <= 0) {
      toast({
        title: "Lỗi",
        description: "Giá phải là số dương",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingEV) {
        await apiService.updateEV(editingEV.id, {
          model_id: evModel,
          price: priceNumber,
          color: evColor,
          status: evStatus,
          notes: evNotes,
          warehouse_id: selectedWarehouse
        });
        toast({
          title: "Thành công",
          description: "Cập nhật xe điện thành công",
        });
      } else {
        await apiService.createEV({
          model_id: evModel,
          price: priceNumber,
          warehouse_id: selectedWarehouse,
          color: evColor || null,
          status: evStatus,
          notes: evNotes || null
        });
        toast({
          title: "Thành công",
          description: "Thêm xe điện mới thành công",
        });
      }
      setIsEVDialogOpen(false);
      refetchEVs();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu xe điện",
        variant: "destructive",
      });
    }
  };

  const handleAddModel = async () => {
    if (!newModelName.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập tên model",
        variant: "destructive",
      });
      return;
    }

    try {
      await apiService.createModel({ name: newModelName });
      toast({
        title: "Thành công",
        description: "Thêm model mới thành công",
      });
      setNewModelName("");
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
      if (deleteWarehouseId) {
        await apiService.deleteWarehouse(deleteWarehouseId);
        toast({
          title: "Thành công",
          description: "Xóa kho thành công",
        });
        refetchWarehouses();
        if (selectedWarehouse === deleteWarehouseId) {
          setSelectedWarehouse("");
        }
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

  const handleDeleteEV = async () => {
    if (!deleteEVId) return;

    try {
      if (deleteEVId) {
        await apiService.deleteEV(deleteEVId);
        toast({
          title: "Thành công",
          description: "Xóa xe điện thành công",
        });
        refetchEVs();
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa xe điện",
        variant: "destructive",
      });
    } finally {
      setDeleteEVId(null);
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
            setSelectedWarehouse("");
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn địa điểm" />
            </SelectTrigger>
            <SelectContent>
              {locations?.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
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
                  <TableHead>Tên Kho</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses && warehouses.length > 0 ? (
                  warehouses.map((warehouse) => (
                    <TableRow key={warehouse.id}>
                      <TableCell
                        className="font-mono text-sm cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.id)}
                      >
                        {warehouse.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.id)}
                      >
                        {warehouse.name}
                      </TableCell>
                      <TableCell
                        className="cursor-pointer hover:bg-accent/50"
                        onClick={() => setSelectedWarehouse(warehouse.id)}
                      >
                        {warehouse.address}
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
                              setDeleteWarehouseId(warehouse.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSelectedWarehouse(warehouse.id)}
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
                onClick={() => setSelectedWarehouse("")}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Danh sách Xe điện</CardTitle>
            </div>
            <Button onClick={() => openEVDialog()} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Xe điện
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Model</TableHead>
                  <TableHead>Màu sắc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Giá</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evs && evs.length > 0 ? (
                  evs.map((ev: EV) => (
                    <TableRow key={ev.id}>
                      <TableCell className="font-mono text-sm">
                        {ev.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>{ev.models?.name || "N/A"}</TableCell>
                      <TableCell>{ev.color || "-"}</TableCell>
                      <TableCell>{ev.status || "có sẵn"}</TableCell>
                      <TableCell className="text-right">
                        ${Number(ev.price).toLocaleString()}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{ev.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEVDialog(ev)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteEVId(ev.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Không có xe điện trong kho này
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
              <Label htmlFor="warehouse-name">Tên Kho</Label>
              <Input
                id="warehouse-name"
                value={warehouseName}
                onChange={(e) => setWarehouseName(e.target.value)}
                placeholder="Nhập tên kho"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warehouse-address">Địa chỉ</Label>
              <Input
                id="warehouse-address"
                value={warehouseAddress}
                onChange={(e) => setWarehouseAddress(e.target.value)}
                placeholder="Nhập địa chỉ kho"
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

      {/* EV Dialog */}
      <Dialog open={isEVDialogOpen} onOpenChange={setIsEVDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingEV ? "Chỉnh sửa Xe điện" : "Thêm Xe điện mới"}
            </DialogTitle>
            <DialogDescription>
              {editingEV ? "Cập nhật thông tin xe điện" : "Nhập thông tin xe điện mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ev-model">Model</Label>
              <div className="flex gap-2">
                <Select value={evModel} onValueChange={setEvModel}>
                  <SelectTrigger id="ev-model" className="flex-1">
                    <SelectValue placeholder="Chọn model" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border">
                    {models?.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
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
              <Label htmlFor="ev-price">Giá ($)</Label>
              <Input
                id="ev-price"
                type="number"
                value={evPrice}
                onChange={(e) => setEvPrice(e.target.value)}
                placeholder="Nhập giá"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-color">Màu sắc</Label>
              <Input
                id="ev-color"
                value={evColor}
                onChange={(e) => setEvColor(e.target.value)}
                placeholder="Nhập màu sắc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-status">Trạng thái</Label>
              <Select value={evStatus} onValueChange={(value) => setEvStatus(value as "có sẵn" | "đã đặt" | "đang giao" | "bảo trì")}>
                <SelectTrigger id="ev-status">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  <SelectItem value="có sẵn">Có sẵn</SelectItem>
                  <SelectItem value="đã đặt">Đã đặt</SelectItem>
                  <SelectItem value="đang giao">Đang giao</SelectItem>
                  <SelectItem value="bảo trì">Bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ev-notes">Ghi chú (tùy chọn)</Label>
              <Input
                id="ev-notes"
                value={evNotes}
                onChange={(e) => setEvNotes(e.target.value)}
                placeholder="Nhập ghi chú"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEVDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEV}>
              {editingEV ? "Cập nhật" : "Thêm"}
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
              Nhập tên model xe điện mới
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-name">Tên Model</Label>
              <Input
                id="model-name"
                value={newModelName}
                onChange={(e) => setNewModelName(e.target.value)}
                placeholder="Nhập tên model"
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

      {/* Delete EV Alert */}
      <AlertDialog open={!!deleteEVId} onOpenChange={() => setDeleteEVId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa xe điện này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEV}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
