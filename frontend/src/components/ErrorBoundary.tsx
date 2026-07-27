import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { AlertTriangle, RefreshCw } from 'lucide-react';

function DefaultFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Something went wrong</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        {error && (
          <details className="text-left text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
            <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">Error details</summary>
            <pre className="mt-2 whitespace-pre-wrap break-words">{error instanceof Error ? error.message : String(error)}</pre>
          </details>
        )}
        <button
          onClick={resetErrorBoundary}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

export default function ErrorBoundary({ children, fallback, onReset }: ErrorBoundaryProps) {
  if (fallback) {
    return (
      <ReactErrorBoundary
        fallbackRender={({ resetErrorBoundary }) => (
          <div onClick={resetErrorBoundary}>{fallback}</div>
        )}
        onReset={onReset}
      >
        {children}
      </ReactErrorBoundary>
    );
  }

  return (
    <ReactErrorBoundary FallbackComponent={DefaultFallback} onReset={onReset}>
      {children}
    </ReactErrorBoundary>
  );
}
