import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Wrench,
  Calendar,
  CheckCircle,
  Clock,
  Settings,
  ArrowLeft,
  Plus,
  RefreshCw,
  Car,
  Star,
  Phone,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast as sonnerToast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface TestDrive {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
}

const ServiceManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [serviceType, setServiceType] = useState("battery");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("09:00");
  const [serviceNotes, setServiceNotes] = useState("");
  const [isAutoMonitoring, setIsAutoMonitoring] = useState(true);

  // Test Drive states
  const [isTestDriveDialogOpen, setIsTestDriveDialogOpen] = useState(false);
  const [newTestDrive, setNewTestDrive] = useState({
    customerName: '',
    customerPhone: '',
    vehicleModel: '',
    scheduledDate: '',
    scheduledTime: '08:00-09:00'
  });
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | undefined>();
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [selectedDateAppointments, setSelectedDateAppointments] = useState<TestDrive[]>([]);

  // Service History
  const [serviceHistory, setServiceHistory] = useState([
    {
      id: "SRV001",
      vehicleId: "VH001",
      vehicleName: "Tesla Model 3",
      serviceType: "Bảo trì pin",
      status: "completed",
      scheduledDate: "2024-09-15",
      completedDate: "2024-09-15",
      technician: "Nguyễn Văn A",
      duration: "2h 30m",
      cost: "1,500,000₫",
      notes: "Thay thế module pin, kiểm tra hệ thống làm mát"
    },
    {
      id: "SRV002",
      vehicleId: "VH002",
      vehicleName: "VinFast VF8",
      serviceType: "Kiểm tra sensor",
      status: "in_progress",
      scheduledDate: "2024-09-16",
      completedDate: "",
      technician: "Trần Thị B",
      duration: "",
      cost: "",
      notes: "Sensor báo lỗi kết nối IoT"
    },
    {
      id: "SRV003",
      vehicleId: "VH003",
      vehicleName: "BMW iX",
      serviceType: "Bảo trì định kỳ",
      status: "scheduled",
      scheduledDate: "2024-09-18",
      completedDate: "",
      technician: "Lê Văn C",
      duration: "",
      cost: "",
      notes: "Bảo trì định kỳ 6 tháng"
    }
  ]);

  // Test Drives
  const [testDrives, setTestDrives] = useState<TestDrive[]>([
    {
      id: '1',
      customerName: 'Lê Thị Cẩm',
      customerPhone: '0912345678',
      vehicleModel: 'VinFast VF8',
      scheduledDate: '2025-02-12',
      scheduledTime: '10:00-11:00',
      status: 'scheduled'
    },
    {
      id: '2',
      customerName: 'Nguyễn Văn An',
      customerPhone: '0901234567',
      vehicleModel: 'Tesla Model 3',
      scheduledDate: '2025-02-05',
      scheduledTime: '14:00-15:00',
      status: 'completed',
      feedback: 'Khách hàng rất hài lòng với trải nghiệm lái',
      rating: 5
    },
    {
      id: '3',
      customerName: 'Trần Minh Hải',
      customerPhone: '0923456789',
      vehicleModel: 'VinFast VF9',
      scheduledDate: '2025-02-12',
      scheduledTime: '14:00-15:00',
      status: 'scheduled'
    },
    {
      id: '4',
      customerName: 'Phạm Thu Hà',
      customerPhone: '0934567890',
      vehicleModel: 'BYD Atto 3',
      scheduledDate: '2025-02-15',
      scheduledTime: '09:00-10:00',
      status: 'scheduled'
    },
    {
      id: '5',
      customerName: 'Hoàng Văn Nam',
      customerPhone: '0945678901',
      vehicleModel: 'Hyundai IONIQ 5',
      scheduledDate: '2025-02-18',
      scheduledTime: '16:00-17:00',
      status: 'scheduled'
    },
    {
      id: '6',
      customerName: 'Võ Thị Mai',
      customerPhone: '0956789012',
      vehicleModel: 'Tesla Model 3',
      scheduledDate: '2025-02-20',
      scheduledTime: '10:00-11:00',
      status: 'completed',
      feedback: 'Xe chạy êm, công nghệ hiện đại',
      rating: 4
    }
  ]);

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

  // KPI Stats
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
      value: testDrives.length.toString(),
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="text-success border-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Hoàn thành
        </Badge>;
      case "in_progress":
        return <Badge variant="outline" className="text-warning border-warning">
          <Clock className="w-3 h-3 mr-1" />
          Đang thực hiện
        </Badge>;
      case "scheduled":
        return <Badge variant="outline" className="text-primary border-primary">
          <Calendar className="w-3 h-3 mr-1" />
          Đã lên lịch
        </Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const handleScheduleService = () => {
    if (!selectedVehicle || !scheduledDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn xe và ngày bảo trì",
        variant: "destructive",
      });
      return;
    }

    const serviceTypeNames = {
      battery: "Bảo trì pin",
      sensor: "Kiểm tra sensor",
      maintenance: "Bảo trì định kỳ",
      repair: "Sửa chữa"
    };

    const newService = {
      id: `SRV${String(serviceHistory.length + 1).padStart(3, '0')}`,
      vehicleId: selectedVehicle,
      vehicleName: `Xe ${selectedVehicle}`,
      serviceType: serviceTypeNames[serviceType as keyof typeof serviceTypeNames],
      status: "scheduled" as const,
      scheduledDate: scheduledDate,
      completedDate: "",
      technician: "Chưa phân công",
      duration: "",
      cost: "",
      notes: serviceNotes || "Lịch bảo trì mới"
    };

    setServiceHistory(prev => [newService, ...prev]);

    // Reset form
    setSelectedVehicle("");
    setScheduledDate("");
    setScheduledTime("09:00");
    setServiceNotes("");
    setIsScheduleDialogOpen(false);

    toast({
      title: "Lên lịch thành công!",
      description: `Đã tạo lịch ${serviceTypeNames[serviceType as keyof typeof serviceTypeNames]} cho ${scheduledDate}`,
    });
  };

  const handleScheduleTestDrive = () => {
    if (!newTestDrive.customerName || !newTestDrive.customerPhone || !newTestDrive.vehicleModel || !newTestDrive.scheduledDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const testDrive: TestDrive = {
      id: Date.now().toString(),
      customerName: newTestDrive.customerName,
      customerPhone: newTestDrive.customerPhone,
      vehicleModel: newTestDrive.vehicleModel,
      scheduledDate: newTestDrive.scheduledDate,
      scheduledTime: newTestDrive.scheduledTime,
      status: 'scheduled'
    };

    setTestDrives([testDrive, ...testDrives]);

    // Reset form
    setNewTestDrive({
      customerName: '',
      customerPhone: '',
      vehicleModel: '',
      scheduledDate: '',
      scheduledTime: '08:00-09:00'
    });
    setIsTestDriveDialogOpen(false);

    sonnerToast.success('Đã đặt lịch lái thử thành công!');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayAppointments = testDrives.filter(td => td.scheduledDate === dateStr);

    setSelectedCalendarDate(date);
    setSelectedDateAppointments(dayAppointments);
    setIsDateDrawerOpen(true);
  };

  // Get booked time slots for a specific date
  const getBookedTimeSlotsForDate = (dateStr: string) => {
    return testDrives
      .filter(td => td.scheduledDate === dateStr && td.status !== 'cancelled' && td.status !== 'no_show')
      .map(td => td.scheduledTime);
  };

  const getTestDrivesForDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return testDrives.filter(td => td.scheduledDate === dateStr);
  };

  const getTestDriveStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge className="bg-primary/20 text-primary border-primary">Đã đặt lịch</Badge>;
      case 'completed':
        return <Badge className="bg-success/20 text-success border-success">Hoàn thành</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground">Đã hủy</Badge>;
      case 'no_show':
        return <Badge className="bg-destructive/20 text-destructive border-destructive">Không đến</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Lên lịch bảo trì</TabsTrigger>
          <TabsTrigger value="test-drive">Lái thử</TabsTrigger>
        </TabsList>

        {/* Schedule Maintenance Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Lịch bảo trì</h3>
              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Tạo lịch bảo trì
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Tạo lịch bảo trì mới</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Chọn xe</Label>
                      <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
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
                      <Label>Loại dịch vụ</Label>
                      <Select value={serviceType} onValueChange={setServiceType}>
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

                    <div className="space-y-2">
                      <Label>Ngày bảo trì</Label>
                      <Input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Thời gian</Label>
                      <Input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Ghi chú</Label>
                      <Input
                        placeholder="Mô tả chi tiết dịch vụ cần thực hiện..."
                        value={serviceNotes}
                        onChange={(e) => setServiceNotes(e.target.value)}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleScheduleService} className="bg-gradient-primary">
                      Tạo lịch
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {serviceHistory.filter(service => service.status === "scheduled").map((service) => (
                <Card key={service.id} className="p-4 border-primary/20">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{service.serviceType}</h4>
                      {getStatusBadge(service.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{service.vehicleName}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {service.scheduledDate}
                    </div>
                    <p className="text-sm">{service.notes}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Chỉnh sửa</Button>
                      <Button variant="outline" size="sm">Hủy lịch</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Test Drive Tab */}
        <TabsContent value="test-drive" className="space-y-6">
          {/* Calendar View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-6">
              <h3 className="text-lg font-semibold mb-6">Lịch lái thử</h3>
              <div className="flex justify-center">
                <div className="relative">
                  <CalendarComponent
                    mode="single"
                    selected={selectedCalendarDate}
                    onSelect={handleDateSelect}
                    locale={vi}
                    className="rounded-md border pointer-events-auto"
                    modifiers={{
                      scheduled: (date) => {
                        const appts = getTestDrivesForDate(date);
                        return appts.some(a => a.status === 'scheduled');
                      },
                      completed: (date) => {
                        const appts = getTestDrivesForDate(date);
                        return appts.some(a => a.status === 'completed');
                      },
                      cancelled: (date) => {
                        const appts = getTestDrivesForDate(date);
                        return appts.some(a => a.status === 'cancelled' || a.status === 'no_show');
                      }
                    }}
                    modifiersClassNames={{
                      scheduled: 'bg-primary/10 font-semibold',
                      completed: 'bg-success/10 font-semibold',
                      cancelled: 'bg-destructive/10 font-semibold'
                    }}
                  />
                  <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-primary"></span>
                      <span>Đã đặt lịch</span>
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
            </Card>

            <Card className="p-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Thống kê</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                    <span className="text-sm">Tổng lịch</span>
                    <span className="font-bold text-lg">{testDrives.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-success/10">
                    <span className="text-sm">Hoàn thành</span>
                    <span className="font-bold text-lg text-success">
                      {testDrives.filter(td => td.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
                    <span className="text-sm">Đã đặt lịch</span>
                    <span className="font-bold text-lg text-primary">
                      {testDrives.filter(td => td.status === 'scheduled').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="text-sm">Đã hủy</span>
                    <span className="font-bold text-lg text-muted-foreground">
                      {testDrives.filter(td => td.status === 'cancelled' || td.status === 'no_show').length}
                    </span>
                  </div>
                </div>
                <Dialog open={isTestDriveDialogOpen} onOpenChange={setIsTestDriveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-primary w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Đặt lịch lái thử
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Đặt lịch lái thử</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Tên khách hàng *</Label>
                          <Input
                            placeholder="Nhập họ tên"
                            value={newTestDrive.customerName}
                            onChange={(e) => setNewTestDrive({ ...newTestDrive, customerName: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Số điện thoại *</Label>
                          <Input
                            placeholder="0901234567"
                            value={newTestDrive.customerPhone}
                            onChange={(e) => setNewTestDrive({ ...newTestDrive, customerPhone: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Chọn xe *</Label>
                        <Select value={newTestDrive.vehicleModel} onValueChange={(value) => setNewTestDrive({ ...newTestDrive, vehicleModel: value })}>
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

                      <div className="space-y-2">
                        <Label>Ngày lái thử *</Label>
                        <Input
                          type="date"
                          value={newTestDrive.scheduledDate}
                          onChange={(e) => setNewTestDrive({ ...newTestDrive, scheduledDate: e.target.value })}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>Chọn khung giờ *</Label>
                        <RadioGroup
                          value={newTestDrive.scheduledTime}
                          onValueChange={(value) => setNewTestDrive({ ...newTestDrive, scheduledTime: value })}
                          className="grid grid-cols-2 gap-3"
                        >
                          {timeSlots.map((slot) => {
                            const bookedSlots = newTestDrive.scheduledDate
                              ? getBookedTimeSlotsForDate(newTestDrive.scheduledDate)
                              : [];
                            const isBooked = bookedSlots.includes(slot);

                            return (
                              <div
                                key={slot}
                                className={`flex items-center space-x-2 border rounded-lg p-3 ${isBooked
                                  ? 'bg-muted/30 opacity-50 cursor-not-allowed'
                                  : 'hover:bg-muted/50 cursor-pointer'
                                  }`}
                              >
                                <RadioGroupItem
                                  value={slot}
                                  id={slot}
                                  disabled={isBooked}
                                />
                                <Label
                                  htmlFor={slot}
                                  className={`flex items-center gap-2 flex-1 ${isBooked ? 'cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                >
                                  <Clock className="w-4 h-4" />
                                  {slot}
                                  {isBooked && (
                                    <span className="text-xs text-muted-foreground ml-auto">(Đã đặt)</span>
                                  )}
                                </Label>
                              </div>
                            );
                          })}
                        </RadioGroup>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTestDriveDialogOpen(false)}>
                        Hủy
                      </Button>
                      <Button onClick={handleScheduleTestDrive} className="bg-gradient-primary">
                        Đặt lịch
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          </div>

          {/* Test Drives List */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Danh sách lịch lái thử</h3>
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
                {testDrives.map((testDrive) => (
                  <TableRow key={testDrive.id}>
                    <TableCell className="font-medium">{testDrive.customerName}</TableCell>
                    <TableCell>{testDrive.customerPhone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        {testDrive.vehicleModel}
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(testDrive.scheduledDate), 'dd/MM/yyyy')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-primary border-primary">
                        <Clock className="w-3 h-3 mr-1" />
                        {testDrive.scheduledTime}
                      </Badge>
                    </TableCell>
                    <TableCell>{getTestDriveStatusBadge(testDrive.status)}</TableCell>
                    <TableCell>
                      {testDrive.rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{testDrive.rating}/5</span>
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

          {/* Date Details Drawer */}
          <Sheet open={isDateDrawerOpen} onOpenChange={setIsDateDrawerOpen}>
            <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle>
                  Lịch lái thử ngày {selectedCalendarDate && format(selectedCalendarDate, 'dd/MM/yyyy', { locale: vi })}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {selectedDateAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Không có lịch lái thử trong ngày này</p>
                  </div>
                ) : (
                  selectedDateAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4 border-primary/20">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-lg">{appointment.vehicleModel}</h4>
                          {getTestDriveStatusBadge(appointment.status)}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium">{appointment.customerName}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.customerPhone}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <Badge variant="outline" className="text-primary border-primary">
                              {appointment.scheduledTime}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-sm">
                            <Car className="w-4 h-4 text-muted-foreground" />
                            <span>{appointment.vehicleModel}</span>
                          </div>
                        </div>

                        {appointment.feedback && (
                          <div className="pt-3 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Phản hồi:</p>
                            <p className="text-sm">{appointment.feedback}</p>
                          </div>
                        )}

                        {appointment.rating && (
                          <div className="flex items-center gap-2 pt-2">
                            <span className="text-sm text-muted-foreground">Đánh giá:</span>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < appointment.rating!
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-muted'
                                    }`}
                                />
                              ))}
                              <span className="text-sm font-medium ml-1">{appointment.rating}/5</span>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-3">
                          <Button variant="outline" size="sm" className="flex-1">Chi tiết</Button>
                          {appointment.status === 'scheduled' && (
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceManagement;
