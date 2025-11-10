import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, XCircle, Wrench } from "lucide-react";

type ScheduleStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'no_show';

export const getScheduleStatusBadge = (status: ScheduleStatus) => {
    switch (status) {
        case "completed":
            return (
                <Badge variant="outline" className="text-success border-success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Hoàn thành
                </Badge>
            );
        case "in_progress":
            return (
                <Badge variant="outline" className="text-warning border-warning">
                    <Wrench className="w-3 h-3 mr-1" />
                    Đang thực hiện
                </Badge>
            );
        case "scheduled":
            return (
                <Badge variant="outline" className="text-primary border-primary">
                    <Calendar className="w-3 h-3 mr-1" />
                    Đã đặt lịch
                </Badge>
            );
        case "cancelled":
            return (
                <Badge variant="outline" className="text-muted-foreground border-muted">
                    <XCircle className="w-3 h-3 mr-1" />
                    Đã hủy
                </Badge>
            );
        case "no_show":
            return (
                <Badge variant="outline" className="text-destructive border-destructive">
                    <XCircle className="w-3 h-3 mr-1" />
                    Không đến
                </Badge>
            );
        default:
            return <Badge variant="outline">Không xác định</Badge>;
    }
};
