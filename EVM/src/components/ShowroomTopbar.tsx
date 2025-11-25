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
  const [currentUser, setCurrentUser] = useState<{ email?: string; role?: string; roleId?: number} | null>(null);

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
      console.warn("Không có user hợp lệ trong localStorage");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // Define menu items based on user role
  const getMenuItems = () => {
    const role = currentUser?.role;
    
    // Common menu items for ROLE_EVMSTAFF
    const evmStaffItems = [
      {
        icon: ShoppingCart,
        label: "Quản lý bán hàng",
        path: "/sales"
      },
      {
        icon: Users,
        label: "Quản lý khách hàng", 
        path: "/customers"
      },
      {
        icon: Calendar,
        label: "Báo cáo",
        path: "/reports"
      }
    ];

    // Admin gets all menu items
    const adminItems = [
      ...evmStaffItems,
      {
        icon: Car,
        label: "Quản lý tồn kho",
        path: "/inventory"
      },
      {
        icon: Shield,
        label: "Dịch vụ",
        path: "/service"
      },
      {
        icon: Shield,
        label: "Dashboard",
        path: "/admin/users"
      },
      {
        icon: Building2,
        label: "Quản lý đại lý",
        path: "/admin/dealerships"
      }
    ];

        // Admin gets all menu items
    const evmManagerItems = [
      ...evmStaffItems,
      {
        icon: Car,
        label: "Quản lý tồn kho",
        path: "/inventory"
      },
      {
        icon: Shield,
        label: "Dịch vụ",
        path: "/service"
      }
    ];

    // Return menu items based on role
    if (role === 'ROLE_ADMIN') {
      return adminItems;
    } else if (role === 'ROLE_EVMSTAFF') {
      return evmStaffItems;
    } else if (role === 'ROLE_EVMMANAGER') {
      return evmManagerItems;
    } else {
      // Default for other roles (ROLE_USER, etc.)
      return evmStaffItems;
    }
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
                {getMenuItems().map((item, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => navigate(item.path)}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}