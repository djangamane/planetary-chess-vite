import React from 'react';
import { useNavigate } from 'react-router-dom';

function Leaderboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <button
        onClick={() => navigate('/')}
        className="mb-8 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Home
      </button>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">High Scores</h1>
        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-white">Leaderboard coming soon...</p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;