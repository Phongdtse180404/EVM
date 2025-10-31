import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { warehouseService } from '@/services/api-warehouse';
import type { WarehouseResponse } from '@/services/api-warehouse';

export const useWarehouses = () => {
  const [allWarehouses, setAllWarehouses] = useState<WarehouseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Attempting to fetch warehouses...');
      const fetchedWarehouses = await warehouseService.getWarehouses();
      console.log('Fetched warehouses:', fetchedWarehouses);
      console.log('Warehouse count:', fetchedWarehouses?.length);
      
      setAllWarehouses(fetchedWarehouses || []);
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách kho",
        variant: "destructive",
      });
      setAllWarehouses([]);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const createWarehouse = useCallback(async (data: { warehouseLocation: string; warehouseName: string }) => {
    try {
      await warehouseService.createWarehouse(data);
      toast({
        title: "Thành công",
        description: "Thêm kho mới thành công",
      });
      await fetchWarehouses();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo kho",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchWarehouses]);

  const updateWarehouse = useCallback(async (warehouseId: number, data: { warehouseLocation: string; warehouseName: string }) => {
    try {
      await warehouseService.updateWarehouse(warehouseId, data);
      toast({
        title: "Thành công",
        description: "Cập nhật kho thành công",
      });
      await fetchWarehouses();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật kho",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchWarehouses]);

  const deleteWarehouse = useCallback(async (warehouseId: number) => {
    try {
      await warehouseService.deleteWarehouse(warehouseId);
      toast({
        title: "Thành công",
        description: "Xóa kho thành công",
      });
      await fetchWarehouses();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa kho",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchWarehouses]);

  return {
    allWarehouses,
    loading,
    fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
};