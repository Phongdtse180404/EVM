import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import type { ModelRequest } from "@/services/api-model";
import { electricVehicleService } from "@/services/api-electric-vehicle";
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
import { Button } from "@/components/ui/button";

interface AddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModelCreated?: (modelCode: string) => void;
  editingModel?: {
    modelId: number;
    modelCode: string;
    brand: string;
    color: string;
    productionYear: number;
  } | null;
}

export default function AddModelDialog({ 
  open, 
  onOpenChange, 
  onModelCreated,
  editingModel = null 
}: AddModelDialogProps) {
  const [modelFormData, setModelFormData] = useState<ModelRequest>({
    modelCode: editingModel?.modelCode || "",
    brand: editingModel?.brand || "",
    color: editingModel?.color || "",
    productionYear: editingModel?.productionYear || new Date().getFullYear()
  });

  const { toast } = useToast();
  const { createModel, updateModel } = useModels();

  // Reset form when dialog opens/closes or editingModel changes
  useEffect(() => {
    if (open) {
      setModelFormData({
        modelCode: editingModel?.modelCode || "",
        brand: editingModel?.brand || "",
        color: editingModel?.color || "",
        productionYear: editingModel?.productionYear || new Date().getFullYear()
      });
    }
  }, [open, editingModel]);

  const handleSave = async () => {
    if (!modelFormData.modelCode?.trim() || !modelFormData.brand?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã model và thương hiệu",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = editingModel 
        ? await updateModel(editingModel.modelId, modelFormData)
        : await createModel(modelFormData);
        
      if (result) {
        // If creating a new model, also create the electric vehicle
        if (!editingModel && typeof result === 'object' && result.modelId && result.modelCode) {
          try {
            await electricVehicleService.createElectricVehicle({
              modelId: result.modelId,
              modelCode: result.modelCode,
              cost: 500000000, // 500M VND placeholder
              price: 800000000, // 800M VND placeholder
              batteryCapacity: 75, // 75 kWh placeholder
              imageUrl: "https://via.placeholder.com/400x300", // Placeholder image
              status: "AVAILABLE"
            });
            
            toast({
              title: "Thành công",
              description: "Đã tạo model và xe điện thành công",
            });
          } catch (electricVehicleError) {
            toast({
              title: "Cảnh báo",
              description: "Model đã được tạo nhưng không thể tạo xe điện",
              variant: "destructive",
            });
          }
        } else if (editingModel) {
          toast({
            title: "Thành công",
            description: "Đã cập nhật model thành công",
          });
        }
        
        // If creating a new model and callback provided, call it with the model code
        if (!editingModel && onModelCreated && typeof result === 'object' && result.modelCode) {
          onModelCreated(result.modelCode);
        }
        
        onOpenChange(false);
      }
    } catch (error) {
      toast({
        title: "Lỗi",
        description: editingModel ? "Không thể cập nhật model" : "Không thể thêm model",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>
            {editingModel ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}