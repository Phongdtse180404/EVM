import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  Download,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Search,
  Filter,
  RefreshCw,
  Settings,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReportsManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form states for new report
  const [reportType, setReportType] = useState("sales");
  const [reportFormat, setReportFormat] = useState("excel");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportNote, setReportNote] = useState("");

  // Schedule form states
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState("monthly");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [scheduleReportType, setScheduleReportType] = useState("sales");

  // Mock data for reports - using state to make it dynamic
  const [salesReports, setSalesReports] = useState([
    {
      id: "RPT001",
      name: "Báo cáo doanh số tháng 9",
      period: "2024-09",
      type: "Tháng",
      revenue: "2,450,000,000",
      orders: 156,
      status: "completed",
      generatedAt: "2024-09-15 09:30",
      approvedBy: "Trần Minh Quân",
      accuracy: "99.8%"
    },
    {
      id: "RPT002",
      name: "Báo cáo doanh số tuần 38",
      period: "2024-W38",
      type: "Tuần",
      revenue: "580,000,000",
      orders: 42,
      status: "pending",
      generatedAt: "2024-09-16 14:15",
      approvedBy: "",
      accuracy: "99.9%"
    },
    {
      id: "RPT003",
      name: "Báo cáo doanh số ngày 15/9",
      period: "2024-09-15",
      type: "Ngày",
      revenue: "89,500,000",
      orders: 8,
      status: "completed",
      generatedAt: "2024-09-15 18:00",
      approvedBy: "Lê Thị Hoa",
      accuracy: "100%"
    }
  ]);

  // Function to generate new report
  const handleGenerateReport = async () => {
    if (!fromDate || !toDate) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ngày bắt đầu và kết thúc",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const reportTypeNames = {
        sales: "Doanh số",
        debt: "Công nợ",
        combined: "Tổng hợp"
      };

      const periodNames = {
        daily: "Ngày",
        weekly: "Tuần",
        monthly: "Tháng",
        quarterly: "Quý",
        custom: "Tùy chỉnh"
      };

      const newReport = {
        id: `RPT${String(salesReports.length + 1).padStart(3, '0')}`,
        name: `Báo cáo ${reportTypeNames[reportType as keyof typeof reportTypeNames]} ${periodNames[selectedPeriod as keyof typeof periodNames]} ${fromDate}`,
        period: `${fromDate} - ${toDate}`,
        type: periodNames[selectedPeriod as keyof typeof periodNames],
        revenue: `${Math.floor(Math.random() * 5000 + 1000).toLocaleString()},000,000`,
        orders: Math.floor(Math.random() * 200 + 50),
        status: "completed" as const,
        generatedAt: new Date().toLocaleString('vi-VN'),
        approvedBy: "Hệ thống tự động",
        accuracy: "99.9%"
      };

      setSalesReports(prev => [newReport, ...prev]);

      // Reset form
      setFromDate("");
      setToDate("");
      setReportNote("");

      setIsGenerating(false);

      toast({
        title: "Tạo báo cáo thành công!",
        description: `Báo cáo ${newReport.name} đã được tạo trong ${Math.floor(Math.random() * 3 + 2)}.${Math.floor(Math.random() * 9)}s`,
      });
    }, 2000);
  };

  const [scheduledReports, setScheduledReports] = useState([
    {
      id: "SCH001",
      name: "Báo cáo doanh số hàng tháng",
      frequency: "Hàng tháng",
      nextRun: "2024-10-01 09:00",
      recipients: ["ceo@company.com", "sales@company.com"],
      status: "active"
    },
    {
      id: "SCH002",
      name: "Báo cáo KPI tuần",
      frequency: "Hàng tuần",
      nextRun: "2024-09-23 10:00",
      recipients: ["manager@company.com"],
      status: "active"
    }
  ]);

  // Function to create new schedule
  const handleCreateSchedule = () => {
    if (!scheduleName || !scheduleRecipients) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập tên lịch và danh sách người nhận",
        variant: "destructive",
      });
      return;
    }

    const frequencyMap = {
      daily: "Hàng ngày",
      weekly: "Hàng tuần",
      monthly: "Hàng tháng",
      quarterly: "Hàng quý"
    };

    const getNextRunDate = (frequency: string) => {
      const now = new Date();
      switch (frequency) {
        case "daily":
          now.setDate(now.getDate() + 1);
          break;
        case "weekly":
          now.setDate(now.getDate() + 7);
          break;
        case "monthly":
          now.setMonth(now.getMonth() + 1);
          break;
        case "quarterly":
          now.setMonth(now.getMonth() + 3);
          break;
      }
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${scheduleTime}`;
    };

    const newSchedule = {
      id: `SCH${String(scheduledReports.length + 1).padStart(3, '0')}`,
      name: scheduleName,
      frequency: frequencyMap[scheduleFrequency as keyof typeof frequencyMap],
      nextRun: getNextRunDate(scheduleFrequency),
      recipients: scheduleRecipients.split(',').map(email => email.trim()),
      status: "active" as const
    };

    setScheduledReports(prev => [newSchedule, ...prev]);

    // Reset form
    setScheduleName("");
    setScheduleRecipients("");
    setScheduleTime("09:00");
    setScheduleFrequency("monthly");
    setScheduleReportType("sales");
    setIsScheduleDialogOpen(false);

    toast({
      title: "Tạo lịch thành công!",
      description: `Lịch "${scheduleName}" đã được tạo và sẽ chạy ${frequencyMap[scheduleFrequency as keyof typeof frequencyMap].toLowerCase()}`,
    });
  };

  const quickStats = [
    {
      title: "Doanh thu tháng này",
      value: "2,450,000,000₫",
      change: "+12.5%",
      trend: "up"
    },
    {
      title: "Số đơn hàng",
      value: "156",
      change: "+8.2%",
      trend: "up"
    },
    {
      title: "Tỷ lệ chuyển đổi",
      value: "25.8%",
      change: "+2.1%",
      trend: "up"
    },
    {
      title: "SLA xuất báo cáo",
      value: "3.2s",
      change: "-0.8s",
      trend: "up"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="text-success border-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Hoàn thành
        </Badge>;
      case "pending":
        return <Badge variant="outline" className="text-warning border-warning">
          <Clock className="w-3 h-3 mr-1" />
          Chờ duyệt
        </Badge>;
      case "active":
        return <Badge variant="outline" className="text-primary border-primary">
          <CheckCircle className="w-3 h-3 mr-1" />
          Hoạt động
        </Badge>;
      default:
        return <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" />
          Không xác định
        </Badge>;
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
              Báo cáo doanh số & công nợ
            </h1>
            <p className="text-muted-foreground">
              Quản lý báo cáo, truy vấn dữ liệu và lịch xuất báo cáo tự động
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="auto-refresh" className="text-sm">Tự động làm mới</Label>
            <Switch
              id="auto-refresh"
              checked={isAutoRefresh}
              onCheckedChange={setIsAutoRefresh}
            />
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Làm mới
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-6 bg-gradient-card border-border/50">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <div className="flex items-center gap-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-success" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className={`text-sm ${stat.trend === "up" ? "text-success" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports">Báo cáo đã tạo</TabsTrigger>
          <TabsTrigger value="generate">Tạo báo cáo mới</TabsTrigger>
          <TabsTrigger value="schedule">Lịch tự động</TabsTrigger>
          <TabsTrigger value="analytics">Phân tích KPI</TabsTrigger>
        </TabsList>

        {/* Generated Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Danh sách báo cáo</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Tìm kiếm báo cáo..." className="w-64" />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="completed">Hoàn thành</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">Mã báo cáo</TableHead>
                  <TableHead className="w-64">Tên báo cáo</TableHead>
                  <TableHead className="w-20">Loại</TableHead>
                  <TableHead className="w-32">Doanh thu</TableHead>
                  <TableHead className="w-20">Đơn hàng</TableHead>
                  <TableHead className="w-24">Độ chính xác</TableHead>
                  <TableHead className="w-28">Trạng thái</TableHead>
                  <TableHead className="w-32">Người duyệt</TableHead>
                  <TableHead className="w-32">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium w-24 truncate">{report.id}</TableCell>
                    <TableCell className="w-64">
                      <div className="line-clamp-2 leading-tight">{report.name}</div>
                    </TableCell>
                    <TableCell className="w-20">
                      <Badge variant="secondary">{report.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium w-32 truncate">{report.revenue}₫</TableCell>
                    <TableCell className="w-20">{report.orders}</TableCell>
                    <TableCell className="w-24">
                      <span className="text-success font-medium">{report.accuracy}</span>
                    </TableCell>
                    <TableCell className="w-28">{getStatusBadge(report.status)}</TableCell>
                    <TableCell className="w-32">
                      <div className="truncate">
                        {report.approvedBy || <span className="text-muted-foreground">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Tải
                        </Button>
                        <Button variant="outline" size="sm">
                          <FileText className="w-4 h-4 mr-1" />
                          Xem
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Generate New Report Tab */}
        <TabsContent value="generate" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Tạo báo cáo mới</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Loại báo cáo</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Báo cáo doanh số</SelectItem>
                      <SelectItem value="debt">Báo cáo công nợ</SelectItem>
                      <SelectItem value="combined">Báo cáo tổng hợp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Khoảng thời gian</Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Theo ngày</SelectItem>
                      <SelectItem value="weekly">Theo tuần</SelectItem>
                      <SelectItem value="monthly">Theo tháng</SelectItem>
                      <SelectItem value="quarterly">Theo quý</SelectItem>
                      <SelectItem value="custom">Tùy chỉnh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Định dạng xuất</Label>
                  <Select value={reportFormat} onValueChange={setReportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Từ ngày</Label>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Đến ngày</Label>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Input
                    placeholder="Thêm ghi chú cho báo cáo..."
                    value={reportNote}
                    onChange={(e) => setReportNote(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                Ước tính thời gian tạo: ~3-5 giây | SLA: &lt;5s
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Lưu làm mẫu
                </Button>
                <Button
                  className="bg-gradient-primary"
                  onClick={handleGenerateReport}
                  disabled={isGenerating}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {isGenerating ? "Đang tạo..." : "Tạo báo cáo"}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Lịch báo cáo tự động</h3>
              <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary">
                    <Clock className="w-4 h-4 mr-2" />
                    Tạo lịch mới
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Tạo lịch báo cáo tự động</DialogTitle>
                  </DialogHeader>

                  <div className="grid grid-cols-2 gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Tên lịch báo cáo</Label>
                      <Input
                        placeholder="VD: Báo cáo doanh số hàng tháng"
                        value={scheduleName}
                        onChange={(e) => setScheduleName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Loại báo cáo</Label>
                      <Select value={scheduleReportType} onValueChange={setScheduleReportType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Báo cáo doanh số</SelectItem>
                          <SelectItem value="debt">Báo cáo công nợ</SelectItem>
                          <SelectItem value="combined">Báo cáo tổng hợp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tần suất</Label>
                      <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Hàng ngày</SelectItem>
                          <SelectItem value="weekly">Hàng tuần</SelectItem>
                          <SelectItem value="monthly">Hàng tháng</SelectItem>
                          <SelectItem value="quarterly">Hàng quý</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Thời gian chạy</Label>
                      <Input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                      />
                    </div>

                    <div className="col-span-2 space-y-2">
                      <Label>Danh sách người nhận (phân cách bằng dấu phẩy)</Label>
                      <Input
                        placeholder="email1@company.com, email2@company.com"
                        value={scheduleRecipients}
                        onChange={(e) => setScheduleRecipients(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
                      Hủy
                    </Button>
                    <Button onClick={handleCreateSchedule} className="bg-gradient-primary">
                      Tạo lịch
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên lịch</TableHead>
                  <TableHead>Tần suất</TableHead>
                  <TableHead>Lần chạy tiếp theo</TableHead>
                  <TableHead>Người nhận</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledReports.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.name}</TableCell>
                    <TableCell>{schedule.frequency}</TableCell>
                    <TableCell>{schedule.nextRun}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {schedule.recipients.map((email, idx) => (
                          <div key={idx} className="text-sm text-muted-foreground">
                            {email}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">Sửa</Button>
                        <Button variant="outline" size="sm">Tạm dừng</Button>
                      </div>
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
              <h3 className="text-lg font-semibold mb-4">SLA Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thời gian xuất báo cáo trung bình</span>
                  <span className="font-medium text-success">3.2s / 5s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Độ chính xác dữ liệu</span>
                  <span className="font-medium text-success">99.8% / 99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tỷ lệ báo cáo thành công</span>
                  <span className="font-medium text-success">98.5%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Manager Approval</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Báo cáo chờ duyệt</span>
                  <span className="font-medium text-warning">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Thời gian duyệt trung bình</span>
                  <span className="font-medium">2.5 giờ</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tỷ lệ duyệt thành công</span>
                  <span className="font-medium text-success">96.2%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsManagement;