import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CompareArrowsIcon } from '../components/Icons';
import { rfpAPI } from '../services/api';

function Comparisons() {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const result = await rfpAPI.getAll();
      if (result.success) {
        const rfpsWithProposals = result.data.filter(rfp => rfp.proposals && rfp.proposals.length > 0);
        setRfps(rfpsWithProposals);
      }
    } catch (error) {
      console.error('Error loading RFPs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '0.5rem' }}>
          Comparisons
        </h1>
        <p className="text-sm text-gray-500">
          Compare proposals and make informed decisions
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: '0.75rem' }}>
          <div className="card-body">
            <div className="flex justify-between items-start" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CompareArrowsIcon width={24} height={24} style={{ color: '#6366F1' }} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium" style={{ marginBottom: '0.5rem' }}>
              RFPs with Proposals
            </p>
            <h3 className="text-4xl font-bold text-gray-900">
              {rfps.length}
            </h3>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : rfps.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '0.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 className="text-lg text-gray-500">
            No proposals to compare yet. Proposals will appear here once vendors respond to your RFPs.
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rfps.map((rfp) => (
            <div key={rfp.id} className="card" style={{ border: '1px solid #E5E7EB', borderRadius: '0.75rem' }}>
              <div className="card-body">
                <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: '1rem' }}>
                  {rfp.title}
                </h3>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <span className="chip chip-success">
                    {rfp.proposals.length} proposals received
                  </span>
                </div>

                <p className="text-sm text-gray-500" style={{ marginBottom: '1.5rem' }}>
                  {rfp.description?.substring(0, 120)}...
                </p>

                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate(`/rfp/${rfp.id}/compare`)}
                >
                  Compare Proposals
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Comparisons;
