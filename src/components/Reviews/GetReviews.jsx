import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Star,
  User,
  MapPin,
  Calendar,
  ThumbsUp,
  Trash2,
  Pencil,
  Plus,
  Filter,
  Search,
} from "lucide-react";

export default function GetReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]);
  const [filters, setFilters] = useState({
    location: "",
    rating: "",
    search: ""
  });
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  const fetchReviews = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.rating) queryParams.append('rating', filters.rating);
      
      const res = await fetch(`${API_BASE_URL}/reviews?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/locations`);
      if (!res.ok) throw new Error("Failed to fetch locations");
      const data = await res.json();
      setLocations(data);
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const showDeleteConfirmation = (reviewId, reviewTitle) => {
    toast.custom((t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">
                Delete Review
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Are you sure you want to delete "{reviewTitle}"? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-gray-200">
          <button
            onClick={() => {
              handleDelete(reviewId);
              toast.dismiss(t.id);
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Yes
          </button>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.error("Deletion cancelled");
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            No
          </button>
        </div>
      </div>
    ));
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/reviews/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Review deleted successfully!");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDeleteClick = (reviewId, reviewTitle) => {
    showDeleteConfirmation(reviewId, reviewTitle);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      location: "",
      rating: "",
      search: ""
    });
  };

  useEffect(() => {
    fetchReviews();
    fetchLocations();
  }, [filters]);

  const filteredReviews = reviews.filter(review => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    return (
      review.guestName.toLowerCase().includes(searchTerm) ||
      review.title.toLowerCase().includes(searchTerm) ||
      review.reviewText.toLowerCase().includes(searchTerm) ||
      (review.location?.name && review.location.name.toLowerCase().includes(searchTerm))
    );
  });

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <p className="text-gray-600 text-lg font-medium animate-pulse">
          Loading reviews...
        </p>
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-inter">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Star className="w-7 h-7 text-[#008DDA]" />
            Guest Reviews
          </h1>
          <p className="text-gray-600 mt-2">
            Manage and monitor guest feedback and ratings
          </p>
        </div>
        <button
          onClick={() => navigate("/reviews/new")}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-[#008DDA] text-white px-4 py-2 rounded-lg shadow hover:bg-[#0074b8] transition"
        >
          <Plus size={18} /> New Review
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Reviews
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by name, title, or content..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Resort
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Resorts</option>
                {locations.map((loc) => (
                  <option key={loc._id} value={loc._id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Rating
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Filter size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Reviews Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {filteredReviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">No reviews found</p>
          <p className="text-gray-400 mb-6">
            {reviews.length === 0 ? "No reviews have been submitted yet." : "No reviews match your filters."}
          </p>
          <button
            onClick={() => navigate("/reviews/new")}
            className="bg-[#008DDA] text-white px-6 py-2 rounded-lg hover:bg-[#0074b8] transition"
          >
            Add First Review
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all p-6"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
                    {review.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>{review.guestName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(review.stayDate)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <StarRating rating={review.rating} />
                  <span className="text-sm font-semibold text-yellow-700 ml-1">
                    {review.rating}.0
                  </span>
                </div>
              </div>

              {/* Location */}
              {review.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                  <MapPin size={14} />
                  <span className="font-medium">{review.location.name}</span>
                </div>
              )}

              {/* Review Text */}
              <p className="text-gray-700 mb-4 line-clamp-3">
                {review.reviewText}
              </p>

              {/* Recommendation */}
              <div className="flex items-center gap-2 mb-4">
                {review.wouldRecommend ? (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <ThumbsUp size={14} />
                    <span className="text-sm font-medium">Recommends</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full">
                    <ThumbsUp size={14} className="rotate-180" />
                    <span className="text-sm font-medium">Doesn't recommend</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  Submitted on {formatDate(review.createdAt)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/reviews/edit/${review._id}`)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-[#008DDA] text-white rounded-lg hover:bg-[#0074b8] transition"
                  >
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(review._id, review.title)}
                    className="flex items-center gap-2 px-3 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}