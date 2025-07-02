import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventModal from './EventModal';

describe('EventModal', () => {
  const event = {
    id: 1,
    title: 'Test Event',
    start: new Date(),
    end: new Date(),
    createdBy: 'test@example.com',
  };
  const user = { email: 'test@example.com', isAdmin: true };

  it('should render the event title', () => {
    render(<EventModal event={event} onClose={() => {}} onSave={() => {}} onDelete={() => {}} currentUser={user} />);
    expect(screen.getByDisplayValue(/Test Event/i)).toBeInTheDocument();
  });

  it('should call onSave when the save button is clicked', () => {
    const onSave = jest.fn();
    render(<EventModal event={event} onClose={() => {}} onSave={onSave} onDelete={() => {}} currentUser={user} />);
    fireEvent.click(screen.getByText(/Save/i));
    expect(onSave).toHaveBeenCalled();
  });

  it('should call onDelete when the delete button is clicked', () => {
    const onDelete = jest.fn();
    window.confirm = jest.fn(() => true);
    render(<EventModal event={event} onClose={() => {}} onSave={() => {}} onDelete={onDelete} currentUser={user} />);
    fireEvent.click(screen.getByText(/Delete/i));
    expect(onDelete).toHaveBeenCalledWith(1);
  });
});
