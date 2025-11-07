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
import type { WarehouseResponse } from "@/services/api-warehouse";

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingWarehouse: WarehouseResponse | null;
  onSave: (data: {
    warehouseName: string;
    warehouseLocation: string;
    maxCapacity: number;
  }) => Promise<void>;
}

export default function WarehouseDialog({
  open,
  onOpenChange,
  editingWarehouse,
  onSave,
}: WarehouseDialogProps) {
  const [warehouseLocation, setWarehouseLocation] = useState("");
  const [warehouseName, setWarehouseName] = useState("");
  const [warehouseMaxCapacity, setWarehouseMaxCapacity] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or editing warehouse changes
  useEffect(() => {
    if (editingWarehouse) {
      setWarehouseLocation(editingWarehouse.warehouseLocation);
      setWarehouseName(editingWarehouse.warehouseName);
      setWarehouseMaxCapacity(editingWarehouse.maxCapacity || 0);
    } else {
      setWarehouseLocation("");
      setWarehouseName("");
      setWarehouseMaxCapacity(0);
    }
  }, [editingWarehouse, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({
        warehouseName,
        warehouseLocation,
        maxCapacity: warehouseMaxCapacity,
      });
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in the parent component
    } finally {
      setLoading(false);
    }
  };

  const isValid = warehouseLocation.trim() && warehouseName.trim() && warehouseMaxCapacity > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <div className="space-y-2">
            <Label htmlFor="warehouse-max-capacity">Sức chứa tối đa</Label>
            <Input
              id="warehouse-max-capacity"
              type="number"
              min="1"
              value={warehouseMaxCapacity}
              onChange={(e) => setWarehouseMaxCapacity(Number(e.target.value))}
              placeholder="Nhập sức chứa tối đa (số xe)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={!isValid || loading}>
            {loading ? "Đang lưu..." : editingWarehouse ? "Cập nhật" : "Thêm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}