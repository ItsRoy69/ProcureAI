import React, { useState, useEffect } from 'react';
import { AddIcon, EmailIcon, PhoneIcon, BusinessIcon, MoreVertIcon, CheckCircleIcon } from '../components/Icons';
import { Modal, Alert } from '../components/UIComponents';
import { vendorAPI } from '../services/api';

function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [error, setError] = useState(null);
  const [newVendor, setNewVendor] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      const result = await vendorAPI.getAll();
      if (result.success) {
        setVendors(result.data);
      }
    } catch (error) {
      console.error('Error loading vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.email) {
      setError('Name and Email are required');
      return;
    }

    try {
      const result = await vendorAPI.create(newVendor);
      if (result.success) {
        setVendors([...vendors, result.data]);
        setOpenDialog(false);
        setNewVendor({ name: '', email: '', contactPerson: '', phone: '' });
        setError(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add vendor');
    }
  };

  const getVendorStats = (vendor) => {
    const proposalCount = vendor.proposals?.length || 0;
    const acceptedCount = vendor.proposals?.filter(p => p.status === 'accepted').length || 0;
    return { proposalCount, acceptedCount };
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ marginBottom: '0.5rem' }}>
            Vendors
          </h1>
          <p className="text-sm text-gray-500">
            Manage your vendor relationships and contacts
          </p>
        </div>
        <button
          className="btn btn-primary btn-lg"
          onClick={() => setOpenDialog(true)}
          style={{ boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)' }}
        >
          <AddIcon width={20} height={20} />
          Add Vendor
        </button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
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
                <BusinessIcon width={24} height={24} style={{ color: '#6366F1' }} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium" style={{ marginBottom: '0.5rem' }}>
              Total Vendors
            </p>
            <h3 className="text-4xl font-bold text-gray-900">
              {vendors.length}
            </h3>
          </div>
        </div>
        <div className="card" style={{ border: '1px solid #F3F4F6', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)', borderRadius: '0.75rem' }}>
          <div className="card-body">
            <div className="flex justify-between items-start" style={{ marginBottom: '1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '0.5rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <CheckCircleIcon width={24} height={24} style={{ color: '#10B981' }} />
              </div>
            </div>
            <p className="text-sm text-gray-500 font-medium" style={{ marginBottom: '0.5rem' }}>
              Active Vendors
            </p>
            <h3 className="text-4xl font-bold text-gray-900">
              {vendors.filter(v => v.proposals && v.proposals.length > 0).length}
            </h3>
          </div>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : vendors.length === 0 ? (
        <div className="card" style={{ padding: '4rem', textAlign: 'center', borderRadius: '0.75rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 className="text-lg text-gray-500">
            No vendors yet. Add your first vendor to get started!
          </h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {vendors.map((vendor) => {
            const stats = getVendorStats(vendor);
            return (
              <div key={vendor.id} className="card" style={{ border: '1px solid #E5E7EB', borderRadius: '0.75rem' }}>
                <div className="card-body">
                  <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                    <div className="avatar avatar-md">
                      {vendor.name?.charAt(0)}
                    </div>
                    <button className="btn-icon">
                      <MoreVertIcon width={20} height={20} />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900" style={{ marginBottom: '0.5rem' }}>
                    {vendor.name}
                  </h3>
                  
                  <div className="flex flex-col gap-2" style={{ marginBottom: '1rem' }}>
                    {vendor.email && (
                      <div className="flex items-center gap-2">
                        <EmailIcon width={16} height={16} style={{ color: '#9CA3AF' }} />
                        <p className="text-sm text-gray-500">{vendor.email}</p>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-2">
                        <PhoneIcon width={16} height={16} style={{ color: '#9CA3AF' }} />
                        <p className="text-sm text-gray-500">{vendor.phone}</p>
                      </div>
                    )}
                    {vendor.contactPerson && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <p className="text-xs text-gray-400">Contact Person</p>
                        <p className="text-sm text-gray-900 font-medium">{vendor.contactPerson}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2" style={{ paddingTop: '1rem', borderTop: '1px solid #F3F4F6', flexWrap: 'wrap' }}>
                    <span className="chip chip-primary">
                      {stats.proposalCount} proposals
                    </span>
                    {stats.acceptedCount > 0 && (
                      <span className="chip chip-success">
                        {stats.acceptedCount} accepted
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={openDialog}
        onClose={() => setOpenDialog(false)}
        title="Add New Vendor"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setOpenDialog(false)}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleAddVendor}>
              Add Vendor
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-4" style={{ paddingTop: '1rem' }}>
          <div>
            <label className="label">Company Name *</label>
            <input
              className="input w-full"
              value={newVendor.name}
              onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Email *</label>
            <input
              className="input w-full"
              type="email"
              value={newVendor.email}
              onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Contact Person</label>
            <input
              className="input w-full"
              value={newVendor.contactPerson}
              onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input w-full"
              value={newVendor.phone}
              onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Vendors;
