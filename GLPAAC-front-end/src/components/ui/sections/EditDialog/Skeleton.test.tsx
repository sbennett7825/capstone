import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import Skeleton from './Skeleton';

describe("Skeleton", () => {
    it("renders a gray square placeholder while awaiting images from the API"), () => {
        render(<Skeleton />)
    };
});