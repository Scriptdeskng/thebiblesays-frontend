import { Search } from "lucide-react";
import { cn } from "@/utils/cn";

interface MobileSearchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

export function MobileSearchButton({ className, icon, ...props }: MobileSearchButtonProps) {
  return (
    <button
      className={cn(
        "p-2 rounded-md border border-gray-300",
        "flex items-center justify-center",
        "hover:bg-gray-100 active:scale-95 transition-all",
        className
      )}
      {...props}
    >
      {icon ?? <Search className="w-5 h-5 text-gray-700" />}
    </button>
  );
}