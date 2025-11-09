import { useEffect, useState } from 'react';
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
import type { CustomerResponse, CustomerRequest } from '@/services/api-customers';
import type { ModelResponse } from '@/services/api-model';
import { electricVehicleService } from '@/services/api-electric-vehicle';
import { customerService } from '@/services/api-customers';
import { modelService } from '@/services/api-model';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSales, setFilterSales] = useState<string>('all');
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [vehiclesByModel, setVehiclesByModel] = useState<any[]>([]);
  const [vehicleModels, setvehicleModels] = useState<ModelResponse[]>([]);
  const [newCustomer, setNewCustomer] = useState<Partial<CustomerRequest>>({
    name: '',
    phoneNumber: '',
    vehicleId: 0,
    status: 'LEAD',
  });


  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber.includes(searchTerm);

    const matchesStatus =
      filterStatus === 'all' || customer.status.toLowerCase() === filterStatus.toLowerCase();

    const matchesSales =
      filterSales === 'all' ||
      (customer.assignedSalesName &&
        customer.assignedSalesName.toLowerCase().includes(filterSales.toLowerCase()));

    return matchesSearch && matchesStatus && matchesSales;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, modelsData] = await Promise.all([
          customerService.getCustomers(),
          modelService.getModels(),
        ]);

        setCustomers(customersData);
        setvehicleModels(modelsData);
      } catch (error: any) {
        toast.error('Không tải được dữ liệu', {
          description: error.message,
        });
      }
    };

    fetchData();
  }, []);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'lead':
        return <Badge className="bg-muted text-muted-foreground">Lead mới</Badge>;
      case 'purchased':
        return <Badge className="bg-success/20 text-success border-success">Đã mua</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phoneNumber) {
      toast.error('Vui lòng nhập tên và số điện thoại');
      return;
    }

    try {
      const created = await customerService.createCustomer(newCustomer);
      setCustomers(prev => [...prev, created]);
      toast.success('Đã thêm khách hàng mới');
      setIsAddDialogOpen(false);
      setNewCustomer({
        name: '',
        phoneNumber: '',
        vehicleId: 0,
        status: 'LEAD',
      });
    } catch (error: any) {
      toast.error('Thêm khách hàng thất bại', {
        description: error.message || 'Lỗi API',
      });
    }
  };

  const handleSelectModel = async (modelCode: string) => {
    try {
      const vehicles = await electricVehicleService.searchVehiclesByModelCode(modelCode);
      setVehiclesByModel(vehicles); // cập nhật danh sách xe thuộc model đó
    } catch (error: any) {
      toast.error("Không thể tải danh sách xe", {
        description: error.message,
      });
    }
  };

  const handleEditCustomer = async () => {
    if (!editingCustomer) return;

    try {
      const updated = await customerService.updateCustomer(editingCustomer.customerId, editingCustomer);

      // Cập nhật lại danh sách khách hàng trên UI
      setCustomers(prev =>
        prev.map(c => (c.customerId === updated.customerId ? updated : c))
      );

      // Đóng dialog + reset state
      setEditingCustomer(null);
      setIsEditDialogOpen(false);

      toast.success("Đã cập nhật thông tin khách hàng");
    } catch (error: any) {
      toast.error("Cập nhật thất bại", {
        description: error.message || "Lỗi API",
      });
    }
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

        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="customers">Khách hàng</TabsTrigger>
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
                            value={newCustomer.phoneNumber}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phoneNumber: e.target.value })}
                            placeholder="0901234567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="vehicle">Hãng xe quan tâm</Label>
                          <Select onValueChange={handleSelectModel}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hãng xe" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehicleModels
                                .filter((model) => model.modelCode && model.modelCode.trim() !== "")
                                .map((model) => (
                                  <SelectItem key={model.modelId} value={model.modelCode}>
                                    {model.brand}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="vehicle">Xe quan tâm</Label>
                          <Select
                            value={String(newCustomer.vehicleId)}
                            onValueChange={(value) =>
                              setNewCustomer({ ...newCustomer, vehicleId: Number(value) })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn xe" />
                            </SelectTrigger>
                            <SelectContent>
                              {vehiclesByModel
                                .filter((v) => v.vehicleId && v.vehicleId > 0)
                                .map((v) => (
                                  <SelectItem key={v.vehicleId} value={v.vehicleId.toString()}>
                                    {v.vehicleId}
                                  </SelectItem>
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
                        <TableRow key={customer.customerId}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{customer.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="w-3 h-3" />
                                {customer.phoneNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{customer.vehicleModel || 'Chưa xác định'}</TableCell>
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
                    value={editingCustomer.phoneNumber}
                    onChange={(e) => setEditingCustomer({ ...editingCustomer, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="vehicle">Hãng xe quan tâm</Label>
                  <Select onValueChange={handleSelectModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn hãng xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicleModels
                        .filter((model) => model.modelCode && model.modelCode.trim() !== "")
                        .map((model) => (
                          <SelectItem key={model.modelId} value={model.modelCode}>
                            {model.brand}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-vehicle">Xe quan tâm</Label>
                  <Select
                    value={String(editingCustomer.vehicleId)}
                    onValueChange={(value) => setEditingCustomer({ ...editingCustomer, vehicleId: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehiclesByModel
                        .filter((v) => v.vehicleId && v.vehicleId > 0)
                        .map((v) => (
                          <SelectItem key={v.vehicleId} value={v.vehicleId.toString()}>
                            {v.vehicleId}
                          </SelectItem>
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