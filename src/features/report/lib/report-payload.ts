import type { ReportBootstrapData, ReportData } from '../types'

export const REPORT_PAYLOAD_ELEMENT_ID = 'code-mapper-report-data'

export interface ReportWindowLike {
  __CODE_MAPPER_DATA__?: ReportData
  __CODE_MAPPER_REPORT_BOOTSTRAP__?: ReportBootstrapData
}

interface ReportPayloadDocumentLike {
  getElementById: (id: string) => {
    textContent: string | null
  } | null
}

export function parseSerializedReportData(
  serializedData: string | null | undefined
): ReportData | null {
  if (!serializedData) {
    return null
  }

  try {
    return JSON.parse(serializedData) as ReportData
  } catch {
    return null
  }
}

export function readEmbeddedReportBootstrap(
  reportWindow: ReportWindowLike
): ReportBootstrapData | null {
  return reportWindow.__CODE_MAPPER_REPORT_BOOTSTRAP__ ?? null
}

export function readEmbeddedReportData(
  reportDocument: ReportPayloadDocumentLike,
  reportWindow?: ReportWindowLike
): ReportData | null {
  const serializedPayload =
    reportDocument.getElementById(REPORT_PAYLOAD_ELEMENT_ID)?.textContent ??
    null

  return (
    parseSerializedReportData(serializedPayload) ??
    reportWindow?.__CODE_MAPPER_DATA__ ??
    null
  )
}
