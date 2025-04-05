import React from 'react';
import { render } from '@testing-library/react';
import Image from './Image';

describe("Image Component", () => {
    it("renders an image with the correct src and alt attributes", () => {
        const mockData = {
            image_url: 'http://example.com/image.jpg',
            name: 'Example Image'
        };

        const { getByAltText } = render(<Image data={mockData} />);

        // Check if the image is rendered with the correct src
        const imgElement = getByAltText(mockData.name);
        expect(imgElement).toBeInTheDocument();
        expect(imgElement).toHaveAttribute('src', mockData.image_url);
        expect(imgElement).toHaveAttribute('alt', mockData.name);
    });
});