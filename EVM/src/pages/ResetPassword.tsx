import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Eye, EyeOff, Lock, Shield } from "lucide-react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { toast } from "sonner";
import { passwordService } from "@/services/api-forgetpassword";

const ResetPassword = () => {
    const navigate = useNavigate();

    // lấy token từ URL
    const [searchParams] = useSearchParams();
    const params = useParams();

    const tokenFromQuery = searchParams.get("token");
    const tokenFromParams = params.token;
    const token = tokenFromQuery || tokenFromParams || "";

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error("Token không hợp lệ!", {
                description: "Link đặt lại mật khẩu không chứa mã token",
                duration: 3000,
            });
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Mật khẩu không khớp!", {
                description: "Vui lòng kiểm tra lại mật khẩu xác nhận",
                duration: 3000,
            });
            return;
        }

        if (form.password.length < 6) {
            toast.error("Mật khẩu quá ngắn!", {
                description: "Mật khẩu phải có ít nhất 6 ký tự",
                duration: 3000,
            });
            return;
        }

        try {
            setSubmitting(true);

            //  GỌI ĐÚNG CHỮ KÝ HÀM (token, newPassword)
            await passwordService.resetPassword(token, form.password);

            toast.success("Đặt lại mật khẩu thành công!", {
                description: "Bạn có thể đăng nhập với mật khẩu mới",
                duration: 3000,
            });
            navigate("/login");
        } catch (err: any) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "Đặt lại mật khẩu thất bại";
            toast.error("Không thể đặt lại mật khẩu", {
                description: msg,
                duration: 3000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-bg relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/20 via-transparent to-transparent" />

            {/* Back Button */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="absolute top-6 left-6 gap-2 hover:bg-background/80 backdrop-blur-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại đăng nhập
            </Button>

            <div className="w-full max-w-md relative z-10">
                <Card className="bg-gradient-card border-border/50 shadow-card backdrop-blur-xl">
                    <CardHeader className="text-center space-y-4">
                        <div className="mx-auto w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                Đặt lại mật khẩu
                            </CardTitle>
                            <CardDescription className="text-base mt-2">
                                Nhập mật khẩu mới cho tài khoản của bạn
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {!token && (
                            <p className="mb-4 text-sm text-red-500">
                                Link không hợp lệ hoặc thiếu token. Vui lòng yêu cầu gửi lại email
                                quên mật khẩu.
                            </p>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="text-sm font-medium flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Mật khẩu mới
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.password}
                                        onChange={(e) =>
                                            setForm({ ...form, password: e.target.value })
                                        }
                                        required
                                        className="h-12 pr-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="confirmPassword"
                                    className="text-sm font-medium flex items-center gap-2"
                                >
                                    <Lock className="w-4 h-4" />
                                    Xác nhận mật khẩu
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        value={form.confirmPassword}
                                        onChange={(e) =>
                                            setForm({ ...form, confirmPassword: e.target.value })
                                        }
                                        required
                                        className="h-12 pr-12 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50"
                                    />
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={submitting || !token}
                                className="w-full h-12 bg-gradient-primary hover:bg-gradient-primary/90 text-white font-semibold shadow-glow hover:shadow-hover transition-all duration-300 disabled:opacity-60"
                            >
                                {submitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
