import Link from "next/link";
import { cn } from "@/utils/cn";

export function NavLink({
    href,
    children,
    className,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Link href={href} className={cn("relative inline-block group", className)}>
            <span className="relative z-10 text-grey">{children}</span>

            <span
                aria-hidden="true"
                className="
          absolute left-0 -bottom-0.5 h-0.5 w-full
          bg-grey
          origin-left scale-x-0 transform
          transition-transform duration-300 ease-out
          group-hover:scale-x-100
        "
            />
        </Link>
    );
}