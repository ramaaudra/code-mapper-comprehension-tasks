import { normalizePath } from '@/shared/lib/utils'

interface GraphStatusSignatureInput {
  filesInCycle: Set<string>
  orphanFilesSet: Set<string>
  brokenFilesSet: Set<string>
  newOrphansSet: Set<string>
}

function createPathSetSignature(paths: Set<string>): string {
  return [...paths].map(normalizePath).sort().join('|')
}

export function createGraphStatusSignature(
  input: GraphStatusSignatureInput
): string {
  return [
    `cycle:${createPathSetSignature(input.filesInCycle)}`,
    `orphan:${createPathSetSignature(input.orphanFilesSet)}`,
    `broken:${createPathSetSignature(input.brokenFilesSet)}`,
    `new-orphan:${createPathSetSignature(input.newOrphansSet)}`
  ].join('::')
}
