import { useState, useEffect } from 'react';
import { ProposedPlan, AgreementAnalysis, SynthesizedPlan } from '../types/collaboration';

export function useCollaborationSocket() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [planA, setPlanA] = useState<ProposedPlan | null>(null);
  const [planB, setPlanB] = useState<ProposedPlan | null>(null);
  const [analysis, setAnalysis] = useState<AgreementAnalysis | null>(null);
  const [synthesizedPlan, setSynthesizedPlan] = useState<SynthesizedPlan | null>(null);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'collaboration_started':
          setSessionId(data.payload.sessionId);
          break;
        case 'plan_proposed':
          if (data.payload.plan.aiId === 'AI-Alpha') {
            setPlanA(data.payload.plan);
          } else {
            setPlanB(data.payload.plan);
          }
          break;
        case 'comparison_complete':
          setAnalysis(data.payload.analysis);
          break;
        case 'synthesis_complete':
          setSynthesizedPlan(data.payload.plan);
          break;
        case 'progress_update':
          setProgress(data.payload.message);
          break;
        case 'error_occurred':
          setError(data.payload.message);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return { sessionId, planA, planB, analysis, synthesizedPlan, progress, error };
}