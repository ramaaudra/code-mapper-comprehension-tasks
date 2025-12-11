import type { FileRiskProfile } from '@/shared/types/risk'

/**
 * Get Tailwind CSS color class based on risk category
 */
export function getRiskColor(category: string): string {
  switch (category) {
    case 'Kritis':
      return 'bg-red-500'
    case 'Tinggi':
      return 'bg-orange-500'
    case 'Sedang':
      return 'bg-yellow-500'
    case 'Rendah':
      return 'bg-green-500'
    default:
      return 'bg-gray-500'
  }
}

/**
 * Get risk badge tone for DependencyNode
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
 * Format risk profile for display
 */
export function formatRiskProfile(profile: FileRiskProfile): string {
  return `Risiko ${profile.category} (Skor: ${profile.score})`
}
