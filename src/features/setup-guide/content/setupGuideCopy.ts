export const setupGuideCopy = {
  header: {
    title: 'Analysis Setup',
    description:
      'Review configuration guidance and unresolved imports so the analysis matches your real project structure.',
    surfaceBadge: 'Analysis Setup'
  },
  status: {
    warningsDetected: {
      badge: 'Warnings Detected',
      title: 'Unresolved imports need attention',
      description:
        'Some alias-based imports could not be resolved. This usually means path mapping is incomplete or the referenced file no longer exists.'
    },
    analysisReady: {
      badge: 'Analysis Ready',
      title: 'Analysis configuration looks healthy',
      description:
        'Path mappings were detected successfully, so import resolution should match the project configuration more closely.'
    }
  },
  unresolvedImports: {
    title: 'Unresolved Imports',
    totalSuffix: 'total',
    summary: (importCount: number, fileCount: number) =>
      `${importCount} import${importCount === 1 ? '' : 's'} from ${fileCount} file${fileCount === 1 ? '' : 's'}`
  },
  instructions: {
    title: 'How to Fix',
    steps: {
      createConfig: {
        title: '1. Create or update a config file',
        description:
          'Make sure one of these files exists in the project root with correct path mappings: tsconfig.app.json > tsconfig.json > jsconfig.json.'
      },
      rerunAnalysis: {
        title: '2. Re-run the analysis',
        description:
          'After updating path mappings, run analyze again or use the reload action in the live app.'
      },
      viteProjects: {
        title: '3. For Vite projects',
        description:
          'Keep path mappings in tsconfig.json or tsconfig.app.json, not only in vite.config.ts. Code Mapper reads tsconfig/jsconfig path settings.'
      },
      troubleshooting: {
        title: '4. Troubleshooting tips',
        items: [
          'Ensure baseUrl is set relative to the tsconfig file location.',
          'Verify that the referenced file actually exists.',
          'For monorepos, run analysis from the frontend or backend package directory instead of the monorepo root.'
        ]
      }
    }
  }
} as const
