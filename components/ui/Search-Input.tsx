import { cn } from "@/utils/cn";
import { Search } from "lucide-react";

interface SearchInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export function SearchInput({
  className,
  icon,
  ...props
}: SearchInputProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-[#878A92] px-3 py-2",
        "focus-outline-none transition-colors",
        className
      )}
    >
      {icon ?? <Search className="w-5 h-5 text-grey" />}
      <input
        className="
          flex-1 bg-transparent outline-none
          placeholder:text-grey
        "
        {...props}
      />
    </div>
  );
}