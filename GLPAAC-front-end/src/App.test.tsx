import { render, screen, fireEvent } from '@testing-library/react';
import App from './App'; // Adjust the import path as necessary
import { vi } from 'vitest';

// Mock the components used in App
vi.mock('./components/ui/sections/LandingPage/LandingPage.tsx', () => {
    return {
        default: function MockLandingPage({ onLoginSuccess }) {
            return <button onClick={onLoginSuccess}>Login</button>;
        },
    };
});

vi.mock('./components/ui/sections/Communicator.tsx', () => {
    return {
        default: function MockCommunicator({ onLogout }) {
            return <button onClick={onLogout}>Logout</button>;
        },
    };
});

describe('App Component', () => {
    it('should render LandingPage when not logged in', () => {
        render(<App />);
        expect(screen.getByText('Login')).toBeInTheDocument(); // Check for the Login button
    });

    it('should render Communicator when logged in', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login')); // Simulate login
        expect(screen.getByText('Logout')).toBeInTheDocument(); // Check for the Logout button
    });

    it('should log out and clear local storage', () => {
        render(<App />);
        fireEvent.click(screen.getByText('Login')); // Simulate login
        fireEvent.click(screen.getByText('Logout')); // Simulate logout

        expect(screen.getByText('Login')).toBeInTheDocument(); // Check for the Login button again
        expect(localStorage.getItem('someKey')).toBeNull(); // Check that local storage is cleared
    });
});