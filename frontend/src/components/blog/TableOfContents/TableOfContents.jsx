import { useState, useEffect, useMemo } from 'react';
import styles from './TableOfContents.module.css';

/**
 * TableOfContents — generates a navigable TOC from an array of headings.
 *
 * @param {Object} props
 * @param {Array<{id: string, text: string, depth: number}>} props.headings
 */
function TableOfContents({ headings }) {
  const [activeId, setActiveId] = useState('');

  const visibleHeadings = useMemo(
    () => (headings || []).filter((h) => h.depth >= 2 && h.depth <= 3),
    [headings],
  );

  useEffect(() => {
    if (!('IntersectionObserver' in window) || visibleHeadings.length === 0) {
      return undefined;
    }

    const ids = visibleHeadings.map((h) => h.id);
    const elements = ids
      .map((id) => document.getElementById(`blog-${id}`))
      .filter(Boolean);

    if (elements.length === 0) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id.replace('blog-', '');
          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            setActiveId(id);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1,
      },
    );

    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, [visibleHeadings]);

  const scrollToHeading = (id) => {
    const element = document.getElementById(`blog-${id}`);
    if (element) {
      const offset = 80;
      const top = element.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  if (visibleHeadings.length === 0) return null;

  return (
    <nav className={styles.toc} aria-label="Table of contents">
      <h2 className={styles.tocTitle}>Contents</h2>
      <ul className={styles.tocList}>
        {visibleHeadings.map((heading) => (
          <li
            key={heading.id}
            className={[
              styles.tocItem,
              heading.depth === 3 ? styles.indent : '',
              activeId === heading.id ? styles.active : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <button
              type="button"
              className={styles.tocLink}
              onClick={() => scrollToHeading(heading.id)}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default TableOfContents;
