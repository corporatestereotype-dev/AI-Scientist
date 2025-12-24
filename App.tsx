
import React from 'react';
import Header from './components/Header';
import AtlasView from './components/AtlasView';
import { ErrorBoundary } from './components/ErrorBoundary';

function App(): React.ReactNode {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      <ErrorBoundary componentName="App Root">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-center text-lg text-slate-400 max-w-3xl mx-auto mb-12">
            An interactive catalog of fundamental instabilities across science and engineering.
            Explore each problem using standard scientific frameworks—Renormalization, Relaxation, and Effective Field Theories—to understand how singularities are resolved.
          </p>
          <ErrorBoundary componentName="Atlas View">
            <AtlasView />
          </ErrorBoundary>
        </main>
        <footer className="text-center py-6 text-slate-500 text-sm">
          <p>Built with the power of Polymathic thinking and the Gemini API.</p>
        </footer>
      </ErrorBoundary>
    </div>
  );
}

export default App;
