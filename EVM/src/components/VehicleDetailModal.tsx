import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Car,
  Battery,
  Gauge,
  Fuel,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";

interface Vehicle {
  id: string;
  name: string;
  model: string;
  image: string;
  price: number;
  stock: number;
  specs: {
    engine?: string;
    power: string;
    range: string;
    acceleration: string;
    maxSpeed?: string;
    batteryCapacity: string;
    chargingTime: string;
    seating?: number;
    seats?: number;
    drivetrain?: string;
    warranty: string;
    year?: number;
  };
  features: string[];
  colors: string[];
}

interface WarehouseItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  model: string;
  image: string;
  vin: string;
  color: string;
  price: number;
  location: string;
  zone: string;
  status: "available" | "reserved" | "maintenance" | "shipping";
  batteryLevel: number;
  lastChecked: string;
  notes?: string;
}

interface VehicleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | WarehouseItem;
  isWarehouseItem?: boolean;
}

export default function VehicleDetailModal({ 
  isOpen, 
  onClose, 
  vehicle, 
  isWarehouseItem = false 
}: VehicleDetailModalProps) {
  if (!vehicle) return null;

  const getBatteryStatus = (level: number) => {
    if (level >= 80) return { color: "text-success", icon: CheckCircle };
    if (level >= 50) return { color: "text-warning", icon: Clock };
    return { color: "text-destructive", icon: AlertCircle };
  };

  const getStatusBadge = (status: WarehouseItem['status']) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
      case 'reserved':
        return <Badge className="bg-warning/20 text-warning border-warning">Đã đặt</Badge>;
      case 'maintenance':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Bảo trì</Badge>;
      case 'shipping':
        return <Badge className="bg-accent/20 text-accent border-accent">Đang giao</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {'name' in vehicle ? vehicle.name : vehicle.vehicleName}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Large Vehicle Image */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 p-4">
              <img 
                src={vehicle.image} 
                alt={'name' in vehicle ? vehicle.name : vehicle.vehicleName}
                className="w-full h-80 object-cover rounded-lg shadow-elegant"
              />
              {isWarehouseItem && 'status' in vehicle && (
                <div className="absolute top-6 right-6">
                  {getStatusBadge(vehicle.status)}
                </div>
              )}
            </div>
            
            {!isWarehouseItem && 'colors' in vehicle && (
              <div>
                <h4 className="font-semibold mb-2">Màu sắc có sẵn</h4>
                <div className="flex flex-wrap gap-2">
                  {vehicle.colors.map((color, index) => (
                    <Badge key={index} variant="outline">{color}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vehicle Details */}
          <div className="space-y-6">
            <div>
              <p className="text-3xl font-bold text-primary">
                {(vehicle.price / 1000000).toFixed(0)}M₫
              </p>
              <p className="text-muted-foreground">{vehicle.model}</p>
              {!isWarehouseItem && 'stock' in vehicle && (
                <p className="text-sm text-muted-foreground">Tồn kho: {vehicle.stock} xe</p>
              )}
            </div>

            {/* Warehouse Specific Info */}
            {isWarehouseItem && 'vin' in vehicle && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">VIN</p>
                    <p className="font-mono text-sm">{vehicle.vin}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Màu sắc</p>
                    <Badge variant="outline">{vehicle.color}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vị trí</p>
                    <p className="font-medium">{vehicle.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Khu vực</p>
                    <Badge variant="secondary">Khu {vehicle.zone}</Badge>
                  </div>
                </div>

                {vehicle.batteryLevel && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Pin</p>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const batteryStatus = getBatteryStatus(vehicle.batteryLevel);
                        return (
                          <>
                            <batteryStatus.icon className={`w-4 h-4 ${batteryStatus.color}`} />
                            <span className={`${batteryStatus.color}`}>
                              {vehicle.batteryLevel}%
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground">Kiểm tra cuối</p>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span className="text-sm">{vehicle.lastChecked}</span>
                  </div>
                </div>

                {vehicle.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Ghi chú</p>
                    <p className="text-sm">{vehicle.notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Vehicle Specifications */}
            {!isWarehouseItem && 'specs' in vehicle && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Thông số kỹ thuật</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Động cơ</p>
                      <p className="text-sm text-muted-foreground">{vehicle.specs.engine || 'Điện'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Gauge className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Công suất</p>
                      <p className="text-sm text-muted-foreground">{vehicle.specs.power}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Fuel className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Quãng đường</p>
                      <p className="text-sm text-muted-foreground">{vehicle.specs.range}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Battery className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Dung lượng pin</p>
                      <p className="text-sm text-muted-foreground">{vehicle.specs.batteryCapacity}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 rounded-lg border">
                    <Users className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">Số chỗ ngồi</p>
                      <p className="text-sm text-muted-foreground">{vehicle.specs.seating || vehicle.specs.seats} chỗ</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            {!isWarehouseItem && 'features' in vehicle && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Tính năng nổi bật</h3>
                <div className="grid grid-cols-2 gap-2">
                  {vehicle.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-success" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-2 pt-4">
              {!isWarehouseItem ? (
                <Button className="flex-1 bg-gradient-primary">
                  Đặt mua ngay
                </Button>
              ) : (
                <Button variant="outline" className="flex-1">
                  Chỉnh sửa thông tin
                </Button>
              )}
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