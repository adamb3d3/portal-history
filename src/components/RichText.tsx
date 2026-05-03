import type { ReactNode } from "react";
import type { Source } from "../lib/schema";

interface Props {
  text: string;
  sources?: Source[];
  className?: string;
  /** When true, blank lines split into <p> elements. */
  paragraphs?: boolean;
}

/**
 * Renders narrative text with markdown-style inline links resolved
 * either as direct URLs or as references to a source's URL by id.
 *
 *   "Read [Founders Online](founders-newburgh-address) for the full text."
 *   "See the [Wikipedia entry](https://en.wikipedia.org/wiki/...)."
 *
 * If `paragraphs` is true, double-newlines split the text into <p>s.
 *
 * Note: any unresolved id falls back to plain text rather than a
 * broken link — fail-safe for incomplete data.
 */
export default function RichText({
  text,
  sources,
  className,
  paragraphs,
}: Props) {
  if (paragraphs) {
    const paras = text.split(/\n\n+/);
    return (
      <div className={className}>
        {paras.map((para, i) => (
          <p key={i} className={i > 0 ? "mt-4" : ""}>
            {renderInline(para, sources)}
          </p>
        ))}
      </div>
    );
  }
  return <span className={className}>{renderInline(text, sources)}</span>;
}

function renderInline(text: string, sources?: Source[]): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;
  const matches = [...text.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)];

  for (const m of matches) {
    const idx = m.index ?? 0;
    if (idx > lastIndex) parts.push(text.slice(lastIndex, idx));

    const [full, label, ref] = m;
    const url = ref.startsWith("http")
      ? ref
      : sources?.find((s) => s.id === ref)?.url;

    if (url) {
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline decoration-ember/40 decoration-1 underline-offset-[3px] hover:decoration-ember hover:text-ember transition-colors"
        >
          {label}
        </a>,
      );
    } else {
      parts.push(label);
    }
    lastIndex = idx + full.length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}
