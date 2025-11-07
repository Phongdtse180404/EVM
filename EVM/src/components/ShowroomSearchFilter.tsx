import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface ShowroomSearchFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onFilterChange: (value: string) => void;
}

export function ShowroomSearchFilter({ 
  searchTerm, 
  onSearchChange, 
  filterStatus, 
  onFilterChange 
}: ShowroomSearchFilterProps) {
  return (
    <div className="flex space-x-4">
      <Card className="p-3 flex-1">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên xe hoặc model..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="border-0 bg-transparent focus-visible:ring-0"
          />
        </div>
      </Card>

      <Card className="p-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterStatus} onValueChange={onFilterChange}>
            <SelectTrigger className="w-40 border-0 bg-transparent focus:ring-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="available">Có sẵn</SelectItem>
              <SelectItem value="limited">Đang giữ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>
    </div>
  );
}