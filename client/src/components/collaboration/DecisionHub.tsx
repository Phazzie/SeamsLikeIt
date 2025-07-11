import React from 'react';
import { SynthesisAssessment } from '../../types/collaboration';

interface DecisionHubProps {
  recommendation: 'CHOOSE_A' | 'CHOOSE_B' | 'SYNTHESIZE';
  assessment: SynthesisAssessment;
  onChooseA: () => void;
  onChooseB: () => void;
  onSynthesize: () => void;
}

const DecisionHub: React.FC<DecisionHubProps> = ({ recommendation, assessment, onChooseA, onChooseB, onSynthesize }) => {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mt-6">
      <h2 className="text-2xl font-bold mb-4">Decision Hub</h2>
      <div className="text-center">
        <p className="text-gray-400 mb-2">AI Recommendation:</p>
        <p className="text-3xl font-bold text-green-400 mb-4">{recommendation}</p>
        <p className="text-gray-400 mb-4">{assessment.recommendation}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onChooseA} className="px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transform hover:scale-105">
            Accept Plan A
          </button>
          <button onClick={onChooseB} className="px-6 py-2 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 transform hover:scale-105">
            Accept Plan B
          </button>
          <button onClick={onSynthesize} className="px-6 py-2 rounded-lg font-semibold bg-purple-600 hover:bg-purple-700 transform hover:scale-105">
            Synthesize
          </button>
        </div>
      </div>
    </div>
  );
};

export default DecisionHub;
