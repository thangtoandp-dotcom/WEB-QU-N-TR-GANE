import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string | number;
  className?: string;
  displayMode?: boolean;
}

/**
 * Automatically detects and formats common math notation if not already LaTeX
 */
function autoFormatMath(raw: string): string {
  let str = raw.trim();

  // If already contains LaTeX math markers $, return as is
  if (str.includes('$')) return str;

  // If it's already raw LaTeX (e.g., starts with \frac or \sqrt)
  if (/^\\(frac|sqrt|displaystyle|int|vec|lim|log|sin|cos|tan|pm)/.test(str)) {
    return `$${str}$`;
  }

  // Convert common High School Math fractions: 1/x, 1/(2x), 1/2, (3x - 1)/(x - 2)
  const fractionMatch = str.match(/^([a-zA-Z0-9_+\-^√*]+)\s*\/\s*([a-zA-Z0-9_+\-^()√*]+)$/);
  if (fractionMatch) {
    let num = fractionMatch[1];
    let den = fractionMatch[2].replace(/^\((.*)\)$/, '$1');
    num = num.replace(/√(\d+)/g, '\\sqrt{$1}').replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');
    den = den.replace(/√(\d+)/g, '\\sqrt{$1}').replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');
    return `$\\dfrac{${num}}{${den}}$`;
  }

  // Fractions with leading parens: (a^3 √2) / 12, (1/2)e^(2x) + C
  if (/^\(?([a-zA-Z0-9\s√^]+)\)?\s*\/\s*(\d+)$/.test(str)) {
    const m = str.match(/^\(?([a-zA-Z0-9\s√^]+)\)?\s*\/\s*(\d+)$/);
    if (m) {
      const num = m[1].trim()
        .replace(/√(\d+)/g, '\\sqrt{$1}')
        .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}');
      return `$\\dfrac{${num}}{${m[2]}}$`;
    }
  }

  // Detect simple equations or math expressions like:
  // "y = 2", "x = 4", "e^x", "3^x", "a^2", "R = 5", "x > 0", "a > 0", "√5"
  if (/^([a-zA-Z][0-9_]*(\([a-zA-Z0-9_]+\))?\s*(=|<|>|≤|≥|≠)\s*[-+a-zA-Z0-9^/()√_]+)$/.test(str) ||
      /^([a-zA-Z0-9]+\^[a-zA-Z0-9_()\-+]+)$/.test(str) ||
      /^(√\d+)$/.test(str)) {
    let latex = str
      .replace(/√(\d+)/g, '\\sqrt{$1}')
      .replace(/\^([a-zA-Z0-9]+)/g, '^{$1}')
      .replace(/≠/g, '\\neq ')
      .replace(/≤/g, '\\le ')
      .replace(/≥/g, '\\ge ')
      .replace(/\s*\*\s*/g, ' \\cdot ');
    return `$${latex}$`;
  }

  return str;
}

/**
 * Sanitizes KaTeX HTML to fix Private Use Area glyphs (\uE020) and ensures standard mathematical ≠ and ℝ symbols
 */
function cleanKatexHtml(html: string): string {
  // Replace KaTeX's composite \uE020 + = glyph that appears as a broken tofu box in standard fonts
  let cleaned = html.replace(
    /<span class="mrel"><span class="mrel"><span class="mord katex-vbox">[\s\S]*?[\uE000-\uF8FF][\s\S]*?<\/span><\/span><span class="mspace nobreak"><\/span><span class="mrel">=<\/span><\/span>/g,
    '<span class="mrel font-serif" style="font-size: 1.15em; margin: 0 0.28em; font-weight: normal; vertical-align: -0.05em; display: inline-block;">≠</span>'
  );
  // Guarantee double-struck real numbers ℝ
  cleaned = cleaned.replace(
    /<span class="mord mathbb">R<\/span>/g,
    '<span class="mord mathbb" style="font-family: KaTeX_AMS, serif; font-weight: normal;">ℝ</span>'
  );
  // Strip any remaining Private Use Area characters
  cleaned = cleaned.replace(/[\uE000-\uF8FF]/g, '');
  return cleaned;
}

export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  displayMode = false
}) => {
  const content = useMemo(() => {
    if (text === null || text === undefined) return '';
    const rawString = String(text).replace(/≢/g, '≠');
    const formatted = autoFormatMath(rawString);

    // If no math delimiter found, return plain text
    if (!formatted.includes('$')) {
      return <span>{rawString}</span>;
    }

    // Parse $$ for display math and $ for inline math
    // Regex splits by $$...$$ or $...$
    const regex = /(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/g;
    const parts = formatted.split(regex);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2).trim();
        try {
          const rawHtml = katex.renderToString(math, {
            throwOnError: false,
            displayMode: true
          });
          const html = cleanKatexHtml(rawHtml);
          return (
            <span
              key={index}
              className="my-2 block text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1).trim();
        try {
          const rawHtml = katex.renderToString(math, {
            throwOnError: false,
            displayMode: displayMode
          });
          const html = cleanKatexHtml(rawHtml);
          return (
            <span
              key={index}
              className="inline-block px-0.5 align-middle font-normal"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch {
          return <span key={index}>{part}</span>;
        }
      }
      return <span key={index}>{part}</span>;
    });
  }, [text, displayMode]);

  return <span className={`math-text-container ${className}`}>{content}</span>;
};
