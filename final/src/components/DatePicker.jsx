import React, { useState } from 'react';

const DatePicker = ({ 
  onDateSelect, 
  multiSelect = true, 
  selectedDates = [], 
  month = 'February', 
  year = 2019,
  onApply
}) => {
  const [internalSelectedDates, setInternalSelectedDates] = useState(selectedDates);
  
  // Days of the week
  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  // Generate calendar dates for the month
  const generateCalendarDates = () => {
    // Sample dates for February 2019 - this would typically be calculated
    // based on the actual month and year passed as props
    const dates = [
      // Week 1
      [27, 28, 29, 30, 1, 2, 3],
      // Week 2  
      [4, 5, 6, 7, 8, 9, 10],
      // Week 3
      [11, 12, 13, 14, 15, 16, 17],
      // Week 4
      [18, 19, 20, 21, 22, 23, 24],
      // Week 5
      [25, 26, 27, 28, 29, 30, 31]
    ];
    return dates;
  };
  
  const calendarDates = generateCalendarDates();
  
  const handleDateClick = (date) => {
    if (multiSelect) {
      let newSelectedDates;
      if (internalSelectedDates.includes(date)) {
        newSelectedDates = internalSelectedDates.filter(d => d !== date);
      } else {
        newSelectedDates = [...internalSelectedDates, date];
      }
      setInternalSelectedDates(newSelectedDates);
      onDateSelect && onDateSelect(newSelectedDates);
    } else {
      setInternalSelectedDates([date]);
      onDateSelect && onDateSelect([date]);
    }
  };
  
  const isDateSelected = (date) => {
    return internalSelectedDates.includes(date);
  };
  
  const isCurrentMonthDate = (date, weekIndex) => {
    // Logic to determine if date belongs to current month
    // For February 2019, dates 1-28 are current month
    if (weekIndex === 0) {
      return date >= 1; // First week, dates 1-3 are current month
    }
    if (weekIndex === 4) {
      return date <= 28; // Last week, dates 25-28 are current month  
    }
    return date <= 28; // Middle weeks
  };
  
  const handleApply = () => {
    onApply && onApply(internalSelectedDates);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Calendar Container */}
      <div 
        className="bg-white rounded-[26px] shadow-[0px_13px_61px_0px_rgba(169,169,169,0.365)] p-6 relative"
      >
        {/* Month/Year Header */}
        <div className="mb-4">
          <h2 className="font-montserrat font-bold text-[15px] text-[#202224] mb-1">
            {month} {year}
          </h2>
          <p className="font-montserrat text-[14px] text-[#434343] opacity-[0.826]">
            *You can choose multiple date
          </p>
        </div>
        
        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map((day, index) => (
            <div 
              key={index}
              className="text-center font-['Nunito_Sans'] font-bold text-[15px] text-[#202224] opacity-[0.654] py-2"
            >
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="space-y-1 mb-6">
          {calendarDates.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((date, dateIndex) => {
                const isCurrentMonth = isCurrentMonthDate(date, weekIndex);
                const isSelected = isDateSelected(date);
                
                return (
                  <button
                    key={dateIndex}
                    onClick={() => handleDateClick(date)}
                    className={`
                      w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-['Nunito_Sans'] font-semibold transition-all duration-200 hover:scale-105
                      ${isSelected 
                        ? 'bg-[#6085ff] text-white shadow-md' 
                        : isCurrentMonth 
                          ? 'text-[#202224] hover:bg-gray-100' 
                          : 'text-[#202224] opacity-50 hover:bg-gray-50'
                      }
                    `}
                  >
                    {date}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        
        {/* Apply Button */}
        <div className="flex justify-center">
          <button
            onClick={handleApply}
            className="bg-[#4880ff] hover:bg-[#3d70e6] text-white font-['Nunito_Sans'] font-bold text-[12px] px-8 py-3 rounded-md transition-colors duration-200 shadow-[0px_4px_8px_0px_rgba(72,128,255,0.3)] hover:shadow-[0px_6px_12px_0px_rgba(72,128,255,0.4)]"
          >
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatePicker;
