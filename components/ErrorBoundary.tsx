import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  componentName?: string; // Optional name to identify which component crashed
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Uncaught error in ${this.props.componentName || 'component'}:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleCopyError = () => {
    const errorText = `Error in ${this.props.componentName || 'App'}: ${this.state.error?.message}\n\nStack:\n${this.state.errorInfo?.componentStack || ''}`;
    navigator.clipboard.writeText(errorText);
    alert('Error details copied to clipboard.');
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-slate-900/90 border border-rose-500/50 rounded-xl text-center my-4 backdrop-blur-sm shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-rose-500/5 pointer-events-none group-hover:bg-rose-500/10 transition-colors"></div>
            
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-900/50 mb-4 ring-1 ring-rose-500/50 shadow-lg shadow-rose-900/50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            
            <h2 className="text-xl font-bold text-rose-400 mb-2">Instability Detected</h2>
            <p className="text-slate-400 text-sm uppercase tracking-wider font-semibold mb-4">
                {this.props.componentName ? `${this.props.componentName} Malfunction` : 'System Error'}
            </p>

            <div className="bg-slate-950/50 rounded p-3 mb-6 max-w-lg mx-auto text-left border border-slate-800">
                <p className="text-rose-300 font-mono text-xs break-all whitespace-pre-wrap">
                    {this.state.error?.message || "An unexpected error occurred."}
                </p>
                {this.state.errorInfo && (
                     <details className="mt-2 text-slate-600 text-[10px] font-mono cursor-pointer">
                        <summary>View Stack Trace</summary>
                        <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                    </details>
                )}
            </div>

            <div className="flex items-center justify-center space-x-4">
                <button
                    onClick={this.handleReset}
                    className="px-5 py-2 bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 text-white rounded-lg transition-all shadow-md font-medium text-sm"
                >
                    Attempt Recovery
                </button>
                <button
                    onClick={this.handleCopyError}
                    className="px-5 py-2 bg-transparent border border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-200 rounded-lg transition-colors text-sm"
                >
                    Copy Diagnostics
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}