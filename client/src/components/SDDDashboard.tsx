import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import PlanComparison from './collaboration/PlanComparison';
import DecisionHub from './collaboration/DecisionHub';
import { useCollaborationSocket } from '../hooks/useCollaborationSocket';

export default function SDDDashboard() {
  const [requirements, setRequirements] = useState('');
  const [domain, setDomain] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [authToken, setAuthToken] = useState('');

  const {
    sessionId,
    planA,
    planB,
    analysis,
    synthesizedPlan,
    progress,
    error,
  } = useCollaborationSocket();

  // Login on mount
  useEffect(() => {
    login();
  }, []);

  const login = async () => {
    // ... (login logic remains the same)
  };

  const startCollaboration = async () => {
    if (!requirements || !authToken) return;
    
    setIsLoading(true);
    setCurrentStep(1);

    // This will now be handled by the WebSocket connection
  };

  const steps = ['Requirements', 'Collaboration', 'Decision', 'Final Plan'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white p-6">
      {/* ... (header and timeline are the same) */}

      {currentStep === 1 && (
        // ... (requirements input form is the same)
      )}

      {currentStep === 2 && planA && planB && (
        <PlanComparison planA={planA} planB={planB} analysis={analysis!} />
      )}

      {currentStep === 2 && planA && planB && (
        <DecisionHub
          recommendation="SYNTHESIZE" // This would come from the critiqueAndCompareTool
          assessment={analysis!}
          onChooseA={() => {}}
          onChooseB={() => {}}
          onSynthesize={() => {}}
        />
      )}
    </div>
  );
}







