import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Wrench,
  Calendar,
  Settings,
  ArrowLeft,
  Plus,
  RefreshCw,
  Car,
  Star,
  Phone,
  User,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast, toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { getScheduleStatusBadge } from "@/lib/scheduleUtils";
import { ScheduleCalendar, type ScheduleItem } from "@/components/ScheduleCalendar";
import { slotService } from "@/services/api-slot";
import { appointmentService } from "@/services/api-appointments";
import { serviceEntityService, type ServiceResponse } from "@/services/api-service-entity";
import { customerService, customerStatus, type CustomerResponse } from "@/services/api-customers";




const ServiceManagement = () => {
  const navigate = useNavigate();

  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(true);
  const [scheduleType, setScheduleType] = useState<"service" | "test-drive">("service");
  const [serviceEntities, setServiceEntities] = useState<ServiceResponse[]>([]);
  const [selectedService, setSelectedService] = useState<ServiceResponse | null>(null);
  const [creatingSchedule, setCreatingSchedule] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<CustomerResponse | null>(null);
  const [isFindingCustomer, setIsFindingCustomer] = useState(false);

  // Unified schedule form state
  type NewScheduleForm = {
    customerPhone: string;
    customerName: string;
    notes: string;
    scheduledDate: string;  // yyyy-MM-dd
    scheduledTime: string;  // "08:00-09:00"
  };

  const [newSchedule, setNewSchedule] = useState<NewScheduleForm>({
    customerPhone: "",
    customerName: "",
    notes: "",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>();
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [selectedDateSchedules, setSelectedDateSchedules] = useState<ScheduleItem[]>([]);
  //-------------------------
  //SERVICE SCHEDULE FETCH
  //-------------------------

  //create schedule
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Fetch schedules list
  const fetchSchedules = async () => {
    try {
      const appointments = await appointmentService.getAll();

      const mapped: ScheduleItem[] = appointments.map((ap) => {
        const start = new Date(ap.startAt);
        const end = new Date(ap.endAt);

        const dateStr = format(start, "yyyy-MM-dd");
        const startTimeStr = format(start, "HH:mm");
        const endTimeStr = format(end, "HH:mm");
        const scheduledTime = `${startTimeStr}-${endTimeStr}`;

        // Map ServiceType → type
        const type: 'service' | 'test-drive' =
          ap.service?.serviceType === "TEST_DRIVE" ? "test-drive" : "service";

        // Map AppointmentStatus → ScheduleStatus
        let status: ScheduleItem["status"] = "scheduled";
        switch (ap.status) {
          case "COMPLETED":
            status = "completed";
            break;
          case "IN_SERVICE":
            status = "in_progress";
            break;
          case "CANCELED":
            status = "cancelled";
            break;
          case "SCHEDULED":
          default:
            status = "scheduled";
        }

        return {
          id: ap.appointmentId,
          type,
          status,
          scheduledDate: dateStr,
          scheduledTime,
          startTime: startTimeStr,
          endTime: endTimeStr,
          customerName: ap.customer?.name || "Khách chưa rõ tên",
          customerPhone: ap.customer?.phoneNumber || "",
          serviceType: ap.service?.name,
          notes: ap.note,
        };
      });

      setSchedules(mapped);
    } catch (err) {
      console.error(err);
      sonnerToast.error("Không tải được danh sách lịch hẹn");
    }
  };

  const fetchServiceEntities = async () => {
    try {
      const res = await serviceEntityService.listServices(0, 20);
      setServiceEntities(res.content);
    } catch (err) {
      console.error(err);
      sonnerToast.error("Không tải được danh sách dịch vụ");
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchServiceEntities();
  }, []);

  const timeSlots = [
    '08:00-09:00',
    '09:00-10:00',
    '10:00-11:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00'
  ];

  // KPI Stats
  const serviceSchedules = schedules.filter(s => s.type === 'service');
  const testDriveSchedules = schedules.filter(s => s.type === 'test-drive');

  const kpiStats = [
    {
      title: "Tỷ lệ lịch bảo trì đúng",
      value: "96.5%",
      target: ">95%",
      trend: "up"
    },
    {
      title: "Thời gian xử lý sự cố",
      value: "18.2h",
      target: "<24h",
      trend: "up"
    },
    {
      title: "Lái thử tháng này",
      value: testDriveSchedules.length.toString(),
      target: ">10",
      trend: "up"
    },
    {
      title: "Chi phí bảo trì trung bình",
      value: "2.1M₫",
      target: "<2.5M₫",
      trend: "stable"
    }
  ];

  const handleCreateSchedule = async () => {
    try {
      if (!selectedService) {
        sonnerToast.error("Vui lòng chọn loại dịch vụ");
        return;
      }

      if (!newSchedule.customerPhone) {
        sonnerToast.error("Vui lòng nhập số điện thoại khách hàng");
        return;
      }

      if (!newSchedule.scheduledDate || !newSchedule.scheduledTime) {
        sonnerToast.error("Vui lòng chọn ngày và khung giờ");
        return;
      }

      // Lấy customer từ phone
      let customer: CustomerResponse;
      try {
        customer = await customerService.getCustomerByPhone(
          newSchedule.customerPhone
        );
      } catch (err) {
        sonnerToast.error(
          "Khách chưa có trong hệ thống, vui lòng tạo khách hàng trước"
        );
        return;
      }

      // Tách khung giờ: "08:00-09:00"
      const [startHour, endHour] = newSchedule.scheduledTime.split("-");
      const startAt = `${newSchedule.scheduledDate}T${startHour}:00`;
      const endAt = `${newSchedule.scheduledDate}T${endHour}:00`;

      // Tạo Slot mới
      const slot = await slotService.create({
        startTime: startAt,
        endTime: endAt,
        maxTestDrive: 5,
        maxService: 10,
      });

      // TODO: assignedUserId có thể lấy từ user đang login, tạm thời hard-code
      const assignedUserId = 3;

      // Tạo Appointment
      await appointmentService.create({
        customerId: customer.customerId,
        serviceId: selectedService.id,
        assignedUserId,
        slotId: slot.slotId,
        note: newSchedule.notes,
        startAt,
        endAt,
      });

      sonnerToast.success("Tạo lịch hẹn thành công");

      // Reset form & đóng dialog
      setNewSchedule({
        customerPhone: "",
        customerName: "",
        notes: "",
        scheduledDate: "",
        scheduledTime: "",
      });
      setIsScheduleDialogOpen(false);

      // Refresh danh sách lịch
      fetchSchedules();
    } catch (err) {
      console.error(err);
      sonnerToast.error("Không thể tạo lịch hẹn, vui lòng thử lại");
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedCalendarDate(date);

    if (!date) {
      setSelectedDateSchedules([]);
      setIsDateDrawerOpen(false);
      return;
    }

    const dateStr = format(date, "yyyy-MM-dd");
    const items = schedules.filter((s) => s.scheduledDate === dateStr);

    setSelectedDateSchedules(items);
    setIsDateDrawerOpen(true);
  };

  // Get booked time slots for a specific date
  const getBookedTimeSlotsForDate = (dateStr: string) => {
    return schedules
      .filter((s) => s.scheduledDate === dateStr)
      .map((s) => s.scheduledTime)
      .filter((s): s is string => Boolean(s));
  };


  const handleFindCustomerByPhone = async () => {
    const phone = newSchedule.customerPhone.trim();
    if (!phone) return;

    try {
      setIsFindingCustomer(true);
      const customer = await customerService.getCustomerByPhone(phone);

      setFoundCustomer(customer);
      // nếu ô tên đang trống thì auto fill
      setNewSchedule(prev => ({
        ...prev,
        customerName: prev.customerName || customer.name,
      }));

      toast.success("Đã tìm thấy khách: " + customer.name);
    } catch (err: any) {
      console.error(err);
      setFoundCustomer(null);
      toast.error("Không tìm thấy khách với SĐT này");
    } finally {
      setIsFindingCustomer(false);
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/showroom')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quản lý dịch vụ
            </h1>
            <p className="text-muted-foreground">
              Lên lịch bảo trì và quản lý lái thử
            </p>
          </div>
        </div>
      </div>


      {/* Calendar View & Create Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-6">Lịch tổng hợp</h3>
          <ScheduleCalendar
            schedules={schedules}
            selectedDate={selectedCalendarDate}
            onDateSelect={handleDateSelect}
          />
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Thống kê</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-sm">Tổng lịch</span>
                <span className="font-bold text-lg">{schedules.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                <span className="text-sm">Hoàn thành</span>
                <span className="font-bold text-lg text-success">
                  {schedules.filter(s => s.status === 'completed').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                <span className="text-sm">Đã đặt lịch</span>
                <span className="font-bold text-lg text-primary">
                  {schedules.filter(s => s.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <span className="text-sm">Đã hủy</span>
                <span className="font-bold text-lg text-muted-foreground">
                  {schedules.filter(s => s.status === 'cancelled' || s.status === 'no_show').length}
                </span>
              </div>
            </div>

            {/* Step 1: Type Selection Dialog */}
            <Dialog open={isTypeSelectionOpen} onOpenChange={setIsTypeSelectionOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary w-full">
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo lịch mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Chọn loại lịch</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-6">
                  {serviceEntities.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Chưa có dịch vụ nào, hãy tạo ServiceEntity trước.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {serviceEntities.map((svc) => {
                        const isSelected = selectedService?.id === svc.id;
                        return (
                          <div
                            key={svc.id}
                            className={`flex items-center space-x-3 border-2 rounded-lg p-4 cursor-pointer transition-all ${isSelected ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                              }`}
                            onClick={() => setSelectedService(svc)}
                          >
                            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                              {/* icon đổi theo tên dịch vụ cho vui */}
                              {svc.name.toLowerCase().includes("lai") ? (
                                <Car className="w-5 h-5 text-primary" />
                              ) : (
                                <Wrench className="w-5 h-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold">{svc.name}</p>
                              {svc.description && (
                                <p className="text-sm text-muted-foreground">{svc.description}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTypeSelectionOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    className="bg-gradient-primary"
                    onClick={() => {
                      setIsTypeSelectionOpen(false);
                      setIsScheduleDialogOpen(true);
                    }}
                  >
                    Tiếp tục
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Step 2: Schedule Details Dialog */}
            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {selectedService
                      ? `Tạo lịch: ${selectedService.name}`
                      : "Tạo lịch dịch vụ"}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* KH - SĐT */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Số điện thoại khách hàng *</Label>
                      <Input
                        placeholder="Ví dụ: 0901234567"
                        value={newSchedule.customerPhone}
                        onChange={(e) =>
                          setNewSchedule((prev) => ({ ...prev, customerPhone: e.target.value }))
                        }
                        onBlur={handleFindCustomerByPhone}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {isFindingCustomer
                          ? "Đang tìm khách theo SĐT..."
                          : foundCustomer
                            ? `Khách: ${foundCustomer.name} (Sales: ${foundCustomer.assignedSalesName || "Chưa gán"})`
                            : "Nhập SĐT rồi rời ô để tự động tìm khách"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Tên khách hàng </Label>
                      <Input
                        placeholder="Nếu để trống sẽ lấy tên từ hệ thống"
                        value={newSchedule.customerName}
                        onChange={(e) =>
                          setNewSchedule((prev) => ({ ...prev, customerName: e.target.value }))
                        }
                      />
                    </div>
                  </div>

                  {/* Ghi chú */}
                  <div className="space-y-2">
                    <Label>Ghi chú</Label>
                    <Input
                      placeholder="Mô tả chi tiết dịch vụ cần thực hiện..."
                      value={newSchedule.notes}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({ ...prev, notes: e.target.value }))
                      }
                    />
                  </div>

                  {/* Ngày & khung giờ */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày *</Label>
                      <Input
                        type="date"
                        value={newSchedule.scheduledDate}
                        onChange={(e) =>
                          setNewSchedule((prev) => ({ ...prev, scheduledDate: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Khung giờ *</Label>
                      <Select
                        value={newSchedule.scheduledTime}
                        onValueChange={(v) =>
                          setNewSchedule((prev) => ({ ...prev, scheduledTime: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn khung giờ" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => {
                            const bookedSlots =
                              newSchedule.scheduledDate !== ""
                                ? getBookedTimeSlotsForDate(newSchedule.scheduledDate)
                                : [];
                            const isBooked = bookedSlots.includes(slot);

                            return (
                              <SelectItem key={slot} value={slot} disabled={isBooked}>
                                {slot} {isBooked && "(Đã đặt)"}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>


                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleCreateSchedule} className="bg-gradient-primary" disabled={creatingSchedule}>
                    {creatingSchedule ? "Đang tạo..." : "Tạo lịch"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>

      {/* Schedules Lists */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tất cả lịch</TabsTrigger>
          <TabsTrigger value="service">Bảo trì ({serviceSchedules.length})</TabsTrigger>
          <TabsTrigger value="test-drive">Lái thử ({testDriveSchedules.length})</TabsTrigger>
        </TabsList>

        {/* TẤT CẢ LỊCH */}
        <TabsContent value="all">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Tất cả lịch</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Khách hàng</TableHead> {/* đổi tên cột */}
                  <TableHead>Ngày</TableHead>
                  <TableHead>Giờ bắt đầu</TableHead>
                  <TableHead>Giờ kết thúc</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const [startTime, endTime] =
                    schedule.scheduledTime?.split("-") ?? ["", ""];

                  return (
                    <TableRow key={schedule.id}>
                      {/* Loại lịch */}
                      <TableCell>
                        {schedule.type === "service" ? (
                          <div className="flex items-center gap-2">
                            <Wrench className="w-4 h-4 text-primary" />
                            <span>Bảo trì</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-primary" />
                            <span>Lái thử</span>
                          </div>
                        )}
                      </TableCell>

                      {/* Khách hàng */}
                      <TableCell>
                        <div className="font-medium">
                          {schedule.customerName || "Khách chưa rõ tên"}
                        </div>
                        {schedule.customerPhone && (
                          <div className="text-sm text-muted-foreground">
                            {schedule.customerPhone}
                          </div>
                        )}
                      </TableCell>

                      {/* Ngày HẸN (không phải ngày tạo) */}
                      <TableCell>
                        {schedule.scheduledDate
                          ? format(new Date(schedule.scheduledDate), "dd/MM/yyyy")
                          : "-"}
                      </TableCell>

                      {/* Giờ bắt đầu */}
                      <TableCell>
                        {schedule.startTime ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {schedule.startTime}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Giờ kết thúc */}
                      <TableCell>
                        {schedule.endTime ? (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="w-3 h-3" />
                            {schedule.endTime}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="service">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Lịch bảo trì</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đánh giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.customerName}</TableCell>
                    <TableCell>{schedule.customerPhone}</TableCell>
                    <TableCell>{format(new Date(schedule.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {schedule.scheduledTime}
                      </div>
                    </TableCell>
                    <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      {schedule.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{schedule.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="test-drive">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Lịch lái thử</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Đánh giá</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testDriveSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.customerName}</TableCell>
                    <TableCell>{schedule.customerPhone}</TableCell>
                    <TableCell>{format(new Date(schedule.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3" />
                        {schedule.scheduledTime}
                      </div>
                    </TableCell>
                    <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      {schedule.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{schedule.rating}/5</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>


      {/* Date Details Drawer */}
      <Sheet open={isDateDrawerOpen} onOpenChange={setIsDateDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              Lịch ngày {selectedCalendarDate && format(selectedCalendarDate, 'dd/MM/yyyy', { locale: vi })}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {selectedDateSchedules.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Không có lịch trong ngày này</p>
              </div>
            ) : (
              selectedDateSchedules.map((schedule) => (
                <Card key={schedule.id} className="p-4 border-primary/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-lg">
                        {schedule.type === 'service' ? schedule.serviceType : schedule.vehicleModel}
                      </h4>
                      {getScheduleStatusBadge(schedule.status)}
                    </div>

                    <div className="space-y-2">
                      {schedule.type === 'service' ? (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span>{schedule.vehicleName}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{schedule.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{schedule.customerPhone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span>{schedule.vehicleModel}</span>
                          </div>
                        </>
                      )}

                      {schedule.scheduledTime && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{schedule.scheduledTime}</span>
                        </div>
                      )}
                    </div>

                    {schedule.notes && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Ghi chú:</p>
                        <p className="text-sm">{schedule.notes}</p>
                      </div>
                    )}

                    {schedule.feedback && (
                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground mb-1">Phản hồi:</p>
                        <p className="text-sm">{schedule.feedback}</p>
                      </div>
                    )}

                    {schedule.rating && (
                      <div className="flex items-center gap-2 pt-2">
                        <span className="text-sm text-muted-foreground">Đánh giá:</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < schedule.rating!
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted'
                                }`}
                            />
                          ))}
                          <span className="text-sm font-medium ml-1">{schedule.rating}/5</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3">
                      <Button variant="outline" size="sm" className="flex-1">Chi tiết</Button>
                      {schedule.status === 'scheduled' && (
                        <Button variant="outline" size="sm" className="flex-1">Hủy lịch</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ServiceManagement;
