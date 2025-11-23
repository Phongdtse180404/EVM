import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";
import type { ModelResponse } from "@/services/api-model";
import AddModelDialog from "@/components/AddModelDialog";
import DeleteAlert from "@/components/DeleteAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Models() {
  // Model CRUD state
  const [editingModel, setEditingModel] = useState<ModelResponse | null>(null);
  const [deleteModelId, setDeleteModelId] = useState<number | null>(null);
  const [isEditModelDialogOpen, setIsEditModelDialogOpen] = useState(false);

  const { toast } = useToast();
  
  // Use custom hook for model operations
  const {
    models,
    modelsLoading,
    fetchModels,
    deleteModel
  } = useModels();

  // Use electric vehicle hook for deleting electric vehicles
  const {
    deleteElectricVehicleByModelId,
    fetchElectricVehicles
  } = useElectricVehicle();

  // Initial data fetch
  useEffect(() => {
    fetchModels();
    fetchElectricVehicles();
  }, [fetchModels, fetchElectricVehicles]);

  // Model CRUD Functions
  const openEditModelDialog = (model?: ModelResponse) => {
    setEditingModel(model || null);
    setIsEditModelDialogOpen(true);
  };
  


  const handleDeleteModel = async () => {
    if (!deleteModelId) return;

    try {
      console.log('Starting model deletion process for modelId:', deleteModelId);
      
      // First, delete the corresponding electric vehicle using the hook
      const electricVehicleResult = await deleteElectricVehicleByModelId(deleteModelId, {
        onSuccess: () => {
          console.log('Electric vehicle deletion completed successfully');
        },
        onError: (error) => {
          console.error('Electric vehicle deletion failed:', error);
          toast({
            title: "Lỗi",
            description: "Không thể xóa xe điện liên quan. Hủy bỏ việc xóa model.",
            variant: "destructive",
          });
        }
      });
      
      // Only proceed with model deletion if electric vehicle deletion was successful
      if (electricVehicleResult.success) {
        console.log('Proceeding to delete model:', deleteModelId);
        await deleteModel(deleteModelId);
        
        // Refresh electric vehicles list after successful deletion
        fetchElectricVehicles();
      } else {
        console.log('Electric vehicle deletion failed, aborting model deletion');
        toast({
          title: "Hủy bỏ",
          description: "Không thể xóa model do lỗi khi xóa xe điện liên quan",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error('Error in delete model process:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra trong quá trình xóa model",
        variant: "destructive",
      });
    } finally {
      setDeleteModelId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Danh sách Model</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Quản lý các model xe điện
            </p>
          </div>
          <Button onClick={() => openEditModelDialog()} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm Model
          </Button>
        </CardHeader>
        <CardContent>
          {modelsLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải danh sách model...
            </div>
          ) : (
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Mã Model</TableHead>
                    <TableHead>Thương hiệu</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Năm sản xuất</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {models && models.length > 0 ? (
                  models.map((model) => (
                    <TableRow key={model.modelId}>
                      <TableCell className="font-mono text-sm">
                        {model.modelId}
                      </TableCell>
                      <TableCell>{model.modelCode || 'N/A'}</TableCell>
                      <TableCell>{model.brand || 'N/A'}</TableCell>
                      <TableCell>{model.color || 'N/A'}</TableCell>
                      <TableCell>{model.productionYear || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModelDialog(model)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Không có model nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Model Edit Dialog */}
      <AddModelDialog 
        open={isEditModelDialogOpen}
        onOpenChange={setIsEditModelDialogOpen}
        editingModel={editingModel}
        onModelCreated={fetchModels}
      />

      {/* Delete Model Alert */}
      <DeleteAlert
        open={!!deleteModelId}
        onOpenChange={() => setDeleteModelId(null)}
        onConfirm={handleDeleteModel}
        description="Bạn có chắc chắn muốn xóa model này? Hành động này sẽ xóa cả xe điện liên quan và không thể hoàn tác."
      />
    </div>
  );
}