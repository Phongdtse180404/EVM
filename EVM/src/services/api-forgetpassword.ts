import { BaseApiService } from "./api";

class PasswordService extends BaseApiService {
    async forgotPassword(email: string) {
        return this.axiosInstance.post("/password/forgot", { email });
    }

    async resetPassword(token: string, newPassword: string) {
        return this.axiosInstance.post("/password/reset", { token, newPassword });
    }
}

export const passwordService = new PasswordService();
