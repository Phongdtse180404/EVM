import { ProcessCard } from "@/components/ProcessCard";
import { FlowConnector } from "@/components/FlowConnector";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart3, 
  Wrench,
  Settings,
  Bell,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SystemDashboard = () => {
  const navigate = useNavigate();
  const processData = [
    {
      title: "Quản lý bán hàng/đơn hàng",
      description: "Nhập đơn khi khách tới showroom, chốt hợp đồng trực tiếp/online, chỉnh sửa/hủy đơn khi xe giao trễ",
      status: "active" as const,
      kpi: {
        value: ">98%",
        label: "Tỉ lệ success, response <2s",
        trend: "up" as const
      },
      flows: ["Tạo đơn-giao xe", "Alt: hủy (refund)", "Ex: mất kết nối DB"],
      deliverables: ["API: Create/Update/Delete Order", "UI: Order Flow", "DB: Orders"]
    },
    {
      title: "Quản lý tồn kho xe",
      description: "Kiểm tra tồn trước xuất bán, audit tồn định kỳ xuất sản, tạo lead mới",
      status: "active" as const,
      kpi: {
        value: "<0.3%",
        label: "Chênh lệch tồn kho",
        trend: "stable" as const
      },
      flows: ["Happy: xuất kho đúng", "Admin: kiểm tồn", "Ex: sensor lỗi dữ liệu"],
      deliverables: ["API: Inventory CRUD", "UI: Dashboard", "DB: Vehicles"]
    },
    {
      title: "Quản lý khách hàng/CRM",
      description: "Gọi chăm sóc hậu mãi, xếp lịch lái thử (test drive), xem tổng hợp KPI từng sales",
      status: "warning" as const,
      kpi: {
        value: ">25%",
        label: "Lead chuyển đổi, response <1.5s",
        trend: "up" as const
      },
      flows: ["Happy: tạo-convert khách", "Alt: khách no-show", "Ex: duplicate lead"],
      deliverables: ["API: Lead/Customer CRUD", "UI: Customer 360", "DB: Customers"]
    },
    {
      title: "Báo cáo doanh số, công nợ",
      description: "Xuất báo cáo ngày/tháng, truy vấn nhanh số dữ liệu, đặt lịch báo cáo định kỳ",
      status: "active" as const,
      kpi: {
        value: "<5s",
        label: "SLA xuất báo cáo, tải chính xác số <0.2%",
        trend: "up" as const
      },
      flows: ["Happy: đầy đủ team đáng", "Manager: duyệt KPI", "Ex: số dữ liệu bất hợp lý"],
      deliverables: ["Service: Report Engine", "UI: Dashboard/Export", "API: Reports"]
    },
    {
      title: "Quản lý dịch vụ/bảo trì",
      description: "Bảo lộ pin/sensor, xử lý IoT, theo dõi lịch sử dịch vụ",
      status: "idle" as const,
      kpi: {
        value: ">95%",
        label: "Tỉ lệ lịch bảo trì đúng, sự cố xử lý <24h",
        trend: "stable" as const
      },
      flows: ["Happy: đầy đủ list team đáng", "Alt: lỗi sensor", "Admin: retry job"],
      deliverables: ["Service: trùng lịch", "IoT: mất tín hiệu hoặc báo sai", "UI: Service Tracker"]
    }
  ];

  return (
    <div className="min-h-screen p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Hệ thống quản lý quy trình kinh doanh
          </h1>
          <p className="text-muted-foreground">
            Dashboard tổng quan các luồng nghiệp vụ cốt lõi
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            onClick={() => navigate('/showroom')}
            className="bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Showroom xe điện
          </Button>
          <Button variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4 mr-2" />
            Thông báo
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Cài đặt
          </Button>
          <Button 
            onClick={() => navigate('/login')}
            variant="default"
            className="bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            Đăng nhập
          </Button>
        </div>
      </div>

      {/* System Overview */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Tổng quan hệ thống</h2>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-success border-success">
              3 Core Active
            </Badge>
            <Badge variant="outline" className="text-warning border-warning">
              1 Warning
            </Badge>
            <Badge variant="outline" className="text-muted-foreground border-muted">
              1 Idle
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-5 gap-6">
          {[
            { icon: ShoppingCart, label: "Bán hàng", color: "text-primary", onClick: () => navigate('/sales') },
            { icon: Package, label: "Tồn kho", color: "text-secondary", onClick: () => navigate('/inventory') },
            { icon: Users, label: "Khách hàng", color: "text-warning", onClick: () => navigate('/customers') },
            { icon: BarChart3, label: "Báo cáo", color: "text-accent", onClick: () => navigate('/reports') },
            { icon: Wrench, label: "Dịch vụ", color: "text-muted-foreground", onClick: () => navigate('/service') }
          ].map((item, index) => (
            <div 
              key={index} 
              className="text-center space-y-2 cursor-pointer hover:scale-105 transition-transform duration-200" 
              onClick={item.onClick}
            >
              <div className="w-12 h-12 mx-auto rounded-lg bg-muted/30 flex items-center justify-center hover:bg-primary/20 transition-colors duration-200">
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <p className="text-sm font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Process Flow Visualization */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Luồng quy trình nghiệp vụ</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {processData.map((process, index) => (
            <div key={index} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div 
                onClick={
                  index === 0 ? () => navigate('/order-details') : 
                  index === 1 ? () => navigate('/inventory') : 
                  index === 2 ? () => navigate('/customers') :
                  index === 3 ? () => navigate('/reports') :
                  index === 4 ? () => navigate('/service') :
                  undefined
                }
                className={index === 0 || index === 1 || index === 2 || index === 3 || index === 4 ? "cursor-pointer" : ""}
              >
                <ProcessCard {...process} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Flow Connections Visualization */}
      <Card className="p-6 bg-gradient-card border-border/50">
        <h3 className="text-lg font-semibold mb-4">Sơ đồ kết nối quy trình</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-primary" />
            </div>
            <FlowConnector direction="horizontal" />
            <div className="w-20 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-secondary" />
            </div>
            <FlowConnector direction="horizontal" />
            <div className="w-20 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <FlowConnector direction="horizontal" />
            <div className="w-20 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-accent" />
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className="w-20 h-12 bg-muted/20 rounded-lg flex items-center justify-center mx-auto">
            <Wrench className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">Dịch vụ/Bảo trì (Độc lập)</p>
        </div>
      </Card>
    </div>
  );
};