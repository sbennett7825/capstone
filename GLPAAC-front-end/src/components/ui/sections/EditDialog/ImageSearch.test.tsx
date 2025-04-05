import React from 'react';
import { render } from '@testing-library/react';
import ImageSearch from './ImageSearch';
import { describe, it, expect } from 'vitest'; // Import necessary functions from vitest

describe("ImageSearch", () => {
    it("renders the title and children correctly", () => {
        const { getByText } = render(
            <ImageSearch>
                <p>Test Child Component</p>
            </ImageSearch>
        );

        // Check if the title is rendered
        expect(getByText("Find Symbol")).toBeInTheDocument();

        // Check if the child component is rendered
        expect(getByText("Test Child Component")).toBeInTheDocument();
    });

    it("renders without children", () => {
        const { getByText } = render(<ImageSearch />);

        // Check if the title is rendered
        expect(getByText("Find Symbol")).toBeInTheDocument();
    });
});