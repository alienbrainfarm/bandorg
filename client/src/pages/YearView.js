import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../components/HamburgerMenu';
import EventModal from '../components/EventModal';

const YearView = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
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

  const changeYear = (amount) => {
    setSelectedYear(selectedYear + amount);
  };

  const filteredEvents = events.filter(event =>
    event.start.getFullYear() === selectedYear
  ).sort((a, b) => a.start - b.start);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="icon-button hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>&#9776;</button>
        <span className="calendar-title">YEAR VIEW</span>
        <button className="icon-button add-icon" onClick={() => handleOpenModal({ start: new Date(selectedYear, 0, 1), end: new Date(selectedYear, 11, 31), title: '' })}>+</button>
        {isMenuOpen && <HamburgerMenu user={user} onLogout={handleLogout} />}
      </div>
      <div className="month-navigation">
        <button onClick={() => changeYear(-1)}>&lt;</button>
        <h2>{selectedYear}</h2>
        <button onClick={() => changeYear(1)}>&gt;</button>
      </div>
      <div className="view-content">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="event-item" onClick={() => handleOpenModal(event)}>
              <div className="event-details">
                <span className="event-title">{event.title}</span>
                <span className="event-date">{event.start.toLocaleDateString()} {event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        ) : (
          <p>No events for this year.</p>
        )}
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

export default YearView;
