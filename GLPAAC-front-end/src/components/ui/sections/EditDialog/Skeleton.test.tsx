// import React from 'react';
// import { render } from '@testing-library/react';
// import { describe, it } from 'vitest';
// import Skeleton from './Skeleton';

// describe("Skeleton", () => {
//     it("renders a gray square placeholder while awaiting images from the API"), () => {
//         render(<Skeleton />)
//     };
// });

import React from 'react';
import { render } from '@testing-library/react';
import Skeleton from './Skeleton';
import { describe, it, expect } from 'vitest';

describe("Skeleton", () => {
    it("renders the correct number of skeleton items", () => {
        const itemCount = 5; // Number of skeleton items to render
        const { container } = render(<Skeleton item={itemCount} />);

        // Check if the correct number of skeleton items is rendered
        const skeletonItems = container.querySelectorAll('.animate-pulse');
        expect(skeletonItems.length).toBe(itemCount);
    });

    it("renders skeleton items with correct classes", () => {
        const itemCount = 3; // Number of skeleton items to render
        const { container } = render(<Skeleton item={itemCount} />);

        // Check if each skeleton item has the correct classes
        const skeletonItems = container.querySelectorAll('.animate-pulse');
        skeletonItems.forEach(item => {
            expect(item).toHaveClass('animate-pulse');
            expect(item.firstChild).toHaveClass('h-20');
            expect(item.firstChild).toHaveClass('w-20');
            expect(item.firstChild).toHaveClass('bg-gray-200');
        });
    });
});