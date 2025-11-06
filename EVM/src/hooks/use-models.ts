import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { modelService } from '@/services/api-model';
import type { ModelResponse, ModelRequest } from '@/services/api-model';

export const useModels = () => {
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const { toast } = useToast();

  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    try {
      console.log('Attempting to fetch models...');
      const data = await modelService.getModels();
      console.log('Models loaded:', data);
      console.log('Models type:', typeof data, Array.isArray(data));
      console.log('Models structure:', data?.map(model => ({
        modelId: model?.modelId,
        modelCode: model?.modelCode,
        brand: model?.brand
      })));
      
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách model",
        variant: "destructive",
      });
      setModels([]);
    } finally {
      setModelsLoading(false);
    }
  }, [toast]);

  const createModel = useCallback(async (data: ModelRequest) => {
    try {
      await modelService.createModel(data);
      toast({
        title: "Thành công",
        description: "Thêm model mới thành công",
      });
      await fetchModels();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm model",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchModels]);

  const updateModel = useCallback(async (modelId: number, data: ModelRequest) => {
    try {
      await modelService.updateModel(modelId, data);
      toast({
        title: "Thành công",
        description: "Cập nhật model thành công",
      });
      await fetchModels();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể cập nhật model",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchModels]);

  const deleteModel = useCallback(async (modelId: number) => {
    try {
      await modelService.deleteModel(modelId);
      toast({
        title: "Thành công",
        description: "Xóa model thành công",
      });
      await fetchModels();
      return true;
    } catch (error) {
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa model",
        variant: "destructive",
      });
      return false;
    }
  }, [toast, fetchModels]);

  return {
    models,
    modelsLoading,
    fetchModels,
    createModel,
    updateModel,
    deleteModel,
  };
};