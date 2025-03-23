import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import ImageSearch from './ImageSearch';

describe("ImageSearch", () => {
    it("renders all children from ImageSearch inside of a div"), () => {
        render(<ImageSearch />)
    };
});