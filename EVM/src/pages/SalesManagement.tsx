import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { VehicleShowcase } from "@/components/VehicleShowcase";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Car,
  User,
  Calendar,
  DollarSign,
  Eye,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  vehicleModel: string;
  vehicleColor: string;
  price: number;
  status: "draft" | "confirmed" | "cancelled";
  createdAt: string;
  notes?: string;
}

export default function SalesManagement() {
  const navigate = useNavigate();
  
  // Check URL params for pre-filling form
  const urlParams = new URLSearchParams(window.location.search);
  const preselectedVehicle = urlParams.get('vehicle');
  const shouldAutoCreate = urlParams.get('create') === 'true';
  const directCreate = urlParams.get('direct') === 'true';
  
  const [orders, setOrders] = useState<Order[]>(() => {
    // Load orders from localStorage if available
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      return JSON.parse(savedOrders);
    }
    
    // Default orders
    return [
      {
        id: "ORD001",
        customerName: "Nguyễn Văn A",
        customerPhone: "0901234567",
        vehicleModel: "VinFast VF8",
        vehicleColor: "Đen",
        price: 1200000000,
        status: "confirmed",
        createdAt: "2024-01-15",
        notes: "Khách hàng yêu cầu giao xe trước tết"
      },
      {
        id: "ORD002", 
        customerName: "Trần Thị B",
        customerPhone: "0987654321",
        vehicleModel: "VinFast VF9",
        vehicleColor: "Trắng",
        price: 1500000000,
        status: "draft",
        createdAt: "2024-01-16"
      }
    ];
  });

  const [isCreating, setIsCreating] = useState(shouldAutoCreate);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVehicleShowcase, setShowVehicleShowcase] = useState(false);
  const [newOrder, setNewOrder] = useState({
    customerName: "",
    customerPhone: "",
    vehicleModel: preselectedVehicle ? getVehicleModelById(preselectedVehicle) : "",
    vehicleColor: "",
    price: preselectedVehicle ? getVehiclePriceById(preselectedVehicle) : "",
    notes: ""
  });
  
  // Helper functions to get vehicle data
  function getVehicleModelById(id: string) {
    const vehicleMap: { [key: string]: string } = {
      'vf8': 'VinFast VF8',
      'vf9': 'VinFast VF9', 
      'vf6': 'VinFast VF6',
      'vf7': 'VinFast VF7'
    };
    return vehicleMap[id] || "";
  }
  
  function getVehiclePriceById(id: string) {
    const priceMap: { [key: string]: string } = {
      'vf8': '1200000000',
      'vf9': '1500000000',
      'vf6': '800000000', 
      'vf7': '999000000'
    };
    return priceMap[id] || "";
  }
  const [editOrder, setEditOrder] = useState({
    customerName: "",
    customerPhone: "",
    vehicleModel: "",
    vehicleColor: "",
    price: "",
    notes: ""
  });

  const filteredOrders = orders.filter(order => 
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerPhone.includes(searchTerm) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateOrder = () => {
    if (!newOrder.customerName || !newOrder.customerPhone || !newOrder.vehicleModel) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const order: Order = {
      id: `ORD${String(orders.length + 1).padStart(3, '0')}`,
      customerName: newOrder.customerName,
      customerPhone: newOrder.customerPhone,
      vehicleModel: newOrder.vehicleModel,
      vehicleColor: newOrder.vehicleColor,
      price: parseFloat(newOrder.price) || 0,
      status: directCreate ? "confirmed" : "draft",
      createdAt: new Date().toISOString().split('T')[0],
      notes: newOrder.notes
    };

    setOrders([order, ...orders]);
    setNewOrder({
      customerName: "",
      customerPhone: "",
      vehicleModel: "",
      vehicleColor: "",
      price: "",
      notes: ""
    });
    setIsCreating(false);
    
    if (directCreate) {
      toast.success("Chốt hợp đồng thành công!");
      // Clear URL params after creating
      window.history.replaceState({}, '', '/sales');
    } else {
      toast.success("Tạo đơn hàng thành công!");
    }
  };

  const handleConfirmOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "confirmed" as const } : order
    ));
    toast.success("Chốt hợp đồng thành công!");
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: "cancelled" as const } : order
    ));
    toast.success("Hủy đơn hàng thành công!");
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders(orders.filter(order => order.id !== orderId));
    toast.success("Xóa đơn hàng thành công!");
  };

  const handleEditOrder = (order: Order) => {
    setEditOrder({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      vehicleModel: order.vehicleModel,
      vehicleColor: order.vehicleColor,
      price: order.price.toString(),
      notes: order.notes || ""
    });
    setEditingOrder(order.id);
  };

  const handleSaveEdit = () => {
    if (!editOrder.customerName || !editOrder.customerPhone || !editOrder.vehicleModel) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setOrders(orders.map(order => 
      order.id === editingOrder ? {
        ...order,
        customerName: editOrder.customerName,
        customerPhone: editOrder.customerPhone,
        vehicleModel: editOrder.vehicleModel,
        vehicleColor: editOrder.vehicleColor,
        price: parseFloat(editOrder.price) || 0,
        notes: editOrder.notes
      } : order
    ));
    
    setEditingOrder(null);
    setEditOrder({
      customerName: "",
      customerPhone: "",
      vehicleModel: "",
      vehicleColor: "",
      price: "",
      notes: ""
    });
    toast.success("Cập nhật đơn hàng thành công!");
  };

  const handleCancelEdit = () => {
    setEditingOrder(null);
    setEditOrder({
      customerName: "",
      customerPhone: "",
      vehicleModel: "",
      vehicleColor: "",
      price: "",
      notes: ""
    });
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'text-success border-success';
      case 'cancelled': return 'text-destructive border-destructive';
      default: return 'text-warning border-warning';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'confirmed': return 'Đã chốt';
      case 'cancelled': return 'Đã hủy';
      default: return 'Nháp';
    }
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Quản lý bán hàng/đơn hàng
            </h1>
            <p className="text-muted-foreground">
              Nhập đơn khi khách tới showroom, chốt hợp đồng trực tiếp/online, chỉnh sửa/hủy đơn khi xe giao trễ
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Badge className="bg-success/20 text-success border-success px-3 py-1">
            Đang hoạt động
          </Badge>
        </div>
      </div>

      {/* Main Stats Card */}
      <Card className="p-8 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-12 bg-gradient-primary rounded-full"></div>
            <div>
              <h2 className="text-2xl font-bold">
                &gt;98%
              </h2>
              <p className="text-muted-foreground">Tỉ lệ success, response &lt;2s</p>
            </div>
          </div>
          <div className="text-success">
            <BarChart3 className="w-8 h-8" />
          </div>
        </div>
        
        <div className="flex justify-center">
          <Button 
            onClick={() => setIsCreating(!isCreating)} 
            className="bg-background text-foreground border border-border hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-lg font-medium"
            variant="outline"
          >
            Xem chi tiết →
          </Button>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-primary mb-2">
            {orders.filter(o => o.status === 'confirmed').length}
          </div>
          <p className="text-muted-foreground">Đơn đã chốt</p>
        </Card>
        
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-warning mb-2">
            {orders.filter(o => o.status === 'draft').length}
          </div>
          <p className="text-muted-foreground">Đang xử lý</p>
        </Card>
        
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-accent mb-2">
            {(orders.filter(o => o.status === 'confirmed').reduce((sum, o) => sum + o.price, 0) / 1000000000).toFixed(1)}B₫
          </div>
          <p className="text-muted-foreground">Doanh thu</p>
        </Card>
      </div>

      {/* Vehicle Showcase Dialog */}
      <VehicleShowcase 
        open={showVehicleShowcase}
        onOpenChange={setShowVehicleShowcase}
      />

      {/* Create Order Form */}
      {isCreating && (
                <Card className="p-6 bg-gradient-card border-border/50">
                  <h3 className="text-lg font-semibold mb-4">
                    {directCreate ? "Chốt hợp đồng mua xe" : "Tạo đơn hàng mới"}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Tên khách hàng *</Label>
              <Input
                id="customerName"
                value={newOrder.customerName}
                onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại *</Label>
              <Input
                id="customerPhone"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder({...newOrder, customerPhone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model xe *</Label>
              <Select value={newOrder.vehicleModel} onValueChange={(value) => setNewOrder({...newOrder, vehicleModel: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn model xe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VinFast VF8">VinFast VF8</SelectItem>
                  <SelectItem value="VinFast VF9">VinFast VF9</SelectItem>
                  <SelectItem value="VinFast VF6">VinFast VF6</SelectItem>
                  <SelectItem value="VinFast VF7">VinFast VF7</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleColor">Màu xe</Label>
              <div className="space-y-3">
                <div className="flex space-x-3">
                  {['Đen', 'Trắng', 'Xám', 'Xanh'].map((color) => (
                    <div 
                      key={color} 
                      className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${
                        newOrder.vehicleColor === color ? 'border-primary bg-primary/10' : 'border-border'
                      }`}
                      onClick={() => setNewOrder({...newOrder, vehicleColor: color})}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${
                        color === 'Đen' ? 'bg-black' :
                        color === 'Trắng' ? 'bg-white border-gray-300' :
                        color === 'Xám' ? 'bg-gray-500' :
                        color === 'Xanh' ? 'bg-blue-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-xs">{color}</span>
                    </div>
                  ))}
                </div>
                <Select value={newOrder.vehicleColor} onValueChange={(value) => setNewOrder({...newOrder, vehicleColor: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Hoặc chọn từ danh sách" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Đen">Đen</SelectItem>
                    <SelectItem value="Trắng">Trắng</SelectItem>
                    <SelectItem value="Xám">Xám</SelectItem>
                    <SelectItem value="Xanh">Xanh</SelectItem>
                    <SelectItem value="Đỏ">Đỏ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Giá bán (VND)</Label>
              <Input
                id="price"
                type="number"
                value={newOrder.price}
                onChange={(e) => setNewOrder({...newOrder, price: e.target.value})}
                placeholder="Nhập giá bán"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                placeholder="Nhập ghi chú (tùy chọn)"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Hủy
            </Button>
                    <Button onClick={handleCreateOrder} className="bg-gradient-primary">
                      {directCreate ? "Chốt hợp đồng" : "Tạo đơn"}
                    </Button>
          </div>
        </Card>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danh sách đơn hàng ({filteredOrders.length})</h3>
        
        {filteredOrders.map((order) => (
          <div key={order.id}>
            <Card className="p-6 bg-gradient-card border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-medium">{order.customerName}</span>
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
                    <p className="text-xs text-muted-foreground">ID: {order.id}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{order.vehicleModel}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Màu: {order.vehicleColor}</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.createdAt}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <span className="font-medium">
                        {order.price.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                    {order.notes && (
                      <p className="text-sm text-muted-foreground">
                        Ghi chú: {order.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  {order.status === 'draft' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleConfirmOrder(order.id)}
                        className="bg-gradient-primary text-xs"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Chốt HĐ
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditOrder(order)}
                        className="text-xs"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Sửa
                      </Button>
                    </>
                  )}
                  
                  {order.status === 'confirmed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs border-warning text-warning"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Hủy đơn
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-xs border-destructive text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>

            {/* Edit Form */}
            {editingOrder === order.id && (
              <Card className="p-6 bg-gradient-card border-border/50 mt-4">
                <h3 className="text-lg font-semibold mb-4">Chỉnh sửa đơn hàng #{order.id}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="editCustomerName">Tên khách hàng *</Label>
                    <Input
                      id="editCustomerName"
                      value={editOrder.customerName}
                      onChange={(e) => setEditOrder({...editOrder, customerName: e.target.value})}
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editCustomerPhone">Số điện thoại *</Label>
                    <Input
                      id="editCustomerPhone"
                      value={editOrder.customerPhone}
                      onChange={(e) => setEditOrder({...editOrder, customerPhone: e.target.value})}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editVehicleModel">Model xe *</Label>
                    <Select value={editOrder.vehicleModel} onValueChange={(value) => setEditOrder({...editOrder, vehicleModel: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn model xe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VinFast VF8">VinFast VF8</SelectItem>
                        <SelectItem value="VinFast VF9">VinFast VF9</SelectItem>
                        <SelectItem value="VinFast VF6">VinFast VF6</SelectItem>
                        <SelectItem value="VinFast VF7">VinFast VF7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editVehicleColor">Màu xe</Label>
                    <div className="space-y-3">
                      <div className="flex space-x-3">
                        {['Đen', 'Trắng', 'Xám', 'Xanh'].map((color) => (
                          <div 
                            key={color} 
                            className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${
                              editOrder.vehicleColor === color ? 'border-primary bg-primary/10' : 'border-border'
                            }`}
                            onClick={() => setEditOrder({...editOrder, vehicleColor: color})}
                          >
                            <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${
                              color === 'Đen' ? 'bg-black' :
                              color === 'Trắng' ? 'bg-white border-gray-300' :
                              color === 'Xám' ? 'bg-gray-500' :
                              color === 'Xanh' ? 'bg-blue-500' : 'bg-gray-300'
                            }`} />
                            <span className="text-xs">{color}</span>
                          </div>
                        ))}
                      </div>
                      <Select value={editOrder.vehicleColor} onValueChange={(value) => setEditOrder({...editOrder, vehicleColor: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Hoặc chọn từ danh sách" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Đen">Đen</SelectItem>
                          <SelectItem value="Trắng">Trắng</SelectItem>
                          <SelectItem value="Xám">Xám</SelectItem>
                          <SelectItem value="Xanh">Xanh</SelectItem>
                          <SelectItem value="Đỏ">Đỏ</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editPrice">Giá bán (VND)</Label>
                    <Input
                      id="editPrice"
                      type="number"
                      value={editOrder.price}
                      onChange={(e) => setEditOrder({...editOrder, price: e.target.value})}
                      placeholder="Nhập giá bán"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editNotes">Ghi chú</Label>
                    <Textarea
                      id="editNotes"
                      value={editOrder.notes}
                      onChange={(e) => setEditOrder({...editOrder, notes: e.target.value})}
                      placeholder="Nhập ghi chú (tùy chọn)"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-4">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    Hủy
                  </Button>
                  <Button onClick={handleSaveEdit} className="bg-gradient-primary">
                    Lưu thay đổi
                  </Button>
                </div>
              </Card>
            )}
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card className="p-12 text-center bg-gradient-card border-border/50">
          <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Không có đơn hàng nào</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Không tìm thấy đơn hàng phù hợp" : "Hãy tạo đơn hàng đầu tiên"}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreating(true)} className="bg-gradient-primary">
              <Plus className="w-4 h-4 mr-2" />
              Tạo đơn mới
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}