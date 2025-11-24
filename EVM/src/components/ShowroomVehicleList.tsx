import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Car } from "lucide-react";
import type { IndividualVehicle } from "@/pages/VehicleShowroom";

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
  // Group vehicles by model (modelCode + color combination)
  const uniqueModels = filteredVehicles.reduce((acc, vehicle) => {
    const modelKey = `${vehicle.modelCode}-${vehicle.color}`;
    if (!acc[modelKey]) {
      acc[modelKey] = {
        ...vehicle,
        availableCount: 0,
        totalCount: 0
      };
    }
    
    acc[modelKey].totalCount++;
    if (vehicle.status === 'AVAILABLE') {
      acc[modelKey].availableCount++;
    }
    
    return acc;
  }, {} as Record<string, IndividualVehicle & { availableCount: number; totalCount: number }>);

  const modelList = Object.values(uniqueModels);

  return (
    <div className="lg:col-span-1 space-y-4 overflow-y-auto">
      <h3 className="font-semibold text-lg">
        Danh sách mẫu xe ({loading ? 'Đang tải...' : modelList.length})
      </h3>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-2">Đang tải xe điện...</p>
        </div>
      ) : modelList.length === 0 ? (
        <div className="text-center py-8">
          <Car className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Không có mẫu xe nào</p>
        </div>
      ) : (
        modelList.map((model, index) => {
          // When selecting a model, find the first vehicle with AVAILABLE status for this model
          const handleSelect = () => {
            let vehicle = filteredVehicles.find(
              v => v.modelCode === model.modelCode && v.color === model.color && v.status === 'AVAILABLE'
            );
            if (!vehicle) {
              // fallback: select the first vehicle of this model
              vehicle = filteredVehicles.find(
                v => v.modelCode === model.modelCode && v.color === model.color
              );
            }
            onVehicleSelect(vehicle);
          };
          return (
            <Card
              key={`${model.modelCode}-${model.color}`}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedVehicle?.modelCode === model.modelCode && selectedVehicle?.color === model.color ? 'ring-2 ring-primary bg-gradient-card' : ''
              }`}
              onClick={handleSelect}
            >
              <CardContent className="p-4">
                <div className="flex space-x-3">
                  <img
                    src={getVehicleImage(model)}
                    alt={`${model.modelCode} - ${model.color}`}
                    className="w-20 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback to firebase image if the API image fails to load
                      const target = e.target as HTMLImageElement;
                      target.src = firebaseImageUrl;
                    }}
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{model.modelCode}</h4>
                    <p className="text-xs text-muted-foreground mb-1">{model.brand}</p>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-blue-600">
                        Màu: {model.color}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Tồn kho: {model.availableCount}/{model.totalCount}
                      </span>
                      <span className="text-xs font-semibold">
                        Năm: {model.productionYear}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}