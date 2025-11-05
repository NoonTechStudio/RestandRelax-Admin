// components/steps/BasicInformation.jsx
import React from 'react';

const BasicInformation = ({ formData, setFormData }) => {
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-700 mb-6">
        Basic Information
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Enter location name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Describe the location, facilities, and unique features"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Capacity of Persons *
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={formData.capacityOfPersons || ''}
            onChange={(e) => handleChange('capacityOfPersons', e.target.value)}
            placeholder="Enter number of persons"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-gray-500 text-xs mt-1">
            Enter the maximum number of persons this location can accommodate
          </p>
        </div>
      </div>
    </div>
  );
};

export default BasicInformation;