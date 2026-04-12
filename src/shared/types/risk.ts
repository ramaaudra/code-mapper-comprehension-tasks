/**
 * Unified Propagation Risk System - Based on dependency metrics
 * Risk Score = Ca × I (Afferent Coupling × Instability)
 *
 * Thresholds:
 * - Critical (≥30): critical propagation-risk band - changes may propagate widely
 * - High (15 to <30): elevated propagation risk - test carefully
 * - Medium (5 to <15): moderate propagation risk - review before refactoring
 * - Low (<5): low propagation risk - effects should stay localized
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface RiskThresholds {
  CRITICAL: number
  HIGH: number
  MEDIUM: number
}

/**
 * Unified Risk Metrics - works for both File and Folder/Module level
 */
export interface RiskMetrics {
  ca: number // Afferent Coupling (fan-in): how many depend on this
  ce: number // Efferent Coupling: how many this item depends on
  instability: number // I = Ce / (Ca + Ce), range 0-1
  hasCycle: boolean // Override: any circular dependency = critical
}

/**
 * Complete risk profile with calculated score
 */
export interface RiskProfile extends RiskMetrics {
  path: string // File or folder path
  riskScore: number // Ca × I (automatically 0 if Ca = 0)
  level: RiskLevel // Derived from riskScore and thresholds
}

/**
 * Legacy interface - maintained for backward compatibility during migration
 * @deprecated Use RiskProfile instead
 */
export type RiskCategory = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis'

/**
 * Risk factors from backend
 * Contains both legacy (indegree/outdegree) and new (ca/ce/instability) fields
 */
export interface FileRiskFactors {
  /** @deprecated Use ca (Afferent Coupling) instead */
  indegree: number
  /** @deprecated Use ce (Efferent Coupling) instead */
  outdegree: number
  inCycle: boolean
  /** Afferent Coupling: how many files import this file */
  ca: number
  /** Efferent Coupling: how many files this file imports */
  ce: number
  /** Instability: I = Ce / (Ca + Ce), range 0-1 */
  instability: number
}

/**
 * Risk profile from backend
 * Uses unified Ca × I formula with cycle override
 */
export interface FileRiskProfile {
  file: string
  score: number
  level: RiskLevel
  /** @deprecated Use level instead. Maintained for compatibility during migration. */
  category: RiskCategory
  factors: FileRiskFactors
}

/**
 * API-compatible risk profile shape during migration.
 * Supports older payloads that still send only legacy category labels.
 */
export interface ApiFileRiskProfile extends Omit<
  FileRiskProfile,
  'level' | 'category'
> {
  level?: RiskLevel
  category?: RiskCategory
}
