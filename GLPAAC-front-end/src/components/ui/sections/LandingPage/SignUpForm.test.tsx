// SignUpForm.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignUpForm from './SignUpForm';

describe("SignUpForm", () => {
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

    it("renders a sign up form with all required fields", () => {
        render(<SignUpForm />);

        // Check for the presence of input fields
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        // Check for the submit button
        expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it("submits the form with the correct data", async () => {
        // Mock the fetch function to simulate a successful response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Success' }),
        });

        render(<SignUpForm />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Check if fetch was called with the correct data
        expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'password123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
            }),
        });
    });

    it("shows an alert on successful sign up", async () => {
        // Mock the fetch function to simulate a successful response
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Success' }),
        });

        render(<SignUpForm />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Sign up successful! Please log in.');
        });
    });

    it("shows an alert on failed sign up", async () => {
        // Mock the fetch function to simulate a failed response
        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Sign up failed' }),
        });

        render(<SignUpForm />);

        // Fill out the form
        fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'John' } });
        fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });

        // Submit the form
        fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

        // Wait for the alert to be called
        await waitFor(() => {
            expect(global.alert).toHaveBeenCalledWith('Sign up failed: Sign up failed');
        });
    });
});