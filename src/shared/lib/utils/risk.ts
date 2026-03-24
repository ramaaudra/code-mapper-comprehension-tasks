import {
  BLAST_RADIUS_THRESHOLDS,
  PROPAGATION_RISK_THRESHOLDS,
  getPropagationRiskThresholds,
  getBlastRadiusBandDescription,
  getBlastRadiusBandLabel,
  getPropagationRiskBandDescription,
  getPropagationRiskBandLabel,
  resolveBlastRadiusLevel,
  resolvePropagationRiskLevel
} from '@/shared/lib/metric-thresholds'

import type { ReviewThresholdCalibration } from '@/shared/lib/metric-thresholds'
import type {
  FileRiskProfile,
  RiskLevel,
  RiskMetrics,
  RiskProfile,
  RiskThresholds
} from '@/shared/types/risk'

/**
 * Unified Propagation Risk Thresholds (Ca × I heuristic)
 * Derived from dependency metrics inspired by Robert C. Martin's package metrics.
 */
export const RISK_THRESHOLDS: RiskThresholds = PROPAGATION_RISK_THRESHOLDS

/**
 * Blast Radius Thresholds (Ca + Ce × 0.5)
 * Heuristic estimate of blast radius / nearby verification scope
 * Used in Node Detail Panel (Micro level)
 */
export { BLAST_RADIUS_THRESHOLDS }

/**
 * Calculate Blast Radius
 * Formula: Ca + (Ce × 0.5)
 * - Ca = Afferent Coupling (external impact - how many files depend on this)
 * - Ce = Efferent Coupling (internal impact - how many files this depends on)
 *
 * Weights Ce × 0.5 because internal dependencies cause localized damage,
 * while external dependencies (Ca) cause cascading failures across the codebase.
 */
export function calculateBlastRadius(ca: number, ce: number): number {
  return ca + ce * 0.5
}

/**
 * Determine Blast Radius level from score
 */
export function getBlastRadiusLevel(
  score: number,
  hasCycle: boolean,
  calibration?: ReviewThresholdCalibration
): RiskLevel {
  return resolveBlastRadiusLevel(score, hasCycle, calibration)
}

/**
 * Calculate a derived propagation-risk heuristic: Risk = Ca × I
 * Where:
 * - Ca = Afferent Coupling (number of dependents)
 * - I = Instability (Ce / (Ca + Ce))
 *
 * Special cases:
 * - If Ca = 0: Risk = 0 (lower expected propagation risk because there are no dependents)
 * - If hasCycle = true: Override to critical (independent of score)
 */
export function calculateRiskScore(ca: number, instability: number): number {
  // If no dependents, risk is 0 regardless of instability
  if (ca === 0) {
    return 0
  }
  return ca * instability
}

/**
 * Determine risk level from score
 */
export function getRiskLevel(
  score: number,
  calibration?: ReviewThresholdCalibration
): RiskLevel {
  return resolvePropagationRiskLevel(score, calibration)
}

export function getPropagationRiskLevel(
  score: number,
  calibration?: ReviewThresholdCalibration
): RiskLevel {
  return resolvePropagationRiskLevel(score, calibration)
}

export function getCalibratedPropagationRiskThresholds(
  calibration?: ReviewThresholdCalibration
): RiskThresholds {
  return getPropagationRiskThresholds(calibration)
}

/**
 * Get human-readable label for risk level
 */
export function getRiskLabel(level: RiskLevel): string {
  return getPropagationRiskBandLabel(level)
}

/**
 * Get Tailwind CSS background color class for risk level
 * Unified across all components (FileTree, Graph, Dashboard, etc.)
 */
export function getRiskColorClass(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'bg-status-critical-solid',
    high: 'bg-status-warning-solid',
    medium: 'bg-status-caution-solid',
    low: 'bg-status-success-solid'
  }
  return colors[level]
}

/**
 * Get Tailwind CSS text color class for risk level
 */
export function getRiskTextClass(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'text-status-critical-foreground',
    high: 'text-status-warning-foreground',
    medium: 'text-status-caution-foreground',
    low: 'text-status-success-foreground'
  }
  return colors[level]
}

/**
 * Get border color class for risk level
 */
export function getRiskBorderClass(level: RiskLevel): string {
  const colors: Record<RiskLevel, string> = {
    critical: 'border-status-critical-border',
    high: 'border-status-warning-border',
    medium: 'border-status-caution-border',
    low: 'border-status-success-border'
  }
  return colors[level]
}

/**
 * Get background color with opacity for cards/accents
 */
export function getRiskBgOpacityClass(level: RiskLevel, opacity = 5): string {
  const opacities: Record<number, Record<RiskLevel, string>> = {
    5: {
      critical: 'bg-status-critical-surface',
      high: 'bg-status-warning-surface',
      medium: 'bg-status-caution-surface',
      low: 'bg-status-success-surface'
    },
    10: {
      critical: 'bg-status-critical-surface',
      high: 'bg-status-warning-surface',
      medium: 'bg-status-caution-surface',
      low: 'bg-status-success-surface'
    },
    20: {
      critical: 'bg-status-critical-surface',
      high: 'bg-status-warning-surface',
      medium: 'bg-status-caution-surface',
      low: 'bg-status-success-surface'
    }
  }
  return opacities[opacity]?.[level] || opacities[5][level]
}

/**
 * Check if risk level is actionable (requires attention)
 * Used for Actionable Insights panel (triage view)
 */
export function isActionableRisk(level: RiskLevel): boolean {
  return level === 'critical' || level === 'high'
}

/**
 * Check if risk score meets actionable threshold
 */
export function isActionableRiskScore(
  score: number,
  calibration?: ReviewThresholdCalibration
): boolean {
  const level = getPropagationRiskLevel(score, calibration)
  return isActionableRisk(level)
}

/**
 * Create complete risk profile from metrics
 */
export function createRiskProfile(
  path: string,
  metrics: RiskMetrics,
  calibration?: ReviewThresholdCalibration
): RiskProfile {
  const riskScore = calculateRiskScore(metrics.ca, metrics.instability)

  // Cycle override: any circular dependency is at least high risk
  let level = getPropagationRiskLevel(riskScore, calibration)
  if (metrics.hasCycle && level !== 'critical') {
    level = 'high' // Elevate to high if in cycle
  }

  return {
    path,
    riskScore,
    level,
    ...metrics
  }
}

/**
 * Sort risk profiles by score (descending)
 */
export function sortByRiskScore(profiles: RiskProfile[]): RiskProfile[] {
  return [...profiles].sort((a, b) => b.riskScore - a.riskScore)
}

/**
 * Filter actionable risk items for triage panel
 */
export function filterActionableRisks(
  profiles: RiskProfile[],
  calibration?: ReviewThresholdCalibration
): RiskProfile[] {
  return profiles.filter((p) => isActionableRiskScore(p.riskScore, calibration))
}

/**
 * Get description text for propagation-risk level.
 */
export function getRiskDescription(level: RiskLevel): string {
  return getPropagationRiskBandDescription(level)
}

/**
 * Get human-readable label for blast-radius level.
 */
export function getBlastRadiusLabel(level: RiskLevel): string {
  return getBlastRadiusBandLabel(level)
}

/**
 * Get description text for blast-radius level.
 */
export function getBlastRadiusDescription(level: RiskLevel): string {
  return getBlastRadiusBandDescription(level)
}

/**
 * Architecture metric thresholds for code smells
 */
export const ARCHITECTURE_THRESHOLDS = {
  /** God Object: file depends on too many other files (Ce > threshold) */
  GOD_OBJECT_CE: 15,
  /** Bottleneck: too many files depend on this file (Ca > threshold) */
  BOTTLENECK_CA: 20
} as const

// ============================================================================
// LEGACY FUNCTIONS - Maintained for backward compatibility during migration
// @deprecated Use unified functions above instead
// ============================================================================

/**
 * @deprecated Use getRiskColorClass with RiskLevel instead
 */
export function getRiskColor(category: string): string {
  switch (category) {
    case 'Kritis':
      return 'bg-status-critical-solid'
    case 'Tinggi':
      return 'bg-status-warning-solid'
    case 'Sedang':
      return 'bg-status-caution-solid'
    case 'Rendah':
      return 'bg-status-success-solid'
    default:
      return 'bg-muted'
  }
}

/**
 * @deprecated Use getRiskLevel and unified color system instead
 */
export function getRiskBadgeTone(
  category: string
): 'danger' | 'warning' | 'info' | 'success' {
  switch (category) {
    case 'Kritis':
      return 'danger'
    case 'Tinggi':
      return 'warning'
    case 'Sedang':
      return 'info'
    default:
      return 'success'
  }
}

/**
 * @deprecated Use createRiskProfile and format utilities instead
 */
export function formatRiskProfile(profile: FileRiskProfile): string {
  return `Risiko ${profile.category} (Skor: ${profile.score})`
}
