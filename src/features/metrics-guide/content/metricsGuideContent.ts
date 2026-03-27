import { getReviewSignalDefinition } from '@/shared/lib/metric-thresholds'

export interface MetricsGuideMetric {
  id: string
  title: string
  family: 'Core Metric' | 'Derived Heuristic' | 'Review Heuristic'
  shortDefinition: string
  whyItMatters: string
  practicalRead: string
  whenToCare: string
  quickAction: string
  caveat: string
  visualAnalogyTitle: string
  visualAnalogyDescription: string
  formula?: string
  screens: string[]
}

export interface MetricsGuideScreenHelp {
  id: string
  title: string
  summary: string
  bullets: string[]
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

export interface MetricsGuideDecisionState {
  id: string
  title: string
  summary: string
  tone: 'danger' | 'warning' | 'info' | 'success'
}

export const metricsGuidePrinciples = [
  {
    label: 'High is not bad',
    text: "High numbers don't always mean bad code. They mean you need to look closer."
  },
  {
    label: 'Combine to decide',
    text: 'Each metric answers one question. Combine them to see the full picture.'
  },
  {
    label: 'App prioritizes for you',
    text: 'Start with "What should I review first?" — the app already prioritized for you.'
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
        'Open Node Detail. Read the diagnosis card — it tells you the risk level and what to check.'
    },
    {
      question: 'What happens if I change this module?',
      answer:
        'Look at Propagation Risk and Blast Radius. Higher values mean wider testing scope.'
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
    summary:
      'Instability shows structural position from foundational to outward-facing.',
    takeaway:
      'High instability is common in UI and adapters. It is not automatically a bad sign.'
  }
]

export const metricsGuideDecisionStates: MetricsGuideDecisionState[] = [
  {
    id: 'critical-hotspot',
    title: 'Critical Hotspot',
    summary: 'Active and broadly shared. Review here first.',
    tone: 'danger'
  },
  {
    id: 'active-local',
    title: 'Active but Local',
    summary: 'Changing often, but still more contained.',
    tone: 'warning'
  },
  {
    id: 'shared-foundation',
    title: 'Shared Foundation',
    summary: 'Widely reused, even when change pressure is calmer.',
    tone: 'info'
  },
  {
    id: 'likely-local',
    title: 'Likely Local Change',
    summary: 'More contained and under lower review pressure.',
    tone: 'success'
  }
]

export const metricsGuideMetrics: MetricsGuideMetric[] = [
  {
    id: 'dependents',
    title: 'Dependents (Ca)',
    family: 'Core Metric',
    shortDefinition: 'How many files or modules depend on the current item.',
    whyItMatters:
      'Higher values usually mean a wider review surface when the item changes.',
    practicalRead:
      'Use this to spot shared foundations that may need broader testing or reviewer attention.',
    whenToCare:
      'When Ca > 10, changes here affect many other files. Plan wider review.',
    quickAction: 'Check which files depend on this before making changes.',
    caveat:
      'High Ca does not mean the code is bad. It means more areas may need review.',
    visualAnalogyTitle: 'Many inputs flow into one shared point',
    visualAnalogyDescription:
      'Think of Ca as incoming traffic. The more areas point here, the more places may care about the change.',
    screens: ['Overview', 'Node Detail', 'Architecture']
  },
  {
    id: 'dependencies',
    title: 'Dependencies (Ce)',
    family: 'Core Metric',
    shortDefinition: 'How many files or modules the current item depends on.',
    whyItMatters:
      'Higher values usually mean the item relies on more external code and carries more coupling complexity.',
    practicalRead:
      'Use this to spot modules or files that may be carrying too many responsibilities.',
    whenToCare:
      'When Ce > 15, this file might be doing too much. Consider splitting.',
    quickAction:
      'Review if all dependencies are truly needed or if some can be removed.',
    caveat:
      'High Ce is a warning signal for review, not proof that a design is wrong.',
    visualAnalogyTitle: 'One item fans out into many dependencies',
    visualAnalogyDescription:
      'Think of Ce as outgoing reliance. The more connections leave this item, the harder it may be to change in isolation.',
    screens: ['Node Detail', 'Architecture']
  },
  {
    id: 'instability',
    title: 'Instability (I)',
    family: 'Core Metric',
    shortDefinition:
      'Shows where this item sits on the spectrum from foundational to outward-facing.',
    whyItMatters:
      'It helps explain whether a module sits in a shared foundation or closer to UI/adapter layers.',
    practicalRead:
      'Use it with Spread Risk, not on its own, when deciding review scope.',
    whenToCare:
      'High I (>.7) + High Ca = changes spread wide. Low I (<.3) + High Ca = shared foundation.',
    quickAction:
      'Combine with Ca to understand change impact, not just position.',
    caveat:
      'High instability is common in presentation and adapter layers. It is not automatically bad.',
    visualAnalogyTitle: 'A spectrum from foundational to outward-facing',
    visualAnalogyDescription:
      'Instability is a position indicator. Read it as structure, not as danger.',
    formula: 'I = Ce / (Ca + Ce)',
    screens: ['Overview', 'Architecture', 'Node Detail']
  },
  {
    id: 'relative-churn',
    title: 'Relative Churn',
    family: 'Core Metric',
    shortDefinition:
      'How much this file changed recently, compared to its size.',
    whyItMatters:
      'It highlights active areas more fairly than raw changed lines alone.',
    practicalRead:
      'Use it to spot files or modules that are still changing heavily and may need closer review.',
    whenToCare:
      'When churn > 30% in 30 days, the area is still unstable. Review recent commits.',
    quickAction:
      'Check recent commit history to understand what is driving the changes.',
    caveat:
      'Values can be above 1.0 when an item is heavily rewritten in the selected time window.',
    visualAnalogyTitle: 'How much has this file been rewritten recently?',
    visualAnalogyDescription:
      'Relative Churn compares recent changes to file size, so small but heavily edited files stand out just like large ones.',
    formula: 'Relative Churn = churn LOC / effective LOC',
    screens: ['Overview', 'Graph', 'Node Detail', 'Architecture']
  },
  {
    id: 'propagation-risk',
    title: 'Propagation Risk',
    family: 'Derived Heuristic',
    shortDefinition:
      'Estimates how widely your changes might spread through the codebase.',
    whyItMatters: propagationRiskSignal.whyItExists,
    practicalRead:
      'Use this to find areas that deserve broader regression checks before merging.',
    whenToCare:
      'Critical or High = run broader tests before merging. Changes here ripple out.',
    quickAction:
      'Review dependent files before making changes. Consider smaller, incremental updates.',
    caveat: propagationRiskSignal.scientificStatusNote,
    visualAnalogyTitle: 'Shared reuse plus outward pull can widen spread',
    visualAnalogyDescription:
      'Propagation Risk combines structural reuse and structural position to estimate how widely a change may travel.',
    formula: 'Propagation Risk = Ca × I',
    screens: ['Overview', 'Architecture', 'Node Detail']
  },
  {
    id: 'blast-radius',
    title: 'Blast Radius',
    family: 'Derived Heuristic',
    shortDefinition:
      'Estimates how many nearby files you should test after changing this one.',
    whyItMatters: blastRadiusSignal.whyItExists,
    practicalRead:
      'Use this as a supporting verification signal in file detail views when planning refactors or choosing test scope.',
    whenToCare:
      'Critical or High = test dependents and dependencies. Medium = spot check related files.',
    quickAction:
      'Use this to scope your testing. Higher radius = more test coverage needed.',
    caveat: blastRadiusSignal.scientificStatusNote,
    visualAnalogyTitle: 'A local ring of nearby verification effort',
    visualAnalogyDescription:
      'Blast Radius is about nearby impact around one file change, not repository-wide spread.',
    formula: 'Blast Radius = Ca + (Ce × 0.5)',
    screens: ['Node Detail']
  },
  {
    id: 'hotspot-score',
    title: 'Hotspot Score',
    family: 'Review Heuristic',
    shortDefinition: 'Combines how active and how sensitive this area is.',
    whyItMatters:
      'It helps prioritize areas that are both active and important to review.',
    practicalRead:
      'Use it to find modules that deserve closer review because they combine recent churn and structural impact.',
    whenToCare:
      'High score = this area is both busy and important. Review carefully before changes.',
    quickAction: 'Prioritize these areas for code review and extra testing.',
    caveat:
      'This score is repo-relative and supports ranking, not universal scientific judgment.',
    visualAnalogyTitle: 'Recent activity plus structural sensitivity',
    visualAnalogyDescription:
      'Hotspot score rewards overlap between heavy recent change and meaningful architectural sensitivity.',
    formula:
      'Hotspot Score = percentile(relative churn 30d) × percentile(structural risk)',
    screens: ['Overview', 'Graph', 'Architecture']
  },
  {
    id: 'hotspot-status',
    title: 'Hotspot Status',
    family: 'Review Heuristic',
    shortDefinition:
      'A quick label that tells you if this area needs attention.',
    whyItMatters: hotspotStatusSignal.whyItExists,
    practicalRead:
      'Treat it as a prioritization band: critical first, active later, stable lower priority.',
    whenToCare:
      'Critical = review first. High = review soon. Active = monitor. Stable = low priority.',
    quickAction:
      'Start with critical hotspots. They combine activity and impact.',
    caveat: hotspotStatusSignal.scientificStatusNote,
    visualAnalogyTitle: 'A readable review band on top of ranking data',
    visualAnalogyDescription:
      'Status labels translate numeric ranking into quick review language so you can decide faster.',
    screens: ['Graph', 'Node Detail', 'Architecture']
  }
]

export const metricsGuideScreenHelp: MetricsGuideScreenHelp[] = [
  {
    id: 'overview',
    title: 'Overview',
    summary: 'Use this page as your triage screen.',
    bullets: [
      'Start Here shows what to review first and where to click next.',
      'Review First combines two lenses: shared change spread and recent change pressure.',
      'System Context is supporting evidence, not your first action surface.'
    ]
  },
  {
    id: 'graph',
    title: 'Graph',
    summary:
      'Use the graph to understand relationships, not to read every metric in full.',
    bullets: [
      'Node labels show quick signals about activity, spread, and relation to the focus item.',
      'Open the detail panel when you need the full reasoning behind a recommendation.',
      'Focused graphs help you inspect local neighborhoods before making a change.'
    ]
  },
  {
    id: 'node-detail',
    title: 'Node Detail',
    summary:
      'Use this panel for decision support before you edit a file or module.',
    bullets: [
      'Read the diagnosis first, then the action guidance, then the top drivers.',
      'Evidence cards and Blast Radius provide supporting context behind the diagnosis, not a separate verdict.',
      'Open Why this recommendation when you need formulas, thresholds, or scientific context.'
    ]
  },
  {
    id: 'architecture',
    title: 'Architecture',
    summary:
      'Use this page to inspect modules in detail once you know where to start.',
    bullets: [
      'Sort by Spread Risk to find shared modules that may need broader testing.',
      'Sort by Hotspot Priority to find modules under recent change pressure.',
      'Use expanded rows to inspect file-level patterns inside a module.'
    ]
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
    practicalMeaning: 'Higher values usually mean broader review scope.'
  },
  {
    term: 'Dependencies (Ce)',
    definition: 'The number of files or modules an item depends on.',
    practicalMeaning: 'Higher values usually mean more external reliance.'
  },
  {
    term: 'Instability (I)',
    definition: 'A structural position metric derived from Ca and Ce.',
    practicalMeaning:
      'Helps explain whether an item is more foundational or outward-facing.'
  },
  {
    term: 'Propagation Risk',
    definition: 'A derived heuristic that combines Ca and I.',
    practicalMeaning: 'Highlights modules where change may spread more widely.'
  },
  {
    term: 'Blast Radius',
    definition: 'A file-level heuristic for nearby verification scope.',
    practicalMeaning:
      'Useful when deciding whether a file change is likely to stay local.'
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
