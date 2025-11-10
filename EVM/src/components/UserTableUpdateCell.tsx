import { Input } from "@/components/ui/input";
import type { UserRequest } from "@/services/api-user";

type CellType = "text" | "tel";

interface UserTableUpdateCellProps {
  isEditing: boolean;
  type: CellType;
  currentValue: string | number | undefined;
  editValue: string | number | undefined;
  placeholder: string;
  emptyDisplayText?: string;
  field: keyof UserRequest;
  onFieldChange: (field: keyof UserRequest, value: string | number) => void;
}

export default function UserTableUpdateCell({
  isEditing,
  type,
  currentValue,
  editValue,
  placeholder,
  emptyDisplayText = "Chưa có",
  field,
  onFieldChange,
}: UserTableUpdateCellProps) {
  if (!isEditing) {
    // Display mode
    const hasValue = currentValue !== null && currentValue !== undefined && currentValue !== "";
    return (
      <span 
        className={hasValue ? (type === "text" && field === "address" ? "max-w-xs truncate block" : "") : "text-muted-foreground italic"}
        title={hasValue && field === "address" ? String(currentValue) : undefined}
      >
        {hasValue ? String(currentValue) : emptyDisplayText}
      </span>
    );
  }

  // Edit mode
  return (
    <Input
      value={String(editValue || currentValue || "")}
      onChange={(e) => onFieldChange(field, e.target.value)}
      placeholder={placeholder}
      type={type === "tel" ? "tel" : "text"}
    />
  );
}