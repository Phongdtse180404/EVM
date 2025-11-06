import { useState, ReactNode } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableRow, TableCell } from "@/components/ui/table";

interface FolderProps {
  id: string;
  children: ReactNode;
  expandedContent: ReactNode;
  colSpan?: number;
  className?: string;
  expandedClassName?: string;
}

export function Folder({ 
  id, 
  children, 
  expandedContent, 
  colSpan = 8, 
  className = "",
  expandedClassName = "bg-muted/30"
}: FolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <>
      {/* Main row with expand/collapse functionality */}
      <TableRow className={`border-b ${className}`}>
        <TableCell className="w-8">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 p-0"
            onClick={toggleExpanded}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </TableCell>
        {children}
      </TableRow>
      
      {/* Expanded content row */}
      {isExpanded && (
        <TableRow className={expandedClassName}>
          <TableCell colSpan={colSpan} className="p-0">
            <div className="p-4 pl-12">
              {expandedContent}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}