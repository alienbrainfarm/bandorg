import React, { useState, useEffect } from 'react';
import HamburgerMenu from '../components/HamburgerMenu';
import EventModal from '../components/EventModal';

const WeekView = ({ user }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const getStartOfWeek = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(date.setDate(diff));
  };

  const changeWeek = (amount) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + (amount * 7));
    setSelectedDate(newDate);
  };

  const startOfWeek = getStartOfWeek(new Date(selectedDate));
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  const filteredEvents = events.filter(event =>
    event.start >= startOfWeek && event.start <= endOfWeek
  ).sort((a, b) => a.start - b.start);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button className="icon-button hamburger-icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>&#9776;</button>
        <span className="calendar-title">WEEK VIEW</span>
        <button className="icon-button add-icon" onClick={() => handleOpenModal({ start: selectedDate, end: selectedDate, title: '' })}>+</button>
        {isMenuOpen && <HamburgerMenu user={user} onLogout={handleLogout} />}
      </div>
      <div className="month-navigation">
        <button onClick={() => changeWeek(-1)}>&lt;</button>
        <h2>{startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - {endOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}</h2>
        <button onClick={() => changeWeek(1)}>&gt;</button>
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
          <p>No events for this week.</p>
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

export default WeekView;
