import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks';
import {
  architectureNodes,
  architectureConnectors,
  technologySummary,
  statusLabel,
  nodePositions,
  nodeStatus,
} from './architectureData';
import styles from './SystemArchitecture.module.css';

/**
 * SystemArchitecture — Interactive SVG-based backend architecture visual.
 *
 * Renders a terminal/editor-style window containing an interactive
 * architecture diagram: API Layer, Services, Events, and Data Layer.
 *
 * Interactions:
 * - Hover/focus a node to highlight it and connected paths.
 * - Click/tap a node to select it and show a detail panel.
 * - Subtle request-flow animation along the primary path.
 * - Subtle mouse parallax (respects reduced motion).
 * - Keyboard accessible (Tab, Enter/Space, Escape).
 *
 * @param {Object} props
 * @param {string} [props.title] - Filename shown in the terminal header
 */
/**
 * Wrap technology labels into lines that fit within a character budget.
 * Returns an array of strings, each suitable for one SVG text line.
 *
 * @param {string[]} technologies - Technology labels
 * @param {number} maxChars - Max characters per line
 * @returns {string[]} Wrapped lines
 */
function wrapTechLines(technologies, maxChars = 16) {
  const lines = [];
  let current = [];

  for (const tech of technologies) {
    const candidate = current.length > 0 ? [...current, tech] : [tech];
    const candidateText = candidate.join(' • ');

    if (candidateText.length > maxChars && current.length > 0) {
      lines.push(current.join(' • '));
      current = [tech];
    } else {
      current = candidate;
    }
  }

  if (current.length > 0) {
    lines.push(current.join(' • '));
  }

  return lines.length > 0 ? lines : [''];
}

function SystemArchitecture({ title = 'system.ts' }) {
  const [activeNode, setActiveNode] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [flowActive, setFlowActive] = useState(false);
  const svgRef = useRef(null);
  const parallaxRef = useRef(null);
  const flowTimerRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const nodesById = Object.fromEntries(architectureNodes.map((n) => [n.id, n]));

  const active = activeNode || hoveredNode;
  const activeNodeData = active ? nodesById[active] : null;

  const connectorActive = (connector) =>
    active && connector.connects.includes(active);

  const handleNodeEnter = (nodeId) => {
    setHoveredNode(nodeId);
  };

  const handleNodeLeave = () => {
    setHoveredNode(null);
  };

  const handleNodeSelect = (nodeId) => {
    setActiveNode((prev) => (prev === nodeId ? null : nodeId));
  };

  const handleKeyDown = (event, nodeId) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleNodeSelect(nodeId);
    } else if (event.key === 'Escape') {
      setActiveNode(null);
    }
  };

  // ---- Request-flow animation ----

  useEffect(() => {
    if (prefersReducedMotion) {
      setFlowActive(false);
      return;
    }

    if (!isPointerInside) {
      setFlowActive(false);
      return;
    }

    let cancelled = false;

    const startFlow = () => {
      if (cancelled) return;
      setFlowActive(true);
      flowTimerRef.current = setTimeout(() => {
        if (!cancelled) {
          setFlowActive(false);
          flowTimerRef.current = setTimeout(startFlow, 1200);
        }
      }, 2200);
    };

    const startTimer = setTimeout(startFlow, 800);

    return () => {
      cancelled = true;
      clearTimeout(startTimer);
      if (flowTimerRef.current) {
        clearTimeout(flowTimerRef.current);
      }
    };
  }, [isPointerInside, prefersReducedMotion]);

  // ---- Subtle parallax ----

  useEffect(() => {
    if (prefersReducedMotion) return;

    const node = parallaxRef.current;
    if (!node) return;

    let rafId = null;

    const handlePointerMove = (event) => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const rect = node.getBoundingClientRect();
        const x = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const y = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        node.style.transform = `translate(${x * 4}px, ${y * 2}px)`;
      });
    };

    node.addEventListener('pointermove', handlePointerMove);
    return () => {
      node.removeEventListener('pointermove', handlePointerMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  return (
    <div
      className={styles.wrapper}
      role="img"
      aria-label="System architecture diagram showing API layer, services, events, and data layer"
    >
      <div
        className={styles.terminal}
        ref={parallaxRef}
        onMouseEnter={() => setIsPointerInside(true)}
        onMouseLeave={() => {
          setIsPointerInside(false);
          setHoveredNode(null);
        }}
      >
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
          <div className={styles.diagramWrapper}>
            <svg
              className={styles.diagram}
              viewBox="0 0 480 340"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              ref={svgRef}
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
                <filter id="activeGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow
                    dx="0"
                    dy="2"
                    stdDeviation="4"
                    floodColor="var(--color-primary)"
                    floodOpacity="0.35"
                  />
                </filter>
                {/* Hidden motion path for request-flow animation.
                    Traces SYSTEM → API → SERVICES → DATA along
                    actual connector geometry. */}
                <path
                  id="requestFlowMotionPath"
                  d="M 80 44 L 80 122 L 240 122 L 240 160"
                  fill="none"
                />
              </defs>

              {/* ---- Status indicator ---- */}
              <g className={styles.statusGroup}>
                <circle
                  className={`${styles.statusDot} ${flowActive ? styles.statusDotActive : ''}`}
                  cx="20"
                  cy="20"
                  r="4"
                />
                <text className={styles.statusText} x="30" y="24">
                  {statusLabel}
                </text>
              </g>

              {/* ---- Connectors ---- */}
              <g className={styles.connectors} aria-hidden="true">
                {architectureConnectors.map((connector) => (
                  <path
                    key={connector.id}
                    className={`${styles.connector} ${
                      connectorActive(connector) ? styles.connectorActive : ''
                    }`}
                    d={connector.d}
                    fill="none"
                  />
                ))}
                {/* Animated request-flow dot following the real path geometry.
                    Travels SYSTEM → API → SERVICES → DATA. */}
                {flowActive && (
                  <g className={styles.flowDot} aria-hidden="true">
                    <circle
                      r="3"
                      fill="var(--color-primary)"
                      filter="url(#activeGlow)"
                    >
                      <animateMotion
                        dur="2.6s"
                        repeatCount="indefinite"
                        rotate="auto"
                      >
                        <mpath href="#requestFlowMotionPath" />
                      </animateMotion>
                    </circle>
                  </g>
                )}
              </g>

              {/* ---- Interactive nodes ---- */}
              {architectureNodes.map((node) => {
                const isActive = active === node.id;
                const isDimmed = active && active !== node.id;

                return (
                  <g
                    key={node.id}
                    className={`${styles.nodeGroup} ${
                      isActive ? styles.nodeGroupActive : ''
                    } ${isDimmed ? styles.nodeGroupDimmed : ''}`}
                    data-node={node.id}
                    onMouseEnter={() => handleNodeEnter(node.id)}
                    onMouseLeave={handleNodeLeave}
                    onClick={() => handleNodeSelect(node.id)}
                    onKeyDown={(e) => handleKeyDown(e, node.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`${node.label}: ${node.description}`}
                    aria-pressed={activeNode === node.id}
                  >
                    <rect
                      className={`${styles.nodeRect} ${
                        isActive ? styles.nodeRectActive : ''
                      }`}
                      x={nodePositions[node.id].x}
                      y={nodePositions[node.id].y}
                      width={nodePositions[node.id].width}
                      height={nodePositions[node.id].height}
                      rx={6}
                    />
                    <text
                      className={styles.nodeTitle}
                      x={nodePositions[node.id].x + nodePositions[node.id].width / 2}
                      y={nodePositions[node.id].y + 22}
                    >
                      {node.label}
                    </text>
                    {nodeStatus[node.id] && (
                      <circle
                        className={styles.nodeStatusDot}
                        cx={nodePositions[node.id].x + nodePositions[node.id].width - 14}
                        cy={nodePositions[node.id].y + 14}
                        r="3"
                      />
                    )}
                    {wrapTechLines(node.technologies, 16).map(
                      (line, lineIndex) => (
                        <text
                          key={lineIndex}
                          className={styles.nodeTech}
                          x={nodePositions[node.id].x + nodePositions[node.id].width / 2}
                          y={nodePositions[node.id].y + 42 + lineIndex * 13}
                        >
                          {line}
                        </text>
                      ),
                    )}
                  </g>
                );
              })}

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

            {/* ---- Detail panel ---- */}
            {activeNodeData && (
              <div className={styles.detailPanel} role="region" aria-label={`${activeNodeData.label} details`}>
                <h3 className={styles.detailTitle}>{activeNodeData.label}</h3>
                <p className={styles.detailDescription}>{activeNodeData.description}</p>
                <div className={styles.detailTechs} aria-hidden="true">
                  {activeNodeData.technologies.map((tech) => (
                    <span key={tech} className={styles.detailTech}>{tech}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SystemArchitecture;