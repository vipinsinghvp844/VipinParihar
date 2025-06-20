// MyCalendarComponent.js
import React, { useState } from 'react';
import Calendar from 'react-calendar';


const DateCalendar = () => {
  const [date, setDate] = useState(new Date());

  const onChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className='p-5'>
      <Calendar
        onChange={onChange}
        value={date}
      />
      <p>Selected date: {date.toDateString()}</p>
    </div>
  );
};

export default DateCalendar;
