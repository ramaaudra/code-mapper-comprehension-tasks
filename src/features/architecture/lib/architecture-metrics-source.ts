interface FileArchitectureMetricsFetchInput {
  hasFilePath: boolean
  hasStaticArchitectureData: boolean
}

export function shouldFetchFileArchitectureMetrics(
  input: FileArchitectureMetricsFetchInput
): boolean {
  return input.hasFilePath && !input.hasStaticArchitectureData
}
