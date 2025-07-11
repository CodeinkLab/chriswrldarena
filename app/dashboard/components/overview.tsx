/* eslint-disable react/no-unescaped-entities */
'use client'

import React, { useEffect, useState } from 'react'
import Analytics from '@/app/lib/analytics'
import { Users, Target, DollarSign, Crown, TrendingUp, Activity, BarChart3, FileText, CheckCircle, Clock, XCircle, CreditCard, ArrowDownRight, ArrowUpRight, Calendar } from 'lucide-react'
import { useAuth } from '@/app/contexts/AuthContext';
import { formatNumberShort } from '@/app/lib/function';
import toast from 'react-hot-toast';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  [key: string]: any;
}
interface Prediction {
  id: string;
  homeTeam: string;
  awayTeam: string;
  tip: string;
  result: string;
  createdAt: string;
  [key: string]: any;
}
interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  [key: string]: any;
}
interface Subscription {
  id: string;
  plan: string;
  status: string;
  startedAt: string;
  expiresAt: string;
  [key: string]: any;
}
interface BlogPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  [key: string]: any;
}

const Overview = ({ content }: any) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      const cacheKey = 'dashboard_summary_cache'
      const cache = typeof window !== 'undefined' ? localStorage.getItem(cacheKey) : null
      if (cache) {
        try {
          setSummary(JSON.parse(cache))
          setLoading(false)
        } catch { }
      }

      console.log('Fetched data:', content.summary)


      // Cache the fresh summary
      if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(content.summary))
      }
      setSummary(content.summary)
      setLoading(false)
      toast.success('Dashboard data loaded successfully!', {
        duration: 3000,
        position: 'top-right',
        style: {
          background: '#fff',
          color: '#333',
          fontSize: '14px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        },
        iconTheme: {
          primary: '#4CAF50',
          secondary: '#fff',
        },
      })
    }
    fetchAll()
  }, [])

  // Helper to safely get a value
  const safe = (fn: () => any, fallback: any = '...') => {
    try { const v = fn(); return v === undefined ? fallback : v } catch { return fallback }
  }

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "orange" }: any) => (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color === 'orange' ? 'from-orange-500 to-orange-600' :
              color === 'green' ? 'from-green-500 to-green-600' :
                color === 'purple' ? 'from-purple-500 to-purple-600' :
                  color === 'orange' ? 'from-orange-500 to-orange-600' :
                    'from-indigo-500 to-indigo-600'
              } text-white shadow-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trend > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(trend)}% vs last month
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  )

  const ActivityItem = ({ icon: Icon, title, subtitle, time, status }: any) => (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon size={16} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{title}</p>
        <p className="text-sm text-gray-500 truncate">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-xs text-gray-400">{time}</p>
        {status && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${status === 'Won' || status === 'completed' ? 'bg-green-100 text-green-700' :
            status === 'Pending' || status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
            {status === 'Won' || status === 'completed' ? <CheckCircle size={10} /> :
              status === 'Pending' || status === 'pending' ? <Clock size={10} /> :
                <XCircle size={10} />}
            {status}
          </div>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
            <span className="font-medium text-gray-700">Loading Dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="p-4 w-full mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Welcome back! 👋
              </h1>
              <p className="text-gray-600 mt-2">Here's what's happening with your platform today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-xl px-4 py-2 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-gray-700">Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6 mb-8">
          <StatCard
            icon={Users}
            title="Total Users"
            value={safe(() => formatNumberShort(summary.overview.totalUsers || '0'), '0')}
            subtitle="Active members"
            trend={12.5}
            color="orange"
          />
          <StatCard
            icon={Target}
            title="Predictions"
            value={safe(() => formatNumberShort(summary.overview.totalPredictions || '0'), '0')}
            subtitle="Total predictions"
            trend={8.3}
            color="green"
          />
          <StatCard
            icon={DollarSign}
            title="Revenue"
            value={safe(() => (user ? user.location?.currencysymbol : "$") + formatNumberShort(summary.overview.totalRevenue || '0'), '$0')}
            subtitle="Total earnings"
            trend={15.2}
            color="purple"
          />
          <StatCard
            icon={Crown}
            title="Subscriptions"
            value={safe(() => formatNumberShort(summary.overview.activeSubscriptions || '0'), '0')}
            subtitle="Active plans"
            trend={-2.1}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            title="Today's Revenue"
            value={safe(() => (user ? user.location?.currencysymbol : "$") + formatNumberShort(summary.todayMetrics.todayRevenue || '0'), '$0')}
            subtitle="Last 24 hours"
            trend={22.8}
            color="indigo"
          />
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Today's Activity</h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            <div className="grid grid-cols-3 gap-8 items-center">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Users</span>
                <span className="font-semibold text-orange-600">{safe(() => summary.todayMetrics.todayUsers, '0')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Predictions</span>
                <span className="font-semibold text-green-600">{safe(() => summary.todayMetrics.todayPredictions, '0')}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Transactions</span>
                <span className="font-semibold text-orange-600">{safe(() => summary.todayMetrics.todayRevenueCount, '0')}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Win Rate</h3>
              <BarChart3 className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Success Rate</span>
                <span className="font-semibold text-green-600">{safe(() => summary.trends.predictionPerformance.winRate.toFixed(1), '0')}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${safe(() => summary.trends.predictionPerformance.winRate, 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Top League</h3>
              <Crown className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3">
              <div className="text-center">
                <p className="font-semibold text-lg text-gray-900">{safe(() => summary.trends.predictionPerformance.mostSuccessfulLeague, '-')}</p>
                <p className="text-sm text-gray-500">Most successful predictions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Users className="text-orange-600" size={20} />
                <h3 className="font-semibold text-gray-900">New Members</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto no_scrollbar">
              {safe(() => summary.recentActivity.latestUsers, []).map((user: User) => (
                <ActivityItem
                  key={user.id}
                  icon={Users}
                  title={user.username}
                  subtitle={user.email}
                  time={new Date(user.createdAt).toLocaleDateString()}
                  status={user.role}
                />
              ))}
            </div>
          </div>

          {/* Recent Blog Posts */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <FileText className="text-purple-600" size={20} />
                <h3 className="font-semibold text-gray-900">Latest Posts</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto no_scrollbar">
              {safe(() => summary.recentActivity.latestBlogPosts, []).map((blog: BlogPost) => (
                <ActivityItem
                  key={blog.id}
                  icon={FileText}
                  title={blog.title}
                  subtitle={blog.slug}
                  time={new Date(blog.createdAt).toLocaleDateString()}
                />
              ))}
            </div>
          </div>

          {/* Recent Predictions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Target className="text-green-600" size={20} />
                <h3 className="font-semibold text-gray-900">Live Predictions</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto no_scrollbar">
              {safe(() => summary.recentActivity.latestPredictions, []).map((pred: Prediction) => (
                <ActivityItem
                  key={pred.id}
                  icon={Target}
                  title={`${pred.homeTeam} vs ${pred.awayTeam}`}
                  subtitle={`Tip: ${pred.tip}`}
                  time={new Date(pred.createdAt).toLocaleTimeString()}
                  status={pred.result}
                />
              ))}
            </div>
          </div>

          {/* Recent Payments */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <CreditCard className="text-orange-600" size={20} />
                <h3 className="font-semibold text-gray-900">Transactions</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-50 max-h-80 overflow-y-auto no_scrollbar">
              {safe(() => summary.recentActivity.latestPayments, []).map((pay: Payment) => (
                <ActivityItem
                  key={pay.id}
                  icon={DollarSign}
                  title={`${user?.location?.currencysymbol}${pay.amount.toFixed(2)}`}
                  subtitle="Payment received"
                  time={new Date(pay.createdAt).toLocaleDateString()}
                  status={pay.status}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* User Growth Chart */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="text-orange-600" size={20} />
                  <h3 className="font-semibold text-gray-900">User Growth Trend</h3>
                </div>
                <div className="text-sm text-gray-500">Last 5 days</div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {safe(() => summary.trends.userGrowth.userGrowth, []).map((growth: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Calendar className="text-gray-400" size={16} />
                      <div>
                        <p className="font-medium text-gray-900">{new Date(growth.date).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">New registrations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">{growth.count}</p>
                      <p className="text-xs text-gray-500">users</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-green-600" size={20} />
                <h3 className="font-semibold text-gray-900">Prediction Analytics</h3>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Win Rate</span>
                    <span className="text-sm font-bold text-green-600">{safe(() => summary.trends.predictionPerformance.winRate.toFixed(1), '0')}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${safe(() => summary.trends.predictionPerformance.winRate, 0)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Loss Rate</span>
                    <span className="text-sm font-bold text-red-600">{safe(() => summary.trends.predictionPerformance.lossRate.toFixed(1), '0')}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${safe(() => summary.trends.predictionPerformance.lossRate, 0)}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Pending Rate</span>
                    <span className="text-sm font-bold text-yellow-600">{safe(() => summary.trends.predictionPerformance.pendingRate.toFixed(1), '0')}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-3 rounded-full transition-all duration-1000" style={{ width: `${safe(() => summary.trends.predictionPerformance.pendingRate, 0)}%` }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-orange-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Crown className="text-purple-600" size={20} />
                      <div>
                        <p className="font-medium text-gray-900">Top League</p>
                        <p className="text-sm text-gray-600">{safe(() => summary.trends.predictionPerformance.mostSuccessfulLeague, '-')}</p>
                      </div>
                    </div>
                    <div className="text-purple-600">
                      <Trophy size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Trophy component (missing from lucide imports)
const Trophy = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55.47.98.97 1.21C12.04 18.75 13 20.24 13 22" />
    <path d="M14 14.66V17c0 .55-.47.98-.97 1.21C11.96 18.75 11 20.24 11 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </svg>
)

export default Overview

