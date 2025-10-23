import { ReactNode, useEffect } from "react";
import { LayoutDashboard, Package, Users, Warehouse, Menu } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { applyAdminTheme, removeAdminTheme, adminClasses } from "@/lib/admin-utils";

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: "Doanh số", href: "/admin/sales", icon: LayoutDashboard },
  { name: "Đơn hàng", href: "/admin/orders", icon: Package },
  { name: "Người dùng", href: "/admin/users", icon: Users },
  { name: "Kho", href: "/admin/warehouses", icon: Warehouse },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  useEffect(() => {
    applyAdminTheme();
    return () => removeAdminTheme();
  }, []);

  return (
    <div className={`${adminClasses.page} bg-background`}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="flex h-16 items-center gap-4 px-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>
          <h1 className="text-black font-semibold bg-gradient-primary bg-clip-text text-transparent">
            EV Admin
          </h1>
        </div>
      </header>

      <div className="flex lg:pt-0 pt-16">
        {/* Desktop Sidebar */}
        <aside className={`hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 ${adminClasses.sidebar} border-r border-sidebar-border`}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent() {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          EV Admin
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-foreground hover:bg-sidebar-accent/50"
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-primary" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              Admin User
            </p>
            <p className="text-xs text-muted-foreground truncate">
              admin@evstore.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
