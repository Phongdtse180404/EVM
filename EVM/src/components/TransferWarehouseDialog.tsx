import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useMemo } from "react";

import { useWarehouses } from "@/hooks/use-warehouses";

import type { WarehouseResponse } from "@/services/api-warehouse";

interface TransferWarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouseId: number | null;
  onTransfer: (targetWarehouseId: number) => void;
  warehouses?: WarehouseResponse[]; // List of all warehouses
}

export default function TransferWarehouseDialog({
  open,
  onOpenChange,
  warehouseId,
  onTransfer,
  warehouses = [],
}: TransferWarehouseDialogProps) {
  const [targetWarehouseId, setTargetWarehouseId] = useState<number | "">("");
  const [modelCode, setModelCode] = useState("");
  // Get available models from the source warehouse's items
  const availableModels = useMemo(() => {
    setModelCode("");
    if (!warehouseId) return [];
    const sourceWarehouse = warehouses.find(w => w.warehouseId === warehouseId);
    if (!sourceWarehouse || !sourceWarehouse.items) return [];
    // Remove models with 0 quantity
    return sourceWarehouse.items.filter(item => item.quantity > 0).map(item => ({
      modelCode: item.modelCode,
      modelName: item.modelCode // You can replace this with a mapping if you have model names elsewhere
    }));
  }, [warehouseId, warehouses]);
  const [quantity, setQuantity] = useState<number | "">("");

  const { transferStock } = useWarehouses();

  const handleTransfer = async () => {
    if (!warehouseId || !targetWarehouseId || !modelCode || !quantity) return;
    try {
      const transferData = { modelCode, quantity: Number(quantity) };
      await transferStock(warehouseId, Number(targetWarehouseId), transferData);
      onTransfer(Number(targetWarehouseId));
      onOpenChange(false);
      setTargetWarehouseId("");
      setModelCode("");
      setQuantity("");
    } catch (error) {
      // Optionally handle error (toast, etc.)
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Chuyển xe sang kho khác</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="target-warehouse" className="block mb-2 font-medium">
              Chọn kho nhận xe
            </label>
            <select
              id="target-warehouse"
              className="w-full border rounded px-3 py-2"
              value={targetWarehouseId}
              onChange={e => setTargetWarehouseId(Number(e.target.value))}
            >
              <option value="">Chọn kho</option>
              {warehouses
                .filter(w => w.warehouseId !== warehouseId)
                .map(w => (
                  <option key={w.warehouseId} value={w.warehouseId}>
                    {w.warehouseName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="model-code" className="block mb-2 font-medium">
              Chọn dòng xe (modelCode)
            </label>
            <select
              id="model-code"
              className="w-full border rounded px-3 py-2"
              value={modelCode}
              onChange={e => setModelCode(e.target.value)}
              disabled={availableModels.length === 0}
            >
              <option value="">Chọn dòng xe</option>
              {availableModels.map((m) => (
                <option key={m.modelCode} value={m.modelCode}>
                  {m.modelCode}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block mb-2 font-medium">
              Số lượng xe
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              className="w-full border rounded px-3 py-2"
              value={quantity}
              onChange={e => setQuantity(e.target.value ? Number(e.target.value) : "")}
              placeholder="Nhập số lượng"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={handleTransfer}
            disabled={!targetWarehouseId || !modelCode || !quantity}
            className="bg-gradient-primary"
          >
            Chuyển xe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
