import React, { useState, useRef, useEffect, useContext } from 'react';
import { Button } from '../../button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../dialog';
import { Volume2, Square, Plus, Minus, Save } from 'lucide-react';
import axios from 'axios';
import { VoiceContext } from '../Communicator';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const Voice = ({ isVoiceDialogOpen, setIsVoiceDialogOpen, inputText }) => {

  const voiceContext = useContext(VoiceContext);

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(voiceContext?.voiceRate || 1);
  const [pitch, setPitch] = useState(voiceContext?.voicePitch || 1);
  const [selectedVoice, setSelectedVoice] = useState(voiceContext?.voiceName || '');
  const [voices, setVoices] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const speechSynthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null); 
  
  const getToken = () => localStorage.getItem('auth_token');
  
  // Initialize voices and load user settings when component mounts
  useEffect(() => {
    if (isVoiceDialogOpen && voiceContext) {
      setRate(voiceContext.voiceRate || 1);
      setPitch(voiceContext.voicePitch || 1);
      setSelectedVoice(voiceContext.voiceName || '');
    }
  }, [isVoiceDialogOpen, voiceContext]);
  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthRef.current.getVoices();
      setVoices(availableVoices);
    };

    // Load voices initially
    loadVoices();

    // Chrome requires this event listener to get voices
    speechSynthRef.current.onvoiceschanged = loadVoices;

    // Load user settings from database if logged in, otherwise from localStorage
    const loadUserSettings = async () => {
      const token = getToken();
     
      if (token) {
        try {
          // Try to fetch from server first
          const response = await axios.get(`${API_URL}/user-settings/voice`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.data.success) {
            setRate(response.data.settings.rate);
            setPitch(response.data.settings.pitch);
            setSelectedVoice(response.data.settings.voiceName);
          }
        } catch (error) {
          console.error('Error loading voice settings:', error);
          // Fall back to localStorage if API call fails
          loadFromLocalStorage();
        }
      } else {
        // If not logged in, use localStorage
        loadFromLocalStorage();
      }
    };
    
    const loadFromLocalStorage = () => {
      const savedRate = localStorage.getItem('voice-rate');
      const savedPitch = localStorage.getItem('voice-pitch');
      const savedVoice = localStorage.getItem('voice-name');
      
      if (savedRate) setRate(parseFloat(savedRate));
      if (savedPitch) setPitch(parseFloat(savedPitch));
      if (savedVoice) setSelectedVoice(savedVoice);
    };
    
    loadUserSettings();

    // Cleanup
    return () => {
      if (utteranceRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

  // When voices are loaded, select the saved voice if available
  useEffect(() => {
    if (voices.length > 0 && selectedVoice) {
      const voiceExists = voices.some(v => v.name === selectedVoice);
      
      if (!voiceExists) {
        setSelectedVoice(voices[0].name);
      }
    } else if (voices.length > 0 && !selectedVoice) {
      setSelectedVoice(voices[0].name);
    }
  }, [voices, selectedVoice]);

  const handleSpeak = () => {
    if (speechSynthRef.current.speaking) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = inputText || "Testing the voice to hear how it sounds.";
    
    if (textToSpeak.trim() !== '') {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      // Set selected voice if available
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utteranceRef.current = utterance;
      speechSynthRef.current.speak(utterance);
      setIsSpeaking(true);
    }
  };

  const saveVoiceSettings = async () => {
    
    // Save to localStorage as fallback
    localStorage.setItem('voice-rate', rate.toString());
    localStorage.setItem('voice-pitch', pitch.toString());
    localStorage.setItem('voice-name', selectedVoice);
      
    // Update context if available
    if (voiceContext) {
      voiceContext.setVoiceRate(rate);
      voiceContext.setVoicePitch(pitch);
      voiceContext.setVoiceName(selectedVoice);
    }
      
    // If user is logged in, save to database
    const token = getToken();
    if (token) {
      try {
        setSaveStatus('saving');
        
        const response = await axios.post(
          `${API_URL}/user-settings/voice`,
          {
            rate,
            pitch,
            voiceName: selectedVoice
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          setSaveStatus('success');
          setTimeout(() => setSaveStatus(''), 1500);
        } else {
          setSaveStatus('error');
          setTimeout(() => setSaveStatus(''), 1500);
        }
      } catch (error) {
        console.error('Error saving voice settings:', error);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus(''), 1500);
      }
    } else {
      // For non-logged in users, just show success for localStorage save
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 1500);
    }
  };

  const adjustRate = (amount) => {
    setRate(prev => Math.max(0.5, Math.min(2, prev + amount)));
  };

  const adjustPitch = (amount) => {
    setPitch(prev => Math.max(0.5, Math.min(2, prev + amount)));
  };

  // Get button color based on save status
  const getSaveButtonClass = () => {
    switch (saveStatus) {
      case 'saving':
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'success':
        return 'bg-green-500 hover:bg-green-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return '';
    }
  };

  return (
    <Dialog className="w-full max-w-md" open={isVoiceDialogOpen} onOpenChange={setIsVoiceDialogOpen}>
      <DialogContent className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 size={20} />
            Voice Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Rate {rate.toFixed(1)}</label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustRate(-0.1)}
                disabled={rate <= 0.5}
              >
                <Minus size={16} />
              </Button>
              <div className="h-2 bg-gray-200 rounded-full flex-1">
                <div 
                  className="h-2 bg-blue-500 rounded-full" 
                  style={{ width: `${((rate - 0.5) / 1.5) * 100}%` }}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustRate(0.1)}
                disabled={rate >= 2}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Pitch {pitch.toFixed(1)}</label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustPitch(-0.1)}
                disabled={pitch <= 0.5}
              >
                <Minus size={16} />
              </Button>
              <div className="h-2 bg-gray-200 rounded-full flex-1">
                <div 
                  className="h-2 bg-blue-500 rounded-full" 
                  style={{ width: `${((pitch - 0.5) / 1.5) * 100}%` }}
                />
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => adjustPitch(0.1)}
                disabled={pitch >= 2}
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
        
        {voices.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-1 block">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full p-2 border rounded"
            >
              {voices.map((voice) => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>
        )}
        
        <DialogFooter className="flex justify-between">
          <Button onClick={() => {setIsVoiceDialogOpen(null);}} variant="outline">
            Cancel
          </Button>
          <Button
            onClick={handleSpeak}
            className={isSpeaking ? "bg-red-500 hover:bg-red-600" : ""}
          >
            {isSpeaking ? (
              <>
                <Square className="mr-2" size={16} />
                Stop
              </>
            ) : (
              <>
                <Volume2 className="mr-2" size={16} />
                Test
              </>
            )}
          </Button>
          <Button
            id="save-voice-button"
            onClick={async () => {
              await saveVoiceSettings();
              setIsVoiceDialogOpen(null);
            }}
            className={`transition-colors ${getSaveButtonClass()}`}
          >
            <Save className="mr-2" size={16} />
            {saveStatus === 'saving' ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Voice;