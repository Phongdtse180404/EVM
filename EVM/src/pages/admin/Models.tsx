import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import type { ModelRequest, ModelResponse } from "@/services/api-model";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mode } from "fs";

export default function Models() {
  // Model CRUD state
  const [editingModel, setEditingModel] = useState<ModelResponse | null>(null);
  const [deleteModelId, setDeleteModelId] = useState<number | null>(null);
  const [isEditModelDialogOpen, setIsEditModelDialogOpen] = useState(false);
  const [modelFormData, setModelFormData] = useState<ModelRequest>({
    modelCode: "",
    brand: "",
    color: "",
    productionYear: new Date().getFullYear()
  });

  const { toast } = useToast();
  
  // Use custom hook for model operations
  const {
    models,
    modelsLoading,
    fetchModels,
    createModel,
    updateModel,
    deleteModel
  } = useModels();

  // Initial data fetch
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  // Model CRUD Functions
  const openEditModelDialog = (model?: ModelResponse) => {

    // Displays model information if updating
    if (model) {
      setEditingModel(model);
      setModelFormData({
        modelCode: model.modelCode || "",
        brand: model.brand || "",
        color: model.color || "",
        productionYear: model.productionYear || new Date().getFullYear()
      });
    // Displays empty form if adding
    } else {
      setEditingModel(null);
      setModelFormData({
        modelCode: "",
        brand: "",
        color: "",
        productionYear: new Date().getFullYear()
      });
    }
    setIsEditModelDialogOpen(true);
  };

  const handleSaveModel = async () => {
    if (!modelFormData.modelCode.trim() || !modelFormData.brand.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã model và thương hiệu",
        variant: "destructive",
      });
      return;
    }

    const success = editingModel 
      ? await updateModel(editingModel.modelId, modelFormData)
      : await createModel(modelFormData);
      
    if (success) {
      setIsEditModelDialogOpen(false);
    }
  };

  const handleDeleteModel = async () => {
    if (!deleteModelId) return;

    try {
      await deleteModel(deleteModelId);
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteModelId(model.modelId)}
                          >
                            <Trash2 className="h-4 w-4" />
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
      <Dialog open={isEditModelDialogOpen} onOpenChange={setIsEditModelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingModel ? "Chỉnh sửa Model" : "Thêm Model mới"}
            </DialogTitle>
            <DialogDescription>
              {editingModel ? "Cập nhật thông tin model" : "Nhập thông tin model mới"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="model-code">Mã Model *</Label>
              <Input
                id="model-code"
                value={modelFormData.modelCode}
                onChange={(e) => setModelFormData(prev => ({ ...prev, modelCode: e.target.value }))}
                placeholder="Nhập mã model"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Thương hiệu *</Label>
              <Input
                id="brand"
                value={modelFormData.brand}
                onChange={(e) => setModelFormData(prev => ({ ...prev, brand: e.target.value }))}
                placeholder="Nhập thương hiệu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Màu sắc</Label>
              <Input
                id="color"
                value={modelFormData.color}
                onChange={(e) => setModelFormData(prev => ({ ...prev, color: e.target.value }))}
                placeholder="Nhập màu sắc"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="production-year">Năm sản xuất</Label>
              <Input
                id="production-year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={modelFormData.productionYear}
                onChange={(e) => setModelFormData(prev => ({ ...prev, productionYear: Number(e.target.value) }))}
                placeholder="Nhập năm sản xuất"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModelDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveModel}>
              {editingModel ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Model Alert */}
      <AlertDialog open={!!deleteModelId} onOpenChange={() => setDeleteModelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa model này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteModel}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}