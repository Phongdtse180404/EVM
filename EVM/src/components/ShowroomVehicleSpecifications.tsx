import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Car,
  Battery,
  Gauge,
  Calendar,
  Zap,
  Timer,
  Shield,
} from "lucide-react";

// Type for individual vehicle (interface for specifications display)
type IndividualVehicle = {
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
  vin: string;
  status: string;
};

interface ShowroomVehicleSpecificationsProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomVehicleSpecifications({ selectedVehicle }: ShowroomVehicleSpecificationsProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Gauge className="w-5 h-5" />
          <span>Thông tin xe</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Car className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Mã model</p>
              <p className="text-sm text-muted-foreground">{selectedVehicle.modelCode}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Thương hiệu</p>
              <p className="text-sm text-muted-foreground">{selectedVehicle.brand}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Battery className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Màu sắc</p>
              <p className="text-sm text-muted-foreground">{selectedVehicle.color}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Năm sản xuất</p>
              <p className="text-sm text-muted-foreground">{selectedVehicle.productionYear}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Zap className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">VIN</p>
              <p className="text-sm text-muted-foreground font-mono">{selectedVehicle.vin}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Timer className="w-4 h-4 text-primary" />
            <div>
              <p className="text-sm font-medium">Trạng thái</p>
              <p className="text-sm text-muted-foreground">
                {selectedVehicle.status === 'AVAILABLE' ? 'Có sẵn' : 
                 selectedVehicle.status === 'HOLD' ? 'Đang giữ' : 'Đã bán'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}