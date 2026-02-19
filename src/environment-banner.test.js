import React from 'react';
import { render, screen } from '@testing-library/react';
import EnvironmentBanner from './environment-banner';

describe('EnvironmentBanner', () => {
  const originalHostname = window.location.hostname;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL(`http://${originalHostname}`),
      writable: true,
    });
  });

  test('renders nothing on non-localhost', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://argbase.org'),
      writable: true,
    });
    const { container } = render(<EnvironmentBanner />);
    expect(container.firstChild).toBeNull();
  });

  test('renders banner on localhost', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3000'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText(/Running on localhost/)).toBeInTheDocument();
  });

  test('renders banner on 127.0.0.1', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://127.0.0.1:3000'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText(/Running on localhost/)).toBeInTheDocument();
  });

  test('displays correct message', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3000'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText('Running on localhost - Development Environment')).toBeInTheDocument();
  });
});
