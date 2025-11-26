import { VehicleStatus } from "@/services/api-electric-vehicle";
import { ReactNode } from "react";

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'secondary' | 'default';
export type VehicleStatusType = 'AVAILABLE' | 'HOLD' | 'SOLD_OUT';

interface WarehouseStatusBadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  vehicleStatus?: VehicleStatus;
  count?: number;
  className?: string;
}

const getVariantClasses = (variant: BadgeVariant): string => {
  const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium";
  
  switch (variant) {
    case 'success':
      return `${baseClasses} bg-green-100 text-green-800`;
    case 'warning':
      return `${baseClasses} bg-yellow-100 text-yellow-800`;
    case 'danger':
      return `${baseClasses} bg-red-100 text-red-800`;
    case 'secondary':
      return `${baseClasses} bg-gray-100 text-gray-800`;
    case 'default':
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`;
  }
};

const getVehicleStatusVariant = (status: VehicleStatus): BadgeVariant => {
  switch (status) {
    case 'AVAILABLE':
      return 'success';
    case 'HOLD':
      return 'warning';
    case 'SOLD_OUT':
      return 'danger';
    default:
      return 'default';
  }
};

const getVehicleStatusText = (status: VehicleStatus): string => {
  switch (status) {
    case 'AVAILABLE':
      return 'Có sẵn';
    case 'HOLD':
      return 'Đang giữ';
    case 'SOLD_OUT':
      return 'Đã bán';
    default:
      return status;
  }
};

export function WarehouseStatusBadge({ 
  children, 
  variant = 'default', 
  vehicleStatus, 
  count, 
  className = "" 
}: WarehouseStatusBadgeProps) {
  // If vehicleStatus is provided, use it to determine variant and text
  if (vehicleStatus) {
    const statusVariant = getVehicleStatusVariant(vehicleStatus);
    const statusText = getVehicleStatusText(vehicleStatus);
    const classes = `${getVariantClasses(statusVariant)} ${className}`;
    
    return (
      <span className={classes}>
        {statusText}
      </span>
    );
  }

  // If count is provided, determine variant based on count value
  if (typeof count === 'number') {
    const countVariant = count > 0 ? 'success' : 'danger';
    const classes = `${getVariantClasses(countVariant)} ${className}`;
    
    return (
      <span className={classes}>
        {count}
      </span>
    );
  }

  // Default behavior with custom variant and children
  const classes = `${getVariantClasses(variant)} ${className}`;
  
  return (
    <span className={classes}>
      {children}
    </span>
  );
}
