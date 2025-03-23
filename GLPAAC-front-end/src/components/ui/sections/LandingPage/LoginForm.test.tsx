import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import LoginForm from './LoginForm';

describe("LoginForm", () => {
    it("renders a dialog with a login form with username and password"), () => {
        render(<LoginForm />)
    };
});