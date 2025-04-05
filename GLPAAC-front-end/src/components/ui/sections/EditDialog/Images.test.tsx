// import React from 'react';
// import { render } from '@testing-library/react';
// import { describe, it } from 'vitest';
// import Images from './Images';

// describe("Images", () => {
//     it("renders mapping of all images from API response"), () => {
//         render(<Images />)
//     };
// });import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ImageContext } from '../Communicator';
import Images from './Images';
import { vi } from 'vitest';

describe("Images", () => {
    const mockSetSelectedImage = vi.fn();

    const renderWithContext = (contextValues) => {
        return render(
            <ImageContext.Provider value={contextValues}>
                <Images />
            </ImageContext.Provider>
        );
    };

    it("renders loading state", () => {
        const contextValues = {
            response: [],
            isLoading: true,
            searchImage: 'Cats',
            selectedImage: null,
            setSelectedImage: mockSetSelectedImage,
        };

        const { getByText, container } = renderWithContext(contextValues);

        // Check if the title is rendered
        expect(getByText("Results for: Cats")).toBeInTheDocument();

        // Check if the skeleton items are rendered
        const skeletonItems = container.querySelectorAll('.animate-pulse');
        expect(skeletonItems.length).toBe(6); // Check if 6 skeleton items are rendered
    });

    it("renders images and handles selection", () => {
        const mockResponse = [
            { image_url: 'http://example.com/image1.jpg' },
            { image_url: 'http://example.com/image2.jpg' },
        ];

        const contextValues = {
            response: mockResponse,
            isLoading: false,
            searchImage: 'Cats',
            selectedImage: null,
            setSelectedImage: mockSetSelectedImage,
        };

        const { getByText, getAllByRole } = renderWithContext(contextValues);

        // Check if the title is rendered
        expect(getByText("Results for: Cats")).toBeInTheDocument();

        // Check if images are rendered
        const imageButtons = getAllByRole('button');
        expect(imageButtons.length).toBe(mockResponse.length);

        // Simulate selecting an image
        fireEvent.click(imageButtons[0]);

        // Check if setSelectedImage was called with the correct URL
        expect(mockSetSelectedImage).toHaveBeenCalledWith('http://example.com/image1.jpg');
    });

    it("displays selected image message", () => {
        const contextValues = {
            response: [],
            isLoading: false,
            searchImage: 'Cats',
            selectedImage: 'http://example.com/image1.jpg',
            setSelectedImage: mockSetSelectedImage,
        };

        const { getByText } = renderWithContext(contextValues);

        // Check if the selected image message is displayed
        expect(getByText("Image Selected")).toBeInTheDocument();
    });

    it("displays none selected message", () => {
        const contextValues = {
            response: [],
            isLoading: false,
            searchImage: 'Cats',
            selectedImage: null,
            setSelectedImage: mockSetSelectedImage,
        };

        const { getByText } = renderWithContext(contextValues);

        // Check if the none selected message is displayed
        expect(getByText("None selected")).toBeInTheDocument();
    });
});