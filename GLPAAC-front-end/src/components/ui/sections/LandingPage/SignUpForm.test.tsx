import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import SignUpForm from './SignupForm';

describe("SignUpForm", () => {
    it("renders a dialog with a sign up form including username, password, first name, last name, and email"), () => {
        render(<SignUpForm />)
    };
});