import React, { useState, createContext, useEffect, useRef } from 'react';
import '../../../App.css';
import '../../../index.css';
    
    
import { col1, col2, grid } from '../../../constants/CardTextConstants.tsx';
import {col1Images,col2Images,gridImages} from '../../../constants/DefaultImageGroupingConstants.tsx';
import deleteWord from '../../../constants/local-images/default-nav-images/delete-word.png';
import clear from '../../../constants/local-images/default-nav-images/clear.png';
import { Card } from '../card.tsx';
import { Input } from '../input.tsx';
import { Textarea } from '../textarea.tsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../dialog.tsx';
import { Button } from '../button.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu.tsx';
import ImageSearch from '../sections/EditDialog/ImageSearch.tsx';
import SearchField from '../sections/EditDialog/SearchField.tsx';
import Images from '../sections/EditDialog/Images.tsx';
import useAxios from '../../../hooks/useAxios.tsx';
import Voice from '../../../components/ui/sections/Voice/Voice.tsx';
import { Menu, Edit, LogIn, Square, PlayCircle, Settings } from 'lucide-react';


//Create Context
export const ImageContext = createContext({});
export const VoiceContext = createContext(null);
    

// Get API URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const Communicator = ({ onLogout }:any) => {
     

      //Image Search
      const [searchImage, setSearchImage] = useState('');
      const [selectedImage, setSelectedImage] = useState(null);
    
      const { response, isLoading, error, fetchData } = 
        useAxios(`${API_URL}/symbols?q=cats`);
      
      const value = {
        selectedImage,
        setSelectedImage,
        response,
        isLoading,
        error,
        fetchData,
        searchImage,
        setSearchImage,
      };

      
      //Voice State
      const [isVoiceDialogOpen, setIsVoiceDialogOpen] = useState(false);
      const [isSpeaking, setIsSpeaking] = useState(false);
      const speechSynthRef = useRef(window.speechSynthesis);
      const utteranceRef = useRef(null);
      const [voiceRate, setVoiceRate] = useState(1);
      const [voicePitch, setVoicePitch] = useState(1);
      const [voiceName, setVoiceName] = useState('');
    

      //Card State
      const [inputText, setInputText] = useState('');
      const [editMode, setEditMode] = useState(false);
      const [selectedCard, setSelectedCard] = useState(null);
      const [isDialogOpen, setIsDialogOpen] = useState(false);
      const [editText, setEditText] = useState('');
      const [draggedCard, setDraggedCard] = useState(null);
      const [dropTarget, setDropTarget] = useState(null);
      const [cards, setCards] = useState({
        column1: Array.from({ length: 6 }, (_, i) => ({
          id: `col1-${i}`,
          text: col1[i],
          image: col1Images[i],
        })),
        column2: Array.from({ length: 7 }, (_, i) => ({
          id: `col2-${i}`,
          text: col2[i],
          image: col2Images[i],
        })),
        grid: Array.from({ length: 42 }, (_, i) => ({
          id: `grid-${i}`,
          text: grid[i],
          image: gridImages[i],
        }))
      });
    
    
//Voice Functions

  // Function to get saved voice settings
  const getSavedVoiceSettings = async () => {
    const token = localStorage.getItem('auth_token');
    
    // If user is logged in, try to fetch from the server first
    if (token) {
      try {
        const response = await fetch(`${API_URL}/user-settings/voice`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Return the settings from the server
            return {
              rate: data.settings.rate,
              pitch: data.settings.pitch,
              voiceName: data.settings.voiceName
            };
          }
        }
        // If server fetch fails, fall back to localStorage
      } catch (error) {
        console.error('Error fetching voice settings:', error);
        // Continue to localStorage fallback
      }
    }
    // Fallback to localStorage if not logged in or API call failed
    return {
      rate: parseFloat(localStorage.getItem('voice-rate') || '1'),
      pitch: parseFloat(localStorage.getItem('voice-pitch') || '1'),
      voiceName: localStorage.getItem('voice-name') || ''
    };
  };
    
  
// Handle speak/stop functionality
  const handleSpeakOrStop = async () => {
    if (speechSynthRef.current.speaking) {
      speechSynthRef.current.cancel();
      setIsSpeaking(false);
      return;
    }

    if (inputText.trim() !== '') {
      try {
        // Get settings asynchronously
        const { rate, pitch, voiceName } = await getSavedVoiceSettings();
        
        const utterance = new SpeechSynthesisUtterance(inputText);
        
        // Apply settings
        utterance.rate = rate;
        utterance.pitch = pitch;
        
        // Set voice if available
        if (voiceName) {
          const voices = speechSynthRef.current.getVoices();
          const savedVoice = voices.find(v => v.name === voiceName);
          if (savedVoice) {
            utterance.voice = savedVoice;
          }
        }

        utterance.onend = () => {
          setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        speechSynthRef.current.speak(utterance);
        setIsSpeaking(true);
      } catch (error) {
        console.error('Error getting voice settings:', error);
        // Fall back to default settings if there's an error
        const utterance = new SpeechSynthesisUtterance(inputText);
        utteranceRef.current = utterance;
        speechSynthRef.current.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };
    
      // Cleanup on unmount
      useEffect(() => {
        return () => {
          if (speechSynthRef.current.speaking) {
            speechSynthRef.current.cancel();
          }
        };
      }, []);
    
      const voiceContextValue = {
        voiceRate,
        voicePitch,
        voiceName,
        setVoiceRate,
        setVoicePitch,
        setVoiceName,
      };
    
    
      //Card Functions
      const handleDeleteWord = () => {
        const words = inputText.trim().split(' ');
        if (words.length > 0) {
          words.pop();
          setInputText(words.join(' '));
        }
      };
    
      const handleClearText = () => {
        setInputText('');
      };
    
      const handleCardClick = (card:any) => {
        if (editMode) {
          setSelectedCard(card);
          setEditText(card.text);
          setIsDialogOpen(true);
        } else {
          setInputText((prev) => prev + (prev ? ' ' : '') + card.text);
        }
      };
    
      const handleCardUpdate = async () => {
        if (!selectedCard) return;
        
        const section = selectedCard.id.split('-')[0] === 'grid' ? 'grid' : 
                       selectedCard.id.split('-')[0] === 'col1' ? 'column1' : 'column2';
        
        let updates = {};
        
        if (editText) {
          updates.text = editText;
        }
        
        try {
          if (selectedImage) {
            updates.image = selectedImage;
          } else if (e && e.target.files && e.target.files[0]) {
            const placeholderResponse = await fetch('/api/placeholder/64/64');
            if (!placeholderResponse.ok) throw new Error('Placeholder fetch failed');
            updates.image = placeholderResponse.url;
          }
        } catch (error) {
          console.error('Error processing image:', error);
        }
        
        setCards({
          ...cards,
          [section]: cards[section].map(card => 
            card.id === selectedCard.id ? { ...card, ...updates } : card
          )
        });
        
        setIsDialogOpen(false);
        setSelectedCard(null);
        setEditText('');
        setSelectedImage(null);
      };
    
      const findCardLocation = (cardId) => {
        for (const [section, cardList] of Object.entries(cards)) {
          const index = cardList.findIndex(card => card.id === cardId);
          if (index !== -1) {
            return { section, index };
          }
        }
        return null;
      };
    
      const handleDragStart = (e, card) => {
        if (editMode){
          setDraggedCard(card);
          e.dataTransfer.setData('text/plain', card.id);
          e.dataTransfer.effectAllowed = 'move';};
      };
    
      const handleDragOver = (e, card) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTarget(card);
      };
    
      const handleDragEnd = () => {
        setDraggedCard(null);
        setDropTarget(null);
      };
    
      const handleDrop = (e, targetCard) => {
        e.preventDefault();
        if (!draggedCard || draggedCard.id === targetCard.id) return;
    
        const sourceLocation = findCardLocation(draggedCard.id);
        const targetLocation = findCardLocation(targetCard.id);
    
        if (!sourceLocation || !targetLocation) return;
    
        const newCards = { ...cards };
        const sourceCards = [...cards[sourceLocation.section]];
        const targetCards = sourceLocation.section === targetLocation.section ? 
          sourceCards : [...cards[targetLocation.section]];
    
        // Remove card from source
        sourceCards.splice(sourceLocation.index, 1);
    
        // Add card to target position
        const targetIndex = targetLocation.index;
        if (sourceLocation.section === targetLocation.section) {
          sourceCards.splice(targetIndex, 0, draggedCard);
          newCards[sourceLocation.section] = sourceCards;
        } else {
          targetCards.splice(targetIndex, 0, draggedCard);
          newCards[sourceLocation.section] = sourceCards;
          newCards[targetLocation.section] = targetCards;
        }
    
        setCards(newCards);
        setDraggedCard(null);
        setDropTarget(null);
      };
    
      const CardContent = ({ card }) => (
        <div 
          className={`w-full h-full flex flex-col items-center justify-center p-1 
            ${dropTarget?.id === card.id ? 'bg-blue-100' : ''}
            ${draggedCard?.id === card.id ? 'opacity-50' : ''}`}
          draggable="true"
          onDragStart={(e) => handleDragStart(e, card)}
          onDragOver={(e) => handleDragOver(e, card)}
          onDragEnd={handleDragEnd}
          onDrop={(e) => handleDrop(e, card)}
        >
          <img 
            src={card.image} 
            alt={card.text} 
            className="w-10 h-10 mb-1 object-cover rounded"
          />
          <span className="text-xs text-center break-words">{card.text}</span>
        </div>
      );

  return (
    <div className="h-screen p-4 flex flex-col gap-4 bg-gray-200">

        {/* Top Row */}
        <div className="flex gap-4 w-full">

          {/* Input */}
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text"
            className="grow resize-none bg-white text-wrap" />

          {/* Speak/Stop Button */}
          <Card
            data-testid="speak-button"
            onClick={handleSpeakOrStop}
            className={isSpeaking ? "bg-red-500 hover:bg-red-600 w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-100 p-2" : "w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-100 p-2"}
          >
            {isSpeaking ? (
              <>
                <Square className="justify-center" size={45} />
              </>
            ) : (
              <>
                <PlayCircle className="justify-center" size={45} />
              </>
            )}
          </Card>

          {/* Voice dialog component */}
          <VoiceContext.Provider value={voiceContextValue}>
            <Voice
              isVoiceDialogOpen={isVoiceDialogOpen}
              setIsVoiceDialogOpen={setIsVoiceDialogOpen}
              inputText={inputText} />
          </VoiceContext.Provider>


          <Card
            data-testid="delete-word-button"
            className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-100 p-2"
            onClick={handleDeleteWord}
          >
            <img src={deleteWord}></img>
          </Card>

          <Card
            data-testid="clear-button"
            className="w-16 h-16 flex items-center justify-center cursor-pointer hover:bg-gray-100 p-3"
            onClick={handleClearText}
          >
            <img src={clear}></img>
          </Card>

          <Card className="w-16 h-16 flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="menu-button">
                <Menu className="h-6 w-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setEditMode(!editMode)}>
                  <Edit className="h-4 w-4 mr-2" />
                  {editMode ? 'Exit Edit Mode' : 'Edit Cards'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setIsVoiceDialogOpen(prev => !prev); } }>
                  <Settings className="h-4 w-4 mr-2" />
                  {'Voice Settings'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onLogout}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {'Log Out'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="flex gap-4 flex-1 overflow-hidden">
          {/* First Column */}
          <div className="flex-none w-16 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {cards.column1.map((card) => (
                <Card
                  key={card.id}
                  className={`w-16 h-16 bg-green-300 cursor-pointer hover:bg-gray-100 ${editMode ? 'border-3 border-blue-500' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <CardContent card={card} />
                </Card>
              ))}
            </div>
          </div>

          {/* Second Column */}
          <div className="flex-none w-16 overflow-y-auto">
            <div className="flex flex-col gap-4">
              {cards.column2.map((card) => (
                <Card
                  key={card.id}
                  className={`w-16 h-16 bg-purple-300 cursor-pointer hover:bg-gray-100 ${editMode ? 'border-3 border-blue-500' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <CardContent card={card} />
                </Card>
              ))}
            </div>
          </div>

          {/* Grid Section */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-6 gap-4">
              {cards.grid.map((card) => (
                <Card
                  key={card.id}
                  className={`w-16 h-16 cursor-pointer hover:bg-gray-100 ${editMode ? 'border-3 border-blue-500' : ''}`}
                  onClick={() => handleCardClick(card)}
                >
                  <CardContent card={card} />
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>Edit Card</DialogTitle>
            </DialogHeader>

            {/* Edit Text */}
            <div className="">
              <h1>Edit Text</h1>
              <Input
                className=""
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Enter new text" />
            </div>

            {/* Search Images */}
            <div className="">
              <ImageContext.Provider value={value}>
                <ImageSearch>
                  <SearchField />
                </ImageSearch>

                <div className="">
                  <Images />
                </div>

              </ImageContext.Provider>
            </div>

            {/* <div className="">
              <h1>Upload from File</h1>
              <Button onClick={() => document.getElementById('imageUpload').click()}>
                <Image className="h-4 w-4 mr-2" />
                Upload Image
              </Button>

              <input
                id="imageUpload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleCardUpdate} />
            </div> */}

            <DialogFooter className="">
              <Button onClick={() => { setIsDialogOpen(false); setSelectedImage(null); } } variant="outline">
                Cancel
              </Button>
              <Button onClick={async () => {
                try {
                  handleCardUpdate();
                }
                catch (error) {
                  console.error('Error during save changes:', error);
                }
              } }>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
  )
}

export default Communicator