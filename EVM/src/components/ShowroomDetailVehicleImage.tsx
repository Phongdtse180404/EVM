import { Badge } from "@/components/ui/badge";

// Type for individual vehicle (interface for image display)
type IndividualVehicle = {
  modelCode: string;
  color: string;
  status: string;
};

interface ShowroomDetailVehicleImageProps {
  selectedVehicle: IndividualVehicle;
  getVehicleImage: (vehicle: IndividualVehicle) => string;
  getStatusBadge: (vehicle: IndividualVehicle) => JSX.Element;
  firebaseImageUrl: string;
}

export function ShowroomDetailVehicleImage({ 
  selectedVehicle, 
  getVehicleImage, 
  getStatusBadge, 
  firebaseImageUrl 
}: ShowroomDetailVehicleImageProps) {
  return (
    <div className="relative">
      <img
        src={getVehicleImage(selectedVehicle)}
        alt={`${selectedVehicle.modelCode} - ${selectedVehicle.color}`}
        className="w-full h-[400px] object-contain p-1"
        onError={(e) => {
          // Fallback to firebase image if the API image fails to load
          const target = e.target as HTMLImageElement;
          target.src = firebaseImageUrl;
        }}
      />
      <div className="absolute top-4 right-4">
        {getStatusBadge(selectedVehicle)}
      </div>
    </div>
  );
}