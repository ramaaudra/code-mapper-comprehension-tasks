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
  isSelected?: boolean
  isHighlighted?: boolean
}

export interface ModuleEdgeData extends Record<string, unknown> {
  source: string
  target: string
  weight: number
}
