import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Phone,
  Menu,
  ChevronDown,
  ShoppingCart,
  Car,
  Users,
  Calendar,
  Shield,
  LogOut,
  User,
  Building2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function ShowroomTopbar() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    //  Kiểm tra kỹ trước khi parse
    if (storedUser && storedUser !== "undefined" && storedUser !== "null") {
      try {
        const parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch (err) {
        console.error(" Lỗi khi parse user từ localStorage:", err);
        localStorage.removeItem("user"); // Xoá dữ liệu lỗi để tránh lặp lại
      }
    } else {
      console.warn("⚠️ Không có user hợp lệ trong localStorage");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <div className="bg-background border-b border-border sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              VinFast Showroom
            </h1>
            <p className="text-sm text-muted-foreground">
              Khám phá và trải nghiệm các mẫu xe điện hiện đại
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
            >
              <Phone className="w-4 h-4 mr-2" />
              Liên hệ tư vấn
            </Button>

            {/* User Dropdown */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center space-x-2 hover:bg-accent transition-all duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span>{currentUser.email}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-background border border-border shadow-lg">
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}

            {/* Main Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-background hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 z-50 bg-background border border-border shadow-lg"
                align="end"
              >
                <DropdownMenuItem
                  onClick={() => navigate("/sales")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Quản lý bán hàng</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/inventory")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Car className="w-4 h-4" />
                  <span>Quản lý tồn kho</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/customers")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Users className="w-4 h-4" />
                  <span>Quản lý khách hàng</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/reports")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Báo cáo</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/service")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Dịch vụ</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/admin/users")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/admin/dealerships")}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Quản lý đại lý</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}