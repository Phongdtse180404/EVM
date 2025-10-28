import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
  BarChart3,
  CreditCard,
  FileText
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import paymentQR from "@/assets/payment-qr-example.png";
import vinfastLogo from "@/assets/vinfast-logo.png";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { roboto } from "@/assets/fonts/Roboto-Regular";

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
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null);
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

  const handleGenerateContractPDF = async (order: Order) => {
    const pdf = new jsPDF();

    pdf.addFileToVFS("Roboto-Regular.ttf", roboto);
    pdf.addFont("Roboto-Regular.ttf", "Roboto", "normal");
    pdf.setFont("Roboto");


    // Load and add logo
    try {
      const logoImg = new Image();
      logoImg.src = vinfastLogo;
      await new Promise((resolve) => {
        logoImg.onload = resolve;
      });

      // Add logo
      pdf.addImage(logoImg, 'PNG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    // Company Header
    pdf.setFontSize(16);
    pdf.setTextColor(0, 51, 102); // VinFast blue
    pdf.setFont("Roboto", "normal");
    pdf.text("CONG TY TNHH SAN XUAT VA KINH DOANH VINFAST", 50, 20);

    pdf.setFontSize(9);
    pdf.setTextColor(80, 80, 80);
    pdf.setFont("helvetica", "normal");
    pdf.text("Dia chi: Khu Cong nghiep Dinh Vu - Cat Hai, Hai Phong", 50, 27);
    pdf.text("Dien thoai: 1900 23 23 89 | Email: info@vinfastauto.com", 50, 32);

    // Decorative line
    pdf.setDrawColor(0, 123, 255);
    pdf.setLineWidth(1);
    pdf.line(15, 45, 195, 45);

    // Title
    pdf.setFontSize(22);
    pdf.setTextColor(0, 51, 102);
    pdf.setFont("Roboto", "normal");
    pdf.text("HOP DONG MUA BAN XE O TO", 105, 55, { align: "center" });

    // Contract info box
    pdf.setFillColor(240, 248, 255);
    pdf.rect(15, 60, 180, 15, 'F');
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");
    pdf.text(`So hop dong: ${order.id}`, 105, 67, { align: "center" });
    pdf.text(`Ngay lap: ${new Date(order.createdAt).toLocaleDateString('vi-VN')}`, 105, 72, { align: "center" });

    let currentY = 85;

    // Seller Information
    pdf.setFontSize(12);
    pdf.setTextColor(0, 51, 102);
    pdf.setFont("Roboto", "normal");
    pdf.text("BEN BAN (BEN A): CONG TY TNHH SAN XUAT VA KINH DOANH VINFAST", 15, currentY);

    currentY += 10;
    autoTable(pdf, {
      startY: currentY,
      head: [],
      body: [
        ['Dia chi', 'Khu Cong nghiep Dinh Vu - Cat Hai, Hai Phong, Viet Nam'],
        ['Ma so thue', '0108926276'],
        ['Dien thoai', '1900 23 23 89'],
        ['Email', 'info@vinfastauto.com'],
      ],
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 140 }
      },
      margin: { left: 15 }
    });

    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Buyer Information
    pdf.setFontSize(12);
    pdf.setTextColor(0, 51, 102);
    pdf.setFont("Roboto", "normal");
    pdf.text("BEN MUA (BEN B)", 15, currentY);

    currentY += 7;
    autoTable(pdf, {
      startY: currentY,
      head: [],
      body: [
        ['Ho va ten', order.customerName],
        ['So dien thoai', order.customerPhone],
        ['CMND/CCCD', '___________________________'],
        ['Dia chi', '___________________________'],
      ],
      theme: 'plain',
      styles: {
        fontSize: 10,
        cellPadding: 2,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 140 }
      },
      margin: { left: 15 }
    });

    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Vehicle Information with decorative box
    pdf.setFillColor(0, 51, 102);
    pdf.rect(15, currentY - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("Roboto", "normal");
    pdf.text("THONG TIN XE", 105, currentY, { align: "center" });

    currentY += 8;
    autoTable(pdf, {
      startY: currentY,
      head: [],
      body: [
        ['Hang xe', 'VinFast'],
        ['Model', order.vehicleModel],
        ['Mau sac', order.vehicleColor],
        ['Nam san xuat', '2024'],
        ['Xuat xu', 'Viet Nam'],
        ['Bao hanh', '10 nam hoac 200,000 km'],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: [0, 51, 102],
      },
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 130 }
      },
      margin: { left: 15 }
    });

    currentY = (pdf as any).lastAutoTable.finalY + 10;

    // Payment Information with colors
    pdf.setFillColor(0, 51, 102);
    pdf.rect(15, currentY - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("Roboto", "normal");
    pdf.text("THONG TIN THANH TOAN", 105, currentY, { align: "center" });

    currentY += 8;
    const totalPrice = order.price.toLocaleString('vi-VN');
    const deposit = (order.price * 0.3).toLocaleString('vi-VN');
    const remaining = (order.price * 0.7).toLocaleString('vi-VN');

    autoTable(pdf, {
      startY: currentY,
      head: [],
      body: [
        ['Gia xe (bao gom VAT)', `${totalPrice} VND`],
        ['Tien coc (30%)', `${deposit} VND`],
        ['Con lai can thanh toan', `${remaining} VND`],
        ['Phuong thuc thanh toan', 'Chuyen khoan ngan hang / Tien mat'],
        ['Thoi han thanh toan', 'Khi nhan xe tai showroom'],
      ],
      theme: 'striped',
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 70 },
        1: { cellWidth: 110, fontStyle: 'bold' }
      },
      margin: { left: 15 }
    });

    // Add new page for terms
    pdf.addPage();

    currentY = 20;

    // Notes if available
    if (order.notes) {
      pdf.setFillColor(255, 250, 205);
      pdf.rect(15, currentY - 5, 180, 8, 'F');
      pdf.setTextColor(0, 51, 102);
      pdf.setFont("Roboto", "normal");
      pdf.text("GHI CHU", 105, currentY, { align: "center" });

      currentY += 8;
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.setFont("helvetica", "normal");
      const splitNotes = pdf.splitTextToSize(order.notes, 170);
      pdf.text(splitNotes, 15, currentY);
      currentY += splitNotes.length * 6 + 10;
    }

    // Terms and Conditions
    pdf.setFillColor(0, 51, 102);
    pdf.rect(15, currentY - 5, 180, 8, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("Roboto", "normal");
    pdf.text("DIEU KHOAN VA DIEU KIEN", 105, currentY, { align: "center" });

    currentY += 10;
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont("helvetica", "normal");

    const terms = [
      "1. Ben B da dat coc 30% gia tri xe theo thoa thuan tai hop dong nay.",
      "2. So tien con lai (70%) se duoc Ben B thanh toan khi nhan xe tai showroom.",
      "3. Thoi gian giao xe du kien: 30 ngay ke tu ngay ky hop dong.",
      "4. Ben A cam ket xe giao dung model, mau sac, cau hinh nhu da thoa thuan.",
      "5. Xe duoc bao hanh 10 nam hoac 200,000 km tuy theo dieu kien nao den truoc.",
      "6. Ben B co quyen huy hop dong va nhan lai 100% tien coc neu Ben A khong",
      "   giao xe dung thoi han da cam ket.",
      "7. Neu Ben B huy hop dong vi ly do ca nhan, Ben A giu lai 20% tien coc",
      "   de bu dap chi phi.",
      "8. Hai ben cam ket thuc hien dung cac dieu khoan da ky ket.",
      "9. Moi tranh chap phat sinh se duoc giai quyet thong qua thuong luong,",
      "   hoa giai. Neu khong dat duoc thoa thuan, se giai quyet tai Toa an",
      "   noi Ben A co tru so.",
    ];

    terms.forEach((term, index) => {
      const lines = pdf.splitTextToSize(term, 170);
      pdf.text(lines, 20, currentY);
      currentY += lines.length * 5;
    });

    currentY += 15;

    // Signatures
    pdf.setFontSize(11);
    pdf.setFont("Roboto", "normal");
    pdf.text("DAI DIEN BEN A", 50, currentY, { align: "center" });
    pdf.text("DAI DIEN BEN B", 150, currentY, { align: "center" });

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "italic");
    pdf.text("(Ky, ghi ro ho ten va dong dau)", 50, currentY + 5, { align: "center" });
    pdf.text("(Ky va ghi ro ho ten)", 150, currentY + 5, { align: "center" });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text("Hop dong nay duoc lap thanh 02 ban, moi ben giu 01 ban co gia tri phap ly nhu nhau.", 105, 280, { align: "center" });

    // Save PDF
    pdf.save(`hop-dong-${order.id}-${order.customerName}.pdf`);
    toast.success("Đã tải xuống hợp đồng PDF!");
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/showroom")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Tạo hợp đồng
            </h1>
            <p className="text-muted-foreground">
              Nhập đơn khi khách tới showroom, chốt hợp đồng trực tiếp/online, chỉnh sửa/hủy đơn khi xe giao trễ
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setIsCreating(!isCreating)}
        >
          Xem chi tiết →
        </Button>
      </div>

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
                onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                placeholder="Nhập tên khách hàng"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Số điện thoại *</Label>
              <Input
                id="customerPhone"
                value={newOrder.customerPhone}
                onChange={(e) => setNewOrder({ ...newOrder, customerPhone: e.target.value })}
                placeholder="Nhập số điện thoại"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Model xe *</Label>
              <Select value={newOrder.vehicleModel} onValueChange={(value) => setNewOrder({ ...newOrder, vehicleModel: value })}>
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
                      className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${newOrder.vehicleColor === color ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                      onClick={() => setNewOrder({ ...newOrder, vehicleColor: color })}
                    >
                      <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${color === 'Đen' ? 'bg-black' :
                        color === 'Trắng' ? 'bg-white border-gray-300' :
                          color === 'Xám' ? 'bg-gray-500' :
                            color === 'Xanh' ? 'bg-blue-500' : 'bg-gray-300'
                        }`} />
                      <span className="text-xs">{color}</span>
                    </div>
                  ))}
                </div>
                <Select value={newOrder.vehicleColor} onValueChange={(value) => setNewOrder({ ...newOrder, vehicleColor: value })}>
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
                onChange={(e) => setNewOrder({ ...newOrder, price: e.target.value })}
                placeholder="Nhập giá bán"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Ghi chú</Label>
              <Textarea
                id="notes"
                value={newOrder.notes}
                onChange={(e) => setNewOrder({ ...newOrder, notes: e.target.value })}
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
                    <>
                      <Button
                        size="sm"
                        onClick={() => setPaymentOrder(order)}
                        className="bg-gradient-primary text-xs"
                      >
                        <CreditCard className="w-3 h-3 mr-1" />
                        Thanh toán
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleGenerateContractPDF(order)}
                        className="bg-secondary text-xs"
                      >
                        <FileText className="w-3 h-3 mr-1" />
                        Hoàn thành
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-xs border-warning text-warning"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Hủy đơn
                      </Button>
                    </>
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
                      onChange={(e) => setEditOrder({ ...editOrder, customerName: e.target.value })}
                      placeholder="Nhập tên khách hàng"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editCustomerPhone">Số điện thoại *</Label>
                    <Input
                      id="editCustomerPhone"
                      value={editOrder.customerPhone}
                      onChange={(e) => setEditOrder({ ...editOrder, customerPhone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="editVehicleModel">Model xe *</Label>
                    <Select value={editOrder.vehicleModel} onValueChange={(value) => setEditOrder({ ...editOrder, vehicleModel: value })}>
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
                            className={`text-center cursor-pointer p-2 rounded-lg border-2 transition-all hover:border-primary ${editOrder.vehicleColor === color ? 'border-primary bg-primary/10' : 'border-border'
                              }`}
                            onClick={() => setEditOrder({ ...editOrder, vehicleColor: color })}
                          >
                            <div className={`w-8 h-8 rounded-full mx-auto mb-1 border ${color === 'Đen' ? 'bg-black' :
                              color === 'Trắng' ? 'bg-white border-gray-300' :
                                color === 'Xám' ? 'bg-gray-500' :
                                  color === 'Xanh' ? 'bg-blue-500' : 'bg-gray-300'
                              }`} />
                            <span className="text-xs">{color}</span>
                          </div>
                        ))}
                      </div>
                      <Select value={editOrder.vehicleColor} onValueChange={(value) => setEditOrder({ ...editOrder, vehicleColor: value })}>
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
                      onChange={(e) => setEditOrder({ ...editOrder, price: e.target.value })}
                      placeholder="Nhập giá bán"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="editNotes">Ghi chú</Label>
                    <Textarea
                      id="editNotes"
                      value={editOrder.notes}
                      onChange={(e) => setEditOrder({ ...editOrder, notes: e.target.value })}
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

      {/* Payment Dialog */}
      <Dialog open={!!paymentOrder} onOpenChange={() => setPaymentOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thanh toán đơn hàng</DialogTitle>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src={paymentQR}
                    alt="Payment QR Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{paymentOrder.id}</span>
                </div>

                <Separator />

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Khách hàng:</span>
                  <span className="font-medium">{paymentOrder.customerName}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loại xe:</span>
                  <span className="font-medium">{paymentOrder.vehicleModel}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Màu sắc:</span>
                  <span className="font-medium">{paymentOrder.vehicleColor}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Tiền cọc:</span>
                  <span className="font-bold text-primary">
                    {(paymentOrder.price * 0.3).toLocaleString('vi-VN')} VND
                  </span>
                </div>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Quét mã QR để thanh toán qua ứng dụng ngân hàng
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}