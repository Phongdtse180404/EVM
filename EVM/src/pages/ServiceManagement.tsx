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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Wrench, 
  Calendar, 
  Wifi, 
  WifiOff,
  Battery,
  BatteryLow,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Settings,
  ArrowLeft,
  Plus,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

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

  // IoT Device Status
  const [iotDevices, setIotDevices] = useState([
    {
      id: "IOT001",
      vehicleId: "VH001",
      vehicleName: "Tesla Model 3 - BKS 30A-123.45",
      deviceType: "Battery Sensor",
      status: "online",
      batteryLevel: 85,
      lastPing: "2024-09-16 14:30",
      location: "Showroom A",
      alerts: 0
    },
    {
      id: "IOT002", 
      vehicleId: "VH002",
      vehicleName: "VinFast VF8 - BKS 51G-567.89",
      deviceType: "Engine Sensor",
      status: "warning",
      batteryLevel: 45,
      lastPing: "2024-09-16 14:25",
      location: "Kho B",
      alerts: 1
    },
    {
      id: "IOT003",
      vehicleId: "VH003", 
      vehicleName: "BMW iX - BKS 29B-901.23",
      deviceType: "Multi Sensor",
      status: "offline",
      batteryLevel: 12,
      lastPing: "2024-09-15 16:45",
      location: "Sân trưng bày",
      alerts: 3
    }
  ]);

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
      title: "Thiết bị IoT hoạt động",
      value: "87%",
      target: ">90%",
      trend: "down"
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
      case "online":
        return <Badge variant="outline" className="text-success border-success">
          <Wifi className="w-3 h-3 mr-1" />
          Trực tuyến
        </Badge>;
      case "warning":
        return <Badge variant="outline" className="text-warning border-warning">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Cảnh báo
        </Badge>;
      case "offline":
        return <Badge variant="outline" className="text-destructive border-destructive">
          <WifiOff className="w-3 h-3 mr-1" />
          Ngoại tuyến
        </Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getBatteryIcon = (level: number) => {
    if (level > 50) return <Battery className="w-4 h-4 text-success" />;
    if (level > 20) return <Battery className="w-4 h-4 text-warning" />;
    return <BatteryLow className="w-4 h-4 text-destructive" />;
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

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quản lý dịch vụ / bảo trì
            </h1>
            <p className="text-muted-foreground">
              Theo dõi IoT, lên lịch bảo trì và quản lý lịch sử dịch vụ
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
            Đồng bộ IoT
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
      <Tabs defaultValue="iot" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="iot">Giám sát IoT</TabsTrigger>
          <TabsTrigger value="schedule">Lên lịch bảo trì</TabsTrigger>
          <TabsTrigger value="history">Lịch sử dịch vụ</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích KPI</TabsTrigger>
        </TabsList>

        {/* IoT Monitoring Tab */}
        <TabsContent value="iot" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Trạng thái thiết bị IoT</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm thiết bị..." className="w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="online">Trực tuyến</SelectItem>
                    <SelectItem value="warning">Cảnh báo</SelectItem>
                    <SelectItem value="offline">Ngoại tuyến</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Thiết bị</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Loại sensor</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Pin</TableHead>
                  <TableHead>Cập nhật cuối</TableHead>
                  <TableHead>Vị trí</TableHead>
                  <TableHead>Cảnh báo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {iotDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.id}</TableCell>
                    <TableCell>{device.vehicleName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{device.deviceType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getBatteryIcon(device.batteryLevel)}
                        <span className="text-sm">{device.batteryLevel}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{device.lastPing}</TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>
                      {device.alerts > 0 ? (
                        <Badge variant="destructive">{device.alerts}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Activity className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                        <Button variant="outline" size="sm">
                          <Zap className="w-4 h-4 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

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
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleScheduleService} className="bg-gradient-primary">
                      Tạo lịch
                    </Button>
                  </div>
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

        {/* Service History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Lịch sử dịch vụ</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm dịch vụ..." className="w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="in_progress">Đang thực hiện</SelectItem>
                    <SelectItem value="scheduled">Đã lên lịch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã dịch vụ</TableHead>
                  <TableHead>Xe</TableHead>
                  <TableHead>Loại dịch vụ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày lên lịch</TableHead>
                  <TableHead>Ngày hoàn thành</TableHead>
                  <TableHead>Kỹ thuật viên</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Chi phí</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceHistory.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.id}</TableCell>
                    <TableCell>{service.vehicleName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{service.serviceType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{service.scheduledDate}</TableCell>
                    <TableCell>
                      {service.completedDate || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>{service.technician}</TableCell>
                    <TableCell>
                      {service.duration || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      {service.cost || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* KPI Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Hiệu suất bảo trì</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lịch bảo trì đúng thời gian</span>
                    <span className="font-medium">96.5%</span>
                  </div>
                  <Progress value={96.5} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Thiết bị IoT hoạt động</span>
                    <span className="font-medium">87%</span>
                  </div>
                  <Progress value={87} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Thời gian phản hồi sự cố</span>
                    <span className="font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Thống kê tháng này</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tổng dịch vụ hoàn thành</span>
                  <span className="font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dịch vụ đang thực hiện</span>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Sự cố IoT xử lý</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Chi phí bảo trì</span>
                  <span className="font-medium">52.5M₫</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceManagement;