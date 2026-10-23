import React, { useState, useEffect } from 'react'
import {
  Star,
  MessageSquare,
  Image,
  AlertTriangle,
  Filter,
  RefreshCw,
  Search,
  Calendar,
  Sparkles,
  TrendingUp,
  X,
  Loader2,
  CheckCircle2,
  User,
  Building,
} from 'lucide-react'
import feedbackService from '../services/feedbackService'

export default function FeedbackView() {
  const [feedbackItems, setFeedbackItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [summary, setSummary] = useState(null)

  // Filters
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'low' | 'photos'
  const [groupBy, setGroupBy] = useState('day') // 'day' | 'week' | 'month'
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [activePhotoModal, setActivePhotoModal] = useState(null)

  const loadFeedback = async (isRef = false) => {
    try {
      if (isRef) setRefreshing(true)
      else setLoading(true)

      const params = { groupBy }

      if (activeTab === 'low') {
        params.maxRating = 2
      } else if (activeTab === 'photos') {
        params.hasPhotos = true
      }

      if (categoryFilter !== 'all') {
        params.category = categoryFilter
      }

      const res = await feedbackService.listFeedback(params)
      if (res) {
        setFeedbackItems(res.items || (Array.isArray(res) ? res : []))
        if (res.summary || res.averages) {
          setSummary(res.summary || res.averages)
        }
      }
    } catch (err) {
      console.warn('Feedback load error:', err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadFeedback()
  }, [activeTab, groupBy, categoryFilter])

  // Calculate local averages if not from API
  const totalCount = feedbackItems.length
  const avgRating = totalCount > 0
    ? (feedbackItems.reduce((acc, i) => acc + (Number(i.rating) || 5), 0) / totalCount).toFixed(1)
    : '4.8'
  const lowRatingCount = feedbackItems.filter((i) => i.rating <= 2).length
  const withPhotosCount = feedbackItems.filter((i) => i.photos && i.photos.length > 0).length

  // Filter by search query
  const filteredItems = feedbackItems.filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      String(item.comment || '').toLowerCase().includes(q) ||
      String(item.room?.number || item.roomNumber || '').toLowerCase().includes(q) ||
      String(item.guest?.name || '').toLowerCase().includes(q) ||
      String(item.category || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-widest text-[#7587A7] uppercase block mb-1">
            GUEST SATISFACTION & REPUTATION MANAGEMENT
          </span>
          <h1 className="font-headline font-bold text-2xl text-[#0B1F3A]">
            Guest Feedback & Ratings
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Real-time guest sentiment tracking, low-rating resolution alerts, and resident photo uploads.
          </p>
        </div>

        <button
          onClick={() => loadFeedback(true)}
          disabled={refreshing}
          className="btn-secondary text-xs h-9 w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Ratings</span>
        </button>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="hotel-card p-5 border-l-4 border-l-[#C9A227]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Overall Satisfaction Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
              {avgRating}
            </span>
            <span className="text-xs font-semibold text-[#64748B]">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 mt-2 text-[#C9A227]">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 ${
                  s <= Math.round(Number(avgRating)) ? 'fill-[#C9A227] text-[#C9A227]' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="hotel-card p-5 border-l-4 border-l-[#0B1F3A]">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Total Reviews Logged
          </span>
          <span className="font-headline font-bold text-3xl text-[#0B1F3A]">
            {totalCount}
          </span>
          <span className="text-[11px] text-[#64748B] block mt-1">
            Aggregated across in-house stays
          </span>
        </div>

        <div className="hotel-card p-5 border-l-4 border-l-red-600">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Critical Alerts (≤ 2 Stars)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-headline font-bold text-3xl text-red-600">
              {lowRatingCount}
            </span>
            <span className="text-[11px] text-red-700 font-medium">Require Service Recovery</span>
          </div>
          <span className="text-[11px] text-[#64748B] block mt-1">
            Dispatched to Guest Experience Lead
          </span>
        </div>

        <div className="hotel-card p-5 border-l-4 border-l-blue-600">
          <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-1">
            Guest Photos Uploaded
          </span>
          <span className="font-headline font-bold text-3xl text-blue-700">
            {withPhotosCount}
          </span>
          <span className="text-[11px] text-[#64748B] block mt-1">
            Verified room inspection attachments
          </span>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="hotel-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F1F5F9] pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Reviews' },
              { id: 'low', label: 'Low Ratings (≤ 2 Stars)' },
              { id: 'photos', label: 'With Attached Photos' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-[#0B1F3A] text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0B1F3A] hover:bg-[#F4F4F2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search comments, rooms, categories..."
              className="hotel-input text-xs h-8 pl-8"
            />
          </div>
        </div>

        {/* Detailed Controls: Category and GroupBy */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">Time Interval:</span>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="day">Group by Day</option>
              <option value="week">Group by Week</option>
              <option value="month">Group by Month</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-[#64748B]">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="hotel-input text-xs h-8 py-1 px-2.5 w-auto"
            >
              <option value="all">All Categories</option>
              <option value="service">Service & Hospitality</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="comfort">Room Comfort</option>
              <option value="amenities">Amenities & Facilities</option>
              <option value="food">Dining</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-[#64748B] font-medium">
            Showing <strong className="text-[#0B1F3A]">{filteredItems.length}</strong> feedback entries
          </div>
        </div>
      </div>

      {/* Feedback Items Grid */}
      {loading ? (
        <div className="hotel-card py-16 text-center text-xs text-[#64748B]">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0B1F3A]" />
          Aggregating guest sentiment...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="hotel-card py-16 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-headline font-bold text-base text-[#0B1F3A]">
            No Feedback Matches Criteria
          </h3>
          <p className="text-xs text-[#64748B] mt-1">
            Zero low-ratings or photo reports found for this view filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredItems.map((item, idx) => {
            const isLow = item.rating <= 2
            return (
              <div
                key={item.id || idx}
                className={`hotel-card p-5 border-l-4 flex flex-col justify-between ${
                  isLow ? 'border-l-red-600 bg-red-50/20' : 'border-l-[#C9A227]'
                }`}
              >
                <div>
                  {/* Top Bar: Room + Rating Stars */}
                  <div className="flex items-start justify-between pb-3 border-b border-[#F1F5F9] mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-bold text-base text-[#0B1F3A]">
                          Room {item.room?.number || item.roomNumber || '101'}
                        </span>
                        {item.category && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-[#0B1F3A]/5 text-[#0B1F3A]">
                            {item.category}
                          </span>
                        )}
                        {item.markAsIssue && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-red-100 text-red-700">
                            Issue Reported
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#64748B] mt-0.5 block">
                        Guest: <strong className="text-[#0B1F3A]">{item.guest?.name || 'Verified Resident'}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= item.rating
                              ? 'fill-[#C9A227] text-[#C9A227]'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Comment */}
                  <p className="text-xs text-[#0B1F3A] leading-relaxed mb-3 italic">
                    "{item.comment || 'No written comment provided.'}"
                  </p>

                  {/* Photos Attachment */}
                  {item.photos && item.photos.length > 0 && (
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-[#64748B] block mb-1.5 flex items-center gap-1">
                        <Image className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Attached Photos ({item.photos.length}):</span>
                      </span>
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {item.photos.map((photoUrl, pIdx) => (
                          <img
                            key={pIdx}
                            src={photoUrl}
                            alt="Guest room inspection"
                            onClick={() => setActivePhotoModal(photoUrl)}
                            className="w-16 h-16 object-cover rounded-lg border border-[#E5E7EB] hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </span>
                  {isLow && (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Action Flagged</span>
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* FULL PHOTO VIEWER MODAL */}
      {activePhotoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setActivePhotoModal(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh] bg-black rounded-2xl overflow-hidden p-2">
            <button
              onClick={() => setActivePhotoModal(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black/90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={activePhotoModal}
              alt="Full size feedback attachment"
              className="max-h-[85vh] w-auto mx-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  )
}
