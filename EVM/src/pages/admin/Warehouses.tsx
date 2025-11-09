import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, Plus, Edit, Trash2 } from "lucide-react";
import { useWarehouses } from "@/hooks/use-warehouses";
import { useWarehouseDetail } from "@/hooks/use-warehouse-detail";
import { useModels } from "@/hooks/use-models";
import { useToast } from "@/hooks/use-toast";
import type { WarehouseResponse } from "@/services/api-warehouse";
import Models from "./Models";
import AddModelDialog from "@/components/AddModelDialog";
import WarehouseDialog from "@/components/WarehouseDialog";
import WarehouseStockDialog from "@/components/WarehouseStockDialog";
import WarehouseStockTable from "@/components/WarehouseStockTable";
import WarehouseTable from "@/components/WarehouseTable";
import DeleteAlert from "@/components/DeleteAlert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

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
import { Badge } from "@/components/ui/badge";
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
  const [editingStockModelCode, setEditingStockModelCode] = useState<string>("");
  const [editingStockQuantity, setEditingStockQuantity] = useState<number>(0);
  
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
    setEditingWarehouse(warehouse || null);
    setIsWarehouseDialogOpen(true);
  };

  const openStockDialog = (modelCode?: string, quantity?: number) => {
    setEditingStockModelCode(modelCode || "");
    setEditingStockQuantity(quantity || 0);
    setIsStockDialogOpen(true);
  };

  const handleSaveWarehouse = async (data: {
    warehouseName: string;
    warehouseLocation: string;
    maxCapacity: number;
  }) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.warehouseId, {
          warehouseLocation: data.warehouseLocation,
          warehouseName: data.warehouseName,
          maxCapacity: data.maxCapacity,
        });
        toast({
          title: "Thành công",
          description: "Cập nhật kho thành công",
        });
      } else {
        await createWarehouse({
          warehouseLocation: data.warehouseLocation,
          warehouseName: data.warehouseName,
          maxCapacity: data.maxCapacity,
        });
        toast({
          title: "Thành công",
          description: "Thêm kho mới thành công",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể lưu kho",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle loading state
    }
  };

  const handleSaveStock = async (data: {
    modelCode: string;
    quantity: number;
  }) => {
    if (!selectedWarehouse) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn kho",
        variant: "destructive",
      });
      throw new Error("No warehouse selected");
    }

    try {
      console.log('Request details:', {
        warehouseId: selectedWarehouse,
        modelCode: data.modelCode,
        quantity: data.quantity
      });
      
      await upsertWarehouseStock(selectedWarehouse, {
        modelCode: data.modelCode,
        quantity: data.quantity,
      });
      
      toast({
        title: "Thành công",
        description: `Đã thêm ${data.quantity} xe model ${data.modelCode} vào kho`,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật tồn kho",
        variant: "destructive",
      });
      throw error; // Re-throw to let the dialog handle loading state
    }
  };

  const handleModelCreated = (modelCode: string) => {
    // Auto-select the newly created model in the stock dialog
    setEditingStockModelCode(modelCode);
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
            <WarehouseTable
              warehouses={allWarehouses || []}
              loading={loading}
              onSelectWarehouse={setSelectedWarehouse}
              onEditWarehouse={openWarehouseDialog}
              onDeleteWarehouse={setDeleteWarehouseId}
            />
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
            <WarehouseStockTable
              warehouseDetail={warehouseDetail}
              loading={warehouseDetailLoading}
              onDeleteStock={setDeleteStockModelCode}
            />
          </CardContent>
        </Card>
      )}

      {/* Warehouse Dialog */}
      <WarehouseDialog
        open={isWarehouseDialogOpen}
        onOpenChange={setIsWarehouseDialogOpen}
        editingWarehouse={editingWarehouse}
        onSave={handleSaveWarehouse}
      />

      {/* Stock Dialog */}
      <WarehouseStockDialog
        open={isStockDialogOpen}
        onOpenChange={setIsStockDialogOpen}
        models={models}
        modelsLoading={modelsLoading}
        selectedModelCode={editingStockModelCode}
        selectedQuantity={editingStockQuantity}
        onSave={handleSaveStock}
        onAddModel={() => setIsModelDialogOpen(true)}
      />

      {/* Add Model Dialog */}
      <AddModelDialog 
        open={isModelDialogOpen}
        onOpenChange={setIsModelDialogOpen}
        onModelCreated={handleModelCreated}
      />

      {/* Delete Alerts */}
      <DeleteAlert
        open={!!deleteWarehouseId}
        onOpenChange={() => setDeleteWarehouseId(null)}
        onConfirm={handleDeleteWarehouse}
        description="Bạn có chắc chắn muốn xóa kho này? Hành động này không thể hoàn tác."
      />

      <DeleteAlert
        open={!!deleteStockModelCode}
        onOpenChange={() => setDeleteStockModelCode(null)}
        onConfirm={handleDeleteStock}
        description="Bạn có chắc chắn muốn xóa tồn kho này? Hành động này không thể hoàn tác."
      />
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Models />
        </TabsContent>
      </Tabs>


    </div>
  );
}
