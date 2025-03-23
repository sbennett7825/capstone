import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Image from './Image';

describe("Image", () => {
    it("renders a single instance of an image using a url and image name from API data"), () => {
        render(<Image />)
    };
});