import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Home from '../home';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Home', () => {
  test('renders logo with correct text', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Arg')).toBeInTheDocument();
    expect(screen.getByText('Base')).toBeInTheDocument();
  });

  test('renders tagline', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Every question answered.')).toBeInTheDocument();
  });

  test('renders search input', () => {
    renderWithRouter(<Home />);
    expect(screen.getByPlaceholderText('What would you like to know?')).toBeInTheDocument();
  });

  test('renders info text', () => {
    renderWithRouter(<Home />);
    expect(screen.getByText('Join us in building the world\'s knowledge base')).toBeInTheDocument();
  });

  test('updates search query on input change', () => {
    renderWithRouter(<Home />);
    const input = screen.getByPlaceholderText('What would you like to know?');
    fireEvent.change(input, { target: { value: 'test query' } });
    expect(input.value).toBe('test query');
  });

  test('has correct structure', () => {
    renderWithRouter(<Home />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
