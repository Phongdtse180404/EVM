import { useState, useEffect } from "react";
import { useElectricVehicle } from "@/hooks/use-electric-vehicle";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Car, 
  Battery, 
  Gauge, 
  Fuel, 
  Users, 
  Calendar, 
  Star,
  Zap,
  Timer,
  Shield
} from "lucide-react";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";

// Firebase fallback image URL
const firebaseImageUrl = "https://firebasestorage.googleapis.com/v0/b/evdealer.firebasestorage.app/o/images%2Fvehicles%2Fvf6-electric-car.png?alt=media&token=ac7891b1-f5e2-4e23-9b35-2c4d6e7f8a9b";

interface VehicleShowcaseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VehicleShowcase({ open, onOpenChange }: VehicleShowcaseProps) {
  const { fetchElectricVehicles, loading, electricVehicles } = useElectricVehicle();
  const [selectedVehicle, setSelectedVehicle] = useState<ElectricVehicleResponse | null>(null);
  const [vehicles, setVehicles] = useState<ElectricVehicleResponse[]>([]);

  // Fetch electric vehicles when dialog opens
  useEffect(() => {
    if (open) {
      const loadVehicles = async () => {
        const apiVehicles = await fetchElectricVehicles();
        if (apiVehicles) {
          setVehicles(apiVehicles);
        }
      };
      loadVehicles();
    }
  }, [open, fetchElectricVehicles]);

  const getStatusBadge = (vehicle: ElectricVehicleResponse) => {
    // Use actual status from API
    if (vehicle.status === 'AVAILABLE') {
      return <Badge className="bg-success/20 text-success border-success">Có sẵn</Badge>;
    } else if (vehicle.status === 'HOLD') {
      return <Badge className="bg-warning/20 text-warning border-warning">Đang giữ</Badge>;
    } else if (vehicle.status === 'SOLD_OUT') {
      return <Badge className="bg-destructive/20 text-destructive border-destructive">Đã bán</Badge>;
    }
    
    return null; // Don't show badge if no valid status
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-2xl">
            <Car className="w-6 h-6 text-primary" />
            <span>Tổng quan xe điện trong kho</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[75vh] space-x-6">
          {/* Vehicle List */}
          <div className="w-1/3 overflow-y-auto space-y-4">
            <h3 className="font-semibold text-lg mb-4">
              Danh sách xe ({loading ? 'Đang tải...' : vehicles.length})
            </h3>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-sm text-muted-foreground mt-2">Đang tải xe điện...</p>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Không có xe điện nào trong kho</p>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <Card 
                  key={vehicle.vehicleId}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    selectedVehicle?.vehicleId === vehicle.vehicleId ? 'ring-2 ring-primary bg-gradient-card' : ''
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <CardContent className="p-4">
                    <div className="flex space-x-3">
                      {(vehicle.imageUrl || firebaseImageUrl) && (
                        <img 
                          src={vehicle.imageUrl || firebaseImageUrl} 
                          alt={vehicle.modelCode}
                          className="w-20 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        {vehicle.modelCode && (
                          <h4 className="font-medium text-sm">{vehicle.modelCode}</h4>
                        )}
                        {vehicle.brand && (
                          <p className="text-xs text-muted-foreground mb-2">{vehicle.brand}</p>
                        )}
                        <div className="flex items-center justify-between">
                          {vehicle.price && (
                            <span className="text-sm font-semibold text-primary">
                              {vehicle.price.toLocaleString('vi-VN')}₫
                            </span>
                          )}
                          {getStatusBadge(vehicle)}
                        </div>
                        {vehicle.batteryCapacity && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Pin: {vehicle.batteryCapacity} kWh
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Vehicle Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedVehicle ? (
              <div className="space-y-6">
                {/* Main Image and Basic Info */}
                <Card className="overflow-hidden">
                  <div className="relative">
                    <img 
                      src={selectedVehicle.imageUrl || firebaseImageUrl} 
                      alt={selectedVehicle.modelCode}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(selectedVehicle)}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        {selectedVehicle.modelCode && (
                          <h2 className="text-2xl font-bold">{selectedVehicle.modelCode}</h2>
                        )}
                        {selectedVehicle.brand && (
                          <p className="text-muted-foreground">{selectedVehicle.brand}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {selectedVehicle.price && (
                          <div className="text-2xl font-bold text-primary">
                            {selectedVehicle.price.toLocaleString('vi-VN')}₫
                          </div>
                        )}
                        {selectedVehicle.productionYear && (
                          <p className="text-sm text-muted-foreground">Năm SX: {selectedVehicle.productionYear}</p>
                        )}
                        {selectedVehicle.color && (
                          <p className="text-sm text-muted-foreground">Màu: {selectedVehicle.color}</p>
                        )}
                      </div>
                    </div>

                    {/* Color and Status */}
                    {(selectedVehicle.color || selectedVehicle.status) && (
                      <div className="mb-4 grid grid-cols-2 gap-4">
                        {selectedVehicle.color && (
                          <div>
                            <h4 className="font-medium mb-2">Màu sắc:</h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedVehicle.color}
                            </Badge>
                          </div>
                        )}
                        {selectedVehicle.status && (
                          <div>
                            <h4 className="font-medium mb-2">Trạng thái:</h4>
                            <Badge variant="outline" className="text-xs">
                              {selectedVehicle.status}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Specifications */}
                <Tabs defaultValue="specs" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="specs">Thông số kỹ thuật</TabsTrigger>
                    <TabsTrigger value="features">Thông tin xe</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="specs">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Gauge className="w-5 h-5" />
                          <span>Thông số kỹ thuật</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedVehicle.batteryCapacity && (
                            <div className="flex items-center space-x-3">
                              <Battery className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Dung lượng pin</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.batteryCapacity} kWh</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedVehicle.productionYear && (
                            <div className="flex items-center space-x-3">
                              <Calendar className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Năm sản xuất</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.productionYear}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedVehicle.price && (
                            <div className="flex items-center space-x-3">
                              <Zap className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Giá bán</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.price.toLocaleString('vi-VN')}₫</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedVehicle.modelCode && (
                            <div className="flex items-center space-x-3">
                              <Car className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Mã model</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.modelCode}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedVehicle.brand && (
                            <div className="flex items-center space-x-3">
                              <Shield className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Thương hiệu</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.brand}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedVehicle.status && (
                            <div className="flex items-center space-x-3">
                              <Timer className="w-4 h-4 text-primary" />
                              <div>
                                <p className="text-sm font-medium">Trạng thái</p>
                                <p className="text-sm text-muted-foreground">{selectedVehicle.status}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="features">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Star className="w-5 h-5" />
                          <span>Thông tin xe</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedVehicle.batteryCapacity || selectedVehicle.price || selectedVehicle.modelCode ? (
                          <div className="space-y-3">
                            {selectedVehicle.batteryCapacity && (
                              <p className="text-sm">Xe điện với dung lượng pin {selectedVehicle.batteryCapacity} kWh</p>
                            )}
                            {selectedVehicle.modelCode && (
                              <p className="text-sm">Model: {selectedVehicle.modelCode}</p>
                            )}
                            {selectedVehicle.brand && (
                              <p className="text-sm">Thương hiệu: {selectedVehicle.brand}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">Không có thông tin chi tiết</p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Car className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Chọn một xe để xem chi tiết</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}