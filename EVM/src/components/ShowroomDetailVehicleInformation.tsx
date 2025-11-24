// Type for individual vehicle (interface for vehicle information display)
import type { IndividualVehicle } from "@/pages/VehicleShowroom";

interface ShowroomDetailVehicleInformationProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomDetailVehicleInformation({ selectedVehicle }: ShowroomDetailVehicleInformationProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-2xl font-bold">{selectedVehicle.modelCode}</h2>
        <p className="text-muted-foreground">{selectedVehicle.brand}</p>
        <p className="text-sm text-muted-foreground mt-2">
          Năm sản xuất: {selectedVehicle.productionYear}
        </p>
      </div>
      <div className="text-right">
        {selectedVehicle.holdUntil && (
          <p className="text-sm text-yellow-600">
            Giữ đến: {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </div>
  );
}