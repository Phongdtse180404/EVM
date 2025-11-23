import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Folder } from "@/components/ui/folder";
import { WarehouseStatusBadge } from "@/components/ui/warehouse-status-badge";
import type { WarehouseResponse } from "@/services/api-warehouse";

interface WarehouseStockTableProps {
  warehouseDetail: WarehouseResponse | null;
  loading: boolean;
  onDeleteStock: (modelCode: string) => void;
}

export default function WarehouseStockTable({
  warehouseDetail,
  loading,
  onDeleteStock,
}: WarehouseStockTableProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Đang tải thông tin kho...
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-8"></TableHead>
          <TableHead>Mã Model</TableHead>
          <TableHead>Thương hiệu</TableHead>
          <TableHead>Màu</TableHead>
          <TableHead>Năm SX</TableHead>
          <TableHead className="text-right">Tổng SL</TableHead>
          <TableHead className="text-right">Xe có sẵn</TableHead>
        
        </TableRow>
      </TableHeader>
      <TableBody>
        {warehouseDetail?.items && Array.isArray(warehouseDetail.items) && warehouseDetail.items.length > 0 ? (
          warehouseDetail.items.map((item, index) => {
            const modelKey = `${item.modelCode}-${item.color}-${index}`;
            const availableCount = item.serials ? item.serials.filter(serial => serial.status === 'AVAILABLE').length : 0;
            
            return (
              <Folder
                key={modelKey}
                id={modelKey}
                colSpan={8}
                expandedContent={
                  <div>
                    {item.serials && item.serials.length > 0 ? (
                      <div className="space-y-3">
                        <div className="text-sm font-medium text-muted-foreground mb-3">
                          Chi tiết xe - {item.brand} {item.modelCode} ({item.color})
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>VIN</TableHead>
                              <TableHead>Trạng thái</TableHead>
                              <TableHead>Giữ chỗ đến</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {item.serials.map((serial, serialIndex) => (
                              <TableRow key={`${serial.vin}-${serialIndex}`} className="hover:bg-muted/50">
                                <TableCell className="font-mono text-sm">
                                  {serial.vin}
                                </TableCell>
                                <TableCell>
                                  <WarehouseStatusBadge vehicleStatus={serial.status} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {serial.holdUntil ? new Date(serial.holdUntil).toLocaleString('vi-VN') : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        Không có xe nào trong model này
                      </div>
                    )}
                  </div>
                }
              >
                <TableCell className="font-mono text-sm font-medium">
                  {item.modelCode}
                </TableCell>
                <TableCell className="font-medium">{item.brand}</TableCell>
                <TableCell>
                  <WarehouseStatusBadge variant="secondary">
                    {item.color}
                  </WarehouseStatusBadge>
                </TableCell>
                <TableCell>{item.productionYear}</TableCell>
                <TableCell className="text-right font-medium">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right">
                  <WarehouseStatusBadge count={availableCount} />
                </TableCell>
                
              </Folder>
            );
          })
        ) : (
          <TableRow>
            <TableCell colSpan={8} className="text-center text-muted-foreground">
              Không có tồn kho trong kho này
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}