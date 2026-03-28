import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'

export interface MetricsGuideMetric {
  id: string
  title: string
  family: 'Codebase Signals' | 'Impact Estimates' | 'Review Priorities'
  whatItMeans: string
  whyYouShouldCare: string
  whatYouShouldDo: string
  visualAnalogyTitle: string
  visualAnalogyDescription: string
  formula?: string
  whereYouSeeIt?: string[]
  caveat?: string
}

export interface MetricsGuideScreenUsage {
  id: string
  ifYouWantToKnow: string
  goTo: string
  youWillGet: string
}

export interface MetricsGuideGlossaryItem {
  term: string
  definition: string
  practicalMeaning: string
}

export interface MetricsGuideQuickVisual {
  id: string
  title: string
  summary: string
  takeaway: string
}

export interface MetricsGuidePriorityQuadrant {
  title: string
  action: string
}

export const metricsGuidePrinciples = [
  {
    label: 'High is not always bad',
    text: "High numbers don't always mean bad code. They mean you need to look closer."
  },
  {
    label: 'Combine to decide',
    text: 'Each metric answers one question. Combine them to see the full picture.'
  },
  {
    label: 'App prioritizes for you',
    text: 'Start with "What should I review first?" — the app already prioritizes based on signals.'
  }
]

export const metricsGuideHeroInsight = {
  title: 'What this guide will help you do',
  actions: [
    {
      question: 'Where should I start reviewing?',
      answer:
        'Check the Overview page. It shows critical hotspots and shared areas first.'
    },
    {
      question: 'Is this file safe to refactor?',
      answer:
        'Open Node Detail. Read the diagnosis — it tells you the risk level and what to check.'
    },
    {
      question: 'What happens if I change this module?',
      answer:
        'Look at Propagation Risk and Blast Radius. Higher values suggest wider testing scope.'
    }
  ]
}

const propagationRiskSignal = getReviewSignalDefinition('propagationRisk')
const blastRadiusSignal = getReviewSignalDefinition('blastRadius')
const hotspotStatusSignal = getReviewSignalDefinition('hotspotStatus')

export const metricsGuideQuickVisuals: MetricsGuideQuickVisual[] = [
  {
    id: 'dependents',
    title: 'Dependents (Ca)',
    summary: 'Many other files point into this item.',
    takeaway:
      'Changes here may need broader review because more areas rely on it.'
  },
  {
    id: 'dependencies',
    title: 'Dependencies (Ce)',
    summary: 'This item points out to many other files.',
    takeaway: 'High Ce often means the item is harder to change in isolation.'
  },
  {
    id: 'instability',
    title: 'Instability (I)',
    summary: 'Shows structural position from foundational to outward-facing.',
    takeaway:
      'High instability is common in UI and adapters. It is not automatically a bad sign.'
  }
]

export const metricsGuideDecisionQuadrants: Record<
  'criticalHotspot' | 'activeLocal' | 'sharedFoundation' | 'likelyLocal',
  MetricsGuidePriorityQuadrant
> = {
  criticalHotspot: {
    title: 'Critical Hotspot',
    action: 'Review here first. This area is both active and widely shared.'
  },
  activeLocal: {
    title: 'Active but Local',
    action: 'Review recent changes, but impact is likely contained.'
  },
  sharedFoundation: {
    title: 'Shared Foundation',
    action: 'Test widely when changed. Code here is reused by many.'
  },
  likelyLocal: {
    title: 'Likely Local Change',
    action: 'Monitor casually. Impact is contained and churn is low.'
  }
}

export const metricsGuideMetrics: MetricsGuideMetric[] = [
  {
    id: 'dependents',
    title: 'Dependents (Ca)',
    family: 'Codebase Signals',
    whatItMeans: 'How many files or modules depend on the current item.',
    whyYouShouldCare:
      'Higher values usually mean a wider review surface when the item changes.',
    whatYouShouldDo:
      'Check which files depend on this before making changes. Plan wider review if Ca > 10.',
    visualAnalogyTitle: 'Many inputs flow into one shared point',
    visualAnalogyDescription:
      'Think of Ca as incoming traffic. The more areas point here, the more places may care about the change.',
    caveat:
      'High Ca does not mean the code is bad. It simply means more areas may need review.',
    whereYouSeeIt: ['Overview', 'Node Detail', 'Architecture']
  },
  {
    id: 'dependencies',
    title: 'Dependencies (Ce)',
    family: 'Codebase Signals',
    whatItMeans: 'How many files or modules the current item depends on.',
    whyYouShouldCare:
      'Higher values usually mean the item relies on more external code and carries more coupling complexity.',
    whatYouShouldDo:
      'Review if all dependencies are truly needed or if some can be removed. If Ce > 15, consider splitting responsibilities.',
    visualAnalogyTitle: 'One item fans out into many dependencies',
    visualAnalogyDescription:
      'Think of Ce as outgoing reliance. The more connections leave this item, the harder it may be to change in isolation.',
    caveat:
      'High Ce is a warning signal for review, not proof that a design is wrong.',
    whereYouSeeIt: ['Node Detail', 'Architecture']
  },
  {
    id: 'instability',
    title: 'Instability (I)',
    family: 'Codebase Signals',
    whatItMeans:
      'Shows where this item sits on the spectrum from foundational to outward-facing.',
    whyYouShouldCare:
      'It helps explain whether a module sits in a shared foundation or closer to UI/adapter layers.',
    whatYouShouldDo:
      'Combine with Ca to understand change impact. High I + High Ca = changes spread wide. Low I + High Ca = shared foundation.',
    visualAnalogyTitle: 'A spectrum from foundational to outward-facing',
    visualAnalogyDescription:
      'Instability is a position indicator. Read it as structure, not as danger.',
    caveat:
      'High instability is common in presentation and adapter layers. It is not automatically bad.',
    formula: 'I = Ce / (Ca + Ce)',
    whereYouSeeIt: ['Overview', 'Architecture', 'Node Detail']
  },
  {
    id: 'relative-churn',
    title: 'Relative Churn',
    family: 'Codebase Signals',
    whatItMeans: 'How much this file changed recently, compared to its size.',
    whyYouShouldCare:
      'It highlights active areas more fairly than raw changed lines alone.',
    whatYouShouldDo:
      'Check recent commit history to understand what is driving the changes. High relative churn means the area is still unstable.',
    visualAnalogyTitle: 'How much has this file been rewritten recently?',
    visualAnalogyDescription:
      'Relative Churn compares recent changes to file size, so small but heavily edited files stand out just like large ones.',
    caveat:
      'Values can be above 1.0 when an item is heavily rewritten in the selected time window.',
    formula: 'Relative Churn = churn LOC / effective LOC',
    whereYouSeeIt: ['Overview', 'Graph', 'Node Detail', 'Architecture']
  },
  {
    id: 'propagation-risk',
    title: 'Propagation Risk',
    family: 'Impact Estimates',
    whatItMeans:
      'Estimates how widely your changes might spread through the codebase.',
    whyYouShouldCare: propagationRiskSignal.whyItExists,
    whatYouShouldDo:
      'Review dependent files before making changes. Critical or High risk suggests the need for broader regression checks before merging.',
    visualAnalogyTitle: 'Shared reuse plus outward pull can widen spread',
    visualAnalogyDescription:
      'Propagation Risk combines structural reuse and structural position to estimate how widely a change may travel.',
    caveat: propagationRiskSignal.scientificStatusNote,
    formula: 'Propagation Risk = Ca × I',
    whereYouSeeIt: ['Overview', 'Architecture', 'Node Detail']
  },
  {
    id: 'blast-radius',
    title: 'Blast Radius',
    family: 'Impact Estimates',
    whatItMeans:
      'Estimates how many nearby files you should test after changing this one.',
    whyYouShouldCare: blastRadiusSignal.whyItExists,
    whatYouShouldDo:
      'Use this to scope your testing. Higher radius means more test coverage is needed for dependents and dependencies.',
    visualAnalogyTitle: 'A local ring of nearby verification effort',
    visualAnalogyDescription:
      'Blast Radius is about nearby impact around one file change, not repository-wide spread.',
    caveat: blastRadiusSignal.scientificStatusNote,
    formula: 'Blast Radius = Ca + (Ce × 0.5)',
    whereYouSeeIt: ['Node Detail']
  },
  {
    id: 'hotspot-score',
    title: 'Hotspot Score',
    family: 'Review Priorities',
    whatItMeans:
      'A score that combines how active and how structurally sensitive this area is.',
    whyYouShouldCare:
      'It helps prioritize areas that are both active and important to review.',
    whatYouShouldDo:
      'Prioritize these areas for code review and extra testing before making changes.',
    visualAnalogyTitle: 'Recent activity plus structural sensitivity',
    visualAnalogyDescription:
      'Hotspot score rewards overlap between heavy recent change and meaningful architectural sensitivity.',
    caveat:
      'This score is repo-relative and helps with relative ranking, not universal scientific judgment.',
    formula:
      'Hotspot Score = percentile(relative churn 30d) × percentile(structural risk)',
    whereYouSeeIt: ['Overview', 'Graph', 'Architecture']
  },
  {
    id: 'hotspot-status',
    title: 'Hotspot Status',
    family: 'Review Priorities',
    whatItMeans: 'A quick label that categorizes if this area needs attention.',
    whyYouShouldCare: hotspotStatusSignal.whyItExists,
    whatYouShouldDo:
      'Start reviewing Critical hotspots first. Treat it as a prioritization band: critical first, active later, stable lower priority.',
    visualAnalogyTitle: 'A readable review band on top of ranking data',
    visualAnalogyDescription:
      'Status labels translate numeric ranking into quick review language so you can decide faster.',
    caveat: hotspotStatusSignal.scientificStatusNote,
    whereYouSeeIt: ['Graph', 'Node Detail', 'Architecture']
  }
]

export const metricsGuideScreenUsage: MetricsGuideScreenUsage[] = [
  {
    id: 'overview',
    ifYouWantToKnow: 'what deserves review first',
    goTo: 'Overview',
    youWillGet:
      'hotspots and shared areas prioritized by activity and structural impact.'
  },
  {
    id: 'node-detail',
    ifYouWantToKnow: 'the local consequences of changing one file',
    goTo: 'Node Detail',
    youWillGet:
      'a risk diagnosis, actionable guidance, and top drivers for change in that specific code.'
  },
  {
    id: 'architecture',
    ifYouWantToKnow: 'the structural health of larger modules',
    goTo: 'Architecture',
    youWillGet: 'metrics to sort modules by spread risk or hotspot priority.'
  },
  {
    id: 'graph',
    ifYouWantToKnow: 'how a module is uniquely connected to its neighbors',
    goTo: 'Graph',
    youWillGet: 'a visual map of direct relationships and dependencies.'
  }
]

export const metricsGuideCaveats = [
  'High instability does not mean poor design.',
  'Low propagation risk does not mean zero review effort.',
  hotspotStatusSignal.scientificStatusNote,
  propagationRiskSignal.scientificStatusNote,
  'Metrics support engineering judgment; they do not replace context.'
]

export const metricsGuideGlossary: MetricsGuideGlossaryItem[] = [
  {
    term: 'Dependents (Ca)',
    definition: 'The number of files or modules that depend on an item.',
    practicalMeaning: 'Higher values usually suggest broader review scope.'
  },
  {
    term: 'Dependencies (Ce)',
    definition: 'The number of files or modules an item depends on.',
    practicalMeaning: 'Higher values usually suggest more external reliance.'
  },
  {
    term: 'Instability (I)',
    definition: 'A structural position metric derived from Ca and Ce.',
    practicalMeaning:
      'Helps explain whether an item is more foundational or outward-facing.'
  },
  {
    term: 'Propagation Risk',
    definition: 'A derived estimate that combines Ca and I.',
    practicalMeaning: 'Highlights modules where change may spread more widely.'
  },
  {
    term: 'Blast Radius',
    definition: 'A file-level heuristic for nearby verification scope.',
    practicalMeaning:
      'Useful when estimating whether a file change is likely to stay local.'
  },
  {
    term: 'Relative Churn',
    definition: 'Recent change activity normalized by current code size.',
    practicalMeaning: 'Helps identify active areas that may still be unstable.'
  },
  {
    term: 'Evolutionary Hotspot Score',
    definition:
      'A ranking heuristic that blends churn and structural sensitivity.',
    practicalMeaning: 'Helps prioritize modules for closer review.'
  },
  {
    term: 'Hotspot Status',
    definition: 'A readable hotspot band based on repo-relative ranking.',
    practicalMeaning:
      'Tells you whether an area is stable, active, or review-critical.'
  }
]
