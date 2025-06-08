import { cn } from "@/lib/utils"

interface LoadingBarProps {
  className?: string;
}

const LoadingBar = ({ className }: LoadingBarProps) => {
  return (
    <div className={cn("fixed top-0 left-0 w-full h-1 bg-transparent overflow-hidden z-50", className)}>
      <div className="w-full h-full bg-primary animate-loading-bar" />
    </div>
  );
};

export { LoadingBar }; 