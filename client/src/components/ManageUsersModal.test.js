import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageUsersModal from './ManageUsersModal';

describe('ManageUsersModal', () => {
  const user = { email: 'admin@example.com', isAdmin: true };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }]),
      })
    );
  });

  it('should render the modal title', async () => {
    render(<ManageUsersModal onClose={() => {}} currentUser={user} />);
    await waitFor(() => expect(screen.getByText(/Manage Authorized Users/i)).toBeInTheDocument());
  });

  it('should add a new user when the form is submitted', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }, { email: 'new@example.com', isAdmin: false }]),
      })
    );
    render(<ManageUsersModal onClose={() => {}} currentUser={user} />);
    fireEvent.change(screen.getByPlaceholderText(/New user email/i), { target: { value: 'new@example.com' } });
    fireEvent.click(screen.getByText(/Add User/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'new@example.com', isAdmin: false }),
      });
    });
  });

  it('should promote a user to admin', async () => {
    global.fetch = jest.fn((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }, { email: 'user@example.com', isAdmin: false }]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }, { email: 'user@example.com', isAdmin: true }]),
      });
    });
    render(<ManageUsersModal onClose={() => {}} currentUser={user} />);
    await waitFor(() => expect(screen.getByText('Regular User')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Promote/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', isAdmin: true }),
      });
    });
  });

  it('should delete a user', async () => {
    global.fetch = jest.fn((url) => {
      if (url === '/api/admin/users') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }, { email: 'user@example.com', isAdmin: false }]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ email: 'admin@example.com', isAdmin: true }]),
      });
    });
    window.confirm = jest.fn(() => true);
    render(<ManageUsersModal onClose={() => {}} currentUser={user} />);
    await waitFor(() => expect(screen.getByText('Regular User')).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Delete/i));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com' }),
      });
    });
  });
});
