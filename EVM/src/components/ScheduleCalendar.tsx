import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface ScheduleItem {
    id: number;
    type: 'service' | 'test-drive';
    status: 'scheduled' | 'completed' | 'cancelled' | 'in_progress' | 'no_show';

    scheduledDate: string;      // yyyy-MM-dd
    scheduledTime?: string;     // "08:00-09:00"
    startTime?: string;         // "08:00"
    endTime?: string;           // "09:00"

    // Service fields
    vehicleId?: string;
    vehicleName?: string;
    serviceType?: string;
    technician?: string;
    notes?: string;
    // Test drive fields
    customerName?: string;
    customerPhone?: string;
    vehicleModel?: string;
    feedback?: string;
    rating?: number;
}


interface ScheduleCalendarProps {
    schedules: ScheduleItem[];
    selectedDate?: Date;
    onDateSelect: (date: Date | undefined) => void;
}

export function ScheduleCalendar({ schedules, selectedDate, onDateSelect }: ScheduleCalendarProps) {
    const getSchedulesForDate = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return schedules.filter(s => s.scheduledDate === dateStr);
    };

    return (
        <div className="flex justify-center">
            <div className="relative">
                <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={onDateSelect}
                    locale={vi}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                        scheduled: (date) => {
                            const items = getSchedulesForDate(date);
                            return items.some(s => s.status === 'scheduled');
                        },
                        inProgress: (date) => {
                            const items = getSchedulesForDate(date);
                            return items.some(s => s.status === 'in_progress');
                        },
                        completed: (date) => {
                            const items = getSchedulesForDate(date);
                            return items.some(s => s.status === 'completed');
                        },
                        cancelled: (date) => {
                            const items = getSchedulesForDate(date);
                            return items.some(s => s.status === 'cancelled' || s.status === 'no_show');
                        }
                    }}
                    modifiersClassNames={{
                        scheduled: 'bg-primary/10 font-semibold',
                        inProgress: 'bg-warning/10 font-semibold',
                        completed: 'bg-success/10 font-semibold',
                        cancelled: 'bg-destructive/10 font-semibold'
                    }}
                />
                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span>Đã đặt lịch</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-warning"></span>
                        <span>Đang thực hiện</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-success"></span>
                        <span>Hoàn thành</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-destructive"></span>
                        <span>Đã hủy</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export type { ScheduleItem };
