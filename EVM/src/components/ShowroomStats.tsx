import { Card } from "@/components/ui/card";
import { Warehouse } from "lucide-react";
import { useEffect, useState } from "react";
import { useDealerships } from "@/hooks/use-dealerships";

interface ShowroomStatsProps {
  loading: boolean;
  totalModels: number;
  totalVehicles: number;
  availableVehicles: number;
  dealershipId?: number;
}

export function ShowroomStats({ 
  loading, 
  totalModels, 
  totalVehicles, 
  availableVehicles, 
  dealershipId 
}: ShowroomStatsProps) {
  const { fetchDealership } = useDealerships();
  const [dealershipName, setDealershipName] = useState<string>("");

  useEffect(() => {
    if (dealershipId) {
      fetchDealership(dealershipId).then((dealership) => {
        setDealershipName(dealership?.name || "Không rõ");
      });
    } else {
      setDealershipName("");
    }
  }, [dealershipId, fetchDealership]);

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
          {loading ? "..." : dealershipName || "Không rõ"}
        </div>
        <p className="text-sm text-muted-foreground">Showroom hiện tại</p>
      </Card>
    </div>
  );
}