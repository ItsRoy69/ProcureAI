import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AddIcon, 
  DescriptionIcon, 
  TrendingUpIcon, 
  SendIcon, 
  CheckCircleIcon, 
  MoreHorizIcon, 
  FilterListIcon 
} from '../components/Icons';
import { Modal } from '../components/UIComponents';
import { rfpAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [rfps, setRfps] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const result = await rfpAPI.getAll();
      if (result.success) {
        setRfps(result.data);
      }
    } catch (error) {
      console.error('Error loading RFPs:', error);
    }
  };

  const filteredRfps = rfps.filter(rfp => {
    if (filters.status !== 'all' && rfp.status !== filters.status) {
      return false;
    }

    if (filters.searchTerm && !rfp.title.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false;
    }

    if (filters.dateFrom) {
      const rfpDate = new Date(rfp.createdAt);
      const fromDate = new Date(filters.dateFrom);
      if (rfpDate < fromDate) return false;
    }

    if (filters.dateTo) {
      const rfpDate = new Date(rfp.createdAt);
      const toDate = new Date(filters.dateTo);
      if (rfpDate > toDate) return false;
    }

    return true;
  });

  const stats = {
    total: filteredRfps.length,
    draft: filteredRfps.filter(r => r.status === 'draft').length,
    sent: filteredRfps.filter(r => r.status === 'sent').length,
    closed: filteredRfps.filter(r => r.status === 'closed').length,
  };

  const getStatusChip = (status) => {
    const config = {
      draft: { className: 'chip-warning', label: 'Draft' },
      sent: { className: 'chip-info', label: 'Sent' },
      closed: { className: 'chip-success', label: 'Closed' }
    }[status] || { className: 'chip-gray', label: status };

    return <span className={`chip ${config.className}`}>{config.label}</span>;
  };

  const handleFilter = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = () => {
    setShowFilterModal(false);

  };

  const handleClearFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: ''
    });
  };

  const handleExport = () => {

    const headers = ['ID', 'Title', 'Status', 'Budget', 'Created Date', 'Deadline'];
    const csvRows = [headers.join(',')];

    filteredRfps.forEach(rfp => {
      const row = [
        rfp.id,
        `"${rfp.title}"`,
        rfp.status,
        rfp.budget || 'N/A',
        new Date(rfp.createdAt).toLocaleDateString(),
        rfp.deadline ? new Date(rfp.deadline).toLocaleDateString() : 'N/A'
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `rfps_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const StatCard = ({ title, value, icon: Icon, trend }) => (
    <div className="card">
      <div className="card-body card-body-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-gray-500 font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
            <div className="flex items-center gap-1">
              <span className="chip chip-success text-xs">{trend}</span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
          <div className="stat-icon">
            <Icon width={20} height={20} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <div className="flex gap-2">
          <button 
            className="btn btn-outlined btn-sm"
            onClick={handleFilter}
          >
            <FilterListIcon width={16} height={16} />
            Filter
          </button>
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => navigate('/rfp/create')}
          >
            <AddIcon width={16} height={16} />
            Create RFP
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total RFPs"
          value={stats.total}
          trend="+12%"
          icon={DescriptionIcon}
        />
        <StatCard
          title="Drafts"
          value={stats.draft}
          trend="+2%"
          icon={TrendingUpIcon}
        />
        <StatCard
          title="Active Sent"
          value={stats.sent}
          trend="+5%"
          icon={SendIcon}
        />
        <StatCard
          title="Completed"
          value={stats.closed}
          trend="+8%"
          icon={CheckCircleIcon}
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <div className="card">
            <div className="card-header flex justify-between items-center">
              <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
              <button className="btn-text">View All</button>
            </div>
            <div className="table-container">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th style={{ width: '40%' }}>PROJECT NAME</th>
                    <th style={{ width: '15%' }}>STATUS</th>
                    <th style={{ width: '20%' }}>BUDGET</th>
                    <th style={{ width: '20%' }}>DATE</th>
                    <th style={{ width: '5%' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRfps.slice(0, 6).map((rfp) => (
                    <tr key={rfp.id}>
                      <td>
                        <div>
                          <p className="font-medium text-gray-900 truncate" style={{ maxWidth: '300px' }}>
                            {rfp.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: #{rfp.id.toString().padStart(4, '0')}
                          </p>
                        </div>
                      </td>
                      <td>{getStatusChip(rfp.status)}</td>
                      <td className="text-gray-700">
                        ${rfp.budget?.toLocaleString() || '-'}
                      </td>
                      <td className="text-gray-700">
                        {new Date(rfp.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button 
                          className="btn-icon"
                          onClick={() => navigate(`/rfp/${rfp.id}`)}
                        >
                          <MoreHorizIcon width={20} height={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRfps.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center text-gray-500" style={{ padding: '2rem' }}>
                        {rfps.length === 0 ? 'No data available' : 'No RFPs match your filters'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="card">
            <div className="card-body card-body-sm">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <button 
                  className="btn btn-outlined w-full"
                  onClick={() => navigate('/vendors')}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <AddIcon width={16} height={16} />
                  New Vendor
                </button>
                <button 
                  className="btn btn-outlined w-full"
                  onClick={handleExport}
                  style={{ justifyContent: 'flex-start' }}
                >
                  <DescriptionIcon width={16} height={16} />
                  Export Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter RFPs"
        footer={
          <>
            <button className="btn btn-secondary" onClick={handleClearFilters}>
              Clear Filters
            </button>
            <button className="btn btn-primary" onClick={handleApplyFilters}>
              Apply Filters
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4" style={{ paddingTop: '1rem' }}>
          <div>
            <label className="label">Search by Title</label>
            <input
              className="input w-full"
              placeholder="Search RFPs..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className="input w-full"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date From</label>
              <input
                type="date"
                className="input w-full"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Date To</label>
              <input
                type="date"
                className="input w-full"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>
          </div>

          {(filters.status !== 'all' || filters.searchTerm || filters.dateFrom || filters.dateTo) && (
            <div className="alert alert-info" style={{ marginTop: '0.5rem' }}>
              <p className="text-sm">
                Active filters: {filteredRfps.length} of {rfps.length} RFPs shown
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Dashboard;
