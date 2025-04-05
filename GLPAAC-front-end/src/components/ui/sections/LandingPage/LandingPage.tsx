import { useState } from "react";

import { Card } from '../../card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../../dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../dialog";
import { Button } from "../../button";
import { Menu } from 'lucide-react';

import SignUpForm from "./SignUpForm";
import LoginForm from "./LoginForm";



const LandingPage = ({ onLoginSuccess }:any) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-200">
      <header className="py-6 px-8 flex justify-between items-center bg-gradient-to-b from-purple-500 to-gray-50">
        <h1 className="text-2xl font-bold text-gray-800" data-testid="title">GLPAAC</h1>

<Card className="w-16 h-16 flex items-center justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger data-testid="dropdown-menu-trigger-button">
                <Menu className="h-6 w-6" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
              <div className="w-64 p-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start" data-testid="login-button">
                        Login
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Login to your account</DialogTitle>
                        <DialogDescription>
                          Enter your credentials to access your account.
                        </DialogDescription>
                      </DialogHeader>
                      <LoginForm onLoginSuccess={onLoginSuccess} />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start" data-testid="signup-button">
                        Sign Up
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create an account</DialogTitle>
                        <DialogDescription>
                          Fill in your details to create a new account.
                        </DialogDescription>
                      </DialogHeader>
                      <SignUpForm />
                    </DialogContent>
                  </Dialog>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </Card>
      </header>
      
      <main className="container mx-auto px-4 py-16 flex flex-col items-center text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6" data-testid="banner-heading">GLPAAC</h2>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          The first Augmentative and Alternative Communication (AAC) 
          application for Gestalt Language Processors (GLP).
        </p>
        <p className="text-xl text-gray-600 max-w-2xl mb-8">
          Click "Get Started" to open your free account.
        </p>
        
        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-purple-500" size="lg" data-testid="get-started-button">Get Started</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create an account</DialogTitle>
                <DialogDescription>
                  Fill in your details to create a new account.
                </DialogDescription>
              </DialogHeader>
              <SignUpForm />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="lg" data-testid="learn-more-button">Learn More</Button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;