// LoginForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from './LoginForm';

describe("LoginForm", () => {
    beforeEach(() => {
        // Mock the alert function before each test
        global.alert = vi.fn();
        // Mock the fetch function
        global.fetch = vi.fn();
    });

    afterEach(() => {
        // Clear mocks after each test
        vi.clearAllMocks();
    });

    it("renders a login form with username and password fields", () => {
        render(<LoginForm onLoginSuccess={vi.fn()} />);

        // Check for the presence of input fields
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

        // Check for the submit button
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
    });

    it("submits the form with the correct data and shows success alert", async () => {
        // Mock the fetch function to simulate a successful response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ token: 'mock_token' }),
        });

        const onLoginSuccess = vi.fn();
        render(<LoginForm onLoginSuccess={onLoginSuccess} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Login successful!');
        });

        // Check if onLoginSuccess was called
        expect(onLoginSuccess).toHaveBeenCalled();

        // Check if the token is stored in localStorage
        expect(localStorage.getItem('auth_token')).toBe('mock_token');
    });

    it("shows an alert on failed login", async () => {
        // Mock the fetch function to simulate a failed response
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid credentials' }),
        });

        render(<LoginForm onLoginSuccess={vi.fn()} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Login failed: Invalid credentials');
        });
    });

    it("shows an alert on network error", async () => {
        // Mock the fetch function to simulate a network error
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        render(<LoginForm onLoginSuccess={vi.fn()} />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /log in/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Login failed due to a network error. Please try again.');
        });
    });
});