import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../firestore-utils/auth-context';
import Profile from '../profile';
import { onAuthStateChanged } from 'firebase/auth';
import * as userPreferences from '../firestore-utils/user-preferences';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
}));

vi.mock('../firestore-utils/user-preferences', () => ({
  getUserPreferences: vi.fn(),
  setUserBetaPreference: vi.fn(),
}));

const mockAuth = {};

const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com'
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider auth={mockAuth}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    });
    userPreferences.getUserPreferences.mockResolvedValue({ beta_enabled: false });
  });

  test('renders user email', async () => {
    renderWithAuth(<Profile db={{}} />);
    await screen.findByText('test@example.com');
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  test('renders beta toggle', async () => {
    renderWithAuth(<Profile db={{}} />);
    await screen.findByText('Join Beta');
    expect(screen.getByText('Join Beta')).toBeInTheDocument();
  });

  test('shows beta enabled when user has beta enabled', async () => {
    userPreferences.getUserPreferences.mockResolvedValue({ beta_enabled: true });
    
    renderWithAuth(<Profile db={{}} />);
    await screen.findByText('Beta Enabled');
    expect(screen.getByText('Beta Enabled')).toBeInTheDocument();
  });

  test('shows not logged in message when no user', async () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
    
    renderWithAuth(<Profile db={{}} />);
    await screen.findByText('Please sign in to view your profile.');
    expect(screen.getByText('Please sign in to view your profile.')).toBeInTheDocument();
  });
});
