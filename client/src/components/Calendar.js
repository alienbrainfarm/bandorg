import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import EventModal from './EventModal';

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

const MyCalendar = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => setEvents(data.map(e => ({...e, start: new Date(e.start), end: new Date(e.end)}))));
  }, []);

  const handleSelect = ({ start, end }) => {
    const title = window.prompt('New Event name');
    if (title) {
      const newEvent = { title, start, end };
      fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      })
        .then((res) => res.json())
        .then((data) => {
          setEvents([...events, {...data, start: new Date(data.start), end: new Date(data.end)}]);
        });
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleUpdateEvent = (updatedEvent) => {
    fetch(`/api/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEvent),
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          throw new Error('Failed to update event.');
        }
      })
      .then(data => {
        setEvents(events.map(e => (e.id === data.id ? { ...data, start: new Date(data.start), end: new Date(data.end) } : e)));
      })
      .catch(error => alert(error.message));
  };

  const handleDeleteEvent = (eventId) => {
    fetch(`/api/events/${eventId}`, {
      method: 'DELETE',
    })
      .then(res => {
        if (res.ok) {
          setEvents(events.filter(e => e.id !== eventId));
        } else {
          throw new Error('Failed to delete event.');
        }
      })
      .catch(error => alert(error.message));
  };

  const eventPropGetter = (event) => {
    return {
      title: event.title + (event.createdBy ? ` (by ${event.createdBy.split('@')[0]})` : ''),
    };
  };

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        selectable
        onSelectSlot={handleSelect}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventPropGetter}
      />
      {isModalOpen && selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={handleCloseModal}
          onSave={handleUpdateEvent}
          onDelete={handleDeleteEvent}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default MyCalendar;