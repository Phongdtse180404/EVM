import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Search, Edit, Phone, Mail, Calendar, Car, Users, TrendingUp, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from "axios";

interface Customer {
  id: string;
  name: string;
  phone: string;
  interestedVehicle: string;
  assignedSales: string;
  status: string;
}

interface TestDrive {
  id: string;
  customerid: string;
  customerName: string;
  vehicleModel: string;
  scheduledDate: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  feedback?: string;
  rating?: number;
}

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSales, setFilterSales] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDriveDialogOpen, setIsTestDriveDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(response.data);
      setFilteredCustomers(response.data);
    } catch (error: any) {
      console.error("Lỗi khi lấy danh sách khách hàng:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const result = customers.filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm);
      const matchesStatus =
        filterStatus === "all" || customer.status === filterStatus;
      const matchesSales =
        filterSales === "all" || customer.assignedSales === filterSales;
      return matchesSearch && matchesStatus && matchesSales;
    });

    setFilteredCustomers(result);
  }, [customers, searchTerm, filterStatus, filterSales]);

  const [testDrives, setTestDrives] = useState<TestDrive[]>([
  ]);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    status: 'LEAD',
    interestedVehicle: '',
    assignedSales: '',
  });

  const [newTestDrive, setNewTestDrive] = useState({
    vehicleModel: '',
    scheduledDate: '',
    duration: 60
  });

  const salesTeam = ['Trần Thị B', 'Nguyễn Văn C', 'Lê Hoàng D', 'Phạm Thị E'];
  const vehicleModels = ['Tesla Model 3', 'VinFast VF8', 'BYD Atto 3', 'Hyundai IONIQ 5'];


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lead':
        return <Badge className="bg-muted text-muted-foreground">Lead mới</Badge>;
      case 'interested':
        return <Badge className="bg-primary/20 text-primary border-primary">Quan tâm</Badge>;
      case 'test_drive':
        return <Badge className="bg-warning/20 text-warning border-warning">Lái thử</Badge>;
      case 'negotiating':
        return <Badge className="bg-orange-500/20 text-orange-500 border-orange-500">Thương lượng</Badge>;
      case 'purchased':
        return <Badge className="bg-success/20 text-success border-success">Đã mua</Badge>;
      case 'follow_up':
        return <Badge className="bg-blue-500/20 text-blue-500 border-blue-500">Theo dõi</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "/api/customers",
        {
          interest_vehicle: newCustomer.interestedVehicle,
          name: newCustomer.name,
          phone_number: newCustomer.phone,
          status: newCustomer.status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Thêm khách hàng thành công!");
      console.log("Dữ liệu trả về:", response.data);
      // load lại danh sách
    } catch (error: any) {
      toast.error("Thêm khách hàng thất bại!", {
        description: error.response?.data?.message || "Vui lòng kiểm tra lại thông tin.",
      });
    }
  };


  const handleEditCustomer = () => {
    if (!editingCustomer) return;

    setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    setEditingCustomer(null);
    setIsEditDialogOpen(false);
    toast.success('Đã cập nhật thông tin khách hàng');
  };

  const handleScheduleTestDrive = () => {
    if (!selectedCustomer || !newTestDrive.vehicleModel || !newTestDrive.scheduledDate) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    const testDrive: TestDrive = {
      id: Date.now().toString(),
      customerid: selectedCustomer.id,
      customerName: selectedCustomer.name,
      vehicleModel: newTestDrive.vehicleModel,
      scheduledDate: newTestDrive.scheduledDate,
      duration: newTestDrive.duration,
      status: 'scheduled'
    };

    setTestDrives([...testDrives, testDrive]);

    // Update customer status
    setCustomers(customers.map(c =>
      c.id === selectedCustomer.id
        ? { ...c, status: 'test_drive', testDriveScheduled: newTestDrive.scheduledDate }
        : c
    ));

    setNewTestDrive({
      vehicleModel: '',
      scheduledDate: '',
      duration: 60
    });
    setIsTestDriveDialogOpen(false);
    setSelectedCustomer(null);
    toast.success('Đã đặt lịch lái thử');
  };

  const getKPIData = () => {
    const totalLeads = customers.length;
    const converted = customers.filter(c => c.status === 'purchased').length;
    const conversionRate = totalLeads > 0 ? (converted / totalLeads * 100) : 0;
    const testDrivesThisMonth = testDrives.filter(td =>
      new Date(td.scheduledDate).getMonth() === new Date().getMonth()
    ).length;

    return {
      totalLeads,
      converted,
      conversionRate: conversionRate.toFixed(1),
      testDrivesThisMonth,
      avgRating: testDrives.filter(td => td.rating).reduce((sum, td) => sum + (td.rating || 0), 0) / testDrives.filter(td => td.rating).length || 0
    };
  };

  const kpiData = getKPIData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Quản lý Khách hàng & CRM
              </h1>
              <p className="text-muted-foreground">Chăm sóc khách hàng, lái thử và theo dõi KPI sales</p>
            </div>
          </div>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng leads</p>
                  <p className="text-2xl font-bold">{kpiData.totalLeads}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/20">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tỉ lệ chuyển đổi</p>
                  <p className="text-2xl font-bold text-success">{kpiData.conversionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-warning/20">
                  <Car className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lái thử tháng này</p>
                  <p className="text-2xl font-bold">{kpiData.testDrivesThisMonth}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Star className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                  <p className="text-2xl font-bold">{kpiData.avgRating.toFixed(1)}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Clock className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phản hồi TB</p>
                  <p className="text-2xl font-bold">&lt;1.5s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="test-drives">Lái thử</TabsTrigger>
          </TabsList>
          <TabsContent value="customers" className="space-y-6">
            {/* Search and Filters */}
            <Card className="bg-gradient-card border-border/50">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex flex-col md:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Tìm kiếm theo tên, SĐT, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Lọc theo trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="lead">Lead mới</SelectItem>
                        <SelectItem value="purchased">Đã mua</SelectItem>
                        <SelectItem value="test_drive">Lái thử</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={filterSales} onValueChange={setFilterSales}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Lọc theo sales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả sales</SelectItem>
                        {salesTeam.map(sales => (
                          <SelectItem key={sales} value={sales}>{sales}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Thêm khách hàng
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Thêm khách hàng mới</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-2 gap-4 py-4">
                        <div>
                          <Label htmlFor="name">Họ tên *</Label>
                          <Input
                            id="name"
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                            placeholder="Nguyễn Văn A"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Số điện thoại *</Label>
                          <Input
                            id="phone"
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                            placeholder="0901234567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-status">Trạng thái</Label>
                          <Select
                            value={editingCustomer?.status ?? 'lead'}
                            onValueChange={(value) => setEditingCustomer({ ...editingCustomer, status: value as Customer['status'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lead">Lead mới</SelectItem>
                              <SelectItem value="purchased">Đã mua</SelectItem>
                              <SelectItem value="test_drive">Lái thử</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="vehicle">Xe quan tâm</Label>
                          <Select
                            value={newCustomer.interestedVehicle}
                            onValueChange={(value) => setNewCustomer({ ...newCustomer, interestedVehicle: value })}
                          >
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
                        <div>
                          <Label htmlFor="sales">Sales phụ trách</Label>
                          <Select
                            value={newCustomer.assignedSales}
                            onValueChange={(value) => setNewCustomer({ ...newCustomer, assignedSales: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn sales" />
                            </SelectTrigger>
                            <SelectContent>
                              {salesTeam.map(sales => (
                                <SelectItem key={sales} value={sales}>{sales}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Hủy
                        </Button>
                        <Button onClick={handleAddCustomer}>Thêm khách hàng</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>

            {/* Customers Table */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Danh sách khách hàng</CardTitle>
                <CardDescription>
                  {filteredCustomers.length} khách hàng được hiển thị
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Liên hệ</TableHead>
                        <TableHead>Xe quan tâm</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div className="font-medium">{customer.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </div>
                          </TableCell>
                          <TableCell>{customer.interestedVehicle || 'Chưa xác định'}</TableCell>
                          <TableCell>{customer.assignedSales || 'Chưa phân'}</TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingCustomer(customer);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setIsTestDriveDialogOpen(true);
                                }}
                              >
                                <Calendar className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test-drives" className="space-y-6">
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle>Lịch lái thử</CardTitle>
                <CardDescription>Quản lý các buổi lái thử xe điện</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Khách hàng</TableHead>
                        <TableHead>Xe</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Thời lượng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Đánh giá</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {testDrives.map((testDrive) => (
                        <TableRow key={testDrive.id}>
                          <TableCell className="font-medium">{testDrive.customerName}</TableCell>
                          <TableCell>{testDrive.vehicleModel}</TableCell>
                          <TableCell>
                            {new Date(testDrive.scheduledDate).toLocaleString('vi-VN')}
                          </TableCell>
                          <TableCell>{testDrive.duration} phút</TableCell>
                          <TableCell>{getTestDriveStatusBadge(testDrive.status)}</TableCell>
                          <TableCell>
                            {testDrive.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{testDrive.rating}/5</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            </DialogHeader>
            {editingCustomer && (
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <Label htmlFor="edit-name">Họ tên</Label>
                  <Input
                    id="edit-name"
                    value={editingCustomer.name}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Số điện thoại</Label>
                  <Input
                    id="edit-phone"
                    value={editingCustomer.phone}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Trạng thái</Label>
                  <Select
                    value={editingCustomer?.status ?? 'lead'}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, status: value as Customer['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead mới</SelectItem>
                      <SelectItem value="purchased">Đã mua</SelectItem>
                      <SelectItem value="test_drive">Lái thử</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-vehicle">Xe quan tâm</Label>
                  <Select
                    value={editingCustomer.interestedVehicle}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, interestedVehicle: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleModels.map(model => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-sales">Sales phụ trách</Label>
                  <Select
                    value={editingCustomer.assignedSales}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, assignedSales: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {salesTeam.map(sales => (
                        <SelectItem key={sales} value={sales}>{sales}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleEditCustomer}>Cập nhật</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Test Drive Dialog */}
        <Dialog open={isTestDriveDialogOpen} onOpenChange={setIsTestDriveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Đặt lịch lái thử</DialogTitle>
            </DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 py-4">
                <div>
                  <Label>Khách hàng</Label>
                  <Input value={selectedCustomer.name} disabled />
                </div>
                <div>
                  <Label htmlFor="test-vehicle">Xe lái thử</Label>
                  <Select
                    value={newTestDrive.vehicleModel}
                    onValueChange={(value) => setNewTestDrive({ ...newTestDrive, vehicleModel: value })}
                  >
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
                <div>
                  <Label htmlFor="test-date">Thời gian</Label>
                  <Input
                    id="test-date"
                    type="datetime-local"
                    value={newTestDrive.scheduledDate}
                    onChange={(e) => setNewTestDrive({ ...newTestDrive, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="test-duration">Thời lượng (phút)</Label>
                  <Select
                    value={newTestDrive.duration.toString()}
                    onValueChange={(value) => setNewTestDrive({ ...newTestDrive, duration: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 phút</SelectItem>
                      <SelectItem value="45">45 phút</SelectItem>
                      <SelectItem value="60">60 phút</SelectItem>
                      <SelectItem value="90">90 phút</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTestDriveDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleScheduleTestDrive}>Đặt lịch</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CustomerManagement;