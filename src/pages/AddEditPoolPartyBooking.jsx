// components/Admin/AddEditPoolPartyBooking.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, AlertCircle, CheckCircle, Calendar, Clock, Users,
  Mail, Phone, User, Tag, Loader2, MapPin, XCircle, CreditCard, Wallet,
  Info, Lock, X, IndianRupee, Eye, Utensils, Home, ShieldCheck
} from 'lucide-react';
import axios from 'axios';

const InlineToast = ({ message, type = 'success', onClose }) => {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const Icon = icons[type] || CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 border rounded-lg shadow-lg max-w-sm ${styles[type] || styles.success}`}>
      <Icon className="w-5 h-5 mr-2 shrink-0" />
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Locked Section Component for Edit Mode
const LockedSection = ({ title, icon: Icon, children, note = "Locked in edit mode" }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 opacity-75">
    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
      <Icon className="w-5 h-5 mr-2 text-gray-400" />
      {title}
      <Lock className="w-4 h-4 ml-2 text-gray-400" />
      {note && (
        <span className="ml-2 text-sm font-normal text-gray-500 italic">
          ({note})
        </span>
      )}
    </h2>
    <div className="space-y-4 opacity-60">
      {children}
    </div>
  </div>
);

const AddEditPoolPartyBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locations, setLocations] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [poolPartyData, setPoolPartyData] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [showDebug, setShowDebug] = useState(false);
  
  // New state for payment options
  const [paymentType, setPaymentType] = useState('token'); // 'token' or 'full'
  const [tokenAmount, setTokenAmount] = useState(2000); // Default token amount
  
  const [formData, setFormData] = useState({
    locationId: '',
    guestName: '',
    email: '',
    phone: '',
    address: '',
    bookingDate: new Date().toISOString().split('T')[0],
    session: '',
    adults: 1,
    kids: 0,
    totalGuests: 1,
    status: 'confirmed',
    paymentType: 'token',
    amountPaid: 0,
    remainingAmount: 0,
    pricing: {
      pricePerAdult: 0,
      pricePerKid: 0,
      totalPrice: 0
    }
  });

  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  const getToken = () => {
    return localStorage.getItem('adminToken') || localStorage.getItem('token');
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  // Fetch pool party data for location
  const fetchPoolPartyForLocation = async (locationId) => {
    if (!locationId) return null;
    
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/pool-parties/location/${locationId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data._id) {
        setPoolPartyData(response.data);
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching pool party:', error);
      if (error.response?.status === 404) {
        showToast('Pool party configuration not found for this location. Please create pool party first.', 'error');
      }
      setPoolPartyData(null);
      return null;
    }
  };

  // Initialize form if editing
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await fetchLocations();
        
        if (id) {
          await fetchBookingById(id);
        } else {
          // For new bookings, set default payment values
          calculateRemainingAmount();
        }
      } catch (error) {
        console.error('Initialization error:', error);
        showToast('Failed to load page data', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [id]);

  const fetchBookingById = async (bookingId) => {
    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/pool-parties/bookings/${bookingId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const booking = response.data.booking || response.data;
        
        // Set payment type from booking data
        setPaymentType(booking.paymentType || 'token');
        if (booking.paymentType === 'token' && booking.amountPaid) {
          setTokenAmount(booking.amountPaid);
        }
        
        // Set form data for editing
        setFormData({
          locationId: booking.locationId?._id || booking.locationId || '',
          guestName: booking.guestName || '',
          email: booking.email || '',
          phone: booking.phone || '',
          address: booking.address || '',
          bookingDate: booking.bookingDate ? booking.bookingDate.split('T')[0] : new Date().toISOString().split('T')[0],
          session: booking.session || '',
          adults: booking.adults || 1,
          kids: booking.kids || 0,
          totalGuests: booking.totalGuests || 1,
          status: booking.status || 'confirmed',
          paymentType: booking.paymentType || 'token',
          amountPaid: booking.amountPaid || 0,
          remainingAmount: booking.remainingAmount || 0,
          pricing: booking.pricing || {
            pricePerAdult: 0,
            pricePerKid: 0,
            totalPrice: 0
          }
        });

        // Fetch sessions for this location and date
        const locationId = booking.locationId?._id || booking.locationId;
        if (locationId && booking.bookingDate) {
          await fetchSessions(locationId, booking.bookingDate.split('T')[0]);
          await fetchPoolPartyForLocation(locationId);
        }
      } else {
        throw new Error(response.data.error || 'Failed to fetch booking');
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
      showToast('Failed to load booking details', 'error');
    }
  };

  const fetchLocations = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${API_BASE_URL}/locations`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      let locationsData = [];
      
      if (response.data.success && Array.isArray(response.data.locations)) {
        locationsData = response.data.locations;
      } else if (Array.isArray(response.data)) {
        locationsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        locationsData = response.data.data;
      }
      
      setLocations(locationsData);
      
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Failed to fetch locations', 'error');
      setLocations([]);
    }
  };

  const fetchSessions = async (locationId, date) => {
    if (!locationId || !date) {
      setSessions([]);
      return;
    }

    try {
      const token = getToken();
      const response = await axios.get(
        `${API_BASE_URL}/pool-parties/sessions-availability/${locationId}?date=${date}`,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success && Array.isArray(response.data.sessions)) {
        setSessions(response.data.sessions);
      } else if (Array.isArray(response.data)) {
        setSessions(response.data);
      } else {
        setSessions([]);
        showToast('No sessions available for selected date', 'info');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      setSessions([]);
      showToast('Failed to fetch sessions', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Only allow editing guest info in edit mode
    if (isEditMode && !['guestName', 'email', 'phone', 'address', 'status'].includes(name)) {
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If location changes, fetch pool party and sessions
    if (name === 'locationId' && !isEditMode) {
      setPoolPartyData(null);
      if (value) {
        fetchPoolPartyForLocation(value);
      }
      setFormData(prev => ({ 
        ...prev, 
        [name]: value,
        session: '',
        bookingDate: new Date().toISOString().split('T')[0]
      }));
    }
    
    // If location or date changes, fetch sessions
    if ((name === 'locationId' || name === 'bookingDate') && !isEditMode) {
      const locationId = name === 'locationId' ? value : formData.locationId;
      const date = name === 'bookingDate' ? value : formData.bookingDate;
      if (locationId && date) {
        fetchSessions(locationId, date);
        setFormData(prev => ({ ...prev, session: '' }));
      }
    }
  };

  const handleNumberChange = (field, operation) => {
    // Don't allow number changes in edit mode
    if (isEditMode) return;
    
    const newValue = operation === 'increase' 
      ? formData[field] + 1
      : Math.max(field === 'adults' ? 1 : 0, formData[field] - 1);
    
    const updatedFormData = {
      ...formData,
      [field]: newValue,
      totalGuests: field === 'adults' || field === 'kids' 
        ? (field === 'adults' ? newValue : formData.adults) + (field === 'kids' ? newValue : formData.kids)
        : formData.totalGuests
    };
    
    setFormData(updatedFormData);
    
    // Recalculate price if session is already selected
    if (formData.session) {
      const selectedSession = sessions.find(s => s.session === formData.session);
      if (selectedSession) {
        handleSessionChange(selectedSession, updatedFormData);
      }
    }
  };

  const handleSessionChange = (session, customFormData = null) => {
    if (isEditMode) return;
    
    const currentFormData = customFormData || formData;
    
    const totalPrice = ((session.pricing?.perAdult || 0) * currentFormData.adults) + 
                       ((session.pricing?.perKid || 0) * currentFormData.kids);
    
    const updatedFormData = {
      ...currentFormData,
      session: session.session,
      pricing: {
        pricePerAdult: session.pricing?.perAdult || 0,
        pricePerKid: session.pricing?.perKid || 0,
        totalPrice: totalPrice
      }
    };
    
    setFormData(updatedFormData);
    
    // Recalculate payment amounts
    calculatePaymentAmounts(totalPrice, updatedFormData);
  };

  const calculatePaymentAmounts = (totalPrice, currentFormData = formData) => {
    let amountPaid = 0;
    let remainingAmount = 0;
    
    if (paymentType === 'full') {
      amountPaid = totalPrice;
      remainingAmount = 0;
    } else if (paymentType === 'token') {
      amountPaid = tokenAmount;
      remainingAmount = Math.max(0, totalPrice - tokenAmount);
    }
    
    setFormData(prev => ({
      ...prev,
      amountPaid,
      remainingAmount,
      pricing: {
        ...prev.pricing,
        totalPrice
      }
    }));
  };

  const calculateTotalPrice = () => {
    if (!formData.session) return 0;
    return (formData.pricing.pricePerAdult * formData.adults) + 
           (formData.pricing.pricePerKid * formData.kids);
  };

  const calculateRemainingAmount = () => {
    const totalPrice = calculateTotalPrice();
    const amountToPay = paymentType === 'full' ? totalPrice : tokenAmount;
    const remainingAmount = Math.max(0, totalPrice - amountToPay);
    
    setFormData(prev => ({
      ...prev,
      amountPaid: amountToPay,
      remainingAmount
    }));
    
    return remainingAmount;
  };

  const handlePaymentTypeChange = (type) => {
    if (isEditMode) return;
    
    setPaymentType(type);
    
    if (type === 'full') {
      const totalPrice = calculateTotalPrice();
      setFormData(prev => ({
        ...prev,
        amountPaid: totalPrice,
        remainingAmount: 0
      }));
    } else if (type === 'token') {
      calculateRemainingAmount();
    }
  };

  const handleTokenAmountChange = (e) => {
    if (isEditMode) return;
    
    const amount = parseInt(e.target.value) || 2000;
    setTokenAmount(amount);
    
    const totalPrice = calculateTotalPrice();
    const remainingAmount = Math.max(0, totalPrice - amount);
    
    setFormData(prev => ({
      ...prev,
      amountPaid: amount,
      remainingAmount
    }));
  };

  const validateForm = () => {
    if (!formData.locationId) {
      showToast('Please select a location', 'error');
      return false;
    }
    if (!poolPartyData) {
      showToast('No pool party configuration found for selected location', 'error');
      return false;
    }
    if (!formData.guestName.trim()) {
      showToast('Please enter guest name', 'error');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }
    if (!formData.phone.trim() || !/^\d{10}$/.test(formData.phone)) {
      showToast('Please enter a valid 10-digit phone number', 'error');
      return false;
    }
    if (!formData.address.trim()) {
      showToast('Please enter guest address', 'error');
      return false;
    }
    if (!formData.session) {
      showToast('Please select a session', 'error');
      return false;
    }
    if (formData.totalGuests < 1) {
      showToast('Please add at least 1 guest', 'error');
      return false;
    }

    const selectedSession = sessions.find(s => s.session === formData.session);
    if (selectedSession && selectedSession.availableCapacity < formData.totalGuests) {
      showToast(`Not enough capacity. Only ${selectedSession.availableCapacity} spots available.`, 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      showToast(isEditMode ? 'Updating booking...' : 'Creating booking...', 'info');

      const token = getToken();
      const totalPrice = calculateTotalPrice();
      
      // Prepare payload
      const payload = {
        poolPartyId: poolPartyData._id,
        locationId: formData.locationId,
        guestName: formData.guestName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        bookingDate: formData.bookingDate,
        session: formData.session,
        adults: formData.adults,
        kids: formData.kids,
        totalGuests: formData.totalGuests,
        status: formData.status,
        paymentType: paymentType,
        amountPaid: formData.amountPaid,
        remainingAmount: formData.remainingAmount,
        pricing: {
          pricePerAdult: formData.pricing.pricePerAdult,
          pricePerKid: formData.pricing.pricePerKid,
          totalPrice: totalPrice
        }
      };

      let response;
      if (isEditMode) {
        // Only update guest info and status in edit mode
        response = await axios.put(
          `${API_BASE_URL}/pool-parties/bookings/${id}`,
          {
            guestName: formData.guestName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            status: formData.status
          },
          {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            }
          }
        );
      } else {
        // Create new booking with payment details
        response = await axios.post(
          `${API_BASE_URL}/pool-parties/bookings`,
          payload,
          {
            headers: { 
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}` 
            }
          }
        );
      }

      if (response.data.success) {
        const successMessage = isEditMode 
          ? 'Booking updated successfully!' 
          : 'Booking created successfully! Payment can be collected from the bookings list.';
        showToast(successMessage, 'success');
        
        setTimeout(() => {
          navigate('/pool-party-bookings');
        }, 2000);
      } else {
        showToast(response.data.error || 'Operation failed', 'error');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      showToast(error.response?.data?.error || error.message || 'Failed to save booking', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/pool-party-bookings');
  };

  const toggleDebug = () => {
    setShowDebug(!showDebug);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking form...</p>
        </div>
      </div>
    );
  }

  // Payment Type Badge Component
  const PaymentTypeBadge = () => {
    const config = {
      full: { color: 'bg-blue-100 text-blue-800', label: 'Full Payment' },
      token: { color: 'bg-purple-100 text-purple-800', label: 'Token Payment' }
    };
    
    const currentConfig = config[paymentType] || config.token;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${currentConfig.color}`}>
        <Wallet className="w-4 h-4 mr-1" />
        {currentConfig.label}
      </span>
    );
  };

  // Status Badge Component
  const StatusBadge = () => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Confirmed' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Cancelled' },
      completed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Completed' }
    };
    
    const config = statusConfig[formData.status] || statusConfig.confirmed;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast.show && (
        <InlineToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Pool Party Booking' : 'Add New Pool Party Booking'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update basic booking information' : 'Create a new pool party booking'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditMode && (
            <>
              <StatusBadge />
              <PaymentTypeBadge />
              <button
                onClick={() => navigate(`/pool-party-bookings/${id}`)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </button>
            </>
          )}
          
          <button
            onClick={toggleDebug}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {showDebug ? 'Hide Debug' : 'Show Debug'}
          </button>
          
          <span className="text-sm text-gray-500">
            {isEditMode ? `Editing Booking #${id.slice(-8)}` : 'Creating new booking'}
          </span>
        </div>
      </div>

      {/* Payment Information Note for New Bookings */}
      {!isEditMode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-800 mb-1">Payment Information</h4>
              <p className="text-sm text-blue-700">
                New bookings will be created with <strong>pending payment status</strong>. 
                Payment can be collected later from the bookings list using the "Pay" button.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Panel */}
      {showDebug && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-yellow-800">Debug Information</h3>
            <button onClick={toggleDebug} className="text-yellow-600 hover:text-yellow-800">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs text-yellow-700">
            <p><strong>Edit Mode:</strong> {isEditMode ? 'Yes' : 'No'}</p>
            <p><strong>Payment Type:</strong> {paymentType}</p>
            <p><strong>Token Amount:</strong> ₹{tokenAmount}</p>
            <p><strong>Amount Paid:</strong> ₹{formData.amountPaid}</p>
            <p><strong>Remaining Amount:</strong> ₹{formData.remainingAmount}</p>
            <p><strong>Total Amount:</strong> ₹{calculateTotalPrice()}</p>
          </div>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Location & Date Section */}
            {isEditMode ? (
              <LockedSection title="Location & Date" icon={Home}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <select
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location._id || location.id} value={location._id || location.id}>
                          {location.name || location.title || location.locationName || `Location ${(location._id || location.id)?.slice(-6)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleInputChange}
                      required
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-gray-400" />
                  Location & Date
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Location *
                    </label>
                    <select
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleInputChange}
                      required
                      disabled={saving}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    >
                      <option value="">Select Location</option>
                      {locations.map((location) => (
                        <option key={location._id || location.id} value={location._id || location.id}>
                          {location.name || location.title || location.locationName || `Location ${(location._id || location.id)?.slice(-6)}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Booking Date *
                    </label>
                    <input
                      type="date"
                      name="bookingDate"
                      value={formData.bookingDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      disabled={saving}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Session Selection */}
            {isEditMode ? (
              <LockedSection title="Session Selection" icon={Clock} note="Cannot change session in edit mode">
                <div className="space-y-4">
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{formData.session}</h4>
                        <p className="text-sm text-gray-600">Selected Session</p>
                      </div>
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  Session Selection
                </h2>
                
                {sessions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sessions.map((sessionItem) => {
                      const isSelected = formData.session === sessionItem.session;
                      const isAvailable = sessionItem.isAvailable !== false;
                      const capacityLeft = sessionItem.availableCapacity || 0;
                      
                      return (
                        <div
                          key={sessionItem.session}
                          onClick={() => !saving && isAvailable && handleSessionChange(sessionItem)}
                          className={`border rounded-lg p-4 transition-all ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          } ${!isAvailable ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{sessionItem.session}</h4>
                              <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Clock size={14} />
                                {sessionItem.startTime} - {sessionItem.endTime}
                              </p>
                            </div>
                            {isSelected && (
                              <CheckCircle className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <div>
                              <p className="text-gray-700">
                                ₹{sessionItem.pricing?.perAdult || 0}/adult
                                {sessionItem.pricing?.perKid ? `, ₹${sessionItem.pricing.perKid}/kid` : ''}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-gray-500" />
                              <span className={`font-medium ${
                                capacityLeft < formData.totalGuests ? 'text-red-600' : 'text-gray-700'
                              }`}>
                                {capacityLeft} spots left
                              </span>
                            </div>
                          </div>
                          
                          {!isAvailable && (
                            <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                              <AlertCircle size={12} />
                              Not available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : formData.locationId && formData.bookingDate ? (
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle size={16} />
                      <p className="text-sm">No sessions available for the selected date. Please choose a different date or location.</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Info size={16} />
                      <p className="text-sm">Please select location and date to see available sessions.</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Guest Count */}
            {isEditMode ? (
              <LockedSection title="Guest Count" icon={Users} note="Cannot be changed">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900">Adults</h4>
                        <p className="text-sm text-gray-600">Ages 13+</p>
                      </div>
                      <div className="text-lg font-bold">{formData.adults}</div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="mb-3">
                        <h4 className="font-semibold text-gray-900">Kids</h4>
                        <p className="text-sm text-gray-600">Ages 2-12</p>
                      </div>
                      <div className="text-lg font-bold">{formData.kids}</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Guests: <span className="font-semibold">{formData.totalGuests}</span>
                  </div>
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  Guest Count
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Adults</h4>
                          <p className="text-sm text-gray-600">Ages 13+</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleNumberChange('adults', 'decrease')}
                            disabled={formData.adults <= 1 || saving}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{formData.adults}</span>
                          <button
                            type="button"
                            onClick={() => handleNumberChange('adults', 'increase')}
                            disabled={saving}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: ₹{formData.pricing.pricePerAdult || 0} per adult
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">Kids</h4>
                          <p className="text-sm text-gray-600">Ages 2-12</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleNumberChange('kids', 'decrease')}
                            disabled={formData.kids <= 0 || saving}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                          >
                            -
                          </button>
                          <span className="font-bold text-lg w-8 text-center">{formData.kids}</span>
                          <button
                            type="button"
                            onClick={() => handleNumberChange('kids', 'increase')}
                            disabled={saving}
                            className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-400"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Price: ₹{formData.pricing.pricePerKid || 0} per kid
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Guests: <span className="font-semibold">{formData.totalGuests}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Guest Information - Always Editable */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-400" />
                Guest Information
                {isEditMode && (
                  <span className="ml-2 text-sm font-normal text-green-600 italic">
                    (Editable)
                  </span>
                )}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="guestName"
                    value={formData.guestName}
                    onChange={handleInputChange}
                    required
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Enter guest name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      disabled={saving}
                      className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="guest@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      pattern="[0-9]{10}"
                      maxLength="10"
                      disabled={saving}
                      className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      placeholder="9876543210"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 transform text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={2}
                      disabled={saving}
                      className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      placeholder="Enter guest address"
                    />
                  </div>
                </div>
                
                {/* Booking Status - Editable in both modes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Booking Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    disabled={saving}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Options - Locked in Edit Mode */}
            {isEditMode ? (
              <LockedSection title="Payment Options" icon={Wallet}>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Payment Type:</span>
                      <PaymentTypeBadge />
                    </div>
                    
                    {paymentType === 'token' && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Token Amount:</span>
                          <span className="font-medium text-green-600">₹{tokenAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Wallet className="w-5 h-5 mr-2 text-gray-400" />
                  Payment Options
                </h2>
                
                <div className="space-y-4">
                  {/* Payment Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Type *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === 'full'}
                          onChange={() => handlePaymentTypeChange('full')}
                          disabled={saving}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Full Payment</span>
                          <p className="text-xs text-gray-500">Pay entire amount now</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          checked={paymentType === 'token'}
                          onChange={() => handlePaymentTypeChange('token')}
                          disabled={saving}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Token Payment</span>
                          <p className="text-xs text-gray-500">Pay partial amount now</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Token Amount Selection */}
                  {paymentType === 'token' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Token Amount *
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={tokenAmount}
                          onChange={handleTokenAmountChange}
                          min="1000"
                          max={calculateTotalPrice()}
                          step="500"
                          disabled={saving}
                          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Recommended: ₹2,000 - ₹5,000
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price Summary */}
            {formData.session && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Tag size={20} />
                  Price Summary
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adults ({formData.adults} × ₹{formData.pricing.pricePerAdult || 0})</span>
                    <span className="font-semibold">₹{((formData.pricing.pricePerAdult || 0) * formData.adults).toLocaleString()}</span>
                  </div>
                  
                  {formData.kids > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Kids ({formData.kids} × ₹{formData.pricing.pricePerKid || 0})</span>
                      <span className="font-semibold">₹{((formData.pricing.pricePerKid || 0) * formData.kids).toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-3 mt-3">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-blue-600">₹{calculateTotalPrice().toLocaleString()}</span>
                    </div>
                    
                    {/* Payment Breakdown */}
                    <div className="mt-4 space-y-2 border-t border-gray-300 pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status:</span>
                        <span className="font-semibold text-yellow-600">
                          Pending
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Amount Paid:</span>
                        <span className="font-medium text-green-600">₹{formData.amountPaid.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Remaining Amount:</span>
                        <span className={`font-medium ${
                          formData.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'
                        }`}>
                          ₹{formData.remainingAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      {!isEditMode && (
                        <div className="mt-2 text-sm text-gray-600">
                          <Info className="w-4 h-4 inline mr-1" />
                          Payment can be collected from the bookings list
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || (!isEditMode && !poolPartyData)}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {isEditMode ? 'Update Booking' : 'Create Booking'}
                </>
              )}
            </button>
          </div>
          
          {!isEditMode && !poolPartyData && formData.locationId && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Pool Party Not Configured:</strong> Please create a pool party configuration for this location first.
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default AddEditPoolPartyBooking;