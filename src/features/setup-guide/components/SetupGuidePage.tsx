import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { ScrollArea } from '@/shared/components/ui/scroll-area'
import type { AnalysisWarnings } from '@/shared/types/analysis'

import { UnresolvedImportsList } from './UnresolvedImportsList'

interface SetupGuidePageProps {
  warnings: AnalysisWarnings | undefined
  onBack: () => void
}

const TSCONFIG_EXAMPLE = `{
   "compilerOptions": {
     "baseUrl": ".",
     "paths": {
       "@/*": ["./src/*"],
       "@/components/*": ["./src/components/*"],
       "@/utils/*": ["./src/utils/*"],
       "@/hooks/*": ["./src/hooks/*"]
     }
   }
 }`

export function SetupGuidePage({ warnings, onBack }: SetupGuidePageProps) {
  const hasIssues = warnings && warnings.unresolvedImports.length > 0

  return (
    <ScrollArea className="h-full bg-background">
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <button
            onClick={onBack}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Kembali ke Overview
          </button>
          <h1 className="text-2xl font-bold">Setup Guide</h1>
          <p className="text-muted-foreground">
            Konfigurasi path aliases untuk hasil analisis yang lengkap.
          </p>
        </div>

        {/* Status Card */}
        <Card
          className={hasIssues ? 'border-yellow-500/50' : 'border-green-500/50'}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {hasIssues ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-yellow-500" />
                  Path Mappings Tidak Ditemukan
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  Konfigurasi Sudah Benar
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {hasIssues ? (
              <p>
                Code Mapper tidak menemukan path mappings di tsconfig.json atau
                jsconfig.json. Import dengan alias seperti{' '}
                <code className="text-foreground">@/components</code> tidak akan
                ter-resolve.
              </p>
            ) : (
              <p>
                Path mappings terdeteksi. Semua import seharusnya ter-resolve
                dengan benar.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Unresolved Imports List */}
        {warnings && (
          <UnresolvedImportsList
            imports={warnings.unresolvedImports}
            totalCount={warnings.totalUnresolvedCount}
          />
        )}

        {/* Instructions */}
        {hasIssues && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Cara Mengatasi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  1. Buat atau edit tsconfig.json di root project
                </h4>
                <pre className="p-4 bg-muted rounded-lg text-xs overflow-x-auto">
                  <code>{TSCONFIG_EXAMPLE}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">
                  2. Jalankan ulang analisis
                </h4>
                <p className="text-sm text-muted-foreground">
                  Setelah menambahkan path mappings, jalankan ulang{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    code-mapper analyze .
                  </code>{' '}
                  atau klik tombol refresh di UI.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium text-sm">3. Untuk Vite users</h4>
                <p className="text-sm text-muted-foreground">
                  Jika menggunakan Vite, pastikan path mappings ada di{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    tsconfig.json
                  </code>{' '}
                  atau{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    tsconfig.app.json
                  </code>
                  , bukan hanya di{' '}
                  <code className="px-1 py-0.5 bg-muted rounded">
                    vite.config.ts
                  </code>
                  .
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  )
}
