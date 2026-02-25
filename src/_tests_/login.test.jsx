import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../firestore-utils/auth-context';
import Login from '../login';
import { signInWithEmailAndPassword, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  onAuthStateChanged: vi.fn(),
  GoogleAuthProvider: vi.fn(),
}));

const mockAuth = {};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider auth={mockAuth}>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  test('renders login form with email and password fields', () => {
    renderWithAuth(<Login />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  test('renders Sign In button', () => {
    renderWithAuth(<Login />);
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  test('renders Google sign in button', () => {
    renderWithAuth(<Login />);
    expect(screen.getByRole('button', { name: /sign in with google/i })).toBeInTheDocument();
  });

  test('renders link to signup page', () => {
    renderWithAuth(<Login />);
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute('href', '/signup');
  });

  test('shows error message on failed login', async () => {
    signInWithEmailAndPassword.mockRejectedValue(new Error('Invalid email or password'));
    
    renderWithAuth(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  test('successful login redirects to home', async () => {
    const mockUser = { email: 'test@test.com' };
    signInWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    
    renderWithAuth(<Login />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password123');
    });
  });

  test('Google login button triggers signInWithPopup', async () => {
    signInWithPopup.mockResolvedValue({ user: { email: 'test@gmail.com' } });
    
    renderWithAuth(<Login />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign in with google/i }));
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(GoogleAuthProvider));
    });
  });
});
