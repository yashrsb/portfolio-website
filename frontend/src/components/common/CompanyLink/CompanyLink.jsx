import styles from './CompanyLink.module.css';

/**
 * Renders a company name as an external link when a URL is present,
 * otherwise as plain text. Used by both the Experience cards and the
 * Timeline so the behavior stays consistent.
 *
 * @param {Object} props
 * @param {string} props.company - Company name
 * @param {string|null} [props.companyUrl] - Optional company website URL
 * @param {string} [props.className] - Additional CSS classes
 */
function CompanyLink({ company, companyUrl = null, className = '' }) {
  if (!companyUrl) {
    return <span className={className}>{company}</span>;
  }

  return (
    <a
      href={companyUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`${styles.link} ${className}`}
      aria-label={`Visit ${company} website`}
    >
      {company}
    </a>
  );
}

export default CompanyLink;
