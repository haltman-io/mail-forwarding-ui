import type { ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import type {
  PrivacyBlock,
  PrivacyDocument,
  PrivacyListItem,
} from "@/lib/privacy-policy";
import { cn } from "@/lib/utils";

type PrivacyPolicyContentProps = {
  document: PrivacyDocument;
  variant?: "page" | "dialog";
};

export function PrivacyPolicyContent({
  document,
  variant = "page",
}: PrivacyPolicyContentProps) {
  const titleClassName =
    variant === "page"
      ? "text-balance font-mono text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl"
      : "text-balance font-mono text-lg font-semibold tracking-tight text-[var(--text-primary)]";

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <h1 className={titleClassName}>{document.title}</h1>
        {document.lastUpdated ? (
          <p className="font-mono text-xs tracking-[0.04em] text-[var(--text-muted)]">
            {document.lastUpdated}
          </p>
        ) : null}
      </header>

      {document.introBlocks.length > 0 ? (
        <>
          <Separator className="bg-[var(--hover-state)]" />
          <div className="space-y-4">{renderBlocks(document.introBlocks, "intro")}</div>
        </>
      ) : null}

      {document.sections.map((section, index) => (
        <section key={section.heading} className="space-y-5">
          <Separator
            className={cn(
              "bg-[var(--hover-state)]",
              index === 0 && document.introBlocks.length === 0 ? "mt-0" : "mt-2",
            )}
          />
          <h2 className="text-balance font-mono text-sm font-semibold tracking-[0.01em] text-[var(--text-primary)]">
            {section.heading}
          </h2>
          <div className="space-y-4">{renderBlocks(section.blocks, `section-${index}`)}</div>
        </section>
      ))}

      {document.agreement ? (
        <>
          <Separator className="bg-[var(--hover-state)]" />
          <p className="font-mono text-xs leading-6 text-[var(--text-muted)]">
            {renderInline(document.agreement)}
          </p>
        </>
      ) : null}
    </div>
  );
}

function renderBlocks(blocks: PrivacyBlock[], keyPrefix: string) {
  return blocks.map((block, index) => renderBlock(block, `${keyPrefix}-${index}`));
}

function renderBlock(block: PrivacyBlock, key: string): ReactNode {
  if (block.type === "paragraph") {
    return (
      <p
        key={key}
        className="font-sans text-sm leading-7 text-[var(--text-secondary)] text-pretty"
      >
        {renderInline(block.text)}
      </p>
    );
  }

  if (block.type === "list") {
    return <div key={key}>{renderList(block.items, 0, key)}</div>;
  }

  if (block.level === 3) {
    return (
      <h3
        key={key}
        className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--neu-green)]"
      >
        {block.text}
      </h3>
    );
  }

  return null;
}

function renderList(items: PrivacyListItem[], depth: number, keyPrefix: string): ReactNode {
  const listClassName =
    depth === 0
      ? "space-y-3 pl-5 font-sans text-sm leading-7 text-[var(--text-secondary)]"
      : "mt-2 space-y-2 pl-5 text-[var(--text-muted)]";

  return (
    <ul className={listClassName}>
      {items.map((item, index) => (
        <li
          key={`${keyPrefix}-item-${index}`}
          className="list-disc space-y-2 marker:text-[var(--neu-green)]"
        >
          <span>{renderInline(item.text)}</span>
          {item.children.length > 0
            ? renderList(item.children, depth + 1, `${keyPrefix}-${index}`)
            : null}
        </li>
      ))}
    </ul>
  );
}

function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < text.length) {
    if (text.startsWith("**", index)) {
      const endIndex = text.indexOf("**", index + 2);

      if (endIndex !== -1) {
        const content = text.slice(index + 2, endIndex);
        nodes.push(
          <strong key={`strong-${key++}`} className="font-semibold text-[var(--text-primary)]">
            {renderInline(content)}
          </strong>,
        );
        index = endIndex + 2;
        continue;
      }
    }

    if (text[index] === "`") {
      const endIndex = text.indexOf("`", index + 1);

      if (endIndex !== -1) {
        nodes.push(
          <code
            key={`code-${key++}`}
            className="rounded bg-[var(--hover-state)] px-1.5 py-0.5 text-[0.85em] text-[var(--neu-green)]"
          >
            {text.slice(index + 1, endIndex)}
          </code>,
        );
        index = endIndex + 1;
        continue;
      }
    }

    const url = matchUrl(text.slice(index));

    if (url) {
      nodes.push(
        <a
          key={`url-${key++}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--neu-green)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
        >
          {url}
        </a>,
      );
      index += url.length;
      continue;
    }

    const email = matchEmail(text.slice(index));

    if (email) {
      nodes.push(
        <a
          key={`email-${key++}`}
          href={`mailto:${email}`}
          className="text-[var(--neu-green)] underline underline-offset-4 transition-colors hover:text-[var(--text-primary)]"
        >
          {email}
        </a>,
      );
      index += email.length;
      continue;
    }

    let nextIndex = index + 1;

    while (nextIndex < text.length) {
      if (
        text.startsWith("**", nextIndex) ||
        text[nextIndex] === "`" ||
        matchUrl(text.slice(nextIndex)) ||
        matchEmail(text.slice(nextIndex))
      ) {
        break;
      }

      nextIndex += 1;
    }

    nodes.push(text.slice(index, nextIndex));
    index = nextIndex;
  }

  return nodes;
}

function matchUrl(text: string) {
  const match = text.match(/^https?:\/\/\S+/);

  if (!match) {
    return null;
  }

  let value = match[0];

  while (/[),.;!?]$/.test(value)) {
    value = value.slice(0, -1);
  }

  return value || null;
}

function matchEmail(text: string) {
  const match = text.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match?.[0] ?? null;
}
