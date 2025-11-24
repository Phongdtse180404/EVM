import { useState, useEffect } from "react";
import { Car, Battery, DollarSign, Calendar, Loader2, ImageIcon } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { ModelResponse } from "@/services/api-model";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";

interface ViewModelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  model: ModelResponse | null;
  electricVehicle: ElectricVehicleResponse | null;
}

export default function ViewModelDialog({ 
  open, 
  onOpenChange, 
  model, 
  electricVehicle 
}: ViewModelDialogProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Reset image states when dialog opens or electric vehicle changes
  useEffect(() => {
    if (open && electricVehicle?.imageUrl) {
      setImageLoading(true);
      setImageError(false);
    }
  }, [open, electricVehicle?.imageUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Chi tiết Model
          </DialogTitle>
        </DialogHeader>
        
        {model && (
          <div className="space-y-6">
            {/* Model Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Mã Model</Label>
                  <p className="text-sm mt-1">
                    {model.modelCode}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Thương hiệu</Label>
                  <p className="text-sm mt-1">{model.brand}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Màu sắc</Label>
                  <p className="text-sm mt-1">{model.color || 'Không có'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Năm sản xuất</Label>
                  <div className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm">{model.productionYear}</p>
                  </div>
                </div>
              </div>
            </div>


        
            <div className="space-y-4">
              {electricVehicle ? (
                <div className="space-y-4">
                  {/* Pricing Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <Label className="text-sm font-medium">Giá vốn</Label>
                      </div>
                      <p className="text-lg font-semibold text-green-600">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(electricVehicle.cost)}
                      </p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <Label className="text-sm font-medium">Giá bán</Label>
                      </div>
                      <p className="text-lg font-semibold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(electricVehicle.price)}
                      </p>
                    </div>
                  </div>

                  {/* Technical Specifications */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dung lượng pin</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Battery className="w-4 h-4 text-yellow-600" />
                        <p className="text-sm font-medium">{electricVehicle.batteryCapacity} kWh</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Hình ảnh xe</Label>
                    </div>
                  </div>
                  {/* Vehicle Image */}
                  {electricVehicle.imageUrl ? (
                    <div>
                      <div className="mt-2 border rounded-lg p-2 relative">
                        {imageLoading && (
                          <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded">
                            <div className="flex flex-col items-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">Đang tải...</span>
                            </div>
                          </div>
                        )}
                        {imageError ? (
                          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mb-2" />
                            <span className="text-sm">Không thể tải hình ảnh</span>
                          </div>
                        ) : (
                          <img
                            src={electricVehicle.imageUrl}
                            alt={`${model.brand} ${model.modelCode}`}
                            className={`w-full max-h-48 object-contain rounded transition-opacity duration-200 ${
                              imageLoading ? 'opacity-0' : 'opacity-100'
                            }`}
                            onLoad={() => setImageLoading(false)}
                            onError={() => {
                              setImageLoading(false);
                              setImageError(true);
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground border-2 border-dashed rounded-lg">
                      <ImageIcon className="w-8 h-8 mb-2" />
                      <span className="text-sm">Chưa có hình ảnh</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Không tìm thấy thông tin xe điện cho model này</p>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}