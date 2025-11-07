import { Card } from "@/components/ui/card";
import { Warehouse } from "lucide-react";

interface ShowroomStatsProps {
  loading: boolean;
  totalModels: number;
  totalVehicles: number;
  availableVehicles: number;
  warehouseName?: string;
}

export function ShowroomStats({ 
  loading, 
  totalModels, 
  totalVehicles, 
  availableVehicles, 
  warehouseName 
}: ShowroomStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-primary">
          {loading ? "..." : totalModels}
        </div>
        <p className="text-sm text-muted-foreground">Mẫu xe</p>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-success">
          {loading ? "..." : totalVehicles}
        </div>
        <p className="text-sm text-muted-foreground">Tổng xe</p>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-warning">
          {loading ? "..." : availableVehicles}
        </div>
        <p className="text-sm text-muted-foreground">Xe có sẵn</p>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-accent">
          <Warehouse className="w-6 h-6 mx-auto mb-1" />
          {loading ? "..." : warehouseName || "Kho 1"}
        </div>
        <p className="text-sm text-muted-foreground">Kho hiện tại</p>
      </Card>
    </div>
  );
}