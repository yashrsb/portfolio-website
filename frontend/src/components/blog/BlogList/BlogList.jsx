import { useState, useEffect, useMemo, useCallback } from 'react';
import { useBlogPosts, useBlogCategories, useBlogTags } from '../../../hooks';
import BlogPostCard from '../BlogPostCard/BlogPostCard';
import ErrorState from '../../common/ErrorState/ErrorState';
import Button from '../../common/Button/Button';
import Reveal from '../../common/Reveal/Reveal';
import styles from './BlogList.module.css';

const SKELETON_COUNT = 6;

function SkeletonCard() {
  return (
    <div className={styles.skeletonCard} aria-hidden="true">
      <div className={styles.skeletonImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
    </div>
  );
}

function FeaturedSkeletonCard() {
  return (
    <div className={styles.skeletonFeaturedCard} aria-hidden="true">
      <div className={styles.skeletonFeaturedImage} />
      <div className={styles.skeletonContent}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
    </div>
  );
}

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

  // Separate featured post from the rest for prominent display
  const featuredPost = posts.find((p) => p.featured);
  const otherPosts = featuredPost
    ? posts.filter((p) => p.id !== featuredPost.id)
    : posts;

  if (loading) {
    return (
      <div data-testid="loading">
        {showSearch && (
          <div className={styles.searchContainer}>
            <div className={styles.skeletonSearch} />
          </div>
        )}

        <FeaturedSkeletonCard />

        <div className={styles.postGrid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load articles"
        message={error}
        onRetry={() => window.location.reload()}
        retryLabel="Retry"
      />
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
          {hasActiveFilters ? (
            <>
              <p className={styles.emptyTitle}>No articles found.</p>
              <p className={styles.emptySubtitle}>
                Try a different search term or clear your filters.
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <p className={styles.emptyTitle}>No articles published yet.</p>
              <p className={styles.emptySubtitle}>
                Check back soon for new technical articles on software
                engineering, system design, and infrastructure.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          {featuredPost && (
            <div className={styles.featuredSection}>
              <h2 className={styles.featuredTitle}>Featured Article</h2>
              <Reveal>
                <BlogPostCard post={featuredPost} />
              </Reveal>
            </div>
          )}

          <div className={styles.postGrid}>
            {otherPosts.map((post, index) => (
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
