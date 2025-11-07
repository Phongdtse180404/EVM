import { Button } from "@/components/ui/button";
import { ShoppingCart, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Type for individual vehicle (matches parent component)
type IndividualVehicle = {
  modelCode: string;
  color: string;
  vin: string;
};

interface ShowroomDetailButtonsProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomDetailButtons({ selectedVehicle }: ShowroomDetailButtonsProps) {
  const navigate = useNavigate();

  const handleCreateOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Tạo đơn hàng clicked", selectedVehicle.vin);
    navigate(`/order-details?model=${selectedVehicle.modelCode}&color=${selectedVehicle.color}&vin=${selectedVehicle.vin}`);
  };

  const handleViewWarehouse = () => {
    navigate('/inventory');
  };

  return (
    <div className="flex space-x-2">
      <Button
        className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
        onClick={handleCreateOrder}
      >
        <ShoppingCart className="w-4 h-4 mr-2" />
        Tạo đơn hàng
      </Button>
      <Button
        variant="outline"
        onClick={handleViewWarehouse}
        className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
      >
        <Warehouse className="w-4 h-4 mr-2" />
        Xem kho
      </Button>
    </div>
  );
}