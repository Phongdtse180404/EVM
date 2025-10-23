import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui_admin/card";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
}

export default function MetricCard({ title, value, change, trend, icon: Icon }: MetricCardProps) {
  return (
    <Card className="shadow-soft hover:shadow-medium transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            <p className="text-sm mt-2 flex items-center gap-1">
              <span className={trend === "up" ? "text-success" : "text-destructive"}>
                {change}
              </span>
              <span className="text-muted-foreground">so với tháng trước</span>
            </p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow">
            <Icon className="h-6 w-6 text-primary-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
