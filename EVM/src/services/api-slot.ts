import { BaseApiService } from "./api";

export interface SlotResponse {
    slotId: number;
    startTime: string;  // ISO
    endTime: string;    // ISO
    maxTestDrive: number;
    maxService: number;
    testDriveCount: number;
    serviceCount: number;
}

class SlotService extends BaseApiService {
    async listAll(): Promise<SlotResponse[]> {
        const res = await this.axiosInstance.get("/slots");
        return res.data;
    }

    async getByRange(startTime: string, endTime: string): Promise<SlotResponse[]> {
        const res = await this.axiosInstance.get("/slots/range", {
            params: { startTime, endTime }
        });
        return res.data;
    }

    async create(slot: Partial<SlotResponse>) {
        const res = await this.axiosInstance.post("/slots", slot);
        return res.data;
    }
}

export const slotService = new SlotService();
