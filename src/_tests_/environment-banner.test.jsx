import React from 'react';
import { render, screen } from '@testing-library/react';
import EnvironmentBanner from '../environment-banner';

describe('EnvironmentBanner', () => {
  const originalHostname = window.location.hostname;

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL(`http://${originalHostname}`),
      writable: true,
    });
  });

  test('renders nothing on production', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://argbase.org'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.queryByText(/Running on localhost/)).toBeNull();
    expect(screen.queryByText(/STAGING/)).toBeNull();
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

  test('renders staging banner', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://argbase-staging.web.app'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText(/STAGING ENVIRONMENT/)).toBeInTheDocument();
  });

  test('displays correct message for localhost', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('http://localhost:3000'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText('Running on localhost - Development Environment')).toBeInTheDocument();
  });

  test('displays correct message for staging', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://argbase-staging.web.app'),
      writable: true,
    });
    render(<EnvironmentBanner />);
    expect(screen.getByText('STAGING ENVIRONMENT - Not Production')).toBeInTheDocument();
  });
});
