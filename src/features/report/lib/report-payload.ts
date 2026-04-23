import type { ReportBootstrapData, ReportData } from '../types'

export const REPORT_PAYLOAD_ELEMENT_ID = 'tauta-report-data'
export const LEGACY_REPORT_PAYLOAD_ELEMENT_ID = 'code-mapper-report-data'
export const REPORT_BOOTSTRAP_GLOBAL = '__TAUTA_REPORT_BOOTSTRAP__'
export const LEGACY_REPORT_BOOTSTRAP_GLOBAL = '__CODE_MAPPER_REPORT_BOOTSTRAP__'
export const REPORT_DATA_GLOBAL = '__TAUTA_DATA__'
export const LEGACY_REPORT_DATA_GLOBAL = '__CODE_MAPPER_DATA__'

const REPORT_BOOTSTRAP_GLOBALS = [
  REPORT_BOOTSTRAP_GLOBAL,
  LEGACY_REPORT_BOOTSTRAP_GLOBAL
] as const

const REPORT_DATA_GLOBALS = [
  REPORT_DATA_GLOBAL,
  LEGACY_REPORT_DATA_GLOBAL
] as const

const REPORT_PAYLOAD_ELEMENT_IDS = [
  REPORT_PAYLOAD_ELEMENT_ID,
  LEGACY_REPORT_PAYLOAD_ELEMENT_ID
] as const

export interface ReportWindowLike {
  __TAUTA_DATA__?: ReportData
  __CODE_MAPPER_DATA__?: ReportData
  __TAUTA_REPORT_BOOTSTRAP__?: ReportBootstrapData
  __CODE_MAPPER_REPORT_BOOTSTRAP__?: ReportBootstrapData
}

interface ReportPayloadDocumentLike {
  getElementById: (id: string) => {
    textContent: string | null
  } | null
}

function readFirstWindowValue<T>(
  keys: readonly string[],
  readValue: (key: string) => T | undefined
): T | null {
  for (const key of keys) {
    const value = readValue(key)
    if (value != null) {
      return value
    }
  }

  return null
}

function readFirstElementText(
  reportDocument: ReportPayloadDocumentLike,
  elementIds: readonly string[]
): string | null {
  for (const elementId of elementIds) {
    const textContent = reportDocument.getElementById(elementId)?.textContent
    if (textContent) {
      return textContent
    }
  }

  return null
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
  return readFirstWindowValue(
    REPORT_BOOTSTRAP_GLOBALS,
    (key) =>
      reportWindow[key as keyof ReportWindowLike] as
        | ReportBootstrapData
        | undefined
  )
}

export function readEmbeddedReportData(
  reportDocument: ReportPayloadDocumentLike,
  reportWindow?: ReportWindowLike
): ReportData | null {
  const serializedPayload = readFirstElementText(
    reportDocument,
    REPORT_PAYLOAD_ELEMENT_IDS
  )

  return (
    parseSerializedReportData(serializedPayload) ??
    (reportWindow
      ? readFirstWindowValue(
          REPORT_DATA_GLOBALS,
          (key) =>
            reportWindow[key as keyof ReportWindowLike] as
              | ReportData
              | undefined
        )
      : null) ??
    null
  )
}
