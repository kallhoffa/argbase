import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../firestore-utils/auth-context';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
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

const TestComponent = () => {
  const { user, loading, login, logout, signup, loginWithGoogle } = useAuth();
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
      <span data-testid="user">{user ? user.email : 'no-user'}</span>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
      <button onClick={() => signup('test@test.com', 'password')}>Signup</button>
      <button onClick={() => loginWithGoogle()}>GoogleLogin</button>
    </div>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('provides initial loading state', () => {
    onAuthStateChanged.mockImplementation((auth, callback) => {
      setTimeout(() => callback(null), 100);
      return vi.fn();
    });

    renderWithAuth(<TestComponent />);
    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  test('provides user after auth state change', async () => {
    const mockUser = { email: 'test@test.com', uid: '123' };
    onAuthStateChanged.mockImplementation((auth, callback) => {
      callback(mockUser);
      return vi.fn();
    });

    renderWithAuth(<TestComponent />);
    
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
    expect(screen.getByTestId('user')).toHaveTextContent('test@test.com');
  });

  test('login calls signInWithEmailAndPassword', async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    signInWithEmailAndPassword.mockResolvedValue({ user: { email: 'test@test.com' } });

    renderWithAuth(<TestComponent />);
    
    await screen.findByTestId('loading');
    await screen.findByTestId('user');

    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password');
    });
  });

  test('logout calls signOut', async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    signOut.mockResolvedValue();

    renderWithAuth(<TestComponent />);
    
    await screen.findByTestId('loading');
    await screen.findByTestId('user');

    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith(mockAuth);
    });
  });

  test('throws error when useAuth used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  test('signup calls createUserWithEmailAndPassword', async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    createUserWithEmailAndPassword.mockResolvedValue({ user: { email: 'test@test.com' } });

    renderWithAuth(<TestComponent />);
    
    await screen.findByTestId('loading');
    await screen.findByTestId('user');

    fireEvent.click(screen.getByText('Signup'));
    
    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@test.com', 'password');
    });
  });

  test('loginWithGoogle calls signInWithPopup', async () => {
    onAuthStateChanged.mockImplementation(() => vi.fn());
    signInWithPopup.mockResolvedValue({ user: { email: 'test@gmail.com' } });

    renderWithAuth(<TestComponent />);
    
    await screen.findByTestId('loading');
    await screen.findByTestId('user');

    fireEvent.click(screen.getByText('GoogleLogin'));
    
    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(mockAuth, expect.any(GoogleAuthProvider));
    });
  });
});
