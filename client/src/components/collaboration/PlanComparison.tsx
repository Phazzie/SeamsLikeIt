import React from 'react';
import { ProposedPlan, AgreementAnalysis } from '../../types/collaboration';

interface PlanComparisonProps {
  planA: ProposedPlan;
  planB: ProposedPlan;
  analysis: AgreementAnalysis;
}

const PlanComparison: React.FC<PlanComparisonProps> = ({ planA, planB, analysis }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">{planA.projectName}</h2>
        <p className="text-gray-400 mb-4">by {planA.aiId}</p>
        <p>{planA.rationale}</p>
      </div>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4">{planB.projectName}</h2>
        <p className="text-gray-400 mb-4">by {planB.aiId}</p>
        <p>{planB.rationale}</p>
      </div>
    </div>
  );
};

export default PlanComparison;
