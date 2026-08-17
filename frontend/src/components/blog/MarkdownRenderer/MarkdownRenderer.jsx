import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import styles from './MarkdownRenderer.module.css';

/**
 * MarkdownRenderer — renders Markdown to HTML with:
 * - GitHub Flavored Markdown (tables, strikethrough, etc.)
 * - Syntax highlighting for code blocks
 * - XSS sanitization via rehype-sanitize (strips dangerous HTML/scripts)
 *
 * @param {Object} props
 * @param {string} props.content - Markdown content.
 * @param {boolean} [props.prose=true] - Whether to apply prose styling.
 * @param {string} [props.className] - Additional CSS class.
 */
function MarkdownRenderer({ content, prose = true, className = '' }) {
  const classes = [styles.markdown, prose ? styles.prose : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [
            rehypeSanitize,
            {
              allowedTags: [
                'h1',
                'h2',
                'h3',
                'h4',
                'h5',
                'h6',
                'p',
                'br',
                'hr',
                'strong',
                'em',
                'del',
                'code',
                'pre',
                'blockquote',
                'ul',
                'ol',
                'li',
                'a',
                'img',
                'table',
                'thead',
                'tbody',
                'tr',
                'th',
                'td',
                'span',
                'div',
              ],
              allowedAttributes: {
                a: ['href', 'title', 'target', 'rel'],
                img: ['src', 'alt', 'title', 'width', 'height'],
                code: ['className'],
                pre: ['className', 'tabIndex'],
                ol: ['start'],
              },
              allowedSchemes: ['http', 'https', 'mailto', 'tel'],
              transform: (tagName, outNode) => {
                if (outNode.tagName === 'a') {
                  const href = outNode.properties?.href || '';
                  const safeScheme = href.match(/^([a-z][a-z\d+\-.]*):/i);
                  if (
                    safeScheme &&
                    !['http', 'https', 'mailto', 'tel'].includes(
                      safeScheme[1].toLowerCase(),
                    )
                  ) {
                    outNode.properties = outNode.properties || {};
                    outNode.properties.href = '#';
                  }
                }
                return outNode;
              },
            },
          ],
          rehypeHighlight,
        ]}
        components={{
          a: ({ ...props }) => {
            const href = props.href || '';
            const isExternal = href.startsWith('http');
            const safeProps = { ...props };
            if (isExternal) {
              safeProps.target = '_blank';
              safeProps.rel = 'noopener noreferrer';
            }
            // Remove any dangerous attributes that might slip through
            delete safeProps.onClick;
            delete safeProps.onMouseEnter;
            delete safeProps.onMouseOut;
            delete safeProps.onLoad;
            delete safeProps.onError;
            return <a {...safeProps} />;
          },
          img: ({ ...props }) => {
            const safeProps = { ...props };
            delete safeProps.onClick;
            return (
              <img {...safeProps} loading="lazy" alt={safeProps.alt || ''} />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;
