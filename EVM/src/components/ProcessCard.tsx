import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  MoreHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProcessCardProps {
  title: string;
  description: string;
  status: "active" | "idle" | "warning";
  kpi: {
    value: string;
    label: string;
    trend: "up" | "down" | "stable";
  };
  className?: string;
  onViewDetails?: () => void;
}

export const ProcessCard = ({
  title,
  description,
  status,
  kpi,
  className,
  onViewDetails
}: ProcessCardProps) => {
  const statusConfig = {
    active: {
      color: "bg-success",
      textColor: "text-success",
      icon: CheckCircle,
      badge: "Đang hoạt động"
    },
    idle: {
      color: "bg-muted",
      textColor: "text-muted-foreground",
      icon: Activity,
      badge: "Chờ xử lý"
    },
    warning: {
      color: "bg-warning",
      textColor: "text-warning",
      icon: AlertTriangle,
      badge: "Cần chú ý"
    }
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg",
      "bg-gradient-card border-border/50 glow-hover",
      status === "active" && "status-active",
      className
    )}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">{title}</h3>
              <Badge 
                variant="outline" 
                className={cn("text-xs", config.textColor, "border-current")}
              >
                {config.badge}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <StatusIcon className={cn("w-5 h-5", config.textColor)} />
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* KPI Section */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
            </div>
            <div className={cn(
              "flex items-center gap-1 text-sm",
              kpi.trend === "up" && "text-success",
              kpi.trend === "down" && "text-destructive",
              kpi.trend === "stable" && "text-muted-foreground"
            )}>
              <TrendingUp className="w-4 h-4" />
              <span>{kpi.trend === "up" ? "↗" : kpi.trend === "down" ? "↘" : "→"}</span>
            </div>
          </div>
        </div>


        {/* Action */}
        <div className="pt-2 border-t border-border/30">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full group hover:bg-primary hover:text-primary-foreground"
            onClick={onViewDetails}
          >
            Xem chi tiết
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </Card>
  );
};