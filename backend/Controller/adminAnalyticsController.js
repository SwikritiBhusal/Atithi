import Booking from '../models/bookingModel.js';
import Homestay from '../models/homestayModel.js';
import userModel from '../models/usermodel.js';
import { autoCompletePastCheckoutBookings } from '../utils/bookingStatusUpdater.js';

const formatDayKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLastNDays = (days) => {
  const list = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const current = new Date(today);
    current.setDate(today.getDate() - offset);
    list.push(current);
  }

  return list;
};

const buildRevenueEntries = (bookings = []) =>
  bookings.map((booking) => {
    const cancellation = booking.cancellation || null;
    const deductionAmount = booking.status === 'cancelled'
      ? Number(cancellation?.refundAmount || booking.advancePayment || 0)
      : 0;
    const retainedAmount = booking.status === 'cancelled'
      ? Number(booking.advancePayment || 0) - deductionAmount
      : Number(booking.advancePayment || 0);

    return {
      bookingId: booking.bookingId,
      homestayName: booking.homestayName,
      guestName: booking.guestName,
      createdAt: booking.createdAt,
      status: booking.status,
      totalPrice: Number(booking.totalPrice || 0),
      collectedAmount: Number(booking.advancePayment || 0),
      pendingAmount: booking.status === 'cancelled' ? 0 : Number(booking.remainingPayment || 0),
      deductionAmount,
      netCollectedAmount: retainedAmount
    };
  });

const buildRevenueSummary = (entries = []) => entries.reduce((summary, entry) => {
  summary.grossRevenue += entry.totalPrice;
  summary.collectedRevenue += entry.collectedAmount;
  summary.pendingRevenue += entry.pendingAmount;
  summary.deductions += entry.deductionAmount;
  summary.netRevenue += entry.netCollectedAmount;
  return summary;
}, {
  grossRevenue: 0,
  collectedRevenue: 0,
  pendingRevenue: 0,
  deductions: 0,
  netRevenue: 0
});

export const getAdminOverviewAnalytics = async (req, res) => {
  try {
    await autoCompletePastCheckoutBookings();

    const [users, homestays, bookings] = await Promise.all([
      userModel.find({}).select('role isAccountVerified username email'),
      Homestay.find({})
        .select('homestayName ownerName district province status submittedAt approvedAt price')
        .sort({ submittedAt: -1 }),
      Booking.find({})
        .populate('cancellation')
        .sort({ createdAt: -1 })
    ]);

    const revenueEntries = buildRevenueEntries(bookings);
    const revenue = buildRevenueSummary(revenueEntries);

    const homestayStats = {
      total: homestays.length,
      pending: homestays.filter((item) => item.status === 'pending').length,
      approved: homestays.filter((item) => item.status === 'approved').length,
      rejected: homestays.filter((item) => item.status === 'rejected').length
    };

    const userStats = {
      total: users.length,
      hosts: users.filter((item) => item.role === 'host').length,
      tourists: users.filter((item) => item.role === 'tourist').length,
      admins: users.filter((item) => item.role === 'admin').length,
      verified: users.filter((item) => item.isAccountVerified).length
    };

    const bookingStats = {
      total: bookings.length,
      confirmed: bookings.filter((item) => item.status === 'confirmed').length,
      completed: bookings.filter((item) => item.status === 'completed').length,
      cancelled: bookings.filter((item) => item.status === 'cancelled').length,
      active: bookings.filter((item) => item.status === 'confirmed').length
    };

    const last30Days = getLastNDays(30);
    const bookingMap = new Map(
      last30Days.map((day) => [
        formatDayKey(day),
        {
          date: formatDayKey(day),
          label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          bookings: 0,
          collectedRevenue: 0
        }
      ])
    );

    bookings.forEach((booking) => {
      const createdAt = new Date(booking.createdAt);
      createdAt.setHours(0, 0, 0, 0);
      const key = formatDayKey(createdAt);

      if (bookingMap.has(key)) {
        const current = bookingMap.get(key);
        current.bookings += 1;
        current.collectedRevenue += Number(booking.advancePayment || 0);
      }
    });

    const topHomestaysMap = bookings.reduce((accumulator, booking) => {
      const key = booking.homestayName || 'Unknown Homestay';
      const current = accumulator.get(key) || {
        homestayName: key,
        bookings: 0,
        grossRevenue: 0,
        netRevenue: 0,
        cancelledBookings: 0
      };

      const cancellation = booking.cancellation || null;
      const deductionAmount = booking.status === 'cancelled'
        ? Number(cancellation?.refundAmount || booking.advancePayment || 0)
        : 0;

      current.bookings += 1;
      current.grossRevenue += Number(booking.totalPrice || 0);
      current.netRevenue += Number(booking.advancePayment || 0) - deductionAmount;
      if (booking.status === 'cancelled') current.cancelledBookings += 1;

      accumulator.set(key, current);
      return accumulator;
    }, new Map());

    const topHomestays = [...topHomestaysMap.values()]
      .sort((first, second) => second.netRevenue - first.netRevenue)
      .slice(0, 5);

    const recentBookings = bookings.slice(0, 6).map((booking) => ({
      id: booking._id,
      bookingId: booking.bookingId,
      guestName: booking.guestName,
      homestayName: booking.homestayName,
      status: booking.status,
      createdAt: booking.createdAt,
      collectedAmount: Number(booking.advancePayment || 0)
    }));

    const pendingHomestays = homestays
      .filter((item) => item.status === 'pending')
      .slice(0, 5)
      .map((item) => ({
        id: item._id,
        homestayName: item.homestayName,
        ownerName: item.ownerName,
        location: `${item.district}, ${item.province}`,
        submittedAt: item.submittedAt,
        price: Number(item.price || 0)
      }));

    return res.json({
      success: true,
      summary: {
        homestays: homestayStats,
        users: userStats,
        bookings: bookingStats,
        revenue
      },
      bookingTrend: [...bookingMap.values()],
      bookingStatusBreakdown: [
        { label: 'Confirmed', value: bookingStats.confirmed, tone: 'confirmed' },
        { label: 'Completed', value: bookingStats.completed, tone: 'completed' },
        { label: 'Cancelled', value: bookingStats.cancelled, tone: 'cancelled' }
      ],
      homestayStatusBreakdown: [
        { label: 'Approved', value: homestayStats.approved, tone: 'approved' },
        { label: 'Pending', value: homestayStats.pending, tone: 'pending' },
        { label: 'Rejected', value: homestayStats.rejected, tone: 'rejected' }
      ],
      userRoleBreakdown: [
        { label: 'Tourists', value: userStats.tourists, tone: 'tourists' },
        { label: 'Hosts', value: userStats.hosts, tone: 'hosts' },
        { label: 'Admins', value: userStats.admins, tone: 'admins' }
      ],
      topHomestays,
      recentBookings,
      pendingHomestays
    });
  } catch (error) {
    console.error('Get Admin Overview Analytics Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin overview analytics',
      error: error.message
    });
  }
};
