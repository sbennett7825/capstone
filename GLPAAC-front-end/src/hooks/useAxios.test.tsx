// useAxios.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import axios from 'axios';
import useAxios from './useAxios';

// Mock the axios module
vi.mock('axios');

const TestComponent = ({ url }) => {
    const { response, isLoading, error } = useAxios(url);

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    return <div>Data: {JSON.stringify(response)}</div>;
};

describe('useAxios', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch data successfully', async () => {
        const mockData = { data: 'some data' };
        axios.mockResolvedValueOnce({ data: mockData });

        render(<TestComponent url="/api/test" />);

        expect(screen.getByText(/Loading.../)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Data:/)).toBeInTheDocument();
            expect(screen.getByText(/some data/)).toBeInTheDocument();
        });
    });

    it('should handle error', async () => {
        const mockError = new Error('Network Error');
        axios.mockRejectedValueOnce(mockError);

        render(<TestComponent url="/api/test" />);

        expect(screen.getByText(/Loading.../)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText(/Error:/)).toBeInTheDocument();
            expect(screen.getByText(/Network Error/)).toBeInTheDocument();
        });
    });

    it('should not fetch data if no URL is provided', () => {
        render(<TestComponent url={null} />);
        expect(screen.queryByText(/Loading.../)).not.toBeInTheDocument();
    });
});