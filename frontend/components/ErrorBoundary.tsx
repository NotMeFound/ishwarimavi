import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetAll = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage?.clear();
        window.sessionStorage?.clear();
      }
    } catch {
      // Ignore
    }
    window.location.hash = '';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
          <div className="w-full max-w-md p-6 sm:p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ईश्वरी माध्यमिक विद्यालय पोर्टलमा प्राविधिक समस्या आयो।
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] font-mono text-red-600 dark:text-red-400 break-words text-left">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#1E40AF] text-white hover:bg-[#1D4ED8] transition cursor-pointer shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetAll}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Clears local cache and reloads default state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
