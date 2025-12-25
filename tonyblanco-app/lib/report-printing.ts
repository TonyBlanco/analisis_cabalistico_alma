'use client';

type PrintableReportInput = {
  title: string;
  subtitle?: string | null;
  markdown: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderInlineMarkdown(escapedText: string): string {
  // Input must already be HTML-escaped.
  // Very small subset: **bold**
  return escapedText.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

function markdownToBasicHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/);

  const out: string[] = [];
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push('</ul>');
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine ?? '';
    const trimmed = line.trimEnd();

    if (!trimmed.trim()) {
      closeList();
      continue;
    }

    if (trimmed.startsWith('# ')) {
      closeList();
      out.push(`<h1>${escapeHtml(trimmed.slice(2).trim())}</h1>`);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeList();
      out.push(`<h2>${escapeHtml(trimmed.slice(3).trim())}</h2>`);
      continue;
    }

    if (trimmed.startsWith('### ')) {
      closeList();
      out.push(`<h3>${escapeHtml(trimmed.slice(4).trim())}</h3>`);
      continue;
    }

    if (trimmed === '---') {
      closeList();
      out.push('<hr />');
      continue;
    }

    const bulletMatch = trimmed.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      const bulletText = bulletMatch[1] || '';
      const checkboxMatch = bulletText.match(/^\[( |x|X)\]\s+(.*)$/);
      if (checkboxMatch) {
        const checked = checkboxMatch[1].toLowerCase() === 'x';
        const label = renderInlineMarkdown(escapeHtml(checkboxMatch[2] || ''));
        out.push(
          `<li class="cb"><span class="box">${checked ? '✓' : ''}</span><span class="lbl">${label}</span></li>`,
        );
      } else {
        out.push(`<li>${renderInlineMarkdown(escapeHtml(bulletText))}</li>`);
      }
      continue;
    }

    closeList();
    out.push(`<p>${renderInlineMarkdown(escapeHtml(trimmed))}</p>`);
  }

  closeList();
  return out.join('\n');
}

export function openPrintableReport({ title, subtitle, markdown }: PrintableReportInput) {
  if (typeof window === 'undefined') return;

  const htmlBody = markdownToBasicHtml(markdown || '');
  const safeTitle = escapeHtml(title);
  const safeSubtitle = subtitle ? escapeHtml(subtitle) : '';

  const doc = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${safeTitle}</title>
  <style>
    :root { color-scheme: light; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Liberation Sans", sans-serif; margin: 18px; }
    .page { max-width: 820px; margin: 0 auto; }
    .meta { margin-bottom: 14px; }
    .meta h1 { margin: 0 0 2px 0; font-size: 16px; }
    .meta p { margin: 0; font-size: 11px; }
    h1 { font-size: 18px; margin: 18px 0 8px; }
    h2 { font-size: 13px; margin: 14px 0 6px; break-inside: avoid; }
    h3 { font-size: 12px; margin: 14px 0 6px; }
    p, li { font-size: 12px; line-height: 1.45; }
    ul { padding-left: 18px; margin: 8px 0; }
    hr { border: none; border-top: 1px solid #ddd; margin: 12px 0; }
    strong { font-weight: 700; }
    .cb { list-style: none; margin-left: -18px; display: flex; align-items: flex-start; gap: 8px; }
    .cb .box { display: inline-flex; width: 14px; height: 14px; border: 1px solid #111; align-items: center; justify-content: center; font-size: 12px; line-height: 1; margin-top: 2px; }
    .cb .lbl { flex: 1; }
    @media print {
      body { margin: 12mm; }
      .page { max-width: none; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="meta">
      <h1>${safeTitle}</h1>
      ${subtitle ? `<p>${safeSubtitle}</p>` : ''}
    </div>
    <main>
    ${htmlBody}
    </main>
  </div>
</body>
</html>`;

  // Use an iframe to avoid popup blockers and blank prints caused by timing.
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  const cleanup = () => {
    try {
      iframe.remove();
    } catch {
      // ignore
    }
  };

  iframe.onload = () => {
    try {
      const w = iframe.contentWindow;
      if (!w) return;
      w.focus();
      w.print();
      // Give the print dialog a moment before removing.
      setTimeout(cleanup, 1500);
    } catch {
      cleanup();
    }
  };

  iframe.srcdoc = doc;
  document.body.appendChild(iframe);
}
