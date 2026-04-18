import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './overview.css';
import Logo from '../../assets/images/atithi-high-resolution-logo.png';
import NotificationBell from '../../components/NotificationBell';
import {
  Building2,
  CalendarCheck2,
  CreditCard,
  Home,
  LogOut,
  Menu,
  TrendingUp,
  User,
  Users,
  Wallet,
  X,
  Settings,
  ShieldCheck,
  Clock3
} from 'lucide-react';
import AdminProfile from './AdminProfile';
import AdminHomestays from './homestays';
import AdminUsers from './UsersManagement';
import { useAppToast } from '../../components/toast';

const formatCurrency = (amount = 0) => `NPR ${Number(amount || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const ChartCard = ({ title, subtitle, children }) => (
  <section className="ao-panel">
    <div className="ao-panel-head">
      <div>
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
    </div>
    {children}
  </section>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      navigate('/login');
      return;
    }

    const userData = JSON.parse(userStr);
    if (userData.role !== 'admin') {
      toast.error('Access Denied', 'Admins only.');
      navigate('/');
      return;
    }

    setUser(userData);
  }, [navigate, toast]);

  useEffect(() => {
    if (activeTab === 'overview' && user) {
      fetchOverviewAnalytics();
    }
  }, [activeTab, user]);

  const fetchOverviewAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await fetch('http://localhost:5000/api/admin/overview', {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setAnalytics(result);
      }
    } catch (error) {
      console.error('Error fetching admin overview analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      const result = await response.json();

      if (result.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('storage'));
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('storage'));
      navigate('/login');
    }
  };

  const maxTrendBookings = useMemo(() => {
    const values = analytics?.bookingTrend?.map((item) => item.bookings) || [];
    return Math.max(...values, 1);
  }, [analytics]);

  const trendPath = useMemo(() => {
    const trend = analytics?.bookingTrend || [];
    if (!trend.length) return '';

    return trend.map((item, index) => {
      const x = 30 + (index * (760 / Math.max(trend.length - 1, 1)));
      const y = 220 - ((item.bookings / maxTrendBookings) * 170);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }, [analytics, maxTrendBookings]);

  const areaPath = useMemo(() => {
    const trend = analytics?.bookingTrend || [];
    if (!trend.length) return '';

    const line = trend.map((item, index) => {
      const x = 30 + (index * (760 / Math.max(trend.length - 1, 1)));
      const y = 220 - ((item.bookings / maxTrendBookings) * 170);
      return `L ${x} ${y}`;
    }).join(' ');

    return `M 30 220 ${line} L 790 220 Z`;
  }, [analytics, maxTrendBookings]);

  const renderOverview = () => {
    if (analyticsLoading) {
      return <div className="ao-loading">Loading live overview...</div>;
    }

    const summary = analytics?.summary;
    const quickCards = [
      {
        label: 'Total Homestays',
        value: summary?.homestays?.total || 0,
        meta: `${summary?.homestays?.pending || 0} pending review`,
        icon: <Building2 size={22} />,
        tone: 'violet'
      },
      {
        label: 'Platform Users',
        value: summary?.users?.total || 0,
        meta: `${summary?.users?.hosts || 0} hosts and ${summary?.users?.tourists || 0} tourists`,
        icon: <Users size={22} />,
        tone: 'blue'
      },
      {
        label: 'Active Bookings',
        value: summary?.bookings?.active || 0,
        meta: `${summary?.bookings?.completed || 0} completed bookings`,
        icon: <CalendarCheck2 size={22} />,
        tone: 'green'
      },
      {
        label: 'Net Revenue',
        value: formatCurrency(summary?.revenue?.netRevenue || 0),
        meta: `${formatCurrency(summary?.revenue?.deductions || 0)} deductions`,
        icon: <Wallet size={22} />,
        tone: 'amber'
      }
    ];

    const financeCards = [
      {
        label: 'Gross Revenue',
        value: formatCurrency(summary?.revenue?.grossRevenue || 0),
        icon: <TrendingUp size={18} />
      },
      {
        label: 'Collected Online',
        value: formatCurrency(summary?.revenue?.collectedRevenue || 0),
        icon: <CreditCard size={18} />
      },
      {
        label: 'Pending at Property',
        value: formatCurrency(summary?.revenue?.pendingRevenue || 0),
        icon: <Clock3 size={18} />
      },
      {
        label: 'Verified Users',
        value: summary?.users?.verified || 0,
        icon: <ShieldCheck size={18} />
      }
    ];

    return (
      <div className="admin-overview">
        <div className="ao-hero">
          <div>
            <span className="ao-eyebrow">Live platform overview</span>
            <h1>Operations at a glance</h1>
            <p>
              Real-time dashboard for approvals, bookings, platform earnings, and the homestays driving performance.
            </p>
          </div>

          <div className="ao-hero-actions">
            <div className="ao-highlight">
              <span>Pending approvals</span>
              <strong>{summary?.homestays?.pending || 0}</strong>
            </div>
            <div className="ao-highlight soft">
              <span>Cancelled bookings</span>
              <strong>{summary?.bookings?.cancelled || 0}</strong>
            </div>
          </div>
        </div>

        <div className="ao-stats-grid">
          {quickCards.map((card) => (
            <div key={card.label} className={`ao-stat-card ${card.tone}`}>
              <div className="ao-stat-icon">{card.icon}</div>
              <div className="ao-stat-copy">
                <span>{card.label}</span>
                <strong>{card.value}</strong>
                <small>{card.meta}</small>
              </div>
            </div>
          ))}
        </div>

        <div className="ao-finance-strip">
          {financeCards.map((item) => (
            <div key={item.label} className="ao-finance-card">
              <div className="ao-finance-icon">{item.icon}</div>
              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </div>
          ))}
        </div>

        <div className="ao-grid two-col">
          <ChartCard
            title="Booking Trend"
            subtitle="Daily booking flow over the last 30 days"
          >
            <div className="ao-line-chart">
              <svg viewBox="0 0 820 260" className="ao-chart-svg">
                <defs>
                  <linearGradient id="aoArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.04" />
                  </linearGradient>
                  <linearGradient id="aoStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#16a34a" />
                  </linearGradient>
                </defs>

                {[0, 1, 2, 3, 4].map((line) => (
                  <line
                    key={line}
                    x1="30"
                    y1={220 - (line * 42)}
                    x2="790"
                    y2={220 - (line * 42)}
                    stroke="#e2e8f0"
                    strokeWidth="1"
                  />
                ))}

                <path d={areaPath} fill="url(#aoArea)" />
                <path d={trendPath} fill="none" stroke="url(#aoStroke)" strokeWidth="4" strokeLinecap="round" />

                {(analytics?.bookingTrend || []).map((item, index) => {
                  const x = 30 + (index * (760 / Math.max((analytics?.bookingTrend?.length || 1) - 1, 1)));
                  const y = 220 - ((item.bookings / maxTrendBookings) * 170);
                  const showLabel = index % 5 === 0 || index === (analytics?.bookingTrend?.length || 1) - 1;

                  return (
                    <g key={item.date}>
                      <circle cx={x} cy={y} r="4.5" fill="#fff" stroke="#2563eb" strokeWidth="3" />
                      {showLabel && (
                        <text x={x} y="248" textAnchor="middle" className="ao-axis-label">
                          {item.label}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </ChartCard>

          <ChartCard
            title="Approval Pipeline"
            subtitle="Homestay moderation workload and current distribution"
          >
            <div className="ao-stack-list">
              {(analytics?.homestayStatusBreakdown || []).map((item) => {
                const total = summary?.homestays?.total || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label} className="ao-stack-item">
                    <div className="ao-stack-top">
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                    <div className="ao-stack-bar">
                      <div className={`ao-stack-fill ${item.tone}`} style={{ width: `${percentage}%` }} />
                    </div>
                    <small>{percentage}% of all homestays</small>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </div>

        <div className="ao-grid three-col">
          <ChartCard
            title="Booking Status"
            subtitle="Current booking mix"
          >
            <div className="ao-mini-list">
              {(analytics?.bookingStatusBreakdown || []).map((item) => {
                const total = summary?.bookings?.total || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={item.label} className="ao-mini-row">
                    <div className="ao-mini-copy">
                      <span>{item.label}</span>
                      <small>{percentage}% share</small>
                    </div>
                    <strong>{item.value}</strong>
                  </div>
                );
              })}
            </div>
          </ChartCard>

          <ChartCard
            title="User Roles"
            subtitle="Healthy platform composition"
          >
            <div className="ao-mini-list">
              {(analytics?.userRoleBreakdown || []).map((item) => (
                <div key={item.label} className="ao-mini-row">
                  <div className="ao-mini-copy">
                    <span>{item.label}</span>
                    <small>Registered accounts</small>
                  </div>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title="Revenue Health"
            subtitle="What is collected versus still pending"
          >
            <div className="ao-revenue-meter">
              <div className="ao-meter-track">
                <div
                  className="ao-meter-fill collected"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((summary?.revenue?.collectedRevenue || 0) / Math.max(summary?.revenue?.grossRevenue || 1, 1)) * 100)
                    )}%`
                  }}
                />
              </div>
              <div className="ao-meter-legend">
                <span>Collected</span>
                <strong>{formatCurrency(summary?.revenue?.collectedRevenue || 0)}</strong>
              </div>
              <div className="ao-meter-legend">
                <span>Pending</span>
                <strong>{formatCurrency(summary?.revenue?.pendingRevenue || 0)}</strong>
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="ao-grid two-col">
          <ChartCard
            title="Top Performing Homestays"
            subtitle="Highest net revenue generated so far"
          >
            <div className="ao-ranking-list">
              {(analytics?.topHomestays || []).length === 0 ? (
                <div className="ao-empty">No booking revenue data available yet.</div>
              ) : (
                analytics.topHomestays.map((item, index) => (
                  <div key={item.homestayName} className="ao-ranking-item">
                    <div className="ao-rank-badge">{index + 1}</div>
                    <div className="ao-ranking-copy">
                      <strong>{item.homestayName}</strong>
                      <span>{item.bookings} bookings</span>
                    </div>
                    <div className="ao-ranking-metrics">
                      <strong>{formatCurrency(item.netRevenue)}</strong>
                      <small>{item.cancelledBookings} cancelled</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>

          <ChartCard
            title="Attention Needed"
            subtitle="Newest pending homestays waiting for review"
          >
            <div className="ao-activity-list">
              {(analytics?.pendingHomestays || []).length === 0 ? (
                <div className="ao-empty">No pending homestays right now.</div>
              ) : (
                analytics.pendingHomestays.map((item) => (
                  <div key={item.id} className="ao-activity-item">
                    <div>
                      <strong>{item.homestayName}</strong>
                      <span>{item.ownerName} | {item.location}</span>
                    </div>
                    <div className="ao-activity-meta">
                      <strong>{formatCurrency(item.price)}</strong>
                      <small>{formatDate(item.submittedAt)}</small>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'homestays':
        return <AdminHomestays />;
      case 'users':
        return <AdminUsers />;
      case 'profile':
        return <AdminProfile />;
      default:
        return renderOverview();
    }
  };

  if (!user) {
    return <div className="ad-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-new">
      <aside className={`ad-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="ad-sidebar-header">
          <div className="ad-logo">
            <Settings size={28} className="ad-logo-icon" />
            {sidebarOpen && <span className="ad-logo-text">Admin Panel</span>}
          </div>
          <button className="ad-toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <div className="logo-wrapperr">
          <div className="logo-boxx" onClick={() => navigate('/')}>
            <img src={Logo} alt="Atithi Logo" className="logo-imagee" />
          </div>
        </div>

        <div className="ad-user-info">
          <div className="ad-user-avatar">
            <User size={24} />
          </div>
          {sidebarOpen && (
            <div className="ad-user-details">
              <span className="ad-user-name">{user.username}</span>
              <span className="ad-user-role">Administrator</span>
            </div>
          )}
        </div>

        <nav className="ad-nav">
          <button
            className={`ad-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Home size={20} />
            {sidebarOpen && <span>Overview</span>}
          </button>

          <button
            className={`ad-nav-item ${activeTab === 'homestays' ? 'active' : ''}`}
            onClick={() => setActiveTab('homestays')}
          >
            <Building2 size={20} />
            {sidebarOpen && <span>Homestays</span>}
          </button>

          <button
            className={`ad-nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} />
            {sidebarOpen && <span>Users</span>}
          </button>

          <button
            className={`ad-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <User size={20} />
            {sidebarOpen && <span>Profile</span>}
          </button>
        </nav>

        <button className="ad-logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      <main className={`ad-main ${sidebarOpen ? '' : 'expanded'}`}>
        <div className="ad-content">
          <div className="ad-topbar">
            <NotificationBell compact />
          </div>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

