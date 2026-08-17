import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBlogPosts, useBlogCategories, useBlogTags } from '../../../hooks';
import BlogPostCard from '../BlogPostCard/BlogPostCard';
import LoadingState from '../../common/LoadingState/LoadingState';
import Button from '../../common/Button/Button';
import Reveal from '../../common/Reveal/Reveal';
import styles from './BlogList.module.css';

/**
 * Reusable blog post listing with search, category/tag filtering, and pagination.
 *
 * @param {Object} props
 * @param {Object} [props.initialQuery] - Initial query params (category, tag, limit, featured).
 * @param {boolean} [props.showSearch] - Whether to show the search box.
 * @param {boolean} [props.showCategoryFilter] - Whether to show category filter buttons.
 * @param {boolean} [props.showTagCloud] - Whether to show the tag cloud.
 */
function BlogList({
  initialQuery = {},
  showSearch = true,
  showCategoryFilter = true,
  showTagCloud = true,
}) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(
    initialQuery.category || null,
  );
  const [activeTag, setActiveTag] = useState(initialQuery.tag || null);
  const [page, setPage] = useState(1);

  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const { categories } = useBlogCategories();
  const { tags } = useBlogTags();

  const query = useMemo(() => {
    const params = { page, limit: 10, ...initialQuery };
    if (debouncedSearch) params.search = debouncedSearch;
    if (activeCategory) params.category = activeCategory;
    if (activeTag) params.tag = activeTag;
    return params;
  }, [page, debouncedSearch, activeCategory, activeTag, initialQuery]);

  const { posts, pagination, loading, error } = useBlogPosts(query);

  const handleFilterCategory = useCallback((catSlug) => {
    setActiveCategory(catSlug || null);
    setPage(1);
  }, []);

  const handleFilterTag = useCallback((tagSlug) => {
    setActiveTag(tagSlug || null);
    setPage(1);
  }, []);

  const handlePage = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setActiveCategory(initialQuery.category || null);
    setActiveTag(initialQuery.tag || null);
    setPage(1);
  }, [initialQuery.category, initialQuery.tag]);

  const hasActiveFilters = debouncedSearch || activeCategory || activeTag;

  if (loading) {
    return <LoadingState label="Loading articles..." />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {showSearch && (
        <div className={styles.searchContainer}>
          <input
            type="search"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
            aria-label="Search blog posts"
          />
        </div>
      )}

      {showCategoryFilter && categories.length > 0 && (
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Category:</span>
          <button
            type="button"
            className={
              activeCategory
                ? styles.filterButton
                : `${styles.filterButton} ${styles.filterButtonActive}`
            }
            onClick={() => handleFilterCategory(null)}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              type="button"
              className={
                activeCategory === cat.slug
                  ? `${styles.filterButton} ${styles.filterButtonActive}`
                  : styles.filterButton
              }
              onClick={() => handleFilterCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          className={styles.clearFilter}
          onClick={clearFilters}
        >
          Clear all filters
        </button>
      )}

      {posts.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No articles found.</p>
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={styles.postGrid}>
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 50}>
                <BlogPostCard post={post} />
              </Reveal>
            ))}
          </div>

          {pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                type="button"
                className={styles.pageButton}
                disabled={!pagination.hasPrevious}
                onClick={() => handlePage(pagination.page - 1)}
                aria-label="Previous page"
              >
                &larr; Previous
              </button>

              <span className={styles.pageInfo}>
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                className={styles.pageButton}
                disabled={!pagination.hasNext}
                onClick={() => handlePage(pagination.page + 1)}
                aria-label="Next page"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {showTagCloud && tags && tags.length > 0 && (
        <div className={styles.tagCloud}>
          <h3 className={styles.tagCloudTitle}>Browse by tag</h3>
          <div className={styles.tagCloudList}>
            {tags.map((tag) => {
              const isActive = activeTag === tag.slug;
              return (
                <button
                  key={tag.slug}
                  type="button"
                  className={
                    isActive
                      ? `${styles.tagButton} ${styles.tagButtonActive}`
                      : styles.tagButton
                  }
                  onClick={() =>
                    handleFilterTag(activeTag === tag.slug ? null : tag.slug)
                  }
                >
                  {tag.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default BlogList;
