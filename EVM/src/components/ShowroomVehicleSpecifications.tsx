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

import type { IndividualVehicle } from "@/pages/VehicleShowroom";


interface ShowroomVehicleSpecificationsProps {
  selectedVehicle: IndividualVehicle;
  getVehiclePrice: (vehicle: IndividualVehicle) => number | undefined;
}

export function ShowroomVehicleSpecifications({ selectedVehicle, getVehiclePrice }: ShowroomVehicleSpecificationsProps) {
  const price = getVehiclePrice(selectedVehicle);
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
            {price != null && !isNaN(Number(price)) ? (
              <>
                <Gauge className="w-4 h-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Giá</p>
                  <p className="text-sm text-green-700 font-semibold">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(price))}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Giá: Không có dữ liệu</div>
            )}
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