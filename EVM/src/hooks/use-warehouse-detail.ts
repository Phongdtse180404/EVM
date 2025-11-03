import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { warehouseService } from '@/services/api-warehouse';
import type { WarehouseResponse, WarehouseStockRequest } from '@/services/api-warehouse';

export const useWarehouseDetail = () => {
  const [warehouseDetail, setWarehouseDetail] = useState<WarehouseResponse | null>(null);
  const [warehouseDetailLoading, setWarehouseDetailLoading] = useState(false);
  const { toast } = useToast();

  const fetchWarehouseDetail = useCallback(async (warehouseId: number) => {
    setWarehouseDetailLoading(true);
    try {
      const data = await warehouseService.getWarehouse(warehouseId);
      setWarehouseDetail(data);
    } catch (error) {
      console.error('Error loading warehouse detail:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải chi tiết kho",
        variant: "destructive",
      });
      setWarehouseDetail(null);
    } finally {
      setWarehouseDetailLoading(false);
    }
  }, [toast]);

  const upsertWarehouseStock = useCallback(async (warehouseId: number, data: WarehouseStockRequest) => {
    try {
      await warehouseService.upsertWarehouseStock(warehouseId, data);
      toast({
        title: "Thành công",
        description: "Cập nhật tồn kho thành công",
      });
      await fetchWarehouseDetail(warehouseId);
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật tồn kho",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchWarehouseDetail]);

  const removeWarehouseStock = useCallback(async (warehouseId: number, modelCode: string) => {
    try {
      await warehouseService.removeWarehouseStock(warehouseId, modelCode);
      toast({
        title: "Thành công",
        description: "Xóa tồn kho thành công",
      });
      await fetchWarehouseDetail(warehouseId);
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa tồn kho",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchWarehouseDetail]);

  const clearWarehouseDetail = useCallback(() => {
    setWarehouseDetail(null);
  }, []);

  return {
    warehouseDetail,
    warehouseDetailLoading,
    fetchWarehouseDetail,
    upsertWarehouseStock,
    removeWarehouseStock,
    clearWarehouseDetail,
  };
};