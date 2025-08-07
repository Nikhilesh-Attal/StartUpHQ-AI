import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Signup from '@/components/Signup';

describe('Signup Component', () => {
  test('renders all input fields and buttons', () => {
    render(<Signup />);

    // Check heading and subheading
    expect(screen.getByText(/Create an account/i)).toBeInTheDocument();
    expect(screen.getByText(/Enter your details to sign up/i)).toBeInTheDocument();

    // Check input placeholders
    expect(screen.getByPlaceholderText(/Your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();

    // Check buttons
    expect(screen.getByRole('button', { name: /Sign Up/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Show Password/i })).toBeInTheDocument();
  });

  test('toggles password visibility', () => {
    render(<Signup />);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const toggleButton = screen.getByRole('button', { name: /Show Password/i });

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    fireEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('fills and submits form', () => {
    render(<Signup />);
    const nameInput = screen.getByPlaceholderText(/Your name/i);
    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign Up/i });

    fireEvent.change(nameInput, { target: { value: 'Nikhilesh' } });
    fireEvent.change(emailInput, { target: { value: 'nikhilesh@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'supersecure' } });

    // Mock console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    fireEvent.click(submitButton);

    expect(consoleSpy).toHaveBeenCalledWith({
      name: 'Nikhilesh',
      email: 'nikhilesh@example.com',
      password: 'supersecure',
    });

    consoleSpy.mockRestore();
  });
});
