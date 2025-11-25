import { Button } from "@/components/ui/button";
import { ShoppingCart, Warehouse } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import type { IndividualVehicle } from "@/pages/VehicleShowroom";

interface ShowroomDetailButtonsProps {
  selectedVehicle: IndividualVehicle;
}

export function ShowroomDetailButtons({ selectedVehicle }: ShowroomDetailButtonsProps) {
  const navigate = useNavigate();

  const handleCreateOrder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check if vehicle is available for ordering
    if (selectedVehicle.status !== 'AVAILABLE') {
      if (selectedVehicle.status === 'HOLD') {
        toast.error("Xe này đang được giữ và không thể đặt hàng");
      } else if (selectedVehicle.status === 'SOLD_OUT') {
        toast.error("Xe này đã được bán và không thể đặt hàng");
      } else {
        toast.error("Xe này hiện không khả dụng để đặt hàng");
      }
      return;
    }
    
    console.log("Tạo đơn hàng clicked", selectedVehicle.vin);
    const params = new URLSearchParams({
      model: selectedVehicle.modelCode,
      color: selectedVehicle.color,
      vin: selectedVehicle.vin
    });
    
    if (selectedVehicle.warehouseId) {
      params.append('warehouseId', selectedVehicle.warehouseId.toString());
    }
    
    if (selectedVehicle.warehouseName) {
      params.append('warehouseName', selectedVehicle.warehouseName);
    }
    
    navigate(`/order-details?${params.toString()}`);
  };

  const handleViewWarehouse = () => {
    navigate('/inventory');
  };

  const isAvailable = selectedVehicle.status === 'AVAILABLE';
  
  return (
    <div className="flex space-x-2">
      <Button
        className={`flex-1 transition-all duration-200 shadow-lg ${
          isAvailable 
            ? "bg-gradient-primary hover:bg-gradient-primary/90 hover:scale-105 active:scale-95 hover:shadow-xl" 
            : "bg-gray-400 cursor-not-allowed opacity-60"
        }`}
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