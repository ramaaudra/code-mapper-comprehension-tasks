import assert from 'node:assert/strict'
import test from 'node:test'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderToStaticMarkup } from 'react-dom/server'

import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { DataContext } from '@/shared/context/DataContext'

import { ModuleSidePanel } from './ModuleSidePanel'

import type {
  FileArchitectureMetrics,
  FolderArchitectureMetrics
} from '@/features/architecture/types/architecture'
import type { AnalysisData } from '@/shared/types/analysis'

function createModuleData(): FolderArchitectureMetrics {
  return {
    folderPath: 'position',
    fileCount: 4,
    ca: 0,
    ce: 0,
    instability: 0,
    hasCycle: false,
    couplingTo: {},
    couplingFrom: {},
    evolution: {
      effectiveLoc: 13,
      churn30d: {
        windowDays: 30,
        churnLoc: 0,
        commitCount: 0,
        relativeChurn: 0
      },
      churn90d: {
        windowDays: 90,
        churnLoc: 0,
        commitCount: 0,
        relativeChurn: 0
      },
      relativeChurnPercentile: 0,
      structuralRiskPercentile: 0,
      hotspotScore: 0,
      hotspotPercentile: 0,
      hotspotStatus: 'stable',
      changedFileCount30d: 0
    },
    connascenceSignals: [
      {
        kind: 'fragile-positional-api',
        signalKey:
          'fragile-positional-api:/repo/position/contract.ts#createUser',
        title: 'Fragile Positional API',
        symbolName: 'createUser',
        declaredIn: '/repo/position/contract.ts',
        targetFiles: [
          '/repo/position/caller-a.ts',
          '/repo/position/caller-b.ts'
        ],
        requiredParamCount: 4,
        callerCount: 2,
        moduleBoundaryCount: 1,
        severity: 'high',
        confidence: 'high',
        whyItMatters:
          'This exported API relies on argument order across 2 cross-file call sites.',
        recommendedAction:
          'Review the linked call sites before changing the signature.',
        evidence: []
      }
    ]
  }
}

function createFileData(): FileArchitectureMetrics[] {
  return [
    {
      filePath: '/repo/position/contract.ts',
      moduleKey: 'position',
      ca: 2,
      ce: 0,
      instability: 0,
      hasCycle: false
    }
  ]
}

function createAnalysisData(): AnalysisData {
  return {
    nodes: [],
    edges: [],
    fileTree: [],
    dependencyMap: {},
    riskAnalysis: [],
    connascenceInsights: {
      summary: {
        availability: 'available',
        unavailableReason: null,
        fragilePositionalApiCount: 1,
        sharedTypeContractCount: 0
      },
      fileSignals: {},
      moduleSignals: {}
    },
    evolutionaryMetrics: {
      summary: {
        availability: 'available',
        unavailableReason: null,
        averageRelativeChurn30d: 0,
        averageRelativeChurn90d: 0,
        filesWithChurn30d: 0,
        filesWithCriticalHotspots: 0,
        filesWithHighHotspots: 0,
        defaultWindowDays: 30
      },
      files: {}
    },
    issues: {
      circularDependencies: [],
      orphans: [],
      summary: ''
    },
    metrics: {
      fileCount: 1,
      edgeCount: 0,
      avgDegree: 0
    },
    detailedMetrics: {
      totalFiles: 1,
      totalDependencies: 0,
      averageDependenciesPerFile: 0,
      topImporters: [],
      mostDependedOn: [],
      codebaseHealth: {
        orphanCount: 0,
        circularCount: 0
      }
    },
    warnings: {
      hasPathMappings: false,
      unresolvedImports: [],
      totalUnresolvedCount: 0
    }
  }
}

test('ModuleSidePanel overview renders coordination risks when module connascence signals are available', () => {
  const queryClient = new QueryClient()
  const moduleData = createModuleData()

  const markup = renderToStaticMarkup(
    <TooltipProvider>
      <QueryClientProvider client={queryClient}>
        <DataContext.Provider
          value={{
            analysisData: createAnalysisData(),
            architectureData: {
              folders: [moduleData],
              files: createFileData()
            },
            isLoading: false,
            error: null,
            refetch: () => {}
          }}
        >
          <ModuleSidePanel
            modulePath='position'
            moduleData={moduleData}
            onClose={() => {}}
            onViewFile={() => {}}
          />
        </DataContext.Provider>
      </QueryClientProvider>
    </TooltipProvider>
  )

  assert.match(markup, /Coordination Risks/)
  assert.match(markup, /createUser depends on argument order/)
  assert.match(markup, /Mostly local.*2 caller files/)
  assert.match(markup, /Review first/)
  assert.match(markup, /Next step:/)
  assert.match(markup, /Declared in/)
  assert.match(markup, /contract\.ts/)
  assert.match(markup, /caller-a\.ts/)
  assert.doesNotMatch(markup, /Pattern:/)
  assert.doesNotMatch(markup, /Suggested next step/)
})
