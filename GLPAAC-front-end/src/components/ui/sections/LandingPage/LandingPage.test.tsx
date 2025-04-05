import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingPage from './LandingPage';
import userEvent from '@testing-library/user-event';

// Mock the child components
vi.mock('./SignUpForm', () => ({
  default: () => <div data-testid="signup-form">SignUpForm Component</div>
}));

vi.mock('./LoginForm', () => ({
  default: ({ onLoginSuccess }) => (
    <div data-testid="login-form" onClick={onLoginSuccess}>
      LoginForm Component
    </div>
  )
}));

// Mock Radix UI components
vi.mock('../../dropdown-menu', async () => {
  const actual = await vi.importActual('../../dropdown-menu');
  return {
    ...actual,
    DropdownMenuContent: ({ children }) => <div data-testid="dropdown-content">{children}</div>,
  };
});

vi.mock('../../dialog', async () => {
  const actual = await vi.importActual('../../dialog');
  return {
    ...actual,
    DialogContent: ({ children }) => <div data-testid="dialog-content">{children}</div>,
    DialogHeader: ({ children }) => <div data-testid="dialog-header">{children}</div>,
  };
});

describe('LandingPage Component', () => {
  const mockOnLoginSuccess = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct title and heading', () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByTestId('title')).toHaveTextContent('GLPAAC');
    expect(screen.getByTestId('banner-heading')).toHaveTextContent('GLPAAC');
  });

  it('displays the app description', () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    expect(screen.getByText(/The first Augmentative and Alternative Communication/)).toBeInTheDocument();
    expect(screen.getByText(/Click "Get Started" to open your free account./)).toBeInTheDocument();
  });

  it('renders dropdown menu with menu button', () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    const dropdownTrigger = screen.getByTestId('dropdown-menu-trigger-button');
    expect(dropdownTrigger).toBeInTheDocument();
  });

  it('opens dropdown content when dropdown trigger is clicked', async () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    // Click the dropdown trigger
    const dropdownTrigger = screen.getByTestId('dropdown-menu-trigger-button');
    await user.click(dropdownTrigger);
    
    // With our mock, dropdown content should be visible
    expect(screen.getByTestId('dropdown-content')).toBeInTheDocument();
    
    // Check if the dropdown content contains both buttons with correct text
    const loginButtonText = screen.getByText('Login');
    const signupButtonText = screen.getByText('Sign Up');
    
    expect(loginButtonText).toBeInTheDocument();
    expect(signupButtonText).toBeInTheDocument();
  });

  it('opens login dialog when Login is clicked', async () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    // Click the dropdown trigger
    const dropdownTrigger = screen.getByTestId('dropdown-menu-trigger-button');
    await user.click(dropdownTrigger);
    
    // Find and click the Login button by text
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    // Check if the dialog appears with login content using getAllByTestId instead
    await waitFor(() => {
      const dialogContents = screen.getAllByTestId('dialog-content');
      expect(dialogContents.length).toBeGreaterThan(0);
      
      // Check if any dialog content contains the login title
      const loginDialog = dialogContents.find(dialog => 
        dialog.textContent?.includes('Login to your account')
      );
      expect(loginDialog).toBeDefined();
    });
    
    // Check if the LoginForm is rendered
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });
  
  it('opens signup dialog when Sign Up is clicked', async () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    // Click the dropdown trigger
    const dropdownTrigger = screen.getByTestId('dropdown-menu-trigger-button');
    await user.click(dropdownTrigger);
    
    // Find and click the Sign Up button by text
    const signupButton = screen.getByText('Sign Up');
    await user.click(signupButton);
    
    // Check if the dialog appears with signup content using getAllByTestId
    await waitFor(() => {
      const dialogContents = screen.getAllByTestId('dialog-content');
      expect(dialogContents.length).toBeGreaterThan(0);
      
      // Check if any dialog content contains the signup title
      const signupDialog = dialogContents.find(dialog => 
        dialog.textContent?.includes('Create an account')
      );
      expect(signupDialog).toBeDefined();
    });
    
    // Check if the SignUpForm is rendered - using getAllByTestId instead
    const signupForms = screen.getAllByTestId('signup-form');
    expect(signupForms.length).toBeGreaterThan(0);
  });

  it('opens signup dialog when "Get Started" button is clicked', async () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    // Click the get started button
    const getStartedButton = screen.getByTestId('get-started-button');
    await user.click(getStartedButton);
    
    // Check if dialog appears with signup content using getAllByTestId
    await waitFor(() => {
      const dialogContents = screen.getAllByTestId('dialog-content');
      expect(dialogContents.length).toBeGreaterThan(0);
      
      // Check if any dialog content contains the signup title
      const signupDialog = dialogContents.find(dialog => 
        dialog.textContent?.includes('Create an account')
      );
      expect(signupDialog).toBeDefined();
    });
    
    // Check if the SignUpForm is rendered - using getAllByTestId instead
    const signupForms = screen.getAllByTestId('signup-form');
    expect(signupForms.length).toBeGreaterThan(0);
  });

  it('triggers onLoginSuccess callback when login is successful', async () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    // Open dropdown menu
    const dropdownTrigger = screen.getByTestId('dropdown-menu-trigger-button');
    await user.click(dropdownTrigger);
    
    // Click login button
    const loginButton = screen.getByText('Login');
    await user.click(loginButton);
    
    // In our mocked dialog, the login form should be available
    await waitFor(() => {
      const loginForm = screen.getByTestId('login-form');
      expect(loginForm).toBeInTheDocument();
      
      // Click the login form to trigger onLoginSuccess
      fireEvent.click(loginForm);
    });
    
    // Verify callback was called
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
  });

  it('renders "Learn More" button', () => {
    render(<LandingPage onLoginSuccess={mockOnLoginSuccess} />);
    
    const learnMoreButton = screen.getByTestId('learn-more-button');
    expect(learnMoreButton).toBeInTheDocument();
    expect(learnMoreButton).toHaveTextContent('Learn More');
  });
});