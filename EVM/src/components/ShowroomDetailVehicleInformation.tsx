// Type for individual vehicle (interface for vehicle information display)
type IndividualVehicle = {
  modelCode: string;
  brand: string;
  color: string;
  productionYear: number;
  vin: string;
  holdUntil?: string;
  warehouseId?: number;
  warehouseName?: string;
};

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
          Màu: {selectedVehicle.color} | Năm sản xuất: {selectedVehicle.productionYear}
        </p>
        {selectedVehicle.warehouseName && (
          <p className="text-sm text-muted-foreground mt-1">
            Kho: {selectedVehicle.warehouseName}
          </p>
        )}
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-primary">
          VIN: {selectedVehicle.vin}
        </div>
        <p className="text-sm text-muted-foreground">Số khung</p>
        {selectedVehicle.holdUntil && (
          <p className="text-sm text-yellow-600">
            Giữ đến: {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
          </p>
        )}
      </div>
    </div>
  );
}