import React, { useState } from 'react'
import { Input } from "../../input";
import { Label } from "../../label";
import { Button } from "../../button";

const LoginForm = ({ onLoginSuccess }: any) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const handleSubmit = async (e: any) => {
      e.preventDefault();
      setIsLoading(true);
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        
        // console.log('Response status:', response.status);
        
        if (response.ok) {
          // Parse the JSON response to get the token
          const data = await response.json();
          
          // Store the token in localStorage
          if (data.token) {
            localStorage.setItem('auth_token', data.token);
            console.log('Token saved in localStorage');
          } else {
            console.warn('No token found in login response');
          }
          
          alert('Login successful!');
          onLoginSuccess();
        } else {
          const errorData = await response.json().catch(() => ({}));
          alert(`Login failed: ${errorData.message || 'Please check your credentials.'}`);
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Login failed due to a network error. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username" 
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password" 
            required
          />
        </div>
        <Button
          data-testid="submit-button" 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </Button>
      </form>
    );
  };  

export default LoginForm