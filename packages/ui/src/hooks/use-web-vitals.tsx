/**
 * Web Vitals Hook
 *
 * Monitor and report Core Web Vitals metrics for performance optimization.
 * Tracks LCP, FID, CLS, FCP, TTFB, and INP.
 */

import { useEffect, useCallback, useRef, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type MetricName = "LCP" | "FID" | "CLS" | "FCP" | "TTFB" | "INP";

export interface WebVitalMetric {
  /** Metric name */
  name: MetricName;
  /** Metric value */
  value: number;
  /** Rating: good, needs-improvement, or poor */
  rating: "good" | "needs-improvement" | "poor";
  /** Delta from previous value (for CLS) */
  delta?: number;
  /** Metric ID */
  id: string;
  /** Navigation type */
  navigationType?: string;
  /** Entries that contributed to the metric */
  entries?: PerformanceEntry[];
}

export interface WebVitalsConfig {
  /** Enable debug logging */
  debug?: boolean;
  /** Report callback */
  onReport?: (metric: WebVitalMetric) => void;
  /** Analytics endpoint */
  analyticsEndpoint?: string;
  /** Sample rate (0-1) */
  sampleRate?: number;
  /** Report all metrics or only final values */
  reportAllChanges?: boolean;
}

export interface WebVitalsState {
  lcp: WebVitalMetric | null;
  fid: WebVitalMetric | null;
  cls: WebVitalMetric | null;
  fcp: WebVitalMetric | null;
  ttfb: WebVitalMetric | null;
  inp: WebVitalMetric | null;
}

// ============================================================================
// Thresholds
// ============================================================================

/**
 * Core Web Vitals thresholds
 * Based on Google's recommendations
 */
export const WEB_VITALS_THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // milliseconds
  FID: { good: 100, poor: 300 }, // milliseconds
  CLS: { good: 0.1, poor: 0.25 }, // score
  FCP: { good: 1800, poor: 3000 }, // milliseconds
  TTFB: { good: 800, poor: 1800 }, // milliseconds
  INP: { good: 200, poor: 500 }, // milliseconds
} as const;

// ============================================================================
// Rating Function
// ============================================================================

/**
 * Get rating for a metric value
 */
export function getMetricRating(
  name: MetricName,
  value: number
): "good" | "needs-improvement" | "poor" {
  const thresholds = WEB_VITALS_THRESHOLDS[name];

  if (value <= thresholds.good) return "good";
  if (value <= thresholds.poor) return "needs-improvement";
  return "poor";
}

// ============================================================================
// Metric ID Generator
// ============================================================================

let metricIdCounter = 0;

function generateMetricId(): string {
  return `v3-${Date.now()}-${++metricIdCounter}`;
}

// ============================================================================
// Web Vitals Hook
// ============================================================================

/**
 * useWebVitals Hook
 *
 * Monitors Core Web Vitals and reports metrics.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { metrics, isSupported } = useWebVitals({
 *     debug: true,
 *     onReport: (metric) => {
 *       console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {metrics.lcp && <p>LCP: {metrics.lcp.value}ms</p>}
 *       {metrics.cls && <p>CLS: {metrics.cls.value}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useWebVitals(config: WebVitalsConfig = {}) {
  const {
    debug = false,
    onReport,
    analyticsEndpoint,
    sampleRate = 1,
    reportAllChanges = false,
  } = config;

  const [metrics, setMetrics] = useState<WebVitalsState>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    inp: null,
  });

  const [isSupported, setIsSupported] = useState(true);
  const observersRef = useRef<PerformanceObserver[]>([]);
  const clsValueRef = useRef(0);

  // Check if we should sample this session
  const shouldSample = useRef(Math.random() < sampleRate);

  /**
   * Report metric
   */
  const reportMetric = useCallback(
    (metric: WebVitalMetric) => {
      if (!shouldSample.current) return;

      // Update state
      setMetrics((prev) => ({
        ...prev,
        [metric.name.toLowerCase()]: metric,
      }));

      // Debug logging
      if (debug) {
        console.log(
          `[Web Vitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`
        );
      }

      // Custom callback
      if (onReport) {
        onReport(metric);
      }

      // Send to analytics endpoint
      if (analyticsEndpoint) {
        sendToAnalytics(analyticsEndpoint, metric);
      }
    },
    [debug, onReport, analyticsEndpoint]
  );

  /**
   * Create metric object
   */
  const createMetric = useCallback(
    (
      name: MetricName,
      value: number,
      entries?: PerformanceEntry[],
      delta?: number
    ): WebVitalMetric => ({
      name,
      value,
      rating: getMetricRating(name, value),
      id: generateMetricId(),
      delta,
      entries,
      navigationType: getNavigationType(),
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof PerformanceObserver === "undefined") {
      setIsSupported(false);
      return;
    }

    const observers: PerformanceObserver[] = [];

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
          startTime: number;
        };

        if (lastEntry) {
          const metric = createMetric("LCP", lastEntry.startTime, entries);
          reportMetric(metric);
        }
      });

      lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      observers.push(lcpObserver);
    } catch (e) {
      if (debug) console.warn("[Web Vitals] LCP not supported");
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as PerformanceEntry & {
          processingStart: number;
          startTime: number;
        };

        if (firstEntry) {
          const value = firstEntry.processingStart - firstEntry.startTime;
          const metric = createMetric("FID", value, entries);
          reportMetric(metric);
        }
      });

      fidObserver.observe({ type: "first-input", buffered: true });
      observers.push(fidObserver);
    } catch (e) {
      if (debug) console.warn("[Web Vitals] FID not supported");
    }

    // CLS Observer
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as (PerformanceEntry & {
          hadRecentInput: boolean;
          value: number;
        })[];

        for (const entry of entries) {
          if (!entry.hadRecentInput) {
            const delta = entry.value;
            clsValueRef.current += delta;

            if (reportAllChanges || delta > 0) {
              const metric = createMetric(
                "CLS",
                clsValueRef.current,
                entries,
                delta
              );
              reportMetric(metric);
            }
          }
        }
      });

      clsObserver.observe({ type: "layout-shift", buffered: true });
      observers.push(clsObserver);
    } catch (e) {
      if (debug) console.warn("[Web Vitals] CLS not supported");
    }

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(
          (entry) => entry.name === "first-contentful-paint"
        ) as PerformanceEntry & { startTime: number };

        if (fcpEntry) {
          const metric = createMetric("FCP", fcpEntry.startTime, entries);
          reportMetric(metric);
        }
      });

      fcpObserver.observe({ type: "paint", buffered: true });
      observers.push(fcpObserver);
    } catch (e) {
      if (debug) console.warn("[Web Vitals] FCP not supported");
    }

    // TTFB
    try {
      const navEntry = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;

      if (navEntry) {
        const ttfb = navEntry.responseStart - navEntry.requestStart;
        const metric = createMetric("TTFB", ttfb, [navEntry]);
        reportMetric(metric);
      }
    } catch (e) {
      if (debug) console.warn("[Web Vitals] TTFB not supported");
    }

    // INP Observer (Interaction to Next Paint)
    try {
      let maxINP = 0;
      const inpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as (PerformanceEntry & {
          duration: number;
        })[];

        for (const entry of entries) {
          if (entry.duration > maxINP) {
            maxINP = entry.duration;
            const metric = createMetric("INP", maxINP, entries);
            reportMetric(metric);
          }
        }
      });

      inpObserver.observe({ type: "event", buffered: true });
      observers.push(inpObserver);
    } catch (e) {
      if (debug) console.warn("[Web Vitals] INP not supported");
    }

    observersRef.current = observers;

    // Cleanup
    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [debug, reportMetric, createMetric, reportAllChanges]);

  return {
    metrics,
    isSupported,
    thresholds: WEB_VITALS_THRESHOLDS,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get navigation type
 */
function getNavigationType(): string {
  if (typeof window === "undefined") return "unknown";

  const navEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  return navEntry?.type || "unknown";
}

/**
 * Send metric to analytics endpoint
 */
async function sendToAnalytics(
  endpoint: string,
  metric: WebVitalMetric
): Promise<void> {
  try {
    // Use sendBeacon for reliability
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(metric)], {
        type: "application/json",
      });
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback to fetch
      await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(metric),
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }
  } catch (e) {
    console.error("[Web Vitals] Failed to send analytics:", e);
  }
}

// ============================================================================
// Utility Hooks
// ============================================================================

/**
 * useMetricAlert Hook
 *
 * Alerts when a metric exceeds threshold.
 */
export function useMetricAlert(
  metric: WebVitalMetric | null,
  threshold: "good" | "needs-improvement" | "poor",
  callback: (metric: WebVitalMetric) => void
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (!metric) return;

    const ratings = ["good", "needs-improvement", "poor"];
    const metricRatingIndex = ratings.indexOf(metric.rating);
    const thresholdIndex = ratings.indexOf(threshold);

    if (metricRatingIndex >= thresholdIndex) {
      callbackRef.current(metric);
    }
  }, [metric, threshold]);
}

/**
 * usePerformanceScore Hook
 *
 * Calculate overall performance score based on Web Vitals.
 */
export function usePerformanceScore(metrics: WebVitalsState): number | null {
  const { lcp, fid, cls, fcp, ttfb } = metrics;

  // Need at least LCP, FID, and CLS for a score
  if (!lcp || !cls) return null;

  // Weight factors (based on Lighthouse)
  const weights = {
    lcp: 0.25,
    fid: 0.25,
    cls: 0.25,
    fcp: 0.15,
    ttfb: 0.1,
  };

  // Calculate individual scores (0-100)
  const scores: Record<string, number> = {};

  if (lcp) {
    scores["lcp"] = calculateScore(
      lcp.value,
      WEB_VITALS_THRESHOLDS.LCP.good,
      WEB_VITALS_THRESHOLDS.LCP.poor
    );
  }

  if (fid) {
    scores["fid"] = calculateScore(
      fid.value,
      WEB_VITALS_THRESHOLDS.FID.good,
      WEB_VITALS_THRESHOLDS.FID.poor
    );
  }

  if (cls) {
    scores["cls"] = calculateScore(
      cls.value,
      WEB_VITALS_THRESHOLDS.CLS.good,
      WEB_VITALS_THRESHOLDS.CLS.poor
    );
  }

  if (fcp) {
    scores["fcp"] = calculateScore(
      fcp.value,
      WEB_VITALS_THRESHOLDS.FCP.good,
      WEB_VITALS_THRESHOLDS.FCP.poor
    );
  }

  if (ttfb) {
    scores["ttfb"] = calculateScore(
      ttfb.value,
      WEB_VITALS_THRESHOLDS.TTFB.good,
      WEB_VITALS_THRESHOLDS.TTFB.poor
    );
  }

  // Calculate weighted average
  let totalWeight = 0;
  let weightedSum = 0;

  for (const [key, score] of Object.entries(scores)) {
    const weight = weights[key as keyof typeof weights] || 0;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : null;
}

/**
 * Calculate score from value and thresholds
 */
function calculateScore(value: number, good: number, poor: number): number {
  if (value <= good) return 100;
  if (value >= poor) return 0;

  // Linear interpolation between good and poor
  return Math.round(((poor - value) / (poor - good)) * 100);
}

// ============================================================================
// Debug Component
// ============================================================================

/**
 * Web Vitals Debug Display
 *
 * Shows current Web Vitals metrics in development.
 */
export function WebVitalsDebug({
  position = "bottom-right",
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const { metrics, isSupported } = useWebVitals({ debug: false });
  const score = usePerformanceScore(metrics);

  if (process.env.NODE_ENV !== "development") return null;
  if (!isSupported) return null;

  const positionStyles: Record<string, React.CSSProperties> = {
    "top-left": { top: 10, left: 10 },
    "top-right": { top: 10, right: 10 },
    "bottom-left": { bottom: 10, left: 10 },
    "bottom-right": { bottom: 10, right: 10 },
  };

  const ratingColors: Record<string, string> = {
    good: "#0cce6b",
    "needs-improvement": "#ffa400",
    poor: "#ff4e42",
  };

  return (
    <div
      style={{
        position: "fixed",
        ...positionStyles[position],
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.9)",
        color: "white",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "12px",
        fontFamily: "monospace",
        minWidth: "180px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        Web Vitals {score !== null && `(${score}/100)`}
      </div>
      {Object.entries(metrics).map(([key, metric]) => (
        <div
          key={key}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
          }}
        >
          <span>{key.toUpperCase()}</span>
          <span
            style={{
              color: metric ? ratingColors[metric.rating] : "#666",
            }}
          >
            {metric
              ? key === "cls"
                ? metric.value.toFixed(3)
                : `${Math.round(metric.value)}ms`
              : "-"}
          </span>
        </div>
      ))}
    </div>
  );
}
