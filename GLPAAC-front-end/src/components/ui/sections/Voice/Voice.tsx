import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../dialog';
import { Volume2, Square, Plus, Minus, Save } from 'lucide-react';

const Voice = ({ isVoiceDialogOpen, setIsVoiceDialogOpen, inputText }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(() => {
    const savedRate = localStorage.getItem('voice-rate');
    return savedRate ? parseFloat(savedRate) : 1;
  });
  const [pitch, setPitch] = useState(() => {
    const savedPitch = localStorage.getItem('voice-pitch');
    return savedPitch ? parseFloat(savedPitch) : 1;
  });
  const [selectedVoice, setSelectedVoice] = useState(() => {
    return localStorage.getItem('voice-name') || '';
  });
  const [voices, setVoices] = useState([]);
  const speechSynthRef = useRef(window.speechSynthesis);
  const utteranceRef = useRef(null);
  
  // Initialize voices when component mounts
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthRef.current.getVoices();
      setVoices(availableVoices);
      
      if (availableVoices.length > 0) {
        // If we have a saved voice, try to find it in available voices
        const savedVoice = localStorage.getItem('voice-name');
        const voiceExists = savedVoice && availableVoices.some(v => v.name === savedVoice);
        
        if (voiceExists) {
          setSelectedVoice(savedVoice);
        } else {
          setSelectedVoice(availableVoices[0].name);
        }
      }
    };

    // Load voices initially
    loadVoices();

    // Chrome requires this event listener to get voices
    speechSynthRef.current.onvoiceschanged = loadVoices;

    // Cleanup
    return () => {
      if (utteranceRef.current) {
        speechSynthRef.current.cancel();
      }
    };
  }, []);

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

  const saveVoiceSettings = () => {
    localStorage.setItem('voice-rate', rate);
    localStorage.setItem('voice-pitch', pitch);
    localStorage.setItem('voice-name', selectedVoice);
    
    // Flash feedback (could be replaced with a toast notification)
    const saveButton = document.getElementById('save-voice-button');
    if (saveButton) {
      saveButton.classList.add('bg-green-500');
      setTimeout(() => {
        saveButton.classList.remove('bg-green-500');
      }, 500);
    }
  };

  const adjustRate = (amount:any) => {
    setRate(prev => Math.max(0.5, Math.min(2, prev + amount)));
  };

  const adjustPitch = (amount:any) => {
    setPitch(prev => Math.max(0.5, Math.min(2, prev + amount)));
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
            onClick={() => {saveVoiceSettings(); setIsVoiceDialogOpen(null);}}
            className="transition-colors"
          >
            <Save className="mr-2" size={16} />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Voice;