import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import styles from './MarkdownPreview.module.css';

/**
 * MarkdownPreview — renders Markdown for admin-side preview.
 * Uses the same rendering pipeline as the public frontend (react-markdown +
 * remark-gfm + rehype-sanitize) to ensure visual consistency.
 *
 * @param {string} content - Markdown content.
 */
function MarkdownPreview({ content }) {
  if (!content || !content.trim()) {
    return (
      <div className={styles.empty}>
        <p>No content to preview.</p>
      </div>
    );
  }

  return (
    <div className={styles.preview}>
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
                img: ['src', 'alt', 'title'],
                code: ['className'],
              },
              allowedSchemes: ['http', 'https', 'mailto', 'tel'],
            },
          ],
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
            return <a {...safeProps} />;
          },
          img: ({ ...props }) => (
            <img {...props} loading="lazy" alt={props.alt || ''} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownPreview;
