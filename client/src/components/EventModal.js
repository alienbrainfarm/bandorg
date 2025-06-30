import React, { useState, useEffect } from 'react';

const EventModal = ({ event, onClose, onSave, onDelete, currentUser }) => {
  const [title, setTitle] = useState(event.title);
  const [start, setStart] = useState(event.start);
  const [end, setEnd] = useState(event.end);

  useEffect(() => {
    setTitle(event.title);
    setStart(event.start);
    setEnd(event.end);
  }, [event]);

  // Helper to format Date objects for datetime-local input
  const formatDateTimeLocal = (date) => {
    if (!date) return '';
    const dt = new Date(date);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  };

  const handleSave = () => {
    onSave({ ...event, title, start: new Date(start), end: new Date(end) });
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      onDelete(event.id);
      onClose();
    }
  };

  const isCreator = currentUser && currentUser.email === event.createdBy;
  const isAdmin = currentUser && currentUser.isAdmin;

  return (
    <div className="event-modal-overlay">
      <div className="event-modal dark">
        <h2>Event Details</h2>
        <p><strong>Title:</strong>
          {(isCreator || isAdmin) ? (
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
          ) : (
            <span> {event.title}</span>
          )}
        </p>
        <p><strong>Start:</strong>
          {(isCreator || isAdmin) ? (
            <input type="datetime-local" value={formatDateTimeLocal(start)} onChange={(e) => setStart(e.target.value)} />
          ) : (
            <span> {new Date(start).toLocaleString()}</span>
          )}
        </p>
        <p><strong>End:</strong>
          {(isCreator || isAdmin) ? (
            <input type="datetime-local" value={formatDateTimeLocal(end)} onChange={(e) => setEnd(e.target.value)} />
          ) : (
            <span> {new Date(end).toLocaleString()}</span>
          )}
        </p>
        <p><strong>Created By:</strong> {event.createdBy}</p>
        {event.lastUpdatedBy && <p><strong>Last Updated By:</strong> {event.lastUpdatedBy}</p>}

        {(isCreator || isAdmin) && (
          <div className="event-actions">
            {(isCreator || isAdmin) && <button onClick={handleSave}>Save Changes</button>}
            {(isCreator || isAdmin) && <button onClick={handleDelete} className="delete-button">Delete Event</button>}
          </div>
        )}
        <button onClick={onClose} className="close-button">Close</button>
      </div>
    </div>
  );
};

export default EventModal;
