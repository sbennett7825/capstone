import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Communicator from './Communicator';

describe("Communicator", () => {
    it("renders a the page with the communicator on it following successful login"), () => {
        render(<Communicator />)
    };
});