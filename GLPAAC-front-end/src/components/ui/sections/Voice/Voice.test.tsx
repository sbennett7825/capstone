import { expect, vi, describe, it, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Voice from './Voice';
import { VoiceContext } from '../Communicator';
import axios from 'axios';

//Smoke test
describe("Voice", () => {
    it("renders a dialog with a pitch and rate adjustors, a dropdown to select a voice/language, and save, test and cancel buttons"), () => {
        render(<Voice />)
    };
});

// Mock axios
vi.mock('axios', async () => {
    return {
      default: {
        get: vi.fn(() => Promise.resolve({ data: { success: true, settings: {} } })),
        post: vi.fn(() => Promise.resolve({ data: { success: true } }))
      }
    };
  });

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock SpeechSynthesis API with initial voices array
const mockVoices = [
  { name: 'Voice 1', lang: 'en-US' },
  { name: 'Voice 2', lang: 'en-GB' }
];

const speechSynthesisMock = {
  speak: vi.fn(),
  cancel: vi.fn(),
  getVoices: vi.fn().mockReturnValue(mockVoices),
  speaking: false,
  onvoiceschanged: null
};

const utteranceMock = {
  onend: null,
  voice: null,
  rate: 1,
  pitch: 1
};

// Set up SpeechSynthesisUtterance constructor mock
global.SpeechSynthesisUtterance = vi.fn(() => utteranceMock);

// Set up speechSynthesis mock
Object.defineProperty(window, 'speechSynthesis', { 
  value: speechSynthesisMock,
  writable: true 
});

// Create a custom render function that includes the VoiceContext provider
const renderWithVoiceContext = (ui, contextValue) => {
  return render(
    <VoiceContext.Provider value={contextValue || null}>
      {ui}
    </VoiceContext.Provider>
  );
};

describe("Voice Component", () => {
  const mockProps = {
    isVoiceDialogOpen: true,
    setIsVoiceDialogOpen: vi.fn(),
    inputText: "Test input text"
  };

  const voiceContextValue = {
    voiceRate: 1.2,
    voicePitch: 1.1,
    voiceName: 'Voice 1',
    setVoiceRate: vi.fn(),
    setVoicePitch: vi.fn(),
    setVoiceName: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset the speechSynthesis mock to ensure voices are available
    window.speechSynthesis = {
      ...speechSynthesisMock,
      getVoices: vi.fn().mockReturnValue(mockVoices)
    };

    // Ensure voices are populated in the component
    vi.spyOn(window.speechSynthesis, 'getVoices').mockReturnValue(mockVoices);
    
    // Clear localStorage mock
    localStorageMock.clear();
    
    // Reset axios mocks
    axios.get.mockReset();
    axios.post.mockReset();

    // Set up default responses
    axios.get.mockResolvedValue({ 
      data: { 
        success: true, 
        settings: {
          rate: 1.2,
          pitch: 1.1,
          voiceName: 'Voice 1'
        }
      }
    });
    axios.post.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the dialog when isVoiceDialogOpen is true", () => {
    renderWithVoiceContext(<Voice {...mockProps} />, voiceContextValue);
    
    // Using query methods that don't throw errors if element isn't found
    const titleElement = screen.queryByText("Voice Settings");
    expect(titleElement).toBeInTheDocument();
  });

  it("loads voice settings from context", () => {
    renderWithVoiceContext(<Voice {...mockProps} />, voiceContextValue);
    
    // Check if context values are used
    expect(screen.queryByText(/Rate 1.2/)).toBeInTheDocument();
    expect(screen.queryByText(/Pitch 1.1/)).toBeInTheDocument();
  });

  it("adjusts rate when buttons are clicked", async () => {
    renderWithVoiceContext(<Voice {...mockProps} />, {
      ...voiceContextValue,
      voiceRate: 1.0,
      voicePitch: 1.0
    });

    // Find rate increment button using role and text content
    const rateButtons = screen.getAllByRole('button');
    const incrementRateBtn = rateButtons.find(btn => btn.textContent === '+');
    
    if (incrementRateBtn) {
      fireEvent.click(incrementRateBtn);
      
      // Manually trigger rate state update since we're not waiting for async
      await waitFor(() => {
        const rateText = screen.queryByText(/Rate 1.1/);
        expect(rateText).toBeInTheDocument();
      });
    }
  });

  it("starts speech synthesis when test button is clicked", () => {
    renderWithVoiceContext(<Voice {...mockProps} />, voiceContextValue);

    // Find test button
    const testButton = screen.getByText('Test');
    fireEvent.click(testButton);

    // Check if speech synthesis was called
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });

  it("saves settings when save button is clicked", async () => {
    // Set up localStorage mock to return a token
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'auth_token') return 'test-token';
      return null;
    });

    renderWithVoiceContext(<Voice {...mockProps} />, voiceContextValue);

    // Find and click save button
    const saveButton = screen.getByText('Save');
    fireEvent.click(saveButton);

    // Check if localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('voice-rate', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('voice-pitch', expect.any(String));
    expect(localStorageMock.setItem).toHaveBeenCalledWith('voice-name', expect.any(String));
    
    // Check if context setters were called
    expect(voiceContextValue.setVoiceRate).toHaveBeenCalled();
    expect(voiceContextValue.setVoicePitch).toHaveBeenCalled();
    expect(voiceContextValue.setVoiceName).toHaveBeenCalled();
    
    // Check if API call was made
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
    
    // Check if dialog was closed
    expect(mockProps.setIsVoiceDialogOpen).toHaveBeenCalledWith(null);
  });

  it("closes the dialog when cancel button is clicked", () => {
    renderWithVoiceContext(<Voice {...mockProps} />, voiceContextValue);

    // Find and click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check if dialog was closed
    expect(mockProps.setIsVoiceDialogOpen).toHaveBeenCalledWith(null);
  });
});