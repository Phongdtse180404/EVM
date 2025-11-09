import { useState, useCallback } from "react";
import { dealershipService } from "@/services/api-dealership";
import { useToast } from "@/hooks/use-toast";
import type { DealershipRequest, DealershipResponse } from "@/services/api-dealership";

/**
 * Hook for managing dealerships - create, update, fetch, delete operations
 * Provides a complete interface for dealership CRUD operations
 */
export const useDealerships = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dealerships, setDealerships] = useState<DealershipResponse[]>([]);
  const [selectedDealership, setSelectedDealership] = useState<DealershipResponse | null>(null);

  // Fetch all dealerships
  const fetchDealerships = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dealershipService.getAllDealerships();
      setDealerships(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching dealerships:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đại lý",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch dealership by ID
  const fetchDealership = useCallback(async (dealershipId: number) => {
    setLoading(true);
    try {
      const dealership = await dealershipService.getDealershipById(dealershipId);
      setSelectedDealership(dealership);
      return dealership;
    } catch (error) {
      console.error('Error fetching dealership:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin đại lý",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create dealership
  const createDealership = useCallback(async (
    dealershipData: DealershipRequest,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      const newDealership = await dealershipService.createDealership(dealershipData);
      
      // Update local state
      setDealerships(prev => [...prev, newDealership]);
      
      toast({
        title: "Thành công",
        description: "Đã tạo đại lý thành công",
      });

      onSuccess?.();
      
      return { success: true, data: newDealership };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể tạo đại lý",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Update dealership
  const updateDealership = useCallback(async (
    dealershipId: number,
    dealershipData: DealershipRequest,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      const updatedDealership = await dealershipService.updateDealership(dealershipId, dealershipData);
      
      // Update local state
      setDealerships(prev => 
        prev.map(dealership => 
          dealership.dealershipId === dealershipId ? updatedDealership : dealership
        )
      );
      
      // Update selected dealership if it's the one being updated
      if (selectedDealership?.dealershipId === dealershipId) {
        setSelectedDealership(updatedDealership);
      }
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật đại lý thành công",
      });

      onSuccess?.();
      
      return { success: true, data: updatedDealership };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể cập nhật đại lý",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast, selectedDealership]);

  // Delete dealership
  const deleteDealership = useCallback(async (
    dealershipId: number,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      await dealershipService.deleteDealership(dealershipId);
      
      // Update local state
      setDealerships(prev => prev.filter(dealership => dealership.dealershipId !== dealershipId));
      
      // Clear selected dealership if it's the one being deleted
      if (selectedDealership?.dealershipId === dealershipId) {
        setSelectedDealership(null);
      }
      
      toast({
        title: "Thành công",
        description: "Đã xóa đại lý thành công",
      });

      onSuccess?.();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể xóa đại lý",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast, selectedDealership]);

  // Delete warehouse from dealership
  const deleteWarehouseFromDealership = useCallback(async (
    dealershipId: number,
    warehouseId: number,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      await dealershipService.deleteWarehouseFromDealership(dealershipId, warehouseId);
      
      // Update local state - remove warehouse from dealership
      setDealerships(prev => 
        prev.map(dealership => 
          dealership.dealershipId === dealershipId 
            ? {
                ...dealership,
                warehouses: dealership.warehouses.filter(w => w.warehouseId !== warehouseId)
              }
            : dealership
        )
      );
      
      // Update selected dealership if it's affected
      if (selectedDealership?.dealershipId === dealershipId) {
        setSelectedDealership(prev => prev ? {
          ...prev,
          warehouses: prev.warehouses.filter(w => w.warehouseId !== warehouseId)
        } : null);
      }
      
      toast({
        title: "Thành công",
        description: "Đã xóa kho khỏi đại lý thành công",
      });

      onSuccess?.();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể xóa kho khỏi đại lý",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast, selectedDealership]);

  return {
    // Operations
    fetchDealerships,
    fetchDealership,
    createDealership,
    updateDealership,
    deleteDealership,
    deleteWarehouseFromDealership,
    
    // State
    loading,
    dealerships,
    selectedDealership,
    setSelectedDealership
  };
};

export default useDealerships;