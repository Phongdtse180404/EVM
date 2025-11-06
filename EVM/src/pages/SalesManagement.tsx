import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { VehicleShowcase } from "@/components/VehicleShowcase";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Trash2,
  Car,
  User,
  Calendar,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import vinfastLogo from "@/assets/vinfast-logo.png";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { roboto } from "@/assets/fonts/Roboto-Regular";
import { orderService, OrderResponse } from "@/services/api-orders";
import { customerService, CustomerResponse } from "@/services/api-customers";

export default function SalesManagement() {
  const navigate = useNavigate();

  // Check URL params for pre-filling form
  const urlParams = new URLSearchParams(window.location.search);


  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showVehicleShowcase, setShowVehicleShowcase] = useState(false);
  const [paymentOrder, setPaymentOrder] = useState<OrderResponse | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("transfer");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [customersData, orderData] = await Promise.all([
          customerService.getCustomers(),
          orderService.getAllOrders(),
        ]);

        setCustomers(customersData);
        setOrders(orderData);
      } catch (error: any) {
        toast.error('Không tải được dữ liệu', {
          description: error.message,
        });
      }
    };

    fetchData();
  }, []);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xoá đơn hàng này không?")) return;
    try {
      await orderService.deleteOrder(id);
      setOrders((prev) => prev.filter((order) => order.orderId !== id));
      toast.success("Xoá đơn hàng thành công!");
    } catch (error) {
      console.error("Lỗi khi xoá đơn hàng:", error);
      toast.error("Không thể xoá đơn hàng!");
    }
  };


  const getStatusColor = (status: OrderResponse['status']) => {
    switch (status) {
      case 'COMPLETED': return 'text-success border-success';
      case 'CANCELLED': return 'text-destructive border-destructive';
      default: return 'text-warning border-warning';
    }
  };

  const getStatusText = (status: OrderResponse['status']) => {
    switch (status) {
      case 'COMPLETED': return 'Đã chốt';
      case 'CANCELLED': return 'Đã hủy';
      default: return 'Nháp';
    }
  };

  const handleGenerateContractPDF = async (order: OrderResponse, customer: CustomerResponse) => {
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
    pdf.text(`So hop dong: ${order.orderId}`, 105, 67, { align: "center" });
    pdf.text(`Ngay lap: ${new Date(order.orderDate).toLocaleDateString('vi-VN')}`, 105, 72, { align: "center" });

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
        ['So dien thoai', customer.phoneNumber],
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
    const totalPrice = order.totalAmount.toLocaleString('vi-VN');
    const deposit = (order.totalAmount * 0.3).toLocaleString('vi-VN');
    const remaining = (order.totalAmount * 0.7).toLocaleString('vi-VN');

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
    pdf.save(`hop-dong-${order.orderId}-${order.customerName}.pdf`);
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
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-primary mb-2">
            {orders.filter(o => o.status === 'COMPLETED').length}
          </div>
          <p className="text-muted-foreground">Đơn đã chốt</p>
        </Card>

        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-warning mb-2">
            {orders.filter(o => o.status === 'PROCESSING').length}
          </div>
          <p className="text-muted-foreground">Đang xử lý</p>
        </Card>

        <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-card border-border/50">
          <div className="text-3xl font-bold text-accent mb-2">
            {(orders.filter(o => o.status === 'COMPLETED').reduce((sum, o) => sum + o.totalAmount, 0) / 1000000000).toFixed(1)}B₫
          </div>
          <p className="text-muted-foreground">Doanh thu</p>
        </Card>
      </div>

      {/* Vehicle Showcase Dialog */}
      <VehicleShowcase
        open={showVehicleShowcase}
        onOpenChange={setShowVehicleShowcase}
      />

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Danh sách đơn hàng ({filteredOrders.length})</h3>

        {filteredOrders.map((order) => (
          <div key={order.orderId}>
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
                    <p className="text-sm text-muted-foreground">{ }</p>
                    <p className="text-xs text-muted-foreground">ID: {order.orderId}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Car className="w-4 h-4 text-secondary" />
                      <span className="font-medium">{order.vehicleModel}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.deliveryDate}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-accent" />
                      <span className="font-medium">
                        {order.totalAmount.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 ml-4">
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
                    variant="outline"
                    onClick={() => handleDeleteOrder(order.orderId)}
                    className="text-xs border-destructive text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Xóa
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!paymentOrder} onOpenChange={() => setPaymentOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Thanh toán đơn hàng</DialogTitle>
          </DialogHeader>

          {paymentOrder && (
            <div className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Phương thức thanh toán</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={paymentMethod === "cash" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("cash")}
                    className="h-12 text-base font-semibold"
                  >
                    Tiền mặt
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "transfer" ? "default" : "outline"}
                    onClick={() => setPaymentMethod("transfer")}
                    className="h-12 text-base font-semibold"
                  >
                    Chuyển khoản
                  </Button>
                </div>
              </div>

              {/* Order Information */}
              <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mã đơn hàng:</span>
                  <span className="font-semibold">{paymentOrder.orderId}</span>
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

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-semibold">Tiền cọc:</span>
                  <span className="font-bold text-primary">
                    {(paymentOrder.totalAmount * 0.3).toLocaleString('vi-VN')} VND
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