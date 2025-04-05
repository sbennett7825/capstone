// import React from 'react';
// import { render } from '@testing-library/react';
// import { describe, it } from 'vitest';
// import SearchField from './SearchField';

// describe("SearchField", () => {
//     it("renders input and submit button for search field, and handles the information from the input"), () => {
//         render(<SearchField />)
//     };
// });

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ImageContext } from '../Communicator';
import SearchField from './SearchField';
import { vi } from 'vitest';

const mockFetchData = vi.fn();
const mockSetSearchImage = vi.fn();

const renderWithContext = () => {
    return render(
        <ImageContext.Provider value={{ fetchData: mockFetchData, setSearchImage: mockSetSearchImage }}>
            <SearchField />
        </ImageContext.Provider>
    );
};

describe("SearchField", () => {
    
    it("renders input and submit button for search field", () => {
        const { getByPlaceholderText, getByText } = renderWithContext();
        
        // Check if input and button are rendered
        expect(getByPlaceholderText("Search Symbols")).toBeInTheDocument();
        expect(getByText("Search")).toBeInTheDocument();
    });

    
    it("handles input change", () => {
        const { getByPlaceholderText } = renderWithContext();
        const input = getByPlaceholderText("Search Symbols");
        
        // Simulate input change
        fireEvent.change(input, { target: { value: 'test' } });
        
        // Check if the input value is updated
        expect(input.value).toBe('test');
    });

    
    it("calls fetchData and setSearchImage on button click", () => {
        const { getByPlaceholderText, getByText } = renderWithContext();
        const input = getByPlaceholderText("Search Symbols");
        
        // Simulate input change
        fireEvent.change(input, { target: { value: 'test' } });
        
        // Simulate button click
        fireEvent.click(getByText("Search"));
        
        // Check if fetchData and setSearchImage were called
        expect(mockFetchData).toHaveBeenCalledWith('http://localhost:5000/api/symbols?q=test');
        expect(mockSetSearchImage).toHaveBeenCalledWith('test');
    });

    
    it("calls fetchData and setSearchImage on Enter key press", () => {
        const { getByPlaceholderText } = renderWithContext();
        const input = getByPlaceholderText("Search Symbols");
        
        // Simulate input change
        fireEvent.change(input, { target: { value: 'test' } });
        
        // Simulate Enter key press
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
        
        // Check if fetchData and setSearchImage were called
        expect(mockFetchData).toHaveBeenCalledWith('http://localhost:5000/api/symbols?q=test');
        expect(mockSetSearchImage).toHaveBeenCalledWith('test');
    });
});