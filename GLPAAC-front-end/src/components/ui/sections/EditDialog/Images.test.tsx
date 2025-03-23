import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Images from './Images';

describe("Images", () => {
    it("renders mapping of all images from API response"), () => {
        render(<Images />)
    };
});