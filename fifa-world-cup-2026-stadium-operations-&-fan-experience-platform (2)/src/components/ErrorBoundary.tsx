/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error inside React Tree:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div id="error-boundary-screen" className="min-h-screen bg-[#0b0f19] flex flex-col justify-center items-center text-slate-300 p-6">
          <div className="bg-red-500/5 border border-red-500/20 max-w-lg w-full p-6 rounded-2xl text-center shadow-2xl">
            <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-lg font-bold tracking-tight text-white uppercase">Operations Interface Error</h2>
            <p className="text-xs text-slate-400 mt-2">
              The front-end interface experienced an unexpected runtime exception. AI telemetry pipelines remain safe.
            </p>
            {this.state.error && (
              <pre className="bg-slate-950/80 border border-slate-900 rounded-lg p-3 text-[10px] text-red-300/90 font-mono mt-4 text-left overflow-x-auto max-h-[120px]">
                {this.state.error.stack || this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-all shadow-lg shadow-indigo-950/50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-initialize Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
