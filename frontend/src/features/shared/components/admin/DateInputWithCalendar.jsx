import '../../styles/DateInputWithCalendar.css';
import React, { useRef } from "react";
import { FaCalendarAlt } from "react-icons/fa";

const DateInputWithCalendar = ({ value, onChange, error, className = "" }) => {
  const hiddenDateRef = useRef(null);

  const openCalendar = () => {
    if (hiddenDateRef.current?.showPicker) {
      hiddenDateRef.current.showPicker();
    } else {
      hiddenDateRef.current?.click();
    }
  };

  return (
    <div className={`date-input-container ${className}`}>
      <div className={`date-input-visual ${error ? 'has-error' : ''}`}>
        <input
          type="text"
          value={value || ""}
          placeholder="DD/MM/AAAA"
          readOnly
        />
        <FaCalendarAlt
          className="date-input-icon"
          onClick={openCalendar}
        />
      </div>

      <input
        ref={hiddenDateRef}
        type="date"
        className="date-input-hidden"
        onChange={(e) => {
          if (!e.target.value) return;
          const [year, month, day] = e.target.value.split("-");
          onChange(`${day}/${month}/${year}`);
        }}
      />
    </div>
  );
};

export default DateInputWithCalendar;
