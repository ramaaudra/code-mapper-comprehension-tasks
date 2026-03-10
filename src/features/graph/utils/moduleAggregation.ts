export type ModuleRelationToFocus =
  | 'overview'
  | 'focus'
  | 'incoming'
  | 'outgoing'
  | 'bidirectional'

export interface ModuleNodeData extends Record<string, unknown> {
  id: string
  folderPath: string
  fileCount: number
  totalIncoming: number
  totalOutgoing: number
  incomingModules: string[]
  outgoingModules: string[]
  riskScore: number
  instability: number
  isZoneOfPain: boolean
  hotspotScore?: number
  hotspotStatus?:
    | 'stable'
    | 'active'
    | 'high-review-needed'
    | 'critical-hotspot'
  relationToFocus?: ModuleRelationToFocus
  isFocusContext?: boolean
  isSelected?: boolean
  isHighlighted?: boolean
}

export interface ModuleEdgeData extends Record<string, unknown> {
  source: string
  target: string
  weight: number
  showLabel?: boolean
  isFocusEdge?: boolean
}
