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

vi.mock('../firestore-utils/remote-config', () => ({
  fetchFeatureFlags: vi.fn().mockResolvedValue({
    navigation_banner: 'control',
  }),
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
    delete window.__FEATURE_FLAGS__;
    delete window.__FLAG_TEST_MODE__;
  });

  afterEach(() => {
    delete window.__FEATURE_FLAGS__;
    delete window.__FLAG_TEST_MODE__;
  });

  test('renders logo with control text (ArgBase)', async () => {
    renderWithRouter(<NavigationBar />);
    await screen.findByText('ArgBase');
    expect(screen.getByText('ArgBase')).toBeInTheDocument();
  });

  test('renders logo with beta text (ArgBase (beta))', async () => {
    window.__FEATURE_FLAGS__ = { navigation_banner: 'beta' };
    
    renderWithRouter(<NavigationBar />);
    await screen.findByText('ArgBase (beta)');
    expect(screen.getByText('ArgBase (beta)')).toBeInTheDocument();
  });

  test('renders logo with next text (ArgBase (beta))', async () => {
    window.__FEATURE_FLAGS__ = { navigation_banner: 'next' };
    
    renderWithRouter(<NavigationBar />);
    await screen.findByText('ArgBase (beta)');
    expect(screen.getByText('ArgBase (beta)')).toBeInTheDocument();
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
