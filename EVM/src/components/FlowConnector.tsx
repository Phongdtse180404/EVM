import { cn } from "@/lib/utils";

interface FlowConnectorProps {
  direction: "horizontal" | "vertical";
  animated?: boolean;
  className?: string;
}

export const FlowConnector = ({ 
  direction, 
  animated = true, 
  className 
}: FlowConnectorProps) => {
  return (
    <div className={cn(
      "relative",
      direction === "horizontal" ? "w-16 h-0.5" : "w-0.5 h-16",
      className
    )}>
      <div className={cn(
        "absolute inset-0 bg-border rounded-full",
        animated && "flow-connector"
      )} />
      
      {/* Arrow indicator */}
      <div className={cn(
        "absolute bg-primary rounded-full",
        direction === "horizontal" 
          ? "right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-2 border-background" 
          : "bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 border-2 border-background"
      )} />
    </div>
  );
};