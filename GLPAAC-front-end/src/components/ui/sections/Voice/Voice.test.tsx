import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Voice from './Voice';

describe("Voice", () => {
    it("renders a dialog with a pitch and rate adjustors, a dropdown to select a voice/language, and save, test and cancel buttons"), () => {
        render(<Voice />)
    };
});