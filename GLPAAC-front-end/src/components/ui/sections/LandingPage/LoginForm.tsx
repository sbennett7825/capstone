import React, { useState } from 'react'
import { Input } from "../../input";
import { Label } from "../../label";
import { Button } from "../../button";

const LoginForm = ({ onLoginSuccess }:any) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
        console.log(response);
        
        if (response.ok) {
          alert('Login successful!');
          onLoginSuccess();
          // Redirect or update state as needed
        } else {
          alert('Login failed. Please check your credentials.');
        }
      } catch (error) {
        console.error('Login error:', error);
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
        <Button type="submit" className="w-full">Log In</Button>
      </form>
    );
  };  

export default LoginForm