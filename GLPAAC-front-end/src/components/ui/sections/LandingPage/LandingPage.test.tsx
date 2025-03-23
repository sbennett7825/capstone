import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import LandingPage from './LandingPage';

describe("LandingPage", () => {
    it("renders a landing page that allows you to sign up/log in before accessing the Communicator"), () => {
        render(<LandingPage />)
    };
});