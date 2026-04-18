import React, { useEffect, useState } from 'react';
import {
  ArrowDownToLine,
  BadgeIndianRupee,
  CalendarDays,
  CreditCard,
  ReceiptText,
  TrendingDown,
  Wallet,
  XCircle
} from 'lucide-react';
import './HostRevenue.css';
import { useAppToast } from '../../components/toast';

const formatCurrency = (amount = 0) => `NPR ${Number(amount || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function HostRevenue() {
  const toast = useAppToast();
  const [summary, setSummary] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchRevenue();
  }, []);

  const fetchRevenue = async () => {
    try {
      setLoading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const response = await fetch(`http://localhost:5000/api/booking/host/${user.id}/revenue`, {
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        setSummary(result.summary);
        setEntries(result.entries || []);
      }
    } catch (error) {
      console.error('Error fetching host revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const userStr = localStorage.getItem('user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      const response = await fetch(`http://localhost:5000/api/booking/host/${user.id}/revenue/report`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to download report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `host-revenue-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading revenue report:', error);
      toast.error('Download Failed', 'Unable to download the revenue report right now.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <div className="hr-loading">Loading revenue records...</div>;
  }

  const cards = [
    {
      key: 'totalGrossRevenue',
      label: 'Gross Revenue',
      value: formatCurrency(summary?.totalGrossRevenue),
      icon: <BadgeIndianRupee size={20} />,
      tone: 'gross'
    },
    {
      key: 'totalCollectedRevenue',
      label: 'Collected Online',
      value: formatCurrency(summary?.totalCollectedRevenue),
      icon: <CreditCard size={20} />,
      tone: 'collected'
    },
    {
      key: 'totalPendingRevenue',
      label: 'Pending at Property',
      value: formatCurrency(summary?.totalPendingRevenue),
      icon: <ReceiptText size={20} />,
      tone: 'pending'
    },
    {
      key: 'totalDeductions',
      label: 'Cancellation Deductions',
      value: formatCurrency(summary?.totalDeductions),
      icon: <TrendingDown size={20} />,
      tone: 'deduction'
    },
    {
      key: 'netCollectedRevenue',
      label: 'Net Collected',
      value: formatCurrency(summary?.netCollectedRevenue),
      icon: <Wallet size={20} />,
      tone: 'net'
    }
  ];

  return (
    <div className="host-revenue">
      <div className="hr-header">
        <div>
          <h2 className="hr-title">Revenue Collection</h2>
          <p className="hr-subtitle">
            Track host earnings, pending balances, and cancellation deductions in one place.
          </p>
        </div>

        <button className="hr-download-btn" onClick={handleDownloadReport} disabled={downloading}>
          <ArrowDownToLine size={18} />
          {downloading ? 'Preparing PDF...' : 'Download PDF Report'}
        </button>
      </div>

      <div className="hr-overview-strip">
        <div className="hr-strip-card">
          <span className="hr-strip-label">Total Bookings</span>
          <strong>{summary?.totalBookings || 0}</strong>
        </div>
        <div className="hr-strip-card">
          <span className="hr-strip-label">Confirmed</span>
          <strong>{summary?.confirmedBookings || 0}</strong>
        </div>
        <div className="hr-strip-card">
          <span className="hr-strip-label">Completed</span>
          <strong>{summary?.completedBookings || 0}</strong>
        </div>
        <div className="hr-strip-card cancelled">
          <span className="hr-strip-label">Cancelled</span>
          <strong>{summary?.cancelledBookings || 0}</strong>
        </div>
      </div>

      <div className="hr-cards">
        {cards.map((card) => (
          <div key={card.key} className={`hr-card ${card.tone}`}>
            <div className="hr-card-icon">{card.icon}</div>
            <div>
              <span className="hr-card-label">{card.label}</span>
              <strong className="hr-card-value">{card.value}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="hr-table-wrap">
        <div className="hr-table-header">
          <div>
            <h3>Revenue Ledger</h3>
            <p>Each booking shows collected amount, deduction after cancellation, and current net revenue.</p>
          </div>
        </div>

        {entries.length === 0 ? (
          <div className="hr-empty">
            <Wallet size={48} />
            <h3>No revenue records yet</h3>
            <p>Bookings will appear here automatically once guests start making reservations.</p>
          </div>
        ) : (
          <div className="hr-table">
            <div className="hr-table-head">
              <span>Booking</span>
              <span>Dates</span>
              <span>Status</span>
              <span>Collected</span>
              <span>Deduction</span>
              <span>Pending</span>
              <span>Net</span>
            </div>

            {entries.map((entry) => (
              <div key={entry.id} className="hr-table-row">
                <div className="hr-booking-cell">
                  <strong>{entry.bookingId}</strong>
                  <span>{entry.guestName}</span>
                  <small>{entry.homestayName}</small>
                </div>

                <div className="hr-date-cell">
                  <span><CalendarDays size={14} /> {formatDate(entry.checkIn)}</span>
                  <small>Booked on {formatDate(entry.createdAt)}</small>
                </div>

                <div>
                  <span className={`hr-status ${entry.status}`}>{entry.status}</span>
                  {entry.cancellationReason && (
                    <small className="hr-note">
                      <XCircle size={12} />
                      {entry.cancellationReason}
                    </small>
                  )}
                </div>

                <strong className="hr-money positive">{formatCurrency(entry.collectedAmount)}</strong>
                <strong className={`hr-money ${entry.deductionAmount > 0 ? 'negative' : ''}`}>
                  {formatCurrency(entry.deductionAmount)}
                </strong>
                <strong className="hr-money neutral">{formatCurrency(entry.pendingAmount)}</strong>
                <strong className="hr-money net">{formatCurrency(entry.netCollectedAmount)}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
