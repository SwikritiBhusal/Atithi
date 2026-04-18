import React, { useState, useEffect } from 'react';
import { Eye, Check, X, Clock, CheckCircle, XCircle, MapPin, Phone, Mail, Home } from 'lucide-react';
import { useAppToast } from '../../components/toast';
import './homestays.css';

export default function AdminHomestays() {
  const toast = useAppToast();
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedHomestay, setSelectedHomestay] = useState(null); // For modal
  const [actionLoading, setActionLoading] = useState(false);
  const [remarks, setRemarks] = useState('');

  // Fetch all homestays
  useEffect(() => {
    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/homestay/all', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setHomestays(result.homestays);
      }
    } catch (error) {
      console.error('Error fetching homestays:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter homestays
  const filtered = homestays.filter(h => {
    if (filter === 'all') return true;
    return h.status === filter;
  });

  // Approve homestay
  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/homestay/approve/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Homestay Approved', 'Host credentials were sent to email.');
        setSelectedHomestay(null);
        setRemarks('');
        fetchHomestays(); // Refresh list
      } else {
        toast.error('Approve Failed', result.message || 'Failed to approve.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Request Failed', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject homestay
  const handleReject = async (id) => {
    if (!remarks.trim()) {
      toast.warning('Remarks Required', 'Please provide a reason for rejection.');
      return;
    }
    setActionLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/homestay/reject/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks })
      });
      const result = await response.json();
      if (result.success) {
        toast.success('Homestay Rejected', 'Homestay rejected successfully.');
        setSelectedHomestay(null);
        setRemarks('');
        fetchHomestays();
      } else {
        toast.error('Reject Failed', result.message || 'Failed to reject.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Request Failed', 'Something went wrong.');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="badge badge-pending"><Clock size={12} /> Pending</span>;
      case 'approved':
        return <span className="badge badge-approved"><CheckCircle size={12} /> Approved</span>;
      case 'rejected':
        return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="admin-homestays">
      {/* Header */}
      <div className="ah-header">
        <h2>Homestay Submissions</h2>
        <p>Review and manage homestay verification requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="ah-filters">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            className={`ah-filter-btn ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ah-filter-count">
              {f === 'all' 
                ? homestays.length 
                : homestays.filter(h => h.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="ah-loading">Loading homestays...</div>
      ) : filtered.length === 0 ? (
        <div className="ah-empty">No homestays found.</div>
      ) : (
        <div className="ah-table-wrapper">
          <table className="ah-table">
            <thead>
              <tr>
                <th>Homestay</th>
                <th>Owner</th>
                <th>Location</th>
                <th>Price</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(homestay => (
                <tr key={homestay._id}>
                  <td>
                    <div className="ah-homestay-name">
                      <Home size={16} />
                      {homestay.homestayName}
                    </div>
                  </td>
                  <td>
                    <div className="ah-owner">
                      <span>{homestay.ownerName}</span>
                      <span className="ah-email">{homestay.email}</span>
                    </div>
                  </td>
                  <td>
                    <div className="ah-location">
                      <MapPin size={13} />
                      {homestay.district}, {homestay.province}
                    </div>
                  </td>
                  <td>NPR {homestay.price?.toLocaleString()}</td>
                  <td>{getStatusBadge(homestay.status)}</td>
                  <td>{new Date(homestay.submittedAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="ah-view-btn"
                      onClick={() => {
                        setSelectedHomestay(homestay);
                        setRemarks('');
                      }}
                    >
                      <Eye size={15} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============ DETAILS MODAL ============ */}
      {selectedHomestay && (
        <div className="ah-modal-overlay" onClick={() => setSelectedHomestay(null)}>
          <div className="ah-modal" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ah-modal-header">
              <div>
                <h3>{selectedHomestay.homestayName}</h3>
                {getStatusBadge(selectedHomestay.status)}
              </div>
              <button className="ah-modal-close" onClick={() => setSelectedHomestay(null)}>✕</button>
            </div>

            <div className="ah-modal-body">
              {/* Owner Info */}
              <div className="ah-modal-section">
                <h4>Owner Information</h4>
                <div className="ah-info-grid">
                  <div className="ah-info-item">
                    <span className="ah-info-label">Full Name</span>
                    <span>{selectedHomestay.ownerName}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Email</span>
                    <span>{selectedHomestay.email}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Phone</span>
                    <span>{selectedHomestay.phone}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Citizenship No.</span>
                    <span>{selectedHomestay.citizenshipNo}</span>
                  </div>
                </div>
              </div>

              {/* Homestay Details */}
              <div className="ah-modal-section">
                <h4>Homestay Details</h4>
                <div className="ah-info-grid">
                  <div className="ah-info-item">
                    <span className="ah-info-label">Location</span>
                    <span>{selectedHomestay.municipality}, {selectedHomestay.district}, {selectedHomestay.province}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Rooms</span>
                    <span>{selectedHomestay.rooms}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Price/Night</span>
                    <span>NPR {selectedHomestay.price?.toLocaleString()}</span>
                  </div>
                  <div className="ah-info-item">
                    <span className="ah-info-label">Facilities</span>
                    <span>{selectedHomestay.facilities?.join(', ') || 'None'}</span>
                  </div>
                </div>
                {selectedHomestay.description && (
                  <p className="ah-description">{selectedHomestay.description}</p>
                )}
              </div>

              {/* Documents */}
              <div className="ah-modal-section">
                <h4>Documents</h4>
                <div className="ah-docs-grid">
                  {/* Citizenship Files */}
                  {selectedHomestay.citizenshipFiles?.map((doc, i) => (
                    <a
                      key={i}
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ah-doc-link"
                    >
                      <div className="ah-doc-card">
                        <div className="ah-doc-icon">📄</div>
                        <span>Citizenship {i === 0 ? 'Front' : 'Back'}</span>
                      </div>
                    </a>
                  ))}

                  {/* Tourism Registration */}
                  {selectedHomestay.tourismRegistration?.url && (
                    <a
                      href={selectedHomestay.tourismRegistration.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ah-doc-link"
                      onClick={() => console.log('Tourism Reg:', selectedHomestay.tourismRegistration)}
                    >
                      <div className="ah-doc-card">
                        <div className="ah-doc-icon">📄</div>
                        <span>Tourism Registration</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Homestay Photos */}
              <div className="ah-modal-section">
                <h4>Homestay Photos</h4>
                <div className="ah-photos-grid">
                  {selectedHomestay.homestayPhotos?.map((photo, i) => (
                    <a
                      key={i}
                      href={photo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <img
                        src={photo.url}
                        alt={`Homestay photo ${i + 1}`}
                        className="ah-photo"
                      />
                    </a>
                  ))}
                </div>
              </div>

              {/* Remarks - Only show if pending */}
              {selectedHomestay.status === 'pending' && (
                <div className="ah-modal-section">
                  <h4>Remarks <span className="ah-required">(Required for rejection)</span></h4>
                  <textarea
                    className="ah-remarks-input"
                    placeholder="Add remarks (required for rejection, optional for approval)..."
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={3}
                  />
                </div>
              )}

              {/* Show existing remarks if already actioned */}
              {selectedHomestay.adminRemarks && (
                <div className="ah-modal-section">
                  <h4>Admin Remarks</h4>
                  <p className="ah-existing-remarks">{selectedHomestay.adminRemarks}</p>
                </div>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            {selectedHomestay.status === 'pending' && (
              <div className="ah-modal-footer">
                <button
                  className="ah-reject-btn"
                  onClick={() => handleReject(selectedHomestay._id)}
                  disabled={actionLoading}
                >
                  <X size={16} />
                  {actionLoading ? 'Processing...' : 'Reject'}
                </button>
                <button
                  className="ah-approve-btn"
                  onClick={() => handleApprove(selectedHomestay._id)}
                  disabled={actionLoading}
                >
                  <Check size={16} />
                  {actionLoading ? 'Processing...' : 'Approve'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}