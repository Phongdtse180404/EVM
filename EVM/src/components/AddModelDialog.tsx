import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useModels } from "@/hooks/use-models";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";
import type { ModelRequest, ModelResponse } from "@/services/api-model";
import type { ElectricVehicleRequest, ElectricVehicleResponse } from "@/services/api-electric-vehicle";
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
import FirebaseImageSelector from "@/components/FirebaseImageSelector";

interface AddModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModelCreated?: (modelCode: string) => void;
  onModelUpdated?: () => void;
  editingModel?: ModelResponse | null;
}

export default function AddModelDialog({
  open,
  onOpenChange,
  onModelCreated,
  onModelUpdated,
  editingModel = null
}: AddModelDialogProps) {

  const [importing, setImporting] = useState<boolean>(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  // Import Excel handler
  const handleImportExcel = async () => {
    if (!importFile) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file Excel để nhập.",
        variant: "destructive",
      });
      return;
    }
    setImporting(true);
    try {
      // Dynamically import the service to avoid circular deps
      const { electricVehicleService } = await import("@/services/api-electric-vehicle");
      const result = await electricVehicleService.importVehicleTypeExcel(importFile);
      toast({
        title: "Thành công",
        description: result || "Nhập file thành công!",
      });
      setImportFile(null);
      
        
      
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Không thể nhập file Excel.",
        variant: "destructive",
      });
    } finally {
      setImporting(false);
      onModelUpdated();
    }
  };
  const [modelFormData, setModelFormData] = useState<ModelRequest>({
    modelCode: editingModel?.modelCode || "",
    brand: editingModel?.brand || "",
    color: editingModel?.color || "",
    productionYear: editingModel?.productionYear || new Date().getFullYear()
  });

  const [electricVehicleFormData, setElectricVehicleFormData] = useState<Omit<ElectricVehicleRequest, 'modelId' | 'modelCode'>>({
    cost: 500000000,
    price: 800000000,
    batteryCapacity: 75,
    imageUrl: "",
    status: "AVAILABLE"
  });

  const [existingElectricVehicle, setExistingElectricVehicle] = useState<ElectricVehicleResponse | null>(null);

  const { toast } = useToast();
  const { createModel, updateModel } = useModels();
  const { createElectricVehicle, updateElectricVehicle, findElectricVehiclesByModelCode, loading: electricVehicleLoading } = useElectricVehicle();

  // Fetch electric vehicle data when editing a model
  useEffect(() => {
    const fetchElectricVehicleData = async () => {
      if (editingModel && open) {
        try {
          const existingEVArray = await findElectricVehiclesByModelCode(editingModel.modelCode);
          const existingEV = existingEVArray && existingEVArray.length > 0 ? existingEVArray[0] : null;
          
          if (existingEV) {
            setExistingElectricVehicle(existingEV);
            setElectricVehicleFormData({
              cost: existingEV.cost,
              price: existingEV.price,
              batteryCapacity: existingEV.batteryCapacity,
              imageUrl: existingEV.imageUrl || "",
              status: existingEV.status
            });
          }
        } catch (error) {
          console.error('Error fetching electric vehicle data:', error);
        }
      }
    };

    if (open) {
      setModelFormData({
        modelCode: editingModel?.modelCode || "",
        brand: editingModel?.brand || "",
        color: editingModel?.color || "",
        productionYear: editingModel?.productionYear || new Date().getFullYear()
      });
      
      if (editingModel) {
        fetchElectricVehicleData();
      } else {
        // Reset to defaults for new model
        setElectricVehicleFormData({
          cost: 500000000,
          price: 800000000,
          batteryCapacity: 75,
          imageUrl: "",
          status: "AVAILABLE"
        });
        setExistingElectricVehicle(null);
      }
    }
  }, [open, editingModel, findElectricVehiclesByModelCode]);

  const handleSave = async () => {
    if (!modelFormData.modelCode?.trim() || !modelFormData.brand?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập mã model và thương hiệu",
        variant: "destructive",
      });
      return;
    }

    // Validate electric vehicle data for both create and update
    if (!electricVehicleFormData.cost || !electricVehicleFormData.price || !electricVehicleFormData.batteryCapacity) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin xe điện (giá vốn, giá bán, dung lượng pin)",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = editingModel 
        ? await updateModel(editingModel.modelId, modelFormData)
        : await createModel(modelFormData);
      if (result) {
        if (editingModel) {
          // Update existing electric vehicle
          if (existingElectricVehicle) {
            await updateElectricVehicle(existingElectricVehicle.vehicleId, {
              modelId: editingModel.modelId,
              modelCode: editingModel.modelCode,
              ...electricVehicleFormData
            });
          }
          toast({
            title: "Thành công",
            description: "Đã cập nhật model và xe điện thành công",
          });
          onModelUpdated();
        } else {
          // Creating a new model, also create the electric vehicle
          if (typeof result === 'object' && result.modelId && result.modelCode) {
            await createElectricVehicle({
              modelId: result.modelId,
              modelCode: result.modelCode,
              ...electricVehicleFormData
            });
          }
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
            {editingModel ? "Chỉnh sửa Model" : ""}
          </DialogTitle>
          <DialogDescription>
            {editingModel ? "Cập nhật thông tin model" : ""}
          </DialogDescription>
        </DialogHeader>
        {editingModel ? (
          <div className="space-y-6 py-4">
            {/* Model Information. Show only for update mode*/}
            <div>
              <h3 className="text-lg font-medium mb-4">Thông tin Model</h3>
              <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">
                {electricVehicleLoading && (
                  <span className="text-sm text-muted-foreground ml-2">(Đang tải...)</span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Giá vốn (VND) *</Label>
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    value={electricVehicleFormData.cost}
                    onChange={(e) => setElectricVehicleFormData(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    placeholder="Nhập giá vốn"
                    disabled={electricVehicleLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Giá bán (VND) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={electricVehicleFormData.price}
                    onChange={(e) => setElectricVehicleFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    placeholder="Nhập giá bán"
                    disabled={electricVehicleLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="battery-capacity">Dung lượng pin (kWh) *</Label>
                  <Input
                    id="battery-capacity"
                    type="number"
                    min="0"
                    step="0.1"
                    value={electricVehicleFormData.batteryCapacity}
                    onChange={(e) => setElectricVehicleFormData(prev => ({ ...prev, batteryCapacity: Number(e.target.value) }))}
                    placeholder="Nhập dung lượng pin"
                    disabled={electricVehicleLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-url">Hình ảnh xe</Label>
                  <FirebaseImageSelector
                    value={electricVehicleFormData.imageUrl}
                    onChange={(url) => setElectricVehicleFormData(prev => ({ ...prev, imageUrl: url }))}
                    disabled={electricVehicleLoading}
                    storagePath="images/vehicles"
                  />
                </div>
              </div>
              {!existingElectricVehicle && !electricVehicleLoading && (
                <p className="text-sm text-yellow-600 mt-2">
                  Không tìm thấy thông tin xe điện cho model này.
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <h3 className="text-lg font-medium mb-4">Nhập Model từ file Excel</h3>
            <div className="space-y-2">
              <Label htmlFor="excel-import">Chọn file Excel (.xlsx)</Label>
              <Input
                id="excel-import"
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={e => setImportFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)}
                disabled={importing}
              />
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          {!editingModel ? (
            <Button onClick={handleImportExcel} disabled={importing || !importFile}>
              {importing ? "Đang nhập..." : "Thêm"}
            </Button>
          ) : (
            <Button onClick={handleSave}>
              Cập Nhật
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}