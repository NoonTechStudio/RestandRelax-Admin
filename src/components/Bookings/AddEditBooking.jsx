import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Users, 
  Utensils,
  Save,
  ArrowLeft,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Wallet,
  AlertCircle,
  IndianRupee,
  Lock,
  Mail
} from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import Toast from '../ui/Toast';

const AddEditBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const API_BASE_URL = import.meta.env.VITE_API_CONNECTION_HOST;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  const [formData, setFormData] = useState({
    locationId: '',
    checkInDate: '',
    checkOutDate: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    adults: 1,
    kids: 0,
    withFood: false,
    paymentType: 'full',
    amountPaid: 0,
    remainingAmount: 0,
    pricing: {
      pricePerAdult: 0,
      pricePerKid: 0,
      extraPersonCharge: 0,
      totalPrice: 0
    },
    paymentStatus: 'pending'
  });

  const [locations, setLocations] = useState([]);
  const [bookedDates, setBookedDates] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  const [selectedLocationDetails, setSelectedLocationDetails] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      await fetchLocations();
      if (isEditMode) {
        await fetchBooking();
      } else {
        setLoading(false);
      }
    };
    
    initializeData();
  }, [id]);

  useEffect(() => {
    if (formData.locationId && locations.length > 0) {
      fetchBookedDates(formData.locationId);
      // Get location details for nightStay property
      const location = locations.find(loc => loc._id === formData.locationId);
      console.log('Setting selected location details:', location);
      setSelectedLocationDetails(location);
    }
  }, [formData.locationId, locations]);

  // Auto-calculate price when location, dates, or guests change (only for new bookings)
  useEffect(() => {
    console.log('🚀 Price calculation effect triggered:', {
      isEditMode,
      locationId: formData.locationId,
      checkInDate: formData.checkInDate,
      checkOutDate: formData.checkOutDate,
      adults: formData.adults,
      kids: formData.kids,
      withFood: formData.withFood,
      selectedLocationDetails: selectedLocationDetails
    });
    
    if (!isEditMode && formData.locationId && formData.checkInDate && selectedLocationDetails) {
      console.log('✅ Calling calculatePrice function');
      calculatePrice();
    }
  }, [formData.locationId, formData.checkInDate, formData.checkOutDate, formData.adults, formData.kids, formData.withFood, isEditMode, selectedLocationDetails]);

  const fetchLocations = async () => {
    try {
      setLocationsLoading(true);
      const response = await fetch(`${API_BASE_URL}/locations`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch locations: ${response.status}`);
      }
      
      const result = await response.json();
      
      let locationsData = [];
      if (result.success && Array.isArray(result.locations)) {
        locationsData = result.locations;
      } else if (Array.isArray(result)) {
        locationsData = result;
      } else if (result.data && Array.isArray(result.data)) {
        locationsData = result.data;
      }
      
      console.log('📋 Loaded locations:', locationsData);
      console.log('📊 Sample location pricing:', locationsData[0]?.pricing);
      
      setLocations(locationsData);
      
      if (locationsData.length === 0) {
        showToast('No locations available. Please add locations first.', 'warning');
      }
      
    } catch (error) {
      console.error('Error fetching locations:', error);
      showToast('Failed to load locations. Please check if locations API is available.', 'error');
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to load booking');
      }
      
      const booking = data.booking;
      
      // Handle location ID - it could be an object (populated) or string ID
      const locationId = booking.location?._id || booking.location;
      
      // Get location details to check nightStay property
      const locationRes = await fetch(`${API_BASE_URL}/locations/${locationId}`);
      const locationData = await locationRes.json();
      setSelectedLocationDetails(locationData);

      setFormData({
        locationId: locationId || '',
        checkInDate: booking.checkInDate ? new Date(booking.checkInDate).toISOString().split('T')[0] : '',
        checkOutDate: booking.checkOutDate ? new Date(booking.checkOutDate).toISOString().split('T')[0] : '',
        name: booking.name || '',
        phone: booking.phone || '',
        email: booking.email || '', 
        address: booking.address || '',
        adults: booking.adults || 1,
        kids: booking.kids || 0,
        withFood: booking.withFood || false,
        paymentType: booking.paymentType || 'full',
        amountPaid: booking.amountPaid || 0,
        remainingAmount: booking.remainingAmount || 0,
        pricing: {
          pricePerAdult: booking.pricing?.pricePerAdult || 0,
          pricePerKid: booking.pricing?.pricePerKid || 0,
          extraPersonCharge: booking.pricing?.extraPersonCharge || 0,
          totalPrice: booking.pricing?.totalPrice || 0
        },
        paymentStatus: booking.paymentStatus || 'pending'
      });
      
    } catch (error) {
      console.error('Error fetching booking:', error);
      showToast('Failed to load booking details', 'error');
      navigate('/bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookedDates = async (locationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/bookings/dates/${locationId}`);
      const data = await response.json();
      if (data.success) {
        // Extract date strings from booked dates
        const dates = data.bookedDates.map(bd => {
          if (typeof bd.date === 'string') {
            return bd.date.split('T')[0];
          } else {
            return new Date(bd.date).toISOString().split('T')[0];
          }
        });
        setBookedDates(dates);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
      setBookedDates([]);
    }
  };

  // Check if a specific date is booked
  const isDateBooked = (dateString) => {
    return bookedDates.includes(dateString);
  };

  // FIXED: Check if any date in a range is booked (INCLUDING check-out date)
  const isDateRangeBooked = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const currentDate = new Date(start);
    
    // Include the end date in the check by using <=
    while (currentDate <= end) {
      const dateString = currentDate.toISOString().split('T')[0];
      if (isDateBooked(dateString)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  // Get the minimum selectable date for check-out
  const getMinCheckoutDate = () => {
    if (!formData.checkInDate) return new Date().toISOString().split('T')[0];
    
    const nextDay = new Date(formData.checkInDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  // Check if a date should be disabled in the date picker
  const isDateDisabled = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates and booked dates
    return date < today || isDateBooked(dateString);
  };

  const calculatePrice = async () => {
    if (!formData.locationId || !formData.checkInDate) {
      console.log('❌ Cannot calculate price: missing locationId or checkInDate');
      return;
    }

    try {
      setCalculatingPrice(true);
      
      console.log('🔍 Available locations:', locations);
      console.log('🔍 Looking for location with ID:', formData.locationId);
      
      const selectedLocation = locations.find(loc => loc._id === formData.locationId);
      
      console.log('🎯 Selected location for pricing calculation:', selectedLocation);
      
      if (!selectedLocation) {
        console.error('❌ Selected location not found in locations array');
        return;
      }

      const nights = calculateNights();
      
      console.log('📅 Nights calculation:', {
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        nights
      });
      
      // For day picnic (nightStay: false), nights should be 0
      const isDayPicnic = selectedLocation.propertyDetails?.nightStay === false;
      const effectiveNights = isDayPicnic ? 0 : (nights > 0 ? nights : 1);
      
      // IMPORTANT: For day picnic, effectiveNights should be 1, not 0
      // Day picnic is 1 day (same day checkout)
      const finalNights = isDayPicnic ? 1 : effectiveNights;

      console.log('🎪 Day picnic status:', {
        isDayPicnic,
        nightStay: selectedLocation.propertyDetails?.nightStay,
        effectiveNights,
        finalNights
      });

      // Calculate base price - IMPORTANT FIX HERE
      const pricePerAdult = selectedLocation.pricing?.pricePerAdult || 1000;
      const pricePerKid = selectedLocation.pricing?.pricePerKid || 500;
      
      console.log('💰 Pricing values:', {
        pricePerAdult,
        pricePerKid,
        adults: formData.adults,
        kids: formData.kids,
        finalNights
      });

      const adultPrice = pricePerAdult * formData.adults * finalNights;
      const kidPrice = pricePerKid * formData.kids * finalNights;
      
      const totalPrice = adultPrice + kidPrice;

      console.log('🧮 Price calculations:', {
        adultPrice,
        kidPrice,
        totalPrice,
        finalNights,
        calculation: `(${pricePerAdult} × ${formData.adults} × ${finalNights}) + (${pricePerKid} × ${formData.kids} × ${finalNights}) = ${totalPrice}`
      });

      // Auto-calculate remaining amount based on payment type
      let amountPaid = formData.amountPaid;
      let remainingAmount = formData.remainingAmount;

      if (formData.paymentType === 'full') {
        amountPaid = totalPrice;
        remainingAmount = 0;
      } else if (formData.paymentType === 'token' && formData.amountPaid === 0) {
        // Default token amount for new bookings
        amountPaid = Math.min(3000, totalPrice);
        remainingAmount = totalPrice - amountPaid;
      }

      console.log('💳 Payment calculations:', {
        amountPaid,
        remainingAmount,
        paymentType: formData.paymentType
      });

      setFormData(prev => ({
        ...prev,
        pricing: {
          pricePerAdult,
          pricePerKid,
          extraPersonCharge: selectedLocation.pricing?.extraPersonCharge || 0,
          totalPrice
        },
        amountPaid,
        remainingAmount
      }));

    } catch (error) {
      console.error('❌ Error calculating price:', error);
    } finally {
      setCalculatingPrice(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log('📝 Form field changed:', { name, value, type, checked });
    
    // Only allow editing name, phone, and address in edit mode
    if (isEditMode && !['name', 'phone', 'address', 'email'].includes(name)) {
      return;
    }
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      const newValue = type === 'checkbox' ? checked : 
                      type === 'number' ? parseInt(value) || 0 : value;
      
      const updatedFormData = {
        ...formData,
        [name]: newValue
      };
      
      setFormData(updatedFormData);

      // Recalculate remaining amount when payment type changes (only for new bookings)
      if (!isEditMode && name === 'paymentType') {
        setTimeout(() => {
          setFormData(prev => {
            if (newValue === 'full') {
              return {
                ...prev,
                amountPaid: prev.pricing.totalPrice,
                remainingAmount: 0
              };
            } else if (newValue === 'token' && prev.amountPaid === prev.pricing.totalPrice) {
              // Set default token amount
              const tokenAmount = Math.min(3000, prev.pricing.totalPrice);
              return {
                ...prev,
                amountPaid: tokenAmount,
                remainingAmount: prev.pricing.totalPrice - tokenAmount
              };
            }
            return prev;
          });
        }, 0);
      }

      // For day picnic: automatically set checkout to same as check-in
      if (!isEditMode && name === 'checkInDate' && selectedLocationDetails?.propertyDetails?.nightStay === false) {
        console.log('🔄 Setting checkout date to same as check-in for day picnic');
        setFormData(prev => ({
          ...prev,
          checkOutDate: value
        }));
      }
      
      // For night stay: if check-in date changes and check-out date is before it, reset check-out date
      if (!isEditMode && name === 'checkInDate' && 
          formData.checkOutDate && value > formData.checkOutDate &&
          selectedLocationDetails?.propertyDetails?.nightStay !== false) {
        console.log('🔄 Resetting checkout date because check-in is after checkout');
        setFormData(prev => ({
          ...prev,
          checkOutDate: ''
        }));
      }
    }
  };

  const handleAmountPaidChange = (e) => {
    // Only allow amount changes for new bookings
    if (isEditMode) return;
    
    const amountPaid = parseFloat(e.target.value) || 0;
    const remainingAmount = Math.max(0, formData.pricing.totalPrice - amountPaid);
    
    setFormData(prev => ({
      ...prev,
      amountPaid,
      remainingAmount
    }));
  };

  const calculateNights = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  };

  const validateForm = () => {
    if (!formData.locationId) {
      showToast('Please select a location', 'error');
      return false;
    }

    if (!formData.checkInDate) {
      showToast('Please select check-in date', 'error');
      return false;
    }

    const checkIn = new Date(formData.checkInDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      showToast('Check-in date cannot be in the past', 'error');
      return false;
    }

    // For night stay: validate check-out date
    if (selectedLocationDetails?.propertyDetails?.nightStay !== false) {
      if (!formData.checkOutDate) {
        showToast('Please select check-out date', 'error');
        return false;
      }

      const checkOut = new Date(formData.checkOutDate);
      
      if (checkIn >= checkOut) {
        showToast('Check-out date must be after check-in date', 'error');
        return false;
      }

      // Check if any dates in the range are booked (only for new bookings)
      // FIXED: Now properly includes check-out date in the range check
      if (!isEditMode && isDateRangeBooked(formData.checkInDate, formData.checkOutDate)) {
        showToast('Some selected dates are already booked. Please select different dates.', 'error');
        return false;
      }
    }

    if (!formData.name.trim()) {
      showToast('Guest name is required', 'error');
      return false;
    }

    if (!formData.phone.trim()) {
      showToast('Phone number is required', 'error');
      return false;
    }

    if (!formData.email.trim()) {
      showToast('Email address is required for payment confirmation', 'error');
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      return false;
    }

    if (!formData.address.trim()) {
      showToast('Address is required', 'error');
      return false;
    }

    if (formData.adults < 1) {
      showToast('At least one adult is required', 'error');
      return false;
    }

    if (formData.pricing.totalPrice < 0) {
      showToast('Total price cannot be negative', 'error');
      return false;
    }

    if (formData.amountPaid < 0 || formData.remainingAmount < 0) {
      showToast('Payment amounts cannot be negative', 'error');
      return false;
    }

    if (formData.amountPaid + formData.remainingAmount !== formData.pricing.totalPrice) {
      showToast('Paid amount + remaining amount must equal total price', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);

    try {
      let response;
      
      // In edit mode, only send name, phone, and address
      const payload = isEditMode ? {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address
      } : {
        ...formData,
        email: formData.email,
        checkInDate: new Date(formData.checkInDate).toISOString(),
        // For day picnic, checkOutDate is same as checkInDate
        checkOutDate: selectedLocationDetails?.propertyDetails?.nightStay === false 
          ? new Date(formData.checkInDate).toISOString()
          : new Date(formData.checkOutDate).toISOString()
      };

      if (isEditMode) {
        response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();

      if (data.success) {
        showToast(isEditMode ? 'Booking updated successfully!' : 'Booking created successfully!', 'success');
        setSelectedBooking(data.booking);

        // Redirect to bookings list after successful creation
        if (!isEditMode) {
          setTimeout(() => {
            navigate('/bookings');
          }, 1500);
        }
      } else {
        throw new Error(data.error || (isEditMode ? 'Failed to update booking' : 'Failed to create booking'));
      }

    } catch (error) {
      console.error('Booking submission error:', error);
      const errorMessage = error.message || 
        (isEditMode ? 'Failed to update booking' : 'Failed to create booking');
      showToast(errorMessage, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getPaymentStatusBadge = () => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Paid' },
      failed: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      partially_paid: { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Partial Paid' }
    };
    
    const config = statusConfig[formData.paymentStatus] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPaymentTypeBadge = () => {
    const typeConfig = {
      full: { color: 'bg-blue-100 text-blue-800', label: 'Full Payment' },
      token: { color: 'bg-purple-100 text-purple-800', label: 'Token Payment' }
    };
    
    const config = typeConfig[formData.paymentType] || typeConfig.full;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Wallet className="w-4 h-4 mr-1" />
        {config.label}
      </span>
    );
  };

  const getLocationName = (locationId) => {
    const location = locations.find(loc => loc._id === locationId);
    return location ? `${location.name} - ${location.address?.city || location.city}` : 'Unknown Location';
  };

  const nights = calculateNights();
  const isFormValid = formData.locationId && formData.checkInDate && 
                     ((selectedLocationDetails?.propertyDetails?.nightStay === false) || formData.checkOutDate) &&
                     formData.name && formData.phone && formData.address && 
                     formData.adults >= 1 && formData.pricing.totalPrice >= 0;

  const PaymentBreakdown = () => {
    console.log('🧾 PaymentBreakdown rendering with:', {
      totalPrice: formData.pricing.totalPrice,
      amountPaid: formData.amountPaid,
      remainingAmount: formData.remainingAmount
    });
    
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">Total Amount:</span>
          <span className="text-lg font-bold text-gray-900">
            ₹{formData.pricing.totalPrice.toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Amount Paid:</span>
          <span className="font-medium text-green-600">₹{formData.amountPaid.toLocaleString()}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Remaining Amount:</span>
          <span className={`font-medium ${
            formData.remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'
          }`}>
            ₹{formData.remainingAmount.toLocaleString()}
          </span>
        </div>
        
        <div className="pt-2 border-t border-gray-200">
          {getPaymentTypeBadge()}
        </div>
      </div>
    );
  };

  // Custom date input component with booked dates highlighted in green
  const DateInput = ({ label, name, value, minDate, onChange, disabled = false, showCheckoutText = false }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} *
      </label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          required
          min={minDate}
          disabled={disabled || isEditMode}
          className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
      {value && isDateBooked(value) && (
        <p className="text-xs text-green-600 mt-1 flex items-center">
          <CheckCircle className="w-3 h-3 mr-1" />
          This date is booked
        </p>
      )}
      {showCheckoutText && (
        <p className="text-xs text-gray-500 mt-1">
          Checkout: Same day ({value ? new Date(value).toLocaleDateString() : 'Select check-in date'})
        </p>
      )}
    </div>
  );

  // Booked Dates Display Component
  const BookedDatesDisplay = () => {
    if (bookedDates.length === 0) return null;

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
          <h3 className="text-sm font-medium text-green-800">Booked Dates at this Location</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {bookedDates.slice(0, 10).map((date, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"
            >
              {new Date(date).toLocaleDateString()}
            </span>
          ))}
          {bookedDates.length > 10 && (
            <span className="text-xs text-green-600">
              +{bookedDates.length - 10} more dates
            </span>
          )}
        </div>
      </div>
    );
  };

  // Locked Section Component
  const LockedSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 opacity-75">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Icon className="w-5 h-5 mr-2 text-gray-400" />
        {title}
        <Lock className="w-4 h-4 ml-2 text-gray-400" />
        <span className="ml-2 text-sm font-normal text-gray-500 italic">
          (Locked in edit mode)
        </span>
      </h2>
      <div className="space-y-4 opacity-60">
        {children}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading booking details...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Booking' : 'Create New Booking'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update guest contact information' : 'Add a new reservation'}
            </p>
          </div>
        </div>
        
        {isEditMode && (
          <div className="flex items-center space-x-3">
            {getPaymentStatusBadge()}
            <button
              onClick={() => navigate(`/bookings/${id}`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Location & Dates */}
          <div className="space-y-6">
            {/* Location Selection - Show as locked in edit mode */}
            {isEditMode ? (
              <LockedSection title="Location & Dates" icon={Home}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Location *
                    </label>
                    <select
                      name="locationId"
                      value={formData.locationId}
                      onChange={handleChange}
                      required
                      disabled
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    >
                      <option value="">Choose a location</option>
                      {locations.map(location => (
                        <option key={location._id} value={location._id}>
                          {location.name} - {location.address?.city || location.city || 'Unknown City'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Current: {getLocationName(formData.locationId)}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput
                      label="Check-in Date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      minDate={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      disabled={true}
                    />

                    {/* Show checkout input only for night stays, show text for day picnic */}
                    {selectedLocationDetails?.propertyDetails?.nightStay !== false ? (
                      <DateInput
                        label="Check-out Date"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        minDate={getMinCheckoutDate()}
                        onChange={handleChange}
                        disabled={true}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date
                        </label>
                        <div className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              Same day: {formData.checkInDate ? new Date(formData.checkInDate).toLocaleDateString() : 'Select check-in date'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Day picnic - Checkout on same day
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {nights > 0 || selectedLocationDetails?.propertyDetails?.nightStay === false ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Duration:</strong> {selectedLocationDetails?.propertyDetails?.nightStay === false ? 'Day picnic (same day)' : `${nights} night${nights !== 1 ? 's' : ''}`}
                        {formData.checkInDate && formData.checkOutDate && selectedLocationDetails?.propertyDetails?.nightStay !== false && (
                          <span className="ml-2">
                            ({new Date(formData.checkInDate).toLocaleDateString()} to {new Date(formData.checkOutDate).toLocaleDateString()})
                          </span>
                        )}
                        {selectedLocationDetails?.propertyDetails?.nightStay === false && formData.checkInDate && (
                          <span className="ml-2">
                            ({new Date(formData.checkInDate).toLocaleDateString()})
                          </span>
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Home className="w-5 h-5 mr-2 text-gray-400" />
                  Location & Dates
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Location *
                    </label>
                    {locationsLoading ? (
                      <div className="flex items-center justify-center py-3">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-600">Loading locations...</span>
                      </div>
                    ) : (
                      <>
                        <select
                          name="locationId"
                          value={formData.locationId}
                          onChange={handleChange}
                          required
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="">Choose a location</option>
                          {locations.map(location => (
                            <option key={location._id} value={location._id}>
                              {location.name} - {location.address?.city || location.city || 'Unknown City'}
                              {location.propertyDetails?.nightStay === false ? ' (Day Picnic)' : ' (Night Stay)'}
                            </option>
                          ))}
                        </select>
                        {locations.length === 0 && !locationsLoading && (
                          <p className="text-xs text-red-500 mt-1">
                            No locations available. Please add locations first.
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DateInput
                      label="Check-in Date"
                      name="checkInDate"
                      value={formData.checkInDate}
                      minDate={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                    />

                    {/* Show checkout input only for night stays, show text for day picnic */}
                    {selectedLocationDetails?.propertyDetails?.nightStay !== false ? (
                      <DateInput
                        label="Check-out Date"
                        name="checkOutDate"
                        value={formData.checkOutDate}
                        minDate={getMinCheckoutDate()}
                        onChange={handleChange}
                      />
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Check-out Date
                        </label>
                        <div className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50">
                          <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <span className="text-gray-700">
                              Same day: {formData.checkInDate ? new Date(formData.checkInDate).toLocaleDateString() : 'Select check-in date'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Day picnic - Checkout on same day
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {(nights > 0 || selectedLocationDetails?.propertyDetails?.nightStay === false) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Duration:</strong> {selectedLocationDetails?.propertyDetails?.nightStay === false ? 'Day picnic (same day)' : `${nights} night${nights !== 1 ? 's' : ''}`}
                        {formData.checkInDate && formData.checkOutDate && selectedLocationDetails?.propertyDetails?.nightStay !== false && (
                          <span className="ml-2">
                            ({new Date(formData.checkInDate).toLocaleDateString()} to {new Date(formData.checkOutDate).toLocaleDateString()})
                          </span>
                        )}
                        {selectedLocationDetails?.propertyDetails?.nightStay === false && formData.checkInDate && (
                          <span className="ml-2">
                            ({new Date(formData.checkInDate).toLocaleDateString()})
                          </span>
                        )}
                      </p>
                      {calculatingPrice && (
                        <p className="text-xs text-blue-600 mt-1">
                          <LoadingSpinner size="sm" className="inline mr-1" />
                          Calculating price...
                        </p>
                      )}
                    </div>
                  )}

                  {/* Booked Dates Display */}
                  <BookedDatesDisplay />
                </div>
              </div>
            )}

            {/* Guest Information - Always editable */}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter guest full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Confirmation PDF will be sent to this email
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      rows="3"
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter complete address"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Guest Details & Pricing */}
          <div className="space-y-6">
            {/* Guest Details - Show as locked in edit mode */}
            {isEditMode ? (
              <LockedSection title="Guest Details" icon={Users}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults *
                      </label>
                      <input
                        type="number"
                        name="adults"
                        value={formData.adults}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        required
                        disabled
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kids
                      </label>
                      <input
                        type="number"
                        name="kids"
                        value={formData.kids}
                        onChange={handleChange}
                        min="0"
                        max="20"
                        disabled
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="withFood"
                      checked={formData.withFood}
                      onChange={handleChange}
                      disabled
                      className="w-4 h-4 text-gray-400 border-gray-300 rounded bg-gray-100 cursor-not-allowed"
                    />
                    <label className="ml-2 text-sm text-gray-700 flex items-center">
                      <Utensils className="w-4 h-4 mr-1" />
                      Include Food Service (+₹500 per person per day)
                    </label>
                  </div>
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-gray-400" />
                  Guest Details
                </h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adults *
                      </label>
                      <input
                        type="number"
                        name="adults"
                        value={formData.adults}
                        onChange={handleChange}
                        min="1"
                        max="20"
                        required
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kids
                      </label>
                      <input
                        type="number"
                        name="kids"
                        value={formData.kids}
                        onChange={handleChange}
                        min="0"
                        max="20"
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="withFood"
                      checked={formData.withFood}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label className="ml-2 text-sm text-gray-700 flex items-center">
                      <Utensils className="w-4 h-4 mr-1" />
                      Include Food Service (+₹500 per person per day)
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Pricing & Payment - Show as locked in edit mode */}
            {isEditMode ? (
              <LockedSection title="Pricing & Payment" icon={IndianRupee}>
                <div className="space-y-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50">
                        <input
                          type="radio"
                          name="paymentType"
                          value="full"
                          checked={formData.paymentType === 'full'}
                          onChange={handleChange}
                          disabled
                          className="text-gray-400"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Full Payment</span>
                          <p className="text-xs text-gray-500">Pay entire amount now</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50">
                        <input
                          type="radio"
                          name="paymentType"
                          value="token"
                          checked={formData.paymentType === 'token'}
                          onChange={handleChange}
                          disabled
                          className="text-gray-400"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Token Payment</span>
                          <p className="text-xs text-gray-500">Pay partial amount now</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <PaymentBreakdown />

                  {/* Manual Amount Input for Token Payments */}
                  {formData.paymentType === 'token' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Paid (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.amountPaid}
                            onChange={handleAmountPaidChange}
                            min="0"
                            max={formData.pricing.totalPrice}
                            step="100"
                            disabled
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remaining Amount (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.remainingAmount}
                            readOnly
                            disabled
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </LockedSection>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <IndianRupee className="w-5 h-5 mr-2 text-gray-400" />
                  Pricing & Payment
                </h2>
                
                <div className="space-y-4">
                  {/* Payment Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="paymentType"
                          value="full"
                          checked={formData.paymentType === 'full'}
                          onChange={handleChange}
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
                          value="token"
                          checked={formData.paymentType === 'token'}
                          onChange={handleChange}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <span className="text-sm font-medium text-gray-700">Token Payment</span>
                          <p className="text-xs text-gray-500">Pay partial amount now</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Payment Breakdown */}
                  <PaymentBreakdown />

                  {/* Manual Amount Input for Token Payments */}
                  {formData.paymentType === 'token' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount Paid (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.amountPaid}
                            onChange={handleAmountPaidChange}
                            min="0"
                            max={formData.pricing.totalPrice}
                            step="100"
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Remaining Amount (₹)
                        </label>
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="number"
                            value={formData.remainingAmount}
                            readOnly
                            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/bookings')}
                  className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid || saving || locations.length === 0}
                  className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {isEditMode ? 'Update Guest Info' : 'Create Booking'}
                    </>
                  )}
                </button>
              </div>

              {locations.length === 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs text-red-800">
                    <strong>No Locations Available:</strong> Please add locations before creating bookings.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddEditBooking;