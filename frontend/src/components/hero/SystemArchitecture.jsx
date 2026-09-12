import { architectureNodes, technologySummary, statusLabel } from './architectureData';
import styles from './SystemArchitecture.module.css';

/**
 * SystemArchitecture — SVG-based backend architecture visual.
 *
 * Renders a terminal/editor-style window containing a minimal
 * architecture diagram: API Layer, Services, Events, and Data Layer.
 *
 * This is a pure presentational component in Step 1.
 * No hover/click interactions are implemented yet.
 *
 * @param {Object} props
 * @param {string} [props.title] - Filename shown in the terminal header
 */
function SystemArchitecture({ title = 'system.ts' }) {
  const [api, services, events, data] = architectureNodes;

  return (
    <div className={styles.wrapper} role="img" aria-label="System architecture diagram showing API layer, services, events, and data layer">
      <div className={styles.terminal}>
        {/* ---- Terminal header ---- */}
        <div className={styles.terminalHeader}>
          <div className={styles.terminalControls} aria-hidden="true">
            <span className={styles.controlDot} />
            <span className={styles.controlDot} />
            <span className={styles.controlDot} />
          </div>
          <span className={styles.terminalTitle}>{title}</span>
        </div>

        {/* ---- Terminal body ---- */}
        <div className={styles.terminalBody}>
          <svg
            className={styles.diagram}
            viewBox="0 0 480 340"
            role="presentation"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <filter id="nodeShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow
                  dx="0"
                  dy="1"
                  stdDeviation="2"
                  floodColor="var(--color-primary)"
                  floodOpacity="0.12"
                />
              </filter>
            </defs>

            {/* ---- Status indicator ---- */}
            <g className={styles.statusGroup}>
              <circle
                className={styles.statusDot}
                cx="20"
                cy="20"
                r="4"
              />
              <text className={styles.statusText} x="30" y="24">
                {statusLabel}
              </text>
            </g>

            {/* ---- Top row: API / Services / Events ---- */}
            <g className={styles.nodeGroup} data-node={api.id}>
              <rect
                className={styles.nodeRect}
                x="20"
                y="44"
                width="120"
                height="52"
                rx="6"
              />
              <text className={styles.nodeTitle} x="80" y="66">
                {api.label}
              </text>
              <text className={styles.nodeTech} x="80" y="86">
                {api.technologies.join(' • ')}
              </text>
            </g>

            <g className={styles.nodeGroup} data-node={services.id}>
              <rect
                className={styles.nodeRect}
                x="180"
                y="44"
                width="120"
                height="52"
                rx="6"
              />
              <text className={styles.nodeTitle} x="240" y="66">
                {services.label}
              </text>
              <text className={styles.nodeTech} x="240" y="86">
                {services.technologies.join(' • ')}
              </text>
            </g>

            <g className={styles.nodeGroup} data-node={events.id}>
              <rect
                className={styles.nodeRect}
                x="340"
                y="44"
                width="120"
                height="52"
                rx="6"
              />
              <text className={styles.nodeTitle} x="400" y="66">
                {events.label}
              </text>
              <text className={styles.nodeTech} x="400" y="86">
                {events.technologies.join(' • ')}
              </text>
            </g>

            {/* ---- Connectors: top row -> middle junction ---- */}
            <g className={styles.connectors} aria-hidden="true">
              {/* API down to junction */}
              <path
                className={styles.connector}
                d="M 80 96 L 80 120 L 240 120 L 240 140"
                fill="none"
                style={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
              />
              {/* Services down to junction */}
              <path
                className={styles.connector}
                d="M 240 96 L 240 140"
                fill="none"
                style={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
              />
              {/* Events down to junction */}
              <path
                className={styles.connector}
                d="M 400 96 L 400 120 L 240 120 L 240 140"
                fill="none"
                style={{ stroke: 'var(--color-border)', strokeWidth: 1.5 }}
              />
            </g>

            {/* ---- Data Layer ---- */}
            <g className={styles.nodeGroup} data-node={data.id}>
              <rect
                className={styles.nodeRect}
                x="160"
                y="160"
                width="160"
                height="52"
                rx="6"
              />
              <text className={styles.nodeTitle} x="240" y="182">
                {data.label}
              </text>
              <text className={styles.nodeTech} x="240" y="202">
                {data.technologies.join(' • ')}
              </text>
            </g>

            {/* ---- Technology summary ---- */}
            <g className={styles.techSummaryGroup} aria-hidden="true">
              <text className={styles.techSummaryLabel} x="20" y="250">
                Stack
              </text>
              <text className={styles.techSummaryValue} x="20" y="272">
                {technologySummary.join(' • ')}
              </text>
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default SystemArchitecture;