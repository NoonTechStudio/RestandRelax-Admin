// components/steps/ReviewSubmit.jsx
import React from 'react';

const ReviewSubmit = ({ formData }) => {
  const renderAddress = () => {
    const { address } = formData;
    return [
      address.line1,
      address.line2,
      `${address.city}, ${address.state} - ${address.pincode}`
    ].filter(Boolean).join(', ');
  };

  const formatFieldName = (fieldName) => {
    return fieldName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Review & Submit
      </h2>
      
      <div className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{formData.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Capacity</p>
              <p className="font-medium text-gray-900">{formData.capacityOfPersons} persons</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium text-gray-900">
                {formData.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>

        {/* Location & Address */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Location & Address</h3>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-gray-900">{renderAddress()}</p>
            {formData.coordinates.lat && formData.coordinates.lng && (
              <p className="text-sm text-gray-600">
                Coordinates: {formData.coordinates.lat.toFixed(6)}, {formData.coordinates.lng.toFixed(6)}
              </p>
            )}
          </div>
        </div>

        {/* Property Features */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Property Features</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(formData.propertyDetails).map(([key, value]) => {
              if (typeof value === 'boolean') {
                return value ? (
                  <div key={key} className="bg-green-50 border border-green-200 rounded px-3 py-2">
                    <p className="text-green-800 text-sm font-medium">{formatFieldName(key)}</p>
                  </div>
                ) : null;
              }
              return value ? (
                <div key={key}>
                  <p className="text-sm text-gray-600">{formatFieldName(key)}</p>
                  <p className="font-medium text-gray-900">{value}</p>
                </div>
              ) : null;
            }).filter(Boolean)}
          </div>
        </div>

        {/* Pricing & Amenities */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Pricing & Amenities</h3>
          </div>
          
          <div className="space-y-6">
            {/* Pricing */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pricing Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Price Per Adult</p>
                  <p className="text-xl font-semibold text-green-600">₹{formData.pricing.pricePerAdult}</p>
                </div>
                
                {formData.pricing.pricePerKid && (
                  <div>
                    <p className="text-sm text-gray-600">Price Per Kid</p>
                    <p className="text-xl font-semibold text-green-600">₹{formData.pricing.pricePerKid}</p>
                  </div>
                )}
                
                {formData.pricing.extraPersonCharge && (
                  <div>
                    <p className="text-sm text-gray-600">Extra Person Charge</p>
                    <p className="text-xl font-semibold text-green-600">₹{formData.pricing.extraPersonCharge}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Amenities */}
            {formData.amenities && formData.amenities.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.amenities.map((amenity) => (
                    <span
                      key={amenity}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Final Check */}
      <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <p className="text-green-800 font-medium">
            Please review all the information above. Click "Create Location" to proceed.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmit;