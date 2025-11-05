// components/LocationForm.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import BasicInformation from '../components/Locations/steps/BasicInformation';
import LocationAddress from '../components/Locations/steps/LocationAddress';
import PropertyFeatures from '../components/Locations/steps/PropertyFeatures';
import PricingAmenities from '../components/Locations/steps/PricingAmenities';
import ReviewSubmit from '../components/Locations/steps/ReviewSubmit';
import { getLocationById, createLocation, updateLocation } from '../services/locationApi';

const steps = [
  'Basic Information',
  'Location & Address',
  'Property Features',
  'Pricing & Amenities',
  'Review & Submit'
];

const LocationForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: ''
    },
    coordinates: {
      lat: null,
      lng: null
    },
    description: '',
    capacityOfPersons: '',
    propertyDetails: {
      bedrooms: '',
      acBedrooms: '',
      nonAcBedrooms: '',
      kitchens: '',
      livingRooms: '',
      halls: '',
      bathrooms: '',
      swimmingPools: '',
      privateRooms: '',
      withFood: false,
      nightStay: false
    },
    amenities: [],
    pricing: {
      pricePerAdult: '',
      pricePerKid: '',
      extraPersonCharge: ''
    }
  });

  useEffect(() => {
    if (id) {
      fetchLocationData();
    }
  }, [id]);

  const fetchLocationData = async () => {
    try {
      setLoading(true);
      const location = await getLocationById(id);
      setFormData(location);
      toast.success('Location data loaded successfully');
    } catch (error) {
      toast.error('Failed to load location data');
      console.error('Error fetching location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const validateCurrentStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.name.trim() || !formData.capacityOfPersons) {
          toast.error('Please fill all required fields in Basic Information');
          return false;
        }
        break;
      case 1:
        if (!formData.address.line1 || !formData.address.city || 
            !formData.address.state || !formData.address.pincode) {
          toast.error('Please fill all required address fields');
          return false;
        }
        break;
      case 2:
        if (!formData.propertyDetails.bedrooms) {
          toast.error('Please specify number of bedrooms');
          return false;
        }
        break;
      case 3:
        if (!formData.pricing.pricePerAdult) {
          toast.error('Please specify price per adult');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        capacityOfPersons: parseInt(formData.capacityOfPersons),
        propertyDetails: {
          ...formData.propertyDetails,
          bedrooms: parseInt(formData.propertyDetails.bedrooms || 0),
          acBedrooms: parseInt(formData.propertyDetails.acBedrooms || 0),
          nonAcBedrooms: parseInt(formData.propertyDetails.nonAcBedrooms || 0),
          kitchens: parseInt(formData.propertyDetails.kitchens || 0),
          livingRooms: parseInt(formData.propertyDetails.livingRooms || 0),
          halls: parseInt(formData.propertyDetails.halls || 0),
          bathrooms: parseInt(formData.propertyDetails.bathrooms || 0),
          swimmingPools: parseInt(formData.propertyDetails.swimmingPools || 0),
          privateRooms: parseInt(formData.propertyDetails.privateRooms || 0)
        },
        pricing: {
          pricePerAdult: parseFloat(formData.pricing.pricePerAdult || 0),
          pricePerKid: parseFloat(formData.pricing.pricePerKid || 0),
          extraPersonCharge: parseFloat(formData.pricing.extraPersonCharge || 0)
        }
      };

      if (id) {
        await updateLocation(id, submitData);
        toast.success('Location updated successfully!');
      } else {
        await createLocation(submitData);
        toast.success('Location created successfully!');
      }
      
      navigate('/locations');
    } catch (error) {
      toast.error(`Failed to ${id ? 'update' : 'create'} location`);
      console.error('Error submitting location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowCancelConfirm(true);
  };

  const confirmCancel = () => {
    setShowCancelConfirm(false);
    navigate('/locations');
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return <BasicInformation formData={formData} setFormData={setFormData} />;
      case 1:
        return <LocationAddress formData={formData} setFormData={setFormData} />;
      case 2:
        return <PropertyFeatures formData={formData} setFormData={setFormData} />;
      case 3:
        return <PricingAmenities formData={formData} setFormData={setFormData} />;
      case 4:
        return <ReviewSubmit formData={formData} />;
      default:
        return null;
    }
  };

  if (loading && id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header Card */}
      <div className="w-full bg-white p-6 mb-6 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="w-1 h-24 bg-blue-600 rounded mr-4"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {id ? 'Edit Location' : 'Create New Location'}
            </h1>
            <p className="text-gray-600 mt-2">
              {id ? 'Edit existing location details' : 'Add a new location to your property portfolio'}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Card */}
      <div className="w-full bg-white p-6 mb-6 rounded-lg shadow-lg">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Step {activeStep + 1} of {steps.length}: {steps[activeStep]}
          </h2>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${index === activeStep 
                  ? 'bg-blue-600 text-white border-2 border-blue-600' 
                  : index < activeStep 
                    ? 'bg-green-500 text-white border-2 border-green-500'
                    : 'bg-white text-gray-400 border-2 border-gray-300'
                }
              `}>
                {index < activeStep ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span className={`
                text-xs mt-2 text-center max-w-24
                ${index === activeStep ? 'text-blue-600 font-medium' : 'text-gray-500'}
              `}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content Card */}
      <div className="w-full bg-white p-6 rounded-lg shadow-lg">
        {renderStepContent()}
        
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          
          <div className="space-x-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0 || loading}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Back
            </button>
            
            {activeStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Submitting...' : (id ? 'Update Location' : 'Create Location')}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Cancellation
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel? All unsaved changes will be lost.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                No, Continue Editing
              </button>
              <button
                onClick={confirmCancel}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationForm;