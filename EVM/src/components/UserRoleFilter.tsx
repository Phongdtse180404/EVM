import { Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserRoleFilterProps {
  filterRole: string;
  onFilterRoleChange: (role: string) => void;
  availableRoles: string[];
}

export default function UserRoleFilter({ 
  filterRole, 
  onFilterRoleChange, 
  availableRoles 
}: UserRoleFilterProps) {
  return (
    <div className="flex items-center gap-2 mt-6">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={filterRole} onValueChange={onFilterRoleChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Lọc theo vai trò" />
        </SelectTrigger>
        <SelectContent className="bg-background border">
          <SelectItem value="all">Tất cả vai trò</SelectItem>
          {availableRoles.map((roleName, index) => (
            <SelectItem key={`${roleName}-${index}`} value={roleName}>
              {roleName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}