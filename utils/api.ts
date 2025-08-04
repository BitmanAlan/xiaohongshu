import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-7be2d7c8`;

class ApiClient {
  private accessToken: string | null = null;

  setAccessToken(token: string | null) {
    this.accessToken = token;
    console.log('API client access token updated:', token ? `${token.substring(0, 20)}...` : 'null');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    // Use access token if available, otherwise use public anon key
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
      console.log('API request with access token:', this.accessToken.substring(0, 20) + '...');
    } else {
      headers['Authorization'] = `Bearer ${publicAnonKey}`;
      console.log('API request with public anon key');
    }
    
    console.log('Making API request to:', `${API_BASE_URL}${endpoint}`);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        console.error(`API Error ${response.status} for ${endpoint}:`, errorData);
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          console.log('Authentication error detected, clearing access token');
          this.setAccessToken(null);
          
          // If this was an auth error and we had an access token, try to refresh the session
          if (this.accessToken) {
            console.log('Attempting to refresh session...');
            // This will trigger the auth state change listener in App.tsx
            const event = new CustomEvent('auth_error', { detail: errorData });
            window.dispatchEvent(event);
          }
          
          throw new Error(errorData.error || 'Authentication failed. Please sign in again.');
        }
        
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Auth
  async signup(email: string, password: string, name: string) {
    return this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  // Copywriting
  async generateCopywriting(data: {
    productName: string;
    selectedTags: string[];
    contentType: string;
    targetAudience: string;
    writingStyle: string;
  }) {
    return this.request('/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLibrary() {
    return this.request('/library');
  }

  async saveToLibrary(generationId: string, contentId: string) {
    return this.request('/library/save', {
      method: 'POST',
      body: JSON.stringify({ generation_id: generationId, content_id: contentId }),
    });
  }

  // Feedback
  async submitFeedback(data: {
    generation_id: string;
    satisfaction: string;
    tags: string[];
    comment: string;
  }) {
    return this.request('/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Style Training
  async analyzeStyle(trainingText: string, accountTag: string) {
    return this.request('/style/analyze', {
      method: 'POST',
      body: JSON.stringify({ training_text: trainingText, account_tag: accountTag }),
    });
  }

  async getStyleProfile() {
    return this.request('/style/profile');
  }

  // User Profile
  async getProfile() {
    return this.request('/profile');
  }

  async updateProfile(updates: any) {
    return this.request('/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }

  // Test endpoint
  async testConnection() {
    return this.request('/test', {
      method: 'POST',
      body: JSON.stringify({ test: 'connection', timestamp: new Date().toISOString() })
    });
  }
}

export const apiClient = new ApiClient();