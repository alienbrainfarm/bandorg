
import React, { useState, useEffect } from 'react';
import './Calendar.css';
import EventModal from './EventModal';
import HamburgerMenu from './HamburgerMenu';
import { Link } from 'react-router-dom';
import ManageUsersModal from './ManageUsersModal';

const CustomCalendar = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState(null);
  const [selectionEnd, setSelectionEnd] = useState(null);
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/logout';
  };

  const handleOpenManageUsersModal = () => {
    setIsManageUsersModalOpen(true);
    setIsMenuOpen(false); // Close hamburger menu when opening manage users modal
  };

  const handleCloseManageUsersModal = () => {
    setIsManageUsersModalOpen(false);
  };

  const handleMouseDown = (day) => {
    setIsSelecting(true);
    setSelectionStart(day);
    setSelectionEnd(day);
  };

  const handleMouseEnter = (day) => {
    if (isSelecting) {
      setSelectionEnd(day);
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
    if (selectionStart && selectionEnd) {
      const start = selectionStart < selectionEnd ? selectionStart : selectionEnd;
      const end = selectionStart < selectionEnd ? selectionEnd : selectionStart;
      handleOpenModal({ start, end, title: '' });
      setSelectionStart(null);
      setSelectionEnd(null);
    }
  };

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data.map(e => ({...e, start: new Date(e.start), end: new Date(e.end)}))));
  }, []);

  const handleOpenModal = (event = null) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleSaveEvent = (eventData) => {
    const url = eventData.id ? `/api/events/${eventData.id}` : '/api/events';
    const method = eventData.id ? 'PUT' : 'POST';

    fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventData),
    })
    .then(res => res.json())
    .then(savedEvent => {
      const newEvent = {...savedEvent, start: new Date(savedEvent.start), end: new Date(savedEvent.end)};
      if (method === 'POST') {
        setEvents([...events, newEvent]);
      } else {
        setEvents(events.map(e => e.id === newEvent.id ? newEvent : e));
      }
      handleCloseModal();
    });
  };

  const handleDeleteEvent = (eventId) => {
    fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      .then(() => {
        setEvents(events.filter(e => e.id !== eventId));
        handleCloseModal();
      });
  };

  const renderHeader = () => (
    <div className="calendar-header">
      <button className="icon-button hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>&#9776;</button>
      <span className="calendar-title">CALENDAR</span>
      <button className="icon-button add-icon" onClick={() => handleOpenModal()}>+</button>
      {isMenuOpen && <HamburgerMenu user={user} onLogout={handleLogout} onManageUsersClick={handleOpenManageUsersModal} />}
    </div>
  );

  const renderDays = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return <div className="days-of-week">{days.map(day => <div key={day}>{day}</div>)}</div>;
  };

  const renderCells = () => {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - monthStart.getDay());
    const endDate = new Date(monthEnd);
    if (monthEnd.getDay() !== 6) {
        endDate.setDate(endDate.getDate() + (6 - monthEnd.getDay()));
    }


    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const isToday = cloneDay.toDateString() === new Date().toDateString();
        const isCurrentMonth = cloneDay.getMonth() === currentDate.getMonth();
        
        let cellClasses = `calendar-cell ${isCurrentMonth ? "" : "disabled"} ${isToday ? "today" : ""}`;

        const overlappingEvents = events.filter(e => {
          const eventStart = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
          const eventEnd = new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate());
          const currentDay = new Date(cloneDay.getFullYear(), cloneDay.getMonth(), cloneDay.getDate());
          return currentDay >= eventStart && currentDay <= eventEnd;
        });

        if (overlappingEvents.length > 0) {
          const multiDayEvent = overlappingEvents.find(e => {
            const eventStart = new Date(e.start.getFullYear(), e.start.getMonth(), e.start.getDate());
            const eventEnd = new Date(e.end.getFullYear(), e.end.getMonth(), e.end.getDate());
            return eventStart.toDateString() !== eventEnd.toDateString();
          });

          if (multiDayEvent) {
            const eventStartDay = new Date(multiDayEvent.start.getFullYear(), multiDayEvent.start.getMonth(), multiDayEvent.start.getDate());
            const eventEndDay = new Date(multiDayEvent.end.getFullYear(), multiDayEvent.end.getMonth(), multiDayEvent.end.getDate());
            const currentDay = new Date(cloneDay.getFullYear(), cloneDay.getMonth(), cloneDay.getDate());

            if (currentDay.toDateString() === eventStartDay.toDateString()) {
              cellClasses += ' event-start-of-range';
            } else if (currentDay.toDateString() === eventEndDay.toDateString()) {
              cellClasses += ' event-end-of-range';
            } else {
              cellClasses += ' event-in-range';
            }
            cellClasses += ' multi-day-event';
          } else {
            cellClasses += ' single-day-event';
          }
        }

        days.push(
          <div
            className={`calendar-cell ${isCurrentMonth ? "" : "disabled"} ${isToday ? "today" : ""}`}
            key={day}
            onClick={() => handleDateClick(cloneDay)}
            onMouseDown={() => handleMouseDown(cloneDay)}
            onMouseEnter={() => handleMouseEnter(cloneDay)}
            onMouseUp={handleMouseUp}
          >
            <div className={cellClasses}>
              <span className="number">{cloneDay.getDate()}</span>
            </div>
          </div>
        );
        day.setDate(day.getDate() + 1);
      }
      rows.push(<div className="calendar-row" key={day}>{days}</div>);
      days = [];
    }
    return <div className="calendar-body">{rows}</div>;
  };

  const handleDateClick = (day) => {
    const dayEvents = events.filter(e =>
      e.start.toDateString() === day.toDateString()
    );

    if (dayEvents.length > 0) {
      // If there are events, open the modal for the first event found on that day
      handleOpenModal(dayEvents[0]);
    } else {
      // Otherwise, open the modal to create a new event for that day
      handleOpenModal({ start: day, end: day, title: '' });
    }
  };

  

  const changeMonth = (amount) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + amount, 1));
  };

  return (
    <div className="bg-gray-700 text-white rounded-lg p-5 shadow-lg w-full max-w-md mx-auto">
      {renderHeader()}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="text-white text-2xl">&lt;</button>
        <h2 className="text-xl font-bold">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
        <button onClick={() => changeMonth(1)} className="text-white text-2xl">&gt;</button>
      </div>
      <div className="grid grid-cols-7 text-center text-gray-400 text-sm font-bold mb-2">
        {days.map(day => <div key={day}>{day}</div>)}
      </div>
      {renderCells()}
      
      {isModalOpen && (
        <EventModal
          event={selectedEvent || { start: new Date(), end: new Date(), title: '' }}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          currentUser={user}
        />
      )}

      {isManageUsersModalOpen && (
        <ManageUsersModal
          onClose={handleCloseManageUsersModal}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default CustomCalendar;
