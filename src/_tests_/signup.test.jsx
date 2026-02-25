import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../firestore-utils/auth-context';
import Signup from '../signup';
import { createUserWithEmailAndPassword, signInWithPopup, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
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

describe('Signup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(null);
      return vi.fn();
    });
  });

  test('renders signup form with email and password fields', () => {
    renderWithAuth(<Signup />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  test('renders Sign Up button', () => {
    renderWithAuth(<Signup />);
    expect(screen.getByRole('button', { name: 'Sign Up' })).toBeInTheDocument();
  });

  test('renders Google sign up button', () => {
    renderWithAuth(<Signup />);
    expect(screen.getByRole('button', { name: /sign up with google/i })).toBeInTheDocument();
  });

  test('renders link to login page', () => {
    renderWithAuth(<Signup />);
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  test('shows error when passwords do not match', async () => {
    renderWithAuth(<Signup />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'differentpassword' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });
  });

  test('shows error when password is too short', async () => {
    renderWithAuth(<Signup />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: '123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });
  });

  test('successful signup creates user and redirects', async () => {
    const mockUser = { email: 'test@test.com' };
    createUserWithEmailAndPassword.mockResolvedValue({ user: mockUser });
    
    renderWithAuth(<Signup />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password123');
    });
  });

  test('shows error message on failed signup', async () => {
    createUserWithEmailAndPassword.mockRejectedValue(new Error('Email already in use'));
    
    renderWithAuth(<Signup />);
    
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));
    
    await waitFor(() => {
      expect(screen.getByText('Email already in use')).toBeInTheDocument();
    });
  });

  test('Google signup button triggers signInWithPopup', async () => {
    signInWithPopup.mockResolvedValue({ user: { email: 'test@gmail.com' } });
    
    renderWithAuth(<Signup />);
    
    fireEvent.click(screen.getByRole('button', { name: /sign up with google/i }));
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(GoogleAuthProvider));
    });
  });
});
