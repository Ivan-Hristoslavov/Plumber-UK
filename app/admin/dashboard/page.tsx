"use client";

import { useState, useEffect } from "react";

type DashboardStats = {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  weeklyRevenue: number;
  totalCustomers: number;
  pendingPayments: number;
};

type RecentActivity = {
  id: string;
  type: "booking" | "payment" | "customer";
  message: string;
  time: string;
  status: "success" | "warning" | "info";
};

// Empty data - will be loaded from Supabase
const mockStats: DashboardStats = {
  totalBookings: 0,
  pendingBookings: 0,
  completedBookings: 0,
  totalRevenue: 0,
  weeklyRevenue: 0,
  totalCustomers: 0,
  pendingPayments: 0,
};

const mockRecentActivity: RecentActivity[] = [];

const upcomingBookings = [];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(mockStats);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>(mockRecentActivity);
  const [upcomingBookings, setUpcomingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load dashboard data on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        // Ensure all stats properties exist with default values
        const safeStats = {
          totalBookings: data.stats?.total_bookings || 0,
          pendingBookings: data.stats?.pending_bookings || 0,
          completedBookings: data.stats?.completed_bookings || 0,
          totalRevenue: data.stats?.total_revenue || 0,
          weeklyRevenue: data.stats?.weekly_revenue || 0,
          totalCustomers: data.stats?.total_customers || 0,
          pendingPayments: data.stats?.pending_payments || 0,
        };
        setStats(safeStats);
        setRecentActivity(data.recentActivity || []);
        setUpcomingBookings(data.upcomingBookings || []);
      } else {
        console.error('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    title,
    value,
    change,
    icon,
    color,
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: React.ReactNode;
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p
              className={`text-sm mt-2 ${change.startsWith("+") ? "text-green-600" : "text-red-600"}`}
            >
              {change} from last week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "booking":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "payment":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        );
      case "customer":
        return (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "info":
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, Plamen! Here's what's happening today.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Export Report
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
            New Booking
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings || 0}
          change="+12%"
          color="bg-blue-100 text-blue-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
        />
        <StatCard
          title="Pending Bookings"
          value={stats.pendingBookings || 0}
          change="+3"
          color="bg-yellow-100 text-yellow-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={`£${(stats.totalRevenue || 0).toLocaleString()}`}
          change="+8%"
          color="bg-green-100 text-green-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers || 0}
          change="+5"
          color="bg-purple-100 text-purple-600"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Main Content Grid - Equal Height Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Activity
              </h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div
                        className={`p-2 rounded-full ${getStatusColor(activity.status)}`}
                      >
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-sm">No recent activity</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="flex flex-col">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                Upcoming Bookings
              </h2>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="space-y-4 flex-1">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.customer?.name || booking.customer_name || 'Unknown Customer'}
                        </p>
                        <p className="text-xs text-gray-500">{booking.service}</p>
                        <p className="text-xs text-gray-500">
                          {booking.date} at {booking.time}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          booking.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">No upcoming bookings</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all bookings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
