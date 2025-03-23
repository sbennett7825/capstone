import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import SearchField from './SearchField';

describe("SearchField", () => {
    it("renders input and submit button for search field, and handles the information from the input"), () => {
        render(<SearchField />)
    };
});