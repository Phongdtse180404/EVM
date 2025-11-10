import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, User, Mail, Lock, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/api-auth";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await authService.login({
        email: loginForm.email,
        password: loginForm.password,
      });

      // { token, tokenType, email }
      const { token, email } = response;
      console.log("Token nhận được từ server:", token);
      console.log("Email nhận được từ server:", email);

      // Lưu token vào localStorage để các request khác dùng
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ email }));

      console.log("Token đã lưu trong localStorage:", localStorage.getItem("token"));
      console.log("User đã lưu trong localStorage:", localStorage.getItem("user"));

      toast.success("Đăng nhập thành công!", {
        description: `Xin chào ${email || "bạn"}!`,
        duration: 3000,
      });

      navigate("/showroom");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Sai email hoặc mật khẩu";
      toast.error("Đăng nhập thất bại!", {
        description: errorMessage,
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl animate-pulse-glow"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="w-full max-w-md space-y-6 relative z-10 animate-slide-in">
        {/* Header Section */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-full mb-4 shadow-lg animate-pulse-glow">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            VinFast Portal
          </h1>
          <p className="text-muted-foreground">
            Chào mừng đến với hệ thống quản lý
          </p>
        </div>

        {/* Login/Signup Card */}
        <Card className="bg-background/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden relative">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none"></div>

          <CardHeader className="text-center relative z-10 pb-6">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
              <Shield className="w-6 h-6 text-primary" />
              Xác thực tài khoản
            </CardTitle>
            <CardDescription className="text-base">
              Đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10">
            {/* Login Tab */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="example@vinfast.vn"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                    className="h-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-all duration-200 pr-12"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-primary hover:bg-gradient-primary/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg text-white font-semibold"
              >
                Đăng nhập
              </Button>

              <div className="text-center">
                <Button variant="link" className="text-sm text-primary hover:text-primary/80 transition-colors">
                  Quên mật khẩu?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;