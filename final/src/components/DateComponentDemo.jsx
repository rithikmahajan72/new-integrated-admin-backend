import React, { useState } from 'react';
import DatePicker from './DatePicker';
import DateBar from './DateBar';

const DateComponentDemo = () => {
  const [selectedDates, setSelectedDates] = useState([14]);
  const [selectedBarDate, setSelectedBarDate] = useState(new Date());

  const handleDateSelect = (dates) => {
    setSelectedDates(dates);
    console.log('Selected dates:', dates);
  };

  const handleApply = (dates) => {
    console.log('Applied dates:', dates);
    // Handle the application of selected dates
    alert(`Applied dates: ${dates.join(', ')}`);
  };

  const handleBarDateChange = (date) => {
    setSelectedBarDate(date);
    console.log('Selected bar date:', date);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-montserrat font-bold text-gray-900 mb-2">
            Date Component Showcase
          </h1>
          <p className="text-gray-600 font-montserrat">
            Based on Figma design - Choose your preferred date selection style
          </p>
        </div>

        {/* Calendar Date Picker */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-2">
              Calendar Date Picker
            </h2>
            <p className="text-gray-600 text-sm">
              Full month view with multi-select capability
            </p>
          </div>
          
          <div className="flex justify-center">
            <DatePicker
              onDateSelect={handleDateSelect}
              selectedDates={selectedDates}
              multiSelect={true}
              month="February"
              year={2019}
              onApply={handleApply}
            />
          </div>
          
          <div className="text-center text-sm text-gray-600">
            Selected dates: {selectedDates.length > 0 ? selectedDates.join(', ') : 'None'}
          </div>
        </div>

        {/* Horizontal Date Bar */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-montserrat font-semibold text-gray-800 mb-2">
              Horizontal Date Bar
            </h2>
            <p className="text-gray-600 text-sm">
              Scrollable week view for quick date selection
            </p>
          </div>
          
          <DateBar
            selectedDate={selectedBarDate}
            onDateChange={handleBarDateChange}
            showWeek={true}
            datesAround={7}
          />
          
          <div className="text-center text-sm text-gray-600">
            Selected date: {selectedBarDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </div>

        {/* Usage Examples */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-montserrat font-semibold text-gray-800 mb-4">
            Usage Examples
          </h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Calendar Date Picker:</h4>
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
{`<DatePicker
  onDateSelect={(dates) => console.log(dates)}
  selectedDates={[14, 15, 16]}
  multiSelect={true}
  month="February"
  year={2019}
  onApply={(dates) => handleApply(dates)}
/>`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Horizontal Date Bar:</h4>
              <pre className="bg-gray-100 p-3 rounded-lg overflow-x-auto">
{`<DateBar
  selectedDate={new Date()}
  onDateChange={(date) => console.log(date)}
  showWeek={true}
  datesAround={7}
/>`}
              </pre>
            </div>
          </div>
        </div>

        {/* Props Documentation */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-montserrat font-semibold text-gray-800 mb-4">
            Component Props
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-3">DatePicker Props:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">onDateSelect</code> - Callback when dates are selected</li>
                <li><code className="bg-gray-100 px-1 rounded">multiSelect</code> - Enable multiple date selection</li>
                <li><code className="bg-gray-100 px-1 rounded">selectedDates</code> - Array of selected dates</li>
                <li><code className="bg-gray-100 px-1 rounded">month</code> - Month name to display</li>
                <li><code className="bg-gray-100 px-1 rounded">year</code> - Year to display</li>
                <li><code className="bg-gray-100 px-1 rounded">onApply</code> - Callback when Apply button is clicked</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-3">DateBar Props:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><code className="bg-gray-100 px-1 rounded">selectedDate</code> - Currently selected date</li>
                <li><code className="bg-gray-100 px-1 rounded">onDateChange</code> - Callback when date changes</li>
                <li><code className="bg-gray-100 px-1 rounded">showWeek</code> - Show day of week labels</li>
                <li><code className="bg-gray-100 px-1 rounded">datesAround</code> - Number of dates to show</li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DateComponentDemo;
