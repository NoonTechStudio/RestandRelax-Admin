// components/Locations/steps/PoolPartyDetails.jsx
import React, { useState, useEffect } from 'react';

const defaultTimings = [
  { session: 'Morning', startTime: '08:00', endTime: '14:00' },
  { session: 'Evening', startTime: '15:00', endTime: '21:00' },
  { session: 'Full Day', startTime: '08:00', endTime: '20:00' }
];

const validatePoolPartyStep = (formData, poolPartyData, useDefaultTimings) => {
  if (!formData.isPoolPartyAvailable) return true;
  
  const errors = [];
  
  // Check timings
  if (!poolPartyData.timings || poolPartyData.timings.length === 0) {
    errors.push('At least one session timing is required');
  } else {
    poolPartyData.timings.forEach((timing, index) => {
      if (!timing.startTime || !timing.endTime) {
        errors.push(`Session ${timing.session || index + 1}: Start time and end time are required`);
      }
      if (timing.startTime >= timing.endTime) {
        errors.push(`Session ${timing.session || index + 1}: Start time must be before end time`);
      }
      // Check capacity for each session
      if (!timing.capacity || parseInt(timing.capacity) <= 0) {
        errors.push(`Session ${timing.session || index + 1}: Capacity is required and must be greater than 0`);
      }
      // Check pricing for each session
      if (!timing.pricing?.perAdult || parseFloat(timing.pricing.perAdult) <= 0) {
        errors.push(`Session ${timing.session || index + 1}: Price per adult is required`);
      }
      if (!timing.pricing?.perKid || parseFloat(timing.pricing.perKid) < 0) {
        errors.push(`Session ${timing.session || index + 1}: Price per kid is required`);
      }
    });
  }
  
  return errors.length === 0 ? true : errors;
};

const PoolPartyDetails = ({ formData, poolPartyData, setPoolPartyData, isEditing }) => {
  const [useDefaultTimings, setUseDefaultTimings] = useState(() => {
    if (isEditing && poolPartyData.timings && poolPartyData.timings.length > 0) {
      const hasDefaultTimings = poolPartyData.timings.length === 3 && 
        poolPartyData.timings[0]?.session === 'Morning' &&
        poolPartyData.timings[1]?.session === 'Evening' &&
        poolPartyData.timings[2]?.session === 'Full Day';
      return hasDefaultTimings;
    }
    return true;
  });

  // Initialize poolPartyData
  useEffect(() => {
    if (!poolPartyData.timings || poolPartyData.timings.length === 0) {
      const initialTimings = (useDefaultTimings ? defaultTimings : [{ session: 'Custom', startTime: '', endTime: '' }])
        .map(timing => ({
          ...timing,
          capacity: '', // Empty initial capacity for each session
          pricing: {
            perAdult: '',
            perKid: ''
          }
        }));
      
      setPoolPartyData(prev => ({
        ...prev,
        timings: initialTimings
      }));
    }
  }, [useDefaultTimings]);

  const handleTimingChange = (index, field, value) => {
    const updatedTimings = [...poolPartyData.timings];
    
    if (field === 'session' && value === 'Custom') {
      updatedTimings[index] = {
        ...updatedTimings[index],
        session: 'Custom',
        startTime: '',
        endTime: '',
        capacity: '',
        pricing: {
          perAdult: '',
          perKid: ''
        }
      };
    } else if (field.includes('.')) {
      // Handle nested fields like pricing.perAdult
      const [parent, child] = field.split('.');
      if (parent === 'pricing') {
        updatedTimings[index] = {
          ...updatedTimings[index],
          pricing: {
            ...updatedTimings[index].pricing,
            [child]: value === '' ? '' : parseFloat(value) || 0
          }
        };
      }
    } else {
      updatedTimings[index] = {
        ...updatedTimings[index],
        [field]: field === 'capacity' ? (value === '' ? '' : parseInt(value) || 0) : value
      };
    }
    
    setPoolPartyData(prev => ({
      ...prev,
      timings: updatedTimings
    }));
  };

  const handleSessionTypeChange = (useDefault) => {
    setUseDefaultTimings(useDefault);
    
    if (useDefault) {
      // Set to default timings with empty capacity and pricing
      setPoolPartyData(prev => ({
        ...prev,
        timings: defaultTimings.map(timing => ({
          ...timing,
          capacity: '',
          pricing: {
            perAdult: '',
            perKid: ''
          }
        }))
      }));
    } else {
      // Custom sessions
      setPoolPartyData(prev => ({
        ...prev,
        timings: [{ 
          session: 'Custom', 
          startTime: '', 
          endTime: '',
          capacity: '',
          pricing: {
            perAdult: '',
            perKid: ''
          }
        }]
      }));
    }
  };

  const addCustomSession = () => {
    const updatedTimings = [...poolPartyData.timings];
    
    // Add new session
    updatedTimings.push({ 
      session: 'Custom', 
      startTime: '', 
      endTime: '',
      capacity: '',
      pricing: {
        perAdult: '',
        perKid: ''
      }
    });
    
    setPoolPartyData(prev => ({
      ...prev,
      timings: updatedTimings
    }));
  };

  const removeSession = (index) => {
    if (poolPartyData.timings.length > 1) {
      const updatedTimings = [...poolPartyData.timings];
      updatedTimings.splice(index, 1);
      
      setPoolPartyData(prev => ({
        ...prev,
        timings: updatedTimings
      }));
    }
  };

  const calculateTotalCapacity = () => {
    return poolPartyData.timings?.reduce((sum, timing) => sum + (parseInt(timing.capacity) || 0), 0) || 0;
  };

  if (!formData.isPoolPartyAvailable) {
    return (
      <div className="text-center py-12">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
          <svg className="w-16 h-16 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Pool Party Not Enabled</h3>
          <p className="text-yellow-700 mb-4">
            Pool party facility is not enabled for this location.
          </p>
          <p className="text-sm text-yellow-600">
            Go back to <strong>Basic Information</strong> step and check "Pool Party Available" to configure pool party details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-8">
        {/* Session Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          {/* Session type selection - keep as is */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Session Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleSessionTypeChange(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  useDefaultTimings
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Default Sessions
              </button>
              <button
                type="button"
                onClick={() => handleSessionTypeChange(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !useDefaultTimings
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Sessions
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              {useDefaultTimings 
                ? 'Using default sessions: Morning, Evening, and Full Day'
                : 'Define your own custom sessions'}
            </p>
          </div>

          {/* Sessions List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-900">
                {useDefaultTimings ? 'Default Sessions' : 'Custom Sessions'} *
              </h4>
              {!useDefaultTimings && poolPartyData.timings && poolPartyData.timings.length < 3 && (
                <button
                  type="button"
                  onClick={addCustomSession}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  + Add Session
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              {poolPartyData.timings.map((timing, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900 capitalize">{timing.session} Session</h4>
                    {!useDefaultTimings && poolPartyData.timings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSession(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {/* Times */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={timing.startTime}
                        onChange={(e) => handleTimingChange(index, 'startTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={timing.endTime}
                        onChange={(e) => handleTimingChange(index, 'endTime', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        required
                      />
                    </div>
                  </div>
                  
                  {/* Capacity */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Session Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={timing.capacity || ''}
                      onChange={(e) => handleTimingChange(index, 'capacity', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Maximum persons for this session"
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Maximum number of persons allowed for this session
                    </p>
                  </div>
                  
                  {/* Session Pricing */}
                  <div className="mb-4 bg-blue-50 p-3 rounded-md">
                    <label className="block text-sm font-medium text-blue-800 mb-2">
                      Session Pricing *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Per Adult *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={timing.pricing?.perAdult || ''}
                            onChange={(e) => handleTimingChange(index, 'pricing.perAdult', e.target.value)}
                            className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Price Per Kid *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500">₹</span>
                          </div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={timing.pricing?.perKid || ''}
                            onChange={(e) => handleTimingChange(index, 'pricing.perKid', e.target.value)}
                            className="w-full pl-8 px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-md font-semibold text-blue-800 mb-3">Pool Party Configuration Summary</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-blue-600 font-medium">Total Sessions:</span>
              <p className="text-blue-800">
                {poolPartyData.timings?.length || 0} session(s)
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Total Capacity:</span>
              <p className="text-blue-800">
                {calculateTotalCapacity()} persons
              </p>
            </div>
            <div>
              <span className="text-blue-600 font-medium">Session Type:</span>
              <p className="text-blue-800">
                {useDefaultTimings ? 'Default Sessions' : 'Custom Sessions'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <span className="text-blue-600 font-medium">Session Details:</span>
            <div className="mt-2 space-y-2">
              {poolPartyData.timings?.map((timing, index) => (
                <div key={index} className="text-sm text-blue-800 bg-white p-2 rounded border border-blue-100">
                  <p className="font-medium capitalize">{timing.session}:</p>
                  <p className="text-xs">Capacity: {timing.capacity || 0} persons | 
                    Pricing: Adult: ₹{timing.pricing?.perAdult || '0'}, Kid: ₹{timing.pricing?.perKid || '0'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

PoolPartyDetails.validateCurrentStep = validatePoolPartyStep;

export default PoolPartyDetails;