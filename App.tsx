
import React, { useState, useEffect } from 'react';
import { ViewState, CareerAnalysis } from './types';
import { analyzeCareerPath } from './geminiService';
import Header from './components/Header';
import Onboarding from './components/Onboarding';
import AnalysisDashboard from './components/AnalysisDashboard';
import RoadmapView from './components/RoadmapView';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('onboarding');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<CareerAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleStartAnalysis = async (profile: string, role: string, time: string, profileUrl?: string) => {
    setLoading(true);
    setView('analyzing');
    setError(null);
    try {
      const result = await analyzeCareerPath(profile, role, time, profileUrl);
      setAnalysis(result);
      setView('dashboard');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Something went wrong. The agent might be overloaded.");
      setView('onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header setView={(v) => analysis && setView(v)} currentView={view} analysisReady={!!analysis} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {view === 'onboarding' && (
          <Onboarding onStart={handleStartAnalysis} loading={loading} />
        )}

        {view === 'analyzing' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
              <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold gradient-text">Agent is reasoning...</h2>
              <p className="text-slate-400 max-w-md">
                Analyzing your data sources, searching for market trends, and architecting your personalized career path.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-lg">!</div>
            {error}
          </div>
        )}

        {view === 'dashboard' && analysis && (
          <AnalysisDashboard analysis={analysis} />
        )}

        {view === 'roadmap' && analysis && (
          <RoadmapView roadmap={analysis.roadmap} />
        )}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-slate-500 text-sm">
        &copy; Personal Career Navigator. Built for the next generation of talent.
      </footer>
    </div>
  );
};

export default App;
