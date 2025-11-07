import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import type { WarehouseStockResponse, VehicleSerialResponse } from "@/services/api-warehouse";

// Type for individual vehicle with serial info (matches parent component)
type IndividualVehicle = WarehouseStockResponse & {
  serial: VehicleSerialResponse;
  status: string;
  holdUntil?: string;
  vin: string;
  imageUrl?: string;
};

interface ShowroomVehicleListProps {
  loading: boolean;
  filteredVehicles: IndividualVehicle[];
  selectedVehicle: IndividualVehicle | null;
  onVehicleSelect: (vehicle: IndividualVehicle) => void;
  getVehicleImage: (vehicle: IndividualVehicle) => string;
  getStatusBadge: (vehicle: IndividualVehicle) => JSX.Element;
  firebaseImageUrl: string;
}

export function ShowroomVehicleList({
  loading,
  filteredVehicles,
  selectedVehicle,
  onVehicleSelect,
  getVehicleImage,
  getStatusBadge,
  firebaseImageUrl
}: ShowroomVehicleListProps) {
  return (
    <div className="lg:col-span-1 space-y-4 overflow-y-auto">
      <h3 className="font-semibold text-lg">
        Danh sách xe ({loading ? 'Đang tải...' : filteredVehicles.length})
      </h3>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Đang tải xe điện...</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-8">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Không có xe điện nào</p>
        </div>
      ) : (
        filteredVehicles.map((vehicle, index) => (
          <Card
            key={`${vehicle.vin}`}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedVehicle?.vin === vehicle.vin ? 'ring-2 ring-primary bg-gradient-card' : ''
            }`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <CardContent className="p-4">
              <div className="flex space-x-3">
                <img
                  src={getVehicleImage(vehicle)}
                  alt={`${vehicle.modelCode} - ${vehicle.color}`}
                  className="w-20 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    // Fallback to firebase image if the API image fails to load
                    const target = e.target as HTMLImageElement;
                    target.src = firebaseImageUrl;
                  }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{vehicle.modelCode}</h4>
                  <p className="text-xs text-muted-foreground mb-1">{vehicle.brand}</p>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-blue-600">
                      Màu: {vehicle.color}
                    </span>
                    {getStatusBadge(vehicle)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      VIN: {vehicle.vin.slice(-8)}
                    </span>
                    <span className="text-xs font-semibold">
                      Năm: {vehicle.productionYear}
                    </span>
                  </div>
                  {vehicle.holdUntil && (
                    <div className="mt-1">
                      <span className="text-xs text-yellow-600">
                        Giữ đến: {new Date(vehicle.holdUntil).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}