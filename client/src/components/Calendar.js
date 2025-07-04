
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
      <button className="icon-button hamburger-icon" onClick={() => setIsMenuOpen(true)}>&#9776;</button>
      <span className="calendar-title">CALENDAR</span>
      <button className="icon-button add-icon" onClick={() => handleOpenModal()}>+</button>
      {isMenuOpen && <HamburgerMenu user={user} onLogout={handleLogout} onManageUsersClick={handleOpenManageUsersModal} onClose={() => setIsMenuOpen(false)} />}
    </div>
  );

  const handleSelectEvent = (event) => {
    handleOpenModal(event);
  };

  const handleSelectSlot = ({ start, end }) => {
    handleOpenModal({ start, end, title: '' });
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
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day}>{day}</div>)}
      </div>
      {/* Removed renderCells() as react-big-calendar handles rendering */}
      
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
