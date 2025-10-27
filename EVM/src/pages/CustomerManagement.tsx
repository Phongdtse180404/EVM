import React, { useState } from 'react';
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
import { ArrowLeft, Plus, Search, Edit, Phone, Mail, Users, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  status: 'lead' | 'purchased';
  interestedVehicle: string;
  assignedSales: string;
  createdAt: string;
  lastContact: string;
  notes: string;
  testDriveScheduled?: string;
  purchaseHistory?: string[];
}

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSales, setFilterSales] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Nguyễn Văn An',
      phone: '0901234567',
      email: 'nguyenvanan@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      status: 'lead',
      interestedVehicle: 'Tesla Model 3',
      assignedSales: 'Trần Thị B',
      createdAt: '2024-01-15',
      lastContact: '2024-01-20',
      notes: 'Quan tâm đến xe điện, cần tư vấn về pin và bảo hành'
    },
    {
      id: '2',
      name: 'Lê Thị Cẩm',
      phone: '0912345678',
      email: 'lethicam@email.com',
      address: '456 Đường DEF, Quận 7, TP.HCM',
      status: 'lead',
      interestedVehicle: 'VinFast VF8',
      assignedSales: 'Nguyễn Văn C',
      createdAt: '2024-01-10',
      lastContact: '2024-01-18',
      notes: 'Đã đặt lịch lái thử, quan tâm đến màu xanh',
      testDriveScheduled: '2024-01-25'
    },
    {
      id: '3',
      name: 'Phạm Hoàng Dũng',
      phone: '0923456789',
      email: 'phamhoangdung@email.com',
      address: '789 Đường GHI, Quận Bình Thạnh, TP.HCM',
      status: 'purchased',
      interestedVehicle: 'BYD Atto 3',
      assignedSales: 'Trần Thị B',
      createdAt: '2024-01-05',
      lastContact: '2024-01-22',
      notes: 'Đã mua xe, cần chăm sóc hậu mãi',
      purchaseHistory: ['BYD Atto 3 - 768.000.000 VNĐ']
    },
    {
      id: '4',
      name: 'Võ Thị Mai',
      phone: '0934567890',
      email: 'vothimai@email.com',
      address: '321 Đường JKL, Quận 3, TP.HCM',
      status: 'lead',
      interestedVehicle: 'Hyundai IONIQ 5',
      assignedSales: 'Nguyễn Văn C',
      createdAt: '2024-01-12',
      lastContact: '2024-01-21',
      notes: 'Đang thương lượng giá, có thể đóng cọc tuần tới'
    }
  ]);

  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({
    name: '',
    phone: '',
    email: '',
    address: '',
    status: 'lead',
    interestedVehicle: '',
    assignedSales: '',
    notes: ''
  });

  const salesTeam = ['Trần Thị B', 'Nguyễn Văn C', 'Lê Hoàng D', 'Phạm Thị E'];
  const vehicleModels = ['Tesla Model 3', 'VinFast VF8', 'BYD Atto 3', 'Hyundai IONIQ 5'];

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || customer.status === filterStatus;
    const matchesSales = filterSales === 'all' || customer.assignedSales === filterSales;
    return matchesSearch && matchesStatus && matchesSales;
  });

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

  const handleAddCustomer = () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Vui lòng nhập tên và số điện thoại');
      return;
    }

    const customer: Customer = {
      id: Date.now().toString(),
      name: newCustomer.name!,
      phone: newCustomer.phone!,
      email: newCustomer.email || '',
      address: newCustomer.address || '',
      status: newCustomer.status as Customer['status'] || 'lead',
      interestedVehicle: newCustomer.interestedVehicle || '',
      assignedSales: newCustomer.assignedSales || '',
      createdAt: new Date().toISOString().split('T')[0],
      lastContact: new Date().toISOString().split('T')[0],
      notes: newCustomer.notes || ''
    };

    setCustomers([...customers, customer]);
    setNewCustomer({
      name: '',
      phone: '',
      email: '',
      address: '',
      status: 'lead',
      interestedVehicle: '',
      assignedSales: '',
      notes: ''
    });
    setIsAddDialogOpen(false);
    toast.success('Đã thêm khách hàng mới');
  };

  const handleEditCustomer = () => {
    if (!editingCustomer) return;

    setCustomers(customers.map(c => c.id === editingCustomer.id ? editingCustomer : c));
    setEditingCustomer(null);
    setIsEditDialogOpen(false);
    toast.success('Đã cập nhật thông tin khách hàng');
  };

  const getKPIData = () => {
    const totalLeads = customers.length;
    const converted = customers.filter(c => c.status === 'purchased').length;
    const conversionRate = totalLeads > 0 ? (converted / totalLeads * 100) : 0;

    return {
      totalLeads,
      converted,
      conversionRate: conversionRate.toFixed(1)
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
              onClick={() => navigate('/showroom')}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
            <TabsTrigger value="sales-kpi">KPI Sales</TabsTrigger>
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
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map((customer) => (
                        <TableRow key={customer.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {customer.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{customer.interestedVehicle || 'Chưa xác định'}</TableCell>
                          <TableCell>{getStatusBadge(customer.status)}</TableCell>
                          <TableCell>
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
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales-kpi" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>KPI theo Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesTeam.map((sales) => {
                      const salesCustomers = customers.filter(c => c.assignedSales === sales);
                      const purchased = salesCustomers.filter(c => c.status === 'purchased').length;
                      const conversionRate = salesCustomers.length > 0 ? (purchased / salesCustomers.length * 100) : 0;

                      return (
                        <div key={sales} className="flex items-center justify-between p-4 rounded-lg border">
                          <div>
                            <div className="font-medium">{sales}</div>
                            <div className="text-sm text-muted-foreground">
                              {salesCustomers.length} leads • {purchased} chuyển đổi
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{conversionRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Tỉ lệ chuyển đổi</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-card border-border/50">
                <CardHeader>
                  <CardTitle>Thống kê theo trạng thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { status: 'lead', label: 'Lead mới' },
                      { status: 'purchased', label: 'Đã mua' },
                    ].map(({ status, label }) => {
                      const count = customers.filter(c => c.status === status).length;
                      const percentage = customers.length > 0 ? (count / customers.length * 100) : 0;

                      return (
                        <div key={status} className="flex items-center justify-between p-4 rounded-lg border">
                          <div className="flex items-center gap-3">
                            {getStatusBadge(status)}
                            <span>{label}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{count}</div>
                            <div className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
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
                    value={editingCustomer.status}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, status: value as Customer['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lead">Lead mới</SelectItem>
                      <SelectItem value="purchased">Đã mua</SelectItem>
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
      </div>
    </div>
  );
};

export default CustomerManagement;