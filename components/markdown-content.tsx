import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type MarkdownContentProps = {
  source: string;
  className?: string;
};

export function MarkdownContent({ source, className }: MarkdownContentProps) {
  return (
    <div
      className={cn(
        "space-y-4",
        "[&_code]:rounded [&_code]:bg-[var(--hover-state)] [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.85em] [&_code]:text-[var(--neu-green)]",
        "[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:border-[var(--glass-border)] [&_pre]:bg-[rgba(0,0,0,0.3)] [&_pre]:p-4 [&_pre]:font-mono [&_pre]:text-[11px] [&_pre]:leading-[1.7] [&_pre]:text-[var(--text-primary)]",
        "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-[var(--text-primary)]",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ className, ...props }) => (
            <h1
              className={cn(
                "text-balance font-mono text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl",
                className,
              )}
              {...props}
            />
          ),
          h2: ({ className, ...props }) => (
            <div className="space-y-5 pt-2">
              <Separator className="bg-[var(--hover-state)]" />
              <h2
                className={cn(
                  "text-balance font-mono text-sm font-semibold tracking-[0.01em] text-[var(--text-primary)]",
                  className,
                )}
                {...props}
              />
            </div>
          ),
          h3: ({ className, ...props }) => (
            <h3
              className={cn(
                "font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--neu-green)]",
                className,
              )}
              {...props}
            />
          ),
          p: ({ className, ...props }) => (
            <p
              className={cn(
                "font-sans text-sm leading-7 text-[var(--text-secondary)] text-pretty",
                className,
              )}
              {...props}
            />
          ),
          ul: ({ className, ...props }) => (
            <ul
              className={cn(
                "list-disc space-y-3 pl-5 font-sans text-sm leading-7 text-[var(--text-secondary)]",
                className,
              )}
              {...props}
            />
          ),
          ol: ({ className, ...props }) => (
            <ol
              className={cn(
                "list-decimal space-y-3 pl-5 font-sans text-sm leading-7 text-[var(--text-secondary)]",
                className,
              )}
              {...props}
            />
          ),
          li: ({ className, ...props }) => (
            <li className={cn("space-y-2 marker:text-[var(--neu-green)]", className)} {...props} />
          ),
          a: ({ className, ...props }) => (
            <a
              className={cn(
                "text-[var(--neu-green)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]",
                className,
              )}
              {...props}
            />
          ),
          strong: ({ className, ...props }) => (
            <strong
              className={cn("font-semibold text-[var(--text-primary)]", className)}
              {...props}
            />
          ),
          blockquote: ({ className, ...props }) => (
            <blockquote
              className={cn(
                "border-l border-[var(--neu-green)] pl-4 font-sans text-sm leading-7 text-[var(--text-secondary)]",
                className,
              )}
              {...props}
            />
          ),
          table: ({ className, ...props }) => (
            <div className="overflow-x-auto rounded-lg border border-[var(--glass-border)]">
              <table className={cn("min-w-full border-collapse", className)} {...props} />
            </div>
          ),
          thead: ({ className, ...props }) => (
            <thead className={cn("bg-[var(--hover-state)]", className)} {...props} />
          ),
          th: ({ className, ...props }) => (
            <th
              className={cn(
                "border-b border-[var(--glass-border)] px-4 py-3 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--text-primary)]",
                className,
              )}
              {...props}
            />
          ),
          td: ({ className, ...props }) => (
            <td
              className={cn(
                "border-b border-[var(--glass-border)] px-4 py-3 align-top font-sans text-sm leading-7 text-[var(--text-secondary)]",
                className,
              )}
              {...props}
            />
          ),
          hr: () => <Separator className="bg-[var(--hover-state)]" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
