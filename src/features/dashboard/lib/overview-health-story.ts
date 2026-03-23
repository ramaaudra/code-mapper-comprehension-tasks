export interface OverviewHealthStoryInput {
  cycleCount: number
  criticalRiskCount: number
  warningRiskCount: number
  orphanCount: number
  stabilityScore: number
}

export interface OverviewHealthStory {
  tone: 'critical' | 'warning' | 'healthy'
  headline: string
  summary: string
  drivers: string[]
}

export function getOverviewHealthStory(
  input: OverviewHealthStoryInput
): OverviewHealthStory {
  if (input.cycleCount > 0) {
    return {
      tone: 'critical',
      headline: 'Unsafe to refactor broadly right now',
      summary:
        'Cycles are still active and shared modules can spread changes farther than a local edit.',
      drivers: [
        `${input.cycleCount} dependency cycle${input.cycleCount === 1 ? '' : 's'} still block safer refactors.`,
        `${input.criticalRiskCount} shared area${input.criticalRiskCount === 1 ? '' : 's'} ${input.criticalRiskCount === 1 ? 'sits' : 'sit'} in the critical spread-risk band.`,
        `${input.orphanCount} cleanup candidate${input.orphanCount === 1 ? '' : 's'} can wait until the blockers are gone.`
      ]
    }
  }

  if (input.criticalRiskCount > 0 || input.warningRiskCount > 0) {
    const focusCount =
      input.criticalRiskCount > 0
        ? input.criticalRiskCount
        : input.warningRiskCount

    return {
      tone: 'warning',
      headline: 'Mostly safe for focused changes',
      summary:
        focusCount === 1
          ? 'One shared area still deserves broader review before you treat the system as low-risk.'
          : 'A few shared areas still deserve broader review before you treat the system as low-risk.',
      drivers: [
        input.criticalRiskCount > 0
          ? `${input.criticalRiskCount} shared area${input.criticalRiskCount === 1 ? '' : 's'} still need critical review coverage.`
          : `${input.warningRiskCount} shared area${input.warningRiskCount === 1 ? '' : 's'} still need broader verification.`,
        input.orphanCount > 0
          ? `${input.orphanCount} cleanup candidate${input.orphanCount === 1 ? '' : 's'} remain secondary follow-up work.`
          : 'No cleanup backlog is competing with the review queue right now.'
      ]
    }
  }

  return {
    tone: 'healthy',
    headline: 'Safe for focused refactors',
    summary:
      'No cycles or elevated spread-risk areas are pushing this repository out of its normal review posture.',
    drivers: [
      'No dependency cycles are blocking structural cleanup.',
      input.orphanCount > 0
        ? `${input.orphanCount} cleanup candidate${input.orphanCount === 1 ? '' : 's'} can be handled during maintenance.`
        : 'No cleanup backlog is competing with feature work right now.'
    ]
  }
}
