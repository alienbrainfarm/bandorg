import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import HamburgerMenu from '../components/HamburgerMenu';
import EventModal from '../components/EventModal';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DayView = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data.map(e => ({...e, start: new Date(e.start), end: new Date(e.end)}))));
  }, []);

  const handleLogout = () => {
    window.location.href = '/logout';
  };

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

  const handleSelectEvent = (event) => {
    handleOpenModal(event);
  };

  const handleSelectSlot = ({ start, end }) => {
    handleOpenModal({ start, end, title: '' });
  };

  return (
    <div className="flex flex-col items-center min-h-screen py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white">
      <div className="w-full max-w-4xl p-4">
        <div className="flex justify-between items-center mb-4">
          <button className="icon-button hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>&#9776;</button>
          <h1 className="text-2xl font-bold">Day View</h1>
          <button className="icon-button add-icon" onClick={() => handleOpenModal({ start: new Date(), end: new Date(), title: '' })}>+</button>
          {isMenuOpen && <HamburgerMenu user={user} onLogout={handleLogout} />}
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-lg shadow-lg p-4" style={{ height: '700px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            defaultView="day"
            views={['day']}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            selectable
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
          />
        </div>
      </div>
      {isModalOpen && (
        <EventModal
          event={selectedEvent || { start: new Date(), end: new Date(), title: '' }}
          onClose={handleCloseModal}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default DayView;
