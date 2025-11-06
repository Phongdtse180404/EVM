import { useState, useCallback } from "react";
import { electricVehicleService } from "@/services/api-electric-vehicle";
import { useToast } from "@/hooks/use-toast";
import type { ElectricVehicleRequest, ElectricVehicleResponse } from "@/services/api-electric-vehicle";

/**
 * Hook for managing electric vehicles - create, update, fetch, etc.
 * Provides a complete interface for electric vehicle operations
 */
export const useElectricVehicle = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [electricVehicles, setElectricVehicles] = useState<ElectricVehicleResponse[]>([]);

  // Create electric vehicle
  const createElectricVehicle = useCallback(async (
    electricVehicleData: ElectricVehicleRequest,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      await electricVehicleService.createElectricVehicle(electricVehicleData);
      
      toast({
        title: "Thành công",
        description: "Đã tạo xe điện thành công",
      });

      onSuccess?.();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể tạo xe điện",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Update electric vehicle
  const updateElectricVehicle = useCallback(async (
    vehicleId: number,
    electricVehicleData: ElectricVehicleRequest,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      await electricVehicleService.updateElectricVehicle(vehicleId, electricVehicleData);
      
      toast({
        title: "Thành công",
        description: "Đã cập nhật xe điện thành công",
      });

      onSuccess?.();
      
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      
      toast({
        title: "Cảnh báo",
        description: "Không thể cập nhật xe điện",
        variant: "destructive",
      });

      onError?.(new Error(errorMessage));
      
      return { success: false, error: errorMessage };
    }
  }, [toast]);

  // Fetch all electric vehicles
  const fetchElectricVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await electricVehicleService.getAllElectricVehicles();
      setElectricVehicles(data || []);
      return data;
    } catch (error) {
      console.error('Error fetching electric vehicles:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe điện",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Find electric vehicle by model ID
  const findElectricVehicleByModelId = useCallback(async (modelId: number): Promise<ElectricVehicleResponse | null> => {
    setLoading(true);
    try {
      const electricVehicles = await electricVehicleService.getAllElectricVehicles();
      const found = electricVehicles.find(ev => ev.modelId === modelId);
      return found || null;
    } catch (error) {
      console.error('Error finding electric vehicle:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Operations
    createElectricVehicle,
    updateElectricVehicle,
    fetchElectricVehicles,
    findElectricVehicleByModelId,
    
    // State
    loading,
    electricVehicles
  };
};

export default useElectricVehicle;