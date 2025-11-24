import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import React from "react";

type OrderDetailsButtonProps = {
	onCancel: () => void;
	onReset: () => void;
	onSubmit: () => void;
	isSubmitting: boolean;
};

const OrderDetailsButton: React.FC<OrderDetailsButtonProps> = ({
	onCancel,
	onReset,
	onSubmit,
	isSubmitting,
}) => (
	<div className="flex space-x-3 mt-6">
		<Button
			variant="outline"
			onClick={onCancel}
			className="flex-1"
		>
			Hủy
		</Button>
		<Button
			variant="outline"
			onClick={onReset}
			className="flex-1"
		>
			Làm mới
		</Button>
		<Button
			onClick={onSubmit}
			disabled={isSubmitting}
			className="flex-1 bg-gradient-primary hover:bg-gradient-primary/90 disabled:opacity-50"
		>
			<ShoppingCart className="w-4 h-4 mr-2" />
			{isSubmitting ? "Đang xử lý..." : "Đặt cọc xe"}
		</Button>
	</div>
);

export default OrderDetailsButton;
