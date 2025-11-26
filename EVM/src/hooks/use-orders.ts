import { useState } from 'react';
import { orderService } from '@/services/api-orders';
import type { OrderResponse } from '@/services/api-orders';

export function useOrders() {
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const deliverNow = async (orderId: number): Promise<OrderResponse | null> => {
		setLoading(true);
		setError(null);
		try {
			const result = await orderService.deliverNow(orderId);
			return result;
		} catch (err: any) {
			setError(err?.message || 'Có lỗi xảy ra');
			return null;
		} finally {
			setLoading(false);
		}
	};

	return {
		loading,
		error,
		deliverNow,
	};
}
