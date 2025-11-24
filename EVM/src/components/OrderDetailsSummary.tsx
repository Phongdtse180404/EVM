
import { Separator } from "@/components/ui/separator";
import type { ElectricVehicleResponse } from "@/services/api-electric-vehicle";

// Types for props
type OrderDetailsSummaryProps = {
	selectedVehicle: {
		modelCode: string;
		color: string;
	};
	orderForm: {
		selectedColor: string;
		depositAmount: string;
	} & Record<string, any>;
	electricVehicle: ElectricVehicleResponse | null;
	formatVnd: (amount: number) => string;
};

export default function OrderDetailsSummary({
	selectedVehicle,
	orderForm,
	electricVehicle,
	formatVnd,
}: OrderDetailsSummaryProps) {
	return (
		<div className="space-y-3">
			<h4 className="font-medium">Tóm tắt đơn hàng</h4>
			<div className="bg-background rounded-lg p-4 space-y-2">
				<div className="flex justify-between">
					<span>Xe:</span>
					<span className="font-medium">{selectedVehicle.modelCode}</span>
				</div>
				<div className="flex justify-between">
					<span>Màu:</span>
					<span className="font-medium">{orderForm.selectedColor || selectedVehicle.color}</span>
				</div>
				<Separator />
				   <div className="flex justify-between text-lg font-bold">
					   <span>Tổng giá xe:</span>
					   <span>{electricVehicle?.price ? formatVnd(electricVehicle.price) : 'Giá chưa có'}</span>
				   </div>
				   <div className="flex justify-between text-lg font-bold">
					   <span>Đặt cọc:</span>
					   <span>
						   {orderForm.depositAmount && parseFloat(orderForm.depositAmount) > 0
							   ? formatVnd(parseFloat(orderForm.depositAmount))
							   : 'Chưa nhập'}
					   </span>
				   </div>
				   <Separator />
				   <div className="flex justify-between text-lg font-bold">
					   <span>Còn lại:</span>
					   <span className="text-primary">
						   {electricVehicle?.price && orderForm.depositAmount && parseFloat(orderForm.depositAmount) > 0
							   ? formatVnd(electricVehicle.price - parseFloat(orderForm.depositAmount))
							   : 'Chưa có'}
					   </span>
				   </div>
			</div>
		</div>
	);
}
