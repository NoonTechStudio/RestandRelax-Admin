// components/steps/PricingAmenities.jsx
import React, { useState } from 'react';

const amenitiesOptions = [
  'yoga health center', 'Horseriding', 'Poolparty', 'Rain Shower', 'Swimming Pool', 'Treehouse', 'minizoo',
  'Indoor Game', 'Outdoor Game', 'Music', 'Banquet Hall', 'Garden Area', 'WiFi', 'Parking', 'Air Conditioning', 'Gym',
  'Restaurant', 'Spa', 'Bar', 'Room Service', 'Conference Room', 'Business Center', 'Laundry Service', 'Childcare',
  'Pet Friendly', 'Beach Access', 'Mountain View', 'Lake View', 'Hot Tub', 'Sauna', 'Tennis Court', 'Basketball Court',
  'Golf Course', 'Bicycle Rental', 'Car Rental', 'Airport Shuttle', 'Concierge', '24-Hour Front Desk', 'Security'
];

const PricingAmenities = ({ formData, setFormData }) => {
  const [amenityInput, setAmenityInput] = useState('');

  const handlePricingChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [field]: value
      }
    }));
  };

  const handleAddAmenity = (amenity) => {
    if (amenity && !formData.amenities.includes(amenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, amenity]
      }));
    }
    setAmenityInput('');
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const filteredAmenities = amenitiesOptions.filter(amenity =>
    amenity.toLowerCase().includes(amenityInput.toLowerCase()) &&
    !formData.amenities.includes(amenity)
  );

  // Group amenities for better organization in quick add
  const quickAddAmenities = [
    // Basic Amenities
    ['Parking','Swimming Pool'],
    // Leisure & Recreation
    ['yoga health center', 'Horseriding', 'Poolparty', 'Treehouse', 'minizoo'],
    // Sports & Games
    ['Indoor Game', 'Outdoor Game'],
    // Facilities
    ['Banquet Hall', 'Garden Area'],
    // Services
    ['Rain Shower', 'Music']
  ];

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Pricing & Amenities
      </h2>
      
      <div className="space-y-8">
        {/* Pricing Section */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Pricing Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Adult *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  value={formData.pricing.pricePerAdult || ''}
                  onChange={(e) => handlePricingChange('pricePerAdult', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Per Kid
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  value={formData.pricing.pricePerKid || ''}
                  onChange={(e) => handlePricingChange('pricePerKid', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Person Charge
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">₹</span>
                </div>
                <input
                  type="number"
                  value={formData.pricing.extraPersonCharge || ''}
                  onChange={(e) => handlePricingChange('extraPersonCharge', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Amenities Section */}
        <div>
          <h3 className="text-md font-medium text-gray-900 mb-4">Amenities</h3>
          
          {/* Selected Amenities */}
          {formData.amenities.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Amenities ({formData.amenities.length})
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200 min-h-12">
                {formData.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm border border-blue-200"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Amenity Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search and Add Amenity
            </label>
            <div className="relative">
              <input
                type="text"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                placeholder="Type to search all amenities..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              
              {/* Amenity Suggestions */}
              {amenityInput && filteredAmenities.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {filteredAmenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => handleAddAmenity(amenity)}
                    >
                      {amenity}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Type to search from {amenitiesOptions.length} available amenities
            </p>
          </div>

          {/* Quick Add Sections */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Quick Add Amenities
            </label>
            
            {quickAddAmenities.map((amenityGroup, index) => (
              <div key={index} className="flex flex-wrap gap-2">
                {amenityGroup.map((amenity) => (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => handleAddAmenity(amenity)}
                    disabled={formData.amenities.includes(amenity)}
                    className={`px-3 py-2 text-sm rounded-md transition-colors ${
                      formData.amenities.includes(amenity)
                        ? 'bg-green-100 text-green-700 border border-green-300 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                    }`}
                  >
                    {amenity}
                    {formData.amenities.includes(amenity) && ' ✓'}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* All Available Amenities Count */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Tip:</strong> You can add any of the {amenitiesOptions.length} available amenities. 
              Use the search above or quick add buttons to quickly select amenities for your property.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingAmenities;