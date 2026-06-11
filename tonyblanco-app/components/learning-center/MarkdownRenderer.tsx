type MarkdownRendererProps = {
  markdown: string;
  className?: string;
};

function renderInline(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let cursor = 0;
  let match: RegExpExecArray | null = null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    if (match[2]) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold text-slate-900">
          {match[2]}
        </strong>,
      );
    } else if (match[3] && match[4]) {
      nodes.push(
        <a
          key={`${match.index}-link`}
          href={match[4]}
          className="font-medium text-sky-700 underline decoration-sky-300 underline-offset-4 hover:text-sky-900"
        >
          {match[3]}
        </a>,
      );
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

export function MarkdownRenderer({ markdown, className }: MarkdownRendererProps) {
  const lines = markdown.split(/\r?\n/);
  const blocks: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (!listType || listItems.length === 0) {
      listType = null;
      listItems = [];
      return;
    }

    blocks.push(
      listType === 'ul' ? (
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-2 pl-5">
          {listItems}
        </ul>
      ) : (
        <ol key={`ol-${blocks.length}`} className="list-decimal space-y-2 pl-5">
          {listItems}
        </ol>
      ),
    );

    listType = null;
    listItems = [];
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith('### ')) {
      flushList();
      blocks.push(
        <h3 key={`h3-${blocks.length}`} className="text-lg font-semibold text-slate-900">
          {trimmed.slice(4)}
        </h3>,
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      flushList();
      blocks.push(
        <h2 key={`h2-${blocks.length}`} className="text-xl font-semibold text-slate-900">
          {trimmed.slice(3)}
        </h2>,
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      flushList();
      blocks.push(
        <h1 key={`h1-${blocks.length}`} className="text-2xl font-semibold text-slate-950">
          {trimmed.slice(2)}
        </h1>,
      );
      return;
    }

    if (trimmed === '---') {
      flushList();
      blocks.push(<hr key={`hr-${blocks.length}`} className="border-slate-200" />);
      return;
    }

    if (trimmed.startsWith('> ')) {
      flushList();
      blocks.push(
        <blockquote
          key={`quote-${blocks.length}`}
          className="rounded-2xl border border-sky-100 bg-sky-50/80 px-4 py-3 text-sm text-sky-900"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>,
      );
      return;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      listItems.push(
        <li key={`li-${blocks.length}-${listItems.length}`} className="leading-7 text-slate-700">
          {renderInline(bulletMatch[1] || '')}
        </li>,
      );
      return;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listItems.push(
        <li key={`oli-${blocks.length}-${listItems.length}`} className="leading-7 text-slate-700">
          {renderInline(orderedMatch[1] || '')}
        </li>,
      );
      return;
    }

    flushList();
    blocks.push(
      <p key={`p-${blocks.length}`} className="leading-7 text-slate-700">
        {renderInline(trimmed)}
      </p>,
    );
  });

  flushList();

  return <div className={className ? `${className} space-y-4` : 'space-y-4'}>{blocks}</div>;
}
