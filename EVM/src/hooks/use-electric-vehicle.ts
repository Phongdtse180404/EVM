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

  // Find electric vehicles by model code
  const findElectricVehiclesByModelCode = useCallback(async (modelCode: string): Promise<ElectricVehicleResponse[]> => {
    setLoading(true);
    try {
      const electricVehicles = await electricVehicleService.searchVehiclesByModelCode(modelCode);
      return electricVehicles || [];
    } catch (error) {
      console.error('Error finding electric vehicles by model code:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete electric vehicle by model ID
  const deleteElectricVehicleByModelId = useCallback(async (
    modelId: number,
    callbacks?: { onSuccess?: () => void; onError?: (error: Error) => void }
  ) => {
    const { onSuccess, onError } = callbacks || {};
    
    try {
      console.log('Starting electric vehicle deletion process for modelId:', modelId);
      
      // Find electric vehicle by modelId (using getAllElectricVehicles for backward compatibility)
      const allElectricVehicles = await electricVehicleService.getAllElectricVehicles();
      const electricVehicle = allElectricVehicles.find(ev => ev.modelId === modelId);
      
      if (electricVehicle) {
        
        
        // Delete the electric vehicle
        await electricVehicleService.deleteElectricVehicle(electricVehicle.vehicleId);
        onSuccess?.();
        return { success: true, deletedVehicleId: electricVehicle.vehicleId };
      } else {
        console.log('No electric vehicle found for modelId:', modelId);
        return { success: true, deletedVehicleId: null }; // No vehicle to delete is still success
      }
    } catch (error) {
        return { success: false };
    }
  }, []);

  return {
    // Operations
    createElectricVehicle,
    updateElectricVehicle,
    fetchElectricVehicles,
    findElectricVehiclesByModelCode,
    deleteElectricVehicleByModelId,
    
    // State
    loading,
    electricVehicles
  };
};

export default useElectricVehicle;