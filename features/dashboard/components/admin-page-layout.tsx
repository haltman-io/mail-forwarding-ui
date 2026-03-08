import { cn } from "@/lib/utils";

interface AdminPageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Content shell for all admin listing pages.
 * Constrains width, centers content, and enforces consistent spacing.
 */
export function AdminPageLayout({ children, className }: AdminPageLayoutProps) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 pb-8", className)}>
      {children}
    </div>
  );
}
