export const setupGuideCopy = {
  header: {
    title: 'Analysis Setup',
    description:
      'Use this page when unresolved imports reduce analysis accuracy and you need concrete recovery steps.',
    surfaceBadge: 'Analysis Setup'
  },
  status: {
    warningsDetected: {
      badge: 'Warnings Detected',
      title: 'Unresolved imports need attention',
      description:
        'Some project imports could not be resolved. Dependency paths, shared impact, and review guidance may be incomplete until these references are fixed and the analysis is rerun.'
    },
    analysisReady: {
      badge: 'Analysis Ready',
      title: 'Analysis configuration looks healthy',
      description:
        'No unresolved project-import warnings were detected in this snapshot.'
    },
    scopeNotice: {
      badge: 'Scope Notice',
      title: 'Some files were skipped by design',
      description:
        'This analysis focuses on JavaScript and TypeScript source files. Skipped files are listed so you know why they do not appear in the dependency graph.'
    }
  },
  unresolvedImports: {
    title: 'Unresolved Imports',
    totalSuffix: 'total',
    summary: (importCount: number, fileCount: number) =>
      `${importCount} import${importCount === 1 ? '' : 's'} from ${fileCount} file${fileCount === 1 ? '' : 's'}`
  },
  unsupportedFiles: {
    title: 'Skipped Non-Code Files',
    totalSuffix: 'skipped',
    supportedLabel: 'Analyzed extensions',
    examplesLabel: 'Examples',
    extensionSummary: (count: number) =>
      `${count} file${count === 1 ? '' : 's'}`
  },
  instructions: {
    title: 'How to Restore Analysis Accuracy',
    steps: {
      createConfig: {
        title: '1. Create or update a config file',
        description:
          'If these imports use aliases, make sure one of these files exists in the project root with correct path mappings: tsconfig.app.json > tsconfig.json > jsconfig.json.'
      },
      rerunAnalysis: {
        title: '2. Re-run the analysis',
        description:
          'After updating path mappings, run analyze again or use the reload action in the live app.'
      },
      viteProjects: {
        title: '3. For Vite projects',
        description:
          'Keep path mappings in tsconfig.json or tsconfig.app.json, not only in vite.config.ts. Tauta reads tsconfig/jsconfig path settings, not Vite aliases alone.'
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
