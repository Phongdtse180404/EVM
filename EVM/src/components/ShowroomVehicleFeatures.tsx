import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

// Type for individual vehicle (interface for features display)
type IndividualVehicle = {
  vin: string;
  status: string;
  holdUntil?: string;
};

interface ShowroomVehicleFeaturesProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomVehicleFeatures({ selectedVehicle }: ShowroomVehicleFeaturesProps) {
  return (
    <>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Star className="w-5 h-5" />
          <span>Chi tiết xe này</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <p className="text-sm font-medium">Số VIN</p>
              <p className="text-sm font-mono">{selectedVehicle.vin}</p>
              
              <p className="text-sm font-medium">Trạng thái</p>
              <Badge 
                className={
                  selectedVehicle.status === 'AVAILABLE' 
                    ? "bg-success/20 text-success border-success" 
                    : selectedVehicle.status === 'HOLD'
                    ? "bg-warning/20 text-warning border-warning"
                    : "bg-destructive/20 text-destructive border-destructive"
                }
              >
                {selectedVehicle.status === 'AVAILABLE' ? "Có sẵn" : 
                 selectedVehicle.status === 'HOLD' ? "Đang giữ" : "Đã bán"}
              </Badge>
              
              {selectedVehicle.holdUntil && (
                <>
                  <p className="text-sm font-medium">Giữ đến</p>
                  <p className="text-sm text-yellow-600">
                    {new Date(selectedVehicle.holdUntil).toLocaleDateString('vi-VN')}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  );
}