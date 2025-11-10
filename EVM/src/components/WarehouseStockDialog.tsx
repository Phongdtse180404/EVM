import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

interface Model {
  modelId: number;
  modelCode: string;
}

interface WarehouseStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  models: Model[] | undefined;
  modelsLoading: boolean;
  selectedModelCode?: string;
  selectedQuantity?: number;
  onSave: (data: {
    modelCode: string;
    quantity: number;
  }) => Promise<void>;
  onAddModel: () => void;
}

export default function WarehouseStockDialog({
  open,
  onOpenChange,
  models,
  modelsLoading,
  selectedModelCode = "",
  selectedQuantity = 0,
  onSave,
  onAddModel,
}: WarehouseStockDialogProps) {
  const [stockModelCode, setStockModelCode] = useState<string>("");
  const [stockQuantity, setStockQuantity] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or when props change
  useEffect(() => {
    if (open) {
      setStockModelCode(selectedModelCode);
      setStockQuantity(selectedQuantity);
    }
  }, [open, selectedModelCode, selectedQuantity]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        modelCode: stockModelCode.trim(),
        quantity: stockQuantity,
      });
      
      // Reset form and close dialog
      setStockModelCode("");
      setStockQuantity(0);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const isValid = stockModelCode.trim() && stockQuantity >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedModelCode ? "Cập nhật tồn kho" : "Thêm tồn kho mới"}
          </DialogTitle>
          <DialogDescription>
            {selectedModelCode ? "Cập nhật số lượng tồn kho" : "Thêm model và số lượng vào kho"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="stock-model">Chọn Model</Label>
            <div className="flex gap-2">
              <Select 
                value={stockModelCode} 
                onValueChange={setStockModelCode}
                disabled={modelsLoading || loading}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder={modelsLoading ? "Đang tải models..." : "Chọn model"} />
                </SelectTrigger>
                <SelectContent>
                  {models && models.length > 0 ? (
                    models
                      .filter((model) => model.modelCode && model.modelCode.trim() !== "")
                      .map((model) => (
                        <SelectItem key={model.modelId} value={model.modelCode}>
                          {model.modelCode}
                        </SelectItem>
                      ))
                  ) : (
                    <SelectItem value="no-models-available" disabled>
                      Không có model nào
                    </SelectItem>
                  )}
                  {models && models.length > 0 && models.filter(m => m.modelCode && m.modelCode.trim() !== "").length === 0 && (
                    <SelectItem value="no-valid-models" disabled>
                      Không có model hợp lệ
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onAddModel}
                title="Thêm model mới"
                disabled={loading}
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
              disabled={loading}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!isValid || loading}>
            {loading ? "Đang lưu..." : selectedModelCode ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}