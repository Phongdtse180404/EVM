import { ChevronRight, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { WarehouseResponse } from "@/services/api-warehouse";

interface WarehouseTableProps {
  warehouses: WarehouseResponse[];
  loading: boolean;
  onSelectWarehouse: (warehouseId: number) => void;
  onEditWarehouse: (warehouse: WarehouseResponse) => void;
  onDeleteWarehouse: (warehouseId: number) => void;
}

export default function WarehouseTable({
  warehouses,
  loading,
  onSelectWarehouse,
  onEditWarehouse,
  onDeleteWarehouse,
}: WarehouseTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Đang tải danh sách kho...
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Tên Kho</TableHead>
          <TableHead>Địa điểm Kho</TableHead>
          <TableHead>Đại lý</TableHead>
          <TableHead className="text-center">Số lượng xe</TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouses && warehouses.length > 0 ? (
          warehouses.map((warehouse) => (
            <TableRow key={warehouse.warehouseId}>
              <TableCell 
                className="font-mono text-sm cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectWarehouse(warehouse.warehouseId)}
              >
                {warehouse.warehouseId}
              </TableCell>
              <TableCell 
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectWarehouse(warehouse.warehouseId)}
              >
                {warehouse.warehouseName}
              </TableCell>
              <TableCell 
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectWarehouse(warehouse.warehouseId)}
              >
                {warehouse.warehouseLocation}
              </TableCell>
              <TableCell 
                className="cursor-pointer hover:bg-accent/50"
                onClick={() => onSelectWarehouse(warehouse.warehouseId)}
              >
                {warehouse.dealershipId ? (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {warehouse.dealershipId}
                    </Badge>
                  </div>
                ) : (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Chưa gán đại lý
                  </Badge>
                )}
              </TableCell>
              <TableCell 
                className="cursor-pointer hover:bg-accent/50 text-center"
                onClick={() => onSelectWarehouse(warehouse.warehouseId)}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{warehouse.vehicleQuantity}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs text-muted-foreground">{warehouse.maxCapacity}</span>
                  </div>
                  {warehouse.maxCapacity > 0 && (
                    <Badge 
                      variant={
                        warehouse.vehicleQuantity / warehouse.maxCapacity >= 0.9 
                          ? "destructive" 
                          : warehouse.vehicleQuantity / warehouse.maxCapacity >= 0.7 
                          ? "default" 
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {Math.round((warehouse.vehicleQuantity / warehouse.maxCapacity) * 100)}%
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditWarehouse(warehouse);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectWarehouse(warehouse.warehouseId)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground">
              Không có kho nào
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}