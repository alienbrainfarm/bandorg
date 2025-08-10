# Development Patterns & Examples

This file provides specific code examples and patterns for common development tasks in the Band Calendar Hub.

## API Endpoint Patterns

### Standard CRUD Endpoint
```javascript
// GET endpoint with authentication
app.get('/api/events', requireAuth, (req, res) => {
    try {
        const events = readEventsFromFile();
        res.json(events);
    } catch (error) {
        console.error('Error reading events:', error);
        res.status(500).json({ error: 'Failed to retrieve events' });
    }
});

// POST endpoint with validation
app.post('/api/events', requireAuth, (req, res) => {
    try {
        const { title, start, end, description } = req.body;
        
        // Validation
        if (!title || !start || !end) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        const newEvent = {
            id: generateId(),
            title,
            start: new Date(start),
            end: new Date(end),
            description: description || '',
            createdBy: req.user.email,
            lastUpdatedBy: req.user.email,
            createdAt: new Date()
        };
        
        const events = readEventsFromFile();
        events.push(newEvent);
        writeEventsToFile(events);
        
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});
```

### Authentication Middleware Pattern
```javascript
// Authentication check
const requireAuth = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if user is authorized
    const authorizedUsers = readAuthorizedUsersFromFile();
    const userEmail = req.user.email;
    const authorizedUser = authorizedUsers.find(user => user.email === userEmail);
    
    if (!authorizedUser) {
        return res.status(403).json({ error: 'User not authorized' });
    }
    
    req.user.role = authorizedUser.role; // Add role to request
    next();
};

// Admin-only middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
```

## React Component Patterns

### Functional Component with Hooks
```jsx
import React, { useState, useEffect } from 'react';

const EventModal = ({ isOpen, onClose, event, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        start: '',
        end: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    // Initialize form data when event changes
    useEffect(() => {
        if (event) {
            setFormData({
                title: event.title || '',
                start: event.start || '',
                end: event.end || '',
                description: event.description || ''
            });
        }
    }, [event]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error('Error saving event:', error);
            // Handle error (show toast, etc.)
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">
                    {event ? 'Edit Event' : 'Create Event'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div className="flex gap-4 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;
```

### API Integration Hook
```jsx
import { useState, useEffect } from 'react';

const useEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/events');
            
            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }
            
            const eventsData = await response.json();
            setEvents(eventsData);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const createEvent = async (eventData) => {
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            throw new Error('Failed to create event');
        }

        const newEvent = await response.json();
        setEvents(prev => [...prev, newEvent]);
        return newEvent;
    };

    const updateEvent = async (eventId, eventData) => {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData),
        });

        if (!response.ok) {
            throw new Error('Failed to update event');
        }

        const updatedEvent = await response.json();
        setEvents(prev => prev.map(event => 
            event.id === eventId ? updatedEvent : event
        ));
        return updatedEvent;
    };

    const deleteEvent = async (eventId) => {
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete event');
        }

        setEvents(prev => prev.filter(event => event.id !== eventId));
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return {
        events,
        loading,
        error,
        refetch: fetchEvents,
        createEvent,
        updateEvent,
        deleteEvent
    };
};

export default useEvents;
```

## Testing Patterns

### Server Test Pattern (Mocha + Chai)
```javascript
const request = require('supertest');
const { expect } = require('chai');
const app = require('../src/index');

describe('Events API', () => {
    beforeEach(() => {
        // Reset test data
        resetTestData();
    });

    describe('GET /api/events', () => {
        it('should return all events for authenticated user', (done) => {
            request(app)
                .get('/api/events')
                .set('Cookie', getAuthenticatedCookie())
                .expect(200)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.be.an('array');
                    expect(res.body.length).to.be.at.least(0);
                    done();
                });
        });

        it('should require authentication', (done) => {
            request(app)
                .get('/api/events')
                .expect(401)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body.error).to.equal('Authentication required');
                    done();
                });
        });
    });

    describe('POST /api/events', () => {
        it('should create a new event', (done) => {
            const eventData = {
                title: 'Test Event',
                start: '2024-01-01T10:00:00Z',
                end: '2024-01-01T11:00:00Z',
                description: 'Test description'
            };

            request(app)
                .post('/api/events')
                .set('Cookie', getAuthenticatedCookie())
                .send(eventData)
                .expect(201)
                .end((err, res) => {
                    if (err) return done(err);
                    
                    expect(res.body).to.have.property('id');
                    expect(res.body.title).to.equal(eventData.title);
                    expect(res.body.createdBy).to.exist;
                    done();
                });
        });
    });
});
```

### React Component Test Pattern
```jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EventModal from '../EventModal';

describe('EventModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when open', () => {
        render(
            <EventModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.getByText('Create Event')).toBeInTheDocument();
        expect(screen.getByLabelText('Title')).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(
            <EventModal
                isOpen={false}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        expect(screen.queryByText('Create Event')).not.toBeInTheDocument();
    });

    it('should call onSave when form is submitted', async () => {
        const user = userEvent.setup();
        mockOnSave.mockResolvedValue();

        render(
            <EventModal
                isOpen={true}
                onClose={mockOnClose}
                onSave={mockOnSave}
            />
        );

        await user.type(screen.getByLabelText('Title'), 'Test Event');
        await user.click(screen.getByRole('button', { name: 'Save' }));

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                title: 'Test Event',
                start: '',
                end: '',
                description: ''
            });
        });
    });
});
```

## Mobile-First Responsive Patterns

### Tailwind CSS Mobile-First Classes
```jsx
// Mobile-first container with responsive breakpoints
<div className="
    px-4 py-2           // Small screens: 16px padding horizontal, 8px vertical
    sm:px-6 sm:py-4     // Small screens and up: 24px horizontal, 16px vertical
    md:px-8 md:py-6     // Medium screens and up: 32px horizontal, 24px vertical
    lg:px-12 lg:py-8    // Large screens and up: 48px horizontal, 32px vertical
">

// Responsive grid layout
<div className="
    grid grid-cols-1    // 1 column on mobile
    sm:grid-cols-2      // 2 columns on small screens
    lg:grid-cols-3      // 3 columns on large screens
    gap-4 sm:gap-6      // Responsive gap
">

// Mobile navigation pattern
<nav className="
    fixed bottom-0 left-0 right-0  // Fixed bottom navigation on mobile
    lg:static lg:top-0              // Static top navigation on desktop
    bg-white border-t               // White background with top border
    lg:border-t-0 lg:border-b       // Border bottom on desktop
    p-4 lg:p-0                      // Padding on mobile, none on desktop
">
```

## File Management Patterns

### Reading/Writing JSON Data
```javascript
const fs = require('fs');
const path = require('path');

const EVENTS_FILE = path.join(__dirname, 'db.json');
const USERS_FILE = path.join(__dirname, 'authorized_users.json');

const readEventsFromFile = () => {
    try {
        if (!fs.existsSync(EVENTS_FILE)) {
            return [];
        }
        const data = fs.readFileSync(EVENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading events file:', error);
        return [];
    }
};

const writeEventsToFile = (events) => {
    try {
        fs.writeFileSync(EVENTS_FILE, JSON.stringify(events, null, 2));
    } catch (error) {
        console.error('Error writing events file:', error);
        throw error;
    }
};

// Atomic write pattern for better reliability
const writeEventsToFileAtomic = (events) => {
    const tempFile = EVENTS_FILE + '.tmp';
    try {
        fs.writeFileSync(tempFile, JSON.stringify(events, null, 2));
        fs.renameSync(tempFile, EVENTS_FILE);
    } catch (error) {
        // Clean up temp file if it exists
        if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile);
        }
        throw error;
    }
};
```

## Error Handling Patterns

### Express Error Handling
```javascript
// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    if (error.type === 'authentication') {
        return res.status(401).json({ error: 'Authentication failed' });
    }
    
    if (error.type === 'authorization') {
        return res.status(403).json({ error: 'Access denied' });
    }
    
    if (error.type === 'validation') {
        return res.status(400).json({ error: error.message });
    }
    
    // Default server error
    res.status(500).json({ error: 'Internal server error' });
});

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
app.get('/api/events', asyncHandler(async (req, res) => {
    const events = await getEventsAsync();
    res.json(events);
}));
```

### React Error Boundaries
```jsx
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error boundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <h3 className="text-red-800 font-medium">Something went wrong</h3>
                    <p className="text-red-600 text-sm mt-1">
                        Please refresh the page or try again later.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}
```