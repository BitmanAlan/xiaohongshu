import React, { useState, useEffect } from 'react';
import { ProductInputStep } from './components/ProductInputStep';
import { TypeSelectionStep } from './components/TypeSelectionStep';
import { StyleSelectionStep } from './components/StyleSelectionStep';
import { ConfirmationStep } from './components/ConfirmationStep';
import { GeneratedResults } from './components/GeneratedResults';
import { FeedbackPage } from './components/FeedbackPage';
import { CompliancePage } from './components/CompliancePage';
import { CopywritingLibrary } from './components/CopywritingLibrary';
import { StyleTraining } from './components/StyleTraining';
import { ProfilePage } from './components/ProfilePage';
import { WelcomePage } from './components/WelcomePage';
import { Navigation } from './components/Navigation';
import { AuthModal } from './components/AuthModal';
import { supabase } from './utils/supabase/client';
import { apiClient } from './utils/api';

export type ContentType = 'single' | 'collection' | 'review' | 'comparison';
export type TargetAudience = 'gen-z' | 'sensitive-skin' | 'office-worker' | 'student';
export type WritingStyle = 'emotional' | 'professional' | 'casual' | 'scientific';

export interface AppState {
  currentStep: string;
  productName: string;
  selectedTags: string[];
  contentType: ContentType | null;
  targetAudience: TargetAudience | null;
  writingStyle: WritingStyle | null;
  generatedContent: any[];
  user: any | null;
  accessToken: string | null;
  showAuthModal: boolean;
  currentGenerationId: string | null;
}

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    currentStep: 'welcome',
    productName: '',
    selectedTags: [],
    contentType: null,
    targetAudience: null,
    writingStyle: null,
    generatedContent: [],
    user: null,
    accessToken: null,
    showAuthModal: false,
    currentGenerationId: null
  });

  // Check for existing session on app load and listen for auth changes
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Test server connection first
        console.log('Testing server connection...');
        const serverTest = await apiClient.testConnection();
        console.log('Server connection test result:', serverTest);
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Initial session check:', { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          hasToken: !!session?.access_token,
          error: error?.message 
        });
        
        if (error) {
          console.error('Session check error:', error);
          return;
        }
        
        if (session?.access_token && session?.user) {
          // Validate the session is still active
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (userError || !user) {
            console.log('Session invalid, clearing auth state:', userError?.message);
            await supabase.auth.signOut();
            apiClient.setAccessToken(null);
            return;
          }
          
          console.log('Valid session found for user:', user.email);
          apiClient.setAccessToken(session.access_token);
          setAppState(prev => ({
            ...prev,
            user: session.user,
            accessToken: session.access_token,
            // If user is logged in and on welcome page, go to main page
            currentStep: prev.currentStep === 'welcome' ? 'product-input' : prev.currentStep
          }));
        }
      } catch (error) {
        console.error('Session initialization error:', error);
        // If server test fails, it might be a connection issue
        if (error.message?.includes('fetch')) {
          console.error('Server connection failed - check if the server is running');
        }
      }
    };
    
    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log('User signed out or session ended');
        apiClient.setAccessToken(null);
        setAppState(prev => ({
          ...prev,
          user: null,
          accessToken: null,
          currentStep: 'welcome'
        }));
        return;
      }
      
      if (session?.access_token && session?.user) {
        console.log('New valid session for user:', session.user.email);
        apiClient.setAccessToken(session.access_token);
        setAppState(prev => ({
          ...prev,
          user: session.user,
          accessToken: session.access_token,
          // If user just signed in and on welcome page, go to main page
          currentStep: prev.currentStep === 'welcome' ? 'product-input' : prev.currentStep
        }));
      }
    });

    // Listen for auth errors from API client
    const handleAuthError = (event: CustomEvent) => {
      console.log('Auth error event received:', event.detail);
      setAppState(prev => ({ ...prev, showAuthModal: true }));
    };
    
    window.addEventListener('auth_error', handleAuthError as EventListener);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('auth_error', handleAuthError as EventListener);
    };
  }, []);

  const updateAppState = (updates: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...updates }));
  };

  const handleAuthSuccess = (user: any, accessToken: string) => {
    console.log('Auth success - User:', user?.email, 'Token:', accessToken?.substring(0, 20) + '...');
    apiClient.setAccessToken(accessToken);
    setAppState(prev => ({
      ...prev,
      user,
      accessToken,
      showAuthModal: false,
      // After successful auth, navigate to main page
      currentStep: prev.currentStep === 'welcome' ? 'product-input' : prev.currentStep
    }));
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    apiClient.setAccessToken(null);
    setAppState(prev => ({
      ...prev,
      user: null,
      accessToken: null,
      currentStep: 'welcome'
    }));
  };

  const requireAuth = () => {
    if (!appState.user) {
      setAppState(prev => ({ ...prev, showAuthModal: true }));
      return false;
    }
    return true;
  };

  const renderCurrentStep = () => {
    switch (appState.currentStep) {
      case 'welcome':
        return <WelcomePage appState={appState} updateAppState={updateAppState} />;
      case 'product-input':
        return <ProductInputStep appState={appState} updateAppState={updateAppState} requireAuth={requireAuth} />;
      case 'type-selection':
        return <TypeSelectionStep appState={appState} updateAppState={updateAppState} />;
      case 'style-selection':
        return <StyleSelectionStep appState={appState} updateAppState={updateAppState} />;
      case 'confirmation':
        return <ConfirmationStep appState={appState} updateAppState={updateAppState} />;
      case 'results':
        return <GeneratedResults appState={appState} updateAppState={updateAppState} />;
      case 'feedback':
        return <FeedbackPage appState={appState} updateAppState={updateAppState} />;
      case 'compliance':
        return <CompliancePage appState={appState} updateAppState={updateAppState} />;
      case 'library':
        return <CopywritingLibrary appState={appState} updateAppState={updateAppState} requireAuth={requireAuth} />;
      case 'training':
        return <StyleTraining appState={appState} updateAppState={updateAppState} requireAuth={requireAuth} />;
      case 'profile':
        return <ProfilePage appState={appState} updateAppState={updateAppState} onLogout={handleSignOut} />;
      default:
        return <WelcomePage appState={appState} updateAppState={updateAppState} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl">
        {renderCurrentStep()}
        <Navigation 
          currentStep={appState.currentStep} 
          updateAppState={updateAppState}
          user={appState.user}
          onSignOut={handleSignOut}
        />
        <AuthModal
          isOpen={appState.showAuthModal}
          onClose={() => updateAppState({ showAuthModal: false })}
          onAuthSuccess={handleAuthSuccess}
        />
      </div>
    </div>
  );
}