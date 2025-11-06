import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";
import { 
  Car,
  Battery,
  Calendar,
  CheckCircle
} from "lucide-react";

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: ElectricVehicleResponse | null;
}

export default function VehicleDetailModal({ 
  isOpen, 
  onClose, 
  vehicle
}: VehicleDetailModalProps) {
  if (!vehicle) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'HOLD':
        return <Badge className="bg-warning/20 text-warning border-warning">Đang giữ</Badge>;
      case 'SOLD_OUT':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Đã bán</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Firebase fallback image URL
  const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {vehicle.modelCode || 'Unknown Model'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <img 
                src={vehicle.imageUrl || firebaseImageUrl} 
                alt={vehicle.modelCode || 'Electric Vehicle'}
                className="w-full h-80 object-cover rounded-lg shadow-elegant"
              />
              <div className="absolute top-6 right-6">
                {getStatusBadge(vehicle.status || '')}
              </div>
            </div>
            
            {vehicle.color && (
              <div>
                <h4 className="font-semibold mb-2">Màu sắc</h4>
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full border-2 border-border ${
                    vehicle.color.toLowerCase().includes('đen') || vehicle.color.toLowerCase().includes('black') ? 'bg-black' :
                    vehicle.color.toLowerCase().includes('trắng') || vehicle.color.toLowerCase().includes('white') ? 'bg-white' :
                    vehicle.color.toLowerCase().includes('xám') || vehicle.color.toLowerCase().includes('gray') ? 'bg-gray-500' :
                    'bg-gray-300'
                  }`} />
                  <Badge variant="outline">{vehicle.color}</Badge>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-primary">
                {vehicle.price && vehicle.price > 0 ? `${(vehicle.price / 1000000).toFixed(0)}M₫` : 'Liên hệ'}
              </p>
              <p className="text-muted-foreground">{vehicle.brand || ''}</p>
              {vehicle.productionYear && (
                <p className="text-sm text-muted-foreground">Năm sản xuất: {vehicle.productionYear}</p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Thông số kỹ thuật</h3>
              <div className="grid grid-cols-1 gap-4">
                {vehicle.batteryCapacity && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Battery className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Dung lượng pin</p>
                      <p className="text-sm text-muted-foreground">{vehicle.batteryCapacity} kWh</p>
                    </div>
                  </div>
                )}
                
                {vehicle.brand && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Thương hiệu</p>
                      <p className="text-sm text-muted-foreground">{vehicle.brand}</p>
                    </div>
                  </div>
                )}

                {vehicle.modelCode && (
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Mã model</p>
                      <p className="text-sm text-muted-foreground">{vehicle.modelCode}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button className="flex-1 bg-gradient-primary">
                Đặt mua ngay
              </Button>
              <Button variant="outline" onClick={onClose}>
                Đóng
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
