import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../firestore-utils/auth-context';
import NavigationBar from '../navigation-bar';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

const mockAuth = {};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider auth={mockAuth}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('NavigationBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  test('renders logo with correct text', () => {
    renderWithRouter(<NavigationBar />);
    expect(screen.getByText('Arg')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
  });

  test('renders search input', () => {
    renderWithRouter(<NavigationBar />);
    expect(screen.getByPlaceholderText('What would you like to know?')).toBeInTheDocument();
  });

  test('renders About link', () => {
    renderWithRouter(<NavigationBar />);
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  test('renders Sign In button', () => {
    renderWithRouter(<NavigationBar />);
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  test('renders Sign Up button', () => {
    renderWithRouter(<NavigationBar />);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  test('updates search query on input change', () => {
    renderWithRouter(<NavigationBar />);
    const input = screen.getByPlaceholderText('What would you like to know?');
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');
  });
});
