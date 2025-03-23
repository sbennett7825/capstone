import React, { useState } from 'react'
import { Input } from "../../input";
import { Label } from "../../label";
import { Button } from "../../button";

const SignUpForm = () => {
    const [formData, setFormData] = useState({
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: ""
    });
    
    const handleChange = (e:any) => {
      const { id, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    };
    
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (response.ok) {
          alert('Sign up successful! Please log in.');
          // Redirect or update state as needed
        } else {
          const data = await response.json();
          alert(`Sign up failed: ${data.message}`);
        }
      } catch (error) {
        console.error('Sign up error:', error);
      }
    };
    
    return (
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input 
            id="username" 
            value={formData.username}
            onChange={handleChange}
            placeholder="Choose a username" 
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input 
            id="password" 
            type="password" 
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password" 
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input 
              id="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your first name" 
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input 
              id="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Your last name" 
              required
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={formData.email}
            onChange={handleChange}
            placeholder="your.email@example.com" 
            required
          />
        </div>
        <Button type="submit" className="w-full">Sign Up</Button>
      </form>
    );
  };

export default SignUpForm