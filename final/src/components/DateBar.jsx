import React, { useState } from 'react';

const DateBar = ({ 
  selectedDate = new Date(),
  onDateChange,
  showWeek = true,
  datesAround = 7 // Number of dates to show around selected date
}) => {
  const [currentDate, setCurrentDate] = useState(selectedDate);
  
  // Generate dates around the selected date
  const generateDatesAround = (centerDate, count) => {
    const dates = [];
    const startDate = new Date(centerDate);
    startDate.setDate(centerDate.getDate() - Math.floor(count / 2));
    
    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };
  
  const dates = generateDatesAround(currentDate, datesAround);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const handleDateClick = (date) => {
    setCurrentDate(date);
    onDateChange && onDateChange(date);
  };
  
  const isSelected = (date) => {
    return date.toDateString() === currentDate.toDateString();
  };
  
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };
  
  const formatDate = (date) => {
    return date.getDate();
  };
  
  const formatDayOfWeek = (date) => {
    return daysOfWeek[date.getDay()];
  };

  return (
    <div className="w-full">
      {/* Date Bar Container */}
      <div className="bg-white rounded-[20px] shadow-[0px_8px_32px_0px_rgba(169,169,169,0.25)] p-4 overflow-x-auto">
        {/* Horizontal Date Scroll */}
        <div className="flex space-x-3 min-w-max">
          {dates.map((date, index) => {
            const isSelectedDate = isSelected(date);
            const isTodayDate = isToday(date);
            
            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                className={`
                  flex flex-col items-center justify-center min-w-[60px] py-3 px-2 rounded-xl transition-all duration-200 hover:scale-105
                  ${isSelectedDate 
                    ? 'bg-[#6085ff] text-white shadow-lg' 
                    : isTodayDate
                      ? 'bg-[#f0f4ff] text-[#6085ff] border-2 border-[#6085ff]'
                      : 'text-[#202224] hover:bg-gray-100'
                  }
                `}
              >
                {/* Day of Week */}
                {showWeek && (
                  <span className={`
                    text-[10px] font-['Nunito_Sans'] font-medium mb-1 uppercase tracking-wide
                    ${isSelectedDate ? 'text-white opacity-80' : 'text-[#434343] opacity-70'}
                  `}>
                    {formatDayOfWeek(date).slice(0, 3)}
                  </span>
                )}
                
                {/* Date Number */}
                <span className={`
                  text-[16px] font-['Nunito_Sans'] font-bold
                  ${isSelectedDate ? 'text-white' : 'text-[#202224]'}
                `}>
                  {formatDate(date)}
                </span>
                
                {/* Today Indicator */}
                {isTodayDate && !isSelectedDate && (
                  <div className="w-1 h-1 bg-[#6085ff] rounded-full mt-1"></div>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Navigation Arrows (Optional) */}
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              const prevWeek = new Date(currentDate);
              prevWeek.setDate(currentDate.getDate() - 7);
              setCurrentDate(prevWeek);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="#6085ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <span className="font-montserrat font-medium text-[14px] text-[#202224]">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          
          <button
            onClick={() => {
              const nextWeek = new Date(currentDate);
              nextWeek.setDate(currentDate.getDate() + 7);
              setCurrentDate(nextWeek);
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="#6085ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateBar;
