// Updated Dashboard.jsx with payment details in recent bookings
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  User, Settings, Shield, Calendar, 
  IndianRupee, MapPin, Star, TrendingUp,
  Users, Home, CalendarDays, CreditCard, Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard/stats`),
        fetch(`${API_BASE_URL}/dashboard/recent-activity`)
      ]);
      
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();

      if (statsData.success) setDashboardStats(statsData.stats);
      if (activityData.success) setRecentActivity(activityData.recentActivity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Total Bookings',
      value: dashboardStats?.overview.totalBookings || 0,
      change: '+12%',
      changeType: 'positive',
      href: '/bookings',
      icon: Calendar,
      color: 'blue'
    },
    {
      name: 'Active Locations',
      value: dashboardStats?.overview.totalLocations || 0,
      change: 'All Active',
      changeType: 'neutral',
      href: '/locations',
      icon: MapPin,
      color: 'orange'
    }
  ];

  // Helper function to format payment type
  const formatPaymentType = (type) => {
    const paymentTypes = {
      'cash': 'Cash',
      'card': 'Card',
      'upi': 'UPI',
      'online': 'Online',
      'partial': 'Partial'
    };
    return paymentTypes[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Resort management dashboard - Overview of your business performance.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              to="/bookings"
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2" />
              View Bookings
            </Link>
          </div>
        </div>
      </div>

      {/* Resort Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <div className={`inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    stat.changeType === 'positive' 
                      ? 'bg-green-100 text-green-800'
                      : stat.changeType === 'negative'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {stat.change}
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-${stat.color}-50 group-hover:bg-${stat.color}-100 transition-colors`}>
                  <IconComponent className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Bookings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarDays className="w-5 h-5 mr-2 text-gray-400" />
            Recent Bookings
          </h3>
          <div className="space-y-3">
            {recentActivity?.bookings?.slice(0, 5).map((booking) => (
              <div key={booking._id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{booking.name}</p>
                    <p className="text-sm text-gray-600">{booking.phone}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{booking.pricing.totalPrice}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      booking.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Wallet className="w-4 h-4 text-blue-500 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500">Amount Paid</p>
                    <p className="text-sm font-semibold text-green-600">
                      ₹{booking.amountPaid || 0}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <IndianRupee className="w-4 h-4 text-orange-500 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500">Remaining</p>
                    <p className="text-sm font-semibold text-red-600">
                      ₹{booking.remainingAmount}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CreditCard className="w-4 h-4 text-purple-500 mr-1" />
                    </div>
                    <p className="text-xs text-gray-500">Payment Type</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatPaymentType(booking.paymentType || 'N/A')}
                    </p>
                  </div>
          
                </div>
              </div>
            ))}
          </div>
          <Link 
            to="/bookings" 
            className="block text-center mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all bookings →
          </Link>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Recent Reviews */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2 text-gray-400" />
              Recent Reviews
            </h3>
            <div className="space-y-3">
              {recentActivity?.reviews?.slice(0, 3).map((review) => (
                <div key={review._id} className="p-3 border border-gray-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-gray-900">{review.guestName}</p>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium ml-1">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{review.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {review.location?.name} • {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/bookings/new"
                className="p-3 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <span className="text-sm font-medium text-blue-700">New Booking</span>
              </Link>
              <Link
                to="/locations/new"
                className="p-3 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <MapPin className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <span className="text-sm font-medium text-green-700">Add Location</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;