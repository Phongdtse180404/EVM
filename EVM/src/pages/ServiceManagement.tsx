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
import { toast as sonnerToast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ScheduleCalendar, type ScheduleItem } from "@/components/ScheduleCalendar";
import { getScheduleStatusBadge } from "@/lib/scheduleUtils";
import { serviceEntityService } from "@/services/api-service-entity";
import { serviceRecordService } from "@/services/api-service-record";

const ServiceManagement = () => {
  const navigate = useNavigate();

  const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleType, setScheduleType] = useState<'service' | 'test-drive'>('service');
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(true);

  // Unified schedule form state
  const [newSchedule, setNewSchedule] = useState({
    vehicleId: "",
    vehicleModel: "",
    serviceId: "",
    serviceType: "",
    customerName: "",
    customerPhone: "",
    scheduledDate: "",
    scheduledTime: "",
    notes: "",
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
      const res = await serviceRecordService.list();
      const items: ScheduleItem[] = res.content.map((record) => ({
        id: record.id.toString(),
        type: "service",
        status: "scheduled",
        scheduledDate: record.createdAt.split("T")[0],
        scheduledTime: record.createdAt.split("T")[1]?.substring(0, 5),
        serviceType: record.content,
        notes: record.note,
        customerId: record.customerId,
        userId: record.userId,
      }));
      setSchedules(items);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lịch:", error);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const vehicleModels = ['Tesla Model 3', 'VinFast VF8', 'VinFast VF9', 'BYD Atto 3', 'Hyundai IONIQ 5'];
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

  const serviceTypeNames = {
    battery: "Bảo trì pin",
    sensor: "Kiểm tra sensor",
    maintenance: "Bảo trì định kỳ",
    repair: "Sửa chữa"
  };

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
      if (!newSchedule.scheduledDate || !newSchedule.scheduledTime) {
        sonnerToast.error("Vui lòng chọn ngày và khung giờ!");
        return;
      }

      if (scheduleType === "service") {
        if (!newSchedule.vehicleId || !newSchedule.serviceType) {
          sonnerToast.error("Vui lòng chọn xe và loại dịch vụ!");
          return;
        }

        const payload = {
          userId: 1, // TODO: thay bằng userId thực tế (ví dụ lấy từ localStorage)
          customerId: 1, // TODO: thay bằng customerId thật
          serviceId: 1, // ID dịch vụ thật nếu có
          content: newSchedule.serviceType, // lưu loại dịch vụ vào content
          note: newSchedule.notes,
        };

        await serviceRecordService.create(payload);
        sonnerToast.success(" Đã tạo lịch bảo trì thành công!");
      }

      if (scheduleType === "test-drive") {
        if (!newSchedule.vehicleModel || !newSchedule.customerName || !newSchedule.customerPhone) {
          sonnerToast.error("Vui lòng nhập đầy đủ thông tin khách hàng!");
          return;
        }

        const payload = {
          name: `Lái thử xe ${newSchedule.vehicleModel}`,
          description: `Khách hàng ${newSchedule.customerName} (${newSchedule.customerPhone}) - Ngày ${newSchedule.scheduledDate} lúc ${newSchedule.scheduledTime}`,
        };

        await serviceEntityService.createService(payload);
        sonnerToast.success(" Đã tạo lịch lái thử thành công!");
      }

      setIsScheduleDialogOpen(false);
      setNewSchedule({
        vehicleId: "",
        vehicleModel: "",
        serviceId: "",
        serviceType: "",
        customerName: "",
        customerPhone: "",
        scheduledDate: "",
        scheduledTime: "",
        notes: "",
      });
    } catch (error) {
      console.error(error);
      sonnerToast.error(" Có lỗi xảy ra khi tạo lịch!");
    }
  };



  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const daySchedules = schedules.filter(s => s.scheduledDate === dateStr);

    setSelectedCalendarDate(date);
    setSelectedDateSchedules(daySchedules);
    setIsDateDrawerOpen(true);
  };

  // Get booked time slots for a specific date
  const getBookedTimeSlotsForDate = (dateStr: string) => {
    return schedules
      .filter(s => s.scheduledDate === dateStr && s.status !== 'cancelled' && s.status !== 'no_show' && s.scheduledTime)
      .map(s => s.scheduledTime!);
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-monitoring" className="text-sm">Giám sát tự động</Label>
            <Switch
              id="auto-monitoring"
              checked={isAutoMonitoring}
              onCheckedChange={setIsAutoMonitoring}
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Đồng bộ
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiStats.map((stat, index) => (
          <Card key={index} className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">Mục tiêu: {stat.target}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
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
                  <RadioGroup value={scheduleType} onValueChange={(v) => setScheduleType(v as 'service' | 'test-drive')}>
                    <div className="grid grid-cols-1 gap-4">
                      <div
                        className={`flex items-center space-x-3 border-2 rounded-lg p-6 cursor-pointer transition-all ${scheduleType === 'service' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        onClick={() => setScheduleType('service')}
                      >
                        <RadioGroupItem value="service" id="service" />
                        <Label htmlFor="service" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Lịch bảo trì</p>
                            <p className="text-sm text-muted-foreground">Tạo lịch bảo trì, sửa chữa xe</p>
                          </div>
                        </Label>
                      </div>
                      <div
                        className={`flex items-center space-x-3 border-2 rounded-lg p-6 cursor-pointer transition-all ${scheduleType === 'test-drive' ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
                        onClick={() => setScheduleType('test-drive')}
                      >
                        <RadioGroupItem value="test-drive" id="test-drive" />
                        <Label htmlFor="test-drive" className="flex items-center gap-3 cursor-pointer flex-1">
                          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Car className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">Lịch lái thử</p>
                            <p className="text-sm text-muted-foreground">Đặt lịch lái thử cho khách hàng</p>
                          </div>
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
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
                    {scheduleType === 'service' ? 'Tạo lịch bảo trì' : 'Tạo lịch lái thử'}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Service Schedule Fields */}
                  {scheduleType === 'service' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Chọn xe *</Label>
                          <Select value={newSchedule.vehicleId} onValueChange={(v) => setNewSchedule({ ...newSchedule, vehicleId: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn xe cần bảo trì" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="VH001">Tesla Model 3 - BKS 30A-123.45</SelectItem>
                              <SelectItem value="VH002">VinFast VF8 - BKS 51G-567.89</SelectItem>
                              <SelectItem value="VH003">BMW iX - BKS 29B-901.23</SelectItem>
                              <SelectItem value="VH004">Audi e-tron - BKS 50H-345.67</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Loại dịch vụ *</Label>
                          <Select value={newSchedule.serviceType} onValueChange={(v) => setNewSchedule({ ...newSchedule, serviceType: v })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="battery">Bảo trì pin</SelectItem>
                              <SelectItem value="sensor">Kiểm tra sensor</SelectItem>
                              <SelectItem value="maintenance">Bảo trì định kỳ</SelectItem>
                              <SelectItem value="repair">Sửa chữa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Ghi chú</Label>
                        <Input
                          placeholder="Mô tả chi tiết dịch vụ cần thực hiện..."
                          value={newSchedule.notes}
                          onChange={(e) => setNewSchedule({ ...newSchedule, notes: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  {/* Test Drive Fields */}
                  {scheduleType === 'test-drive' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tên khách hàng *</Label>
                          <Input
                            placeholder="Nhập họ tên"
                            value={newSchedule.customerName}
                            onChange={(e) => setNewSchedule({ ...newSchedule, customerName: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Số điện thoại *</Label>
                          <Input
                            placeholder="0901234567"
                            value={newSchedule.customerPhone}
                            onChange={(e) => setNewSchedule({ ...newSchedule, customerPhone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chọn xe *</Label>
                        <Select value={newSchedule.vehicleModel} onValueChange={(v) => setNewSchedule({ ...newSchedule, vehicleModel: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn mẫu xe" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleModels.map(model => (
                              <SelectItem key={model} value={model}>{model}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}

                  {/* Common Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ngày *</Label>
                      <Input
                        type="date"
                        value={newSchedule.scheduledDate}
                        onChange={(e) => setNewSchedule({ ...newSchedule, scheduledDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Khung giờ *</Label>
                      <Select
                        value={newSchedule.scheduledTime}
                        onValueChange={(v) => setNewSchedule({ ...newSchedule, scheduledTime: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((slot) => {
                            const bookedSlots = newSchedule.scheduledDate
                              ? getBookedTimeSlotsForDate(newSchedule.scheduledDate)
                              : [];
                            const isBooked = bookedSlots.includes(slot);

                            return (
                              <SelectItem
                                key={slot}
                                value={slot}
                                disabled={isBooked}
                              >
                                {slot} {isBooked && '(Đã đặt)'}
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
                  <Button onClick={handleCreateSchedule} className="bg-gradient-primary">
                    Tạo lịch
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

        <TabsContent value="all">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Tất cả lịch</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Loại</TableHead>
                  <TableHead>Thông tin</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      {schedule.type === 'service' ? (
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
                    <TableCell>
                      {schedule.type === 'service' ? (
                        <div>
                          <div className="font-medium">{schedule.serviceType}</div>
                          <div className="text-sm text-muted-foreground">{schedule.vehicleName}</div>
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{schedule.customerName}</div>
                          <div className="text-sm text-muted-foreground">{schedule.vehicleModel}</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{format(new Date(schedule.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {schedule.scheduledTime && (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {schedule.scheduledTime}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Ngày</TableHead>
                  <TableHead>Khung giờ</TableHead>
                  <TableHead>Kỹ thuật viên</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.serviceType}</TableCell>
                    <TableCell>{schedule.vehicleName}</TableCell>
                    <TableCell>{format(new Date(schedule.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      {schedule.scheduledTime && (
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="w-3 h-3" />
                          {schedule.scheduledTime}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{getScheduleStatusBadge(schedule.status)}</TableCell>
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
                  <TableHead>Xe</TableHead>
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
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        {schedule.vehicleModel}
                      </div>
                    </TableCell>
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
