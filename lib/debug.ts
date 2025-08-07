// Debug utilities for network requests

export function setupNetworkDebugging() {
  if (typeof window === 'undefined') return;

  // Intercept fetch to log all network requests
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options] = args;
    
    console.group(`🌐 Network Request: ${typeof url === 'string' ? url : url.toString()}`);
    console.log('Method:', options?.method || 'GET');
    console.log('Headers:', options?.headers);
    console.log('Body:', options?.body);
    console.groupEnd();

    try {
      const response = await originalFetch(...args);
      
      console.group(`✅ Network Response: ${typeof url === 'string' ? url : url.toString()}`);
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      try {
        const body = await clonedResponse.text();
        const parsed = body ? JSON.parse(body) : null;
        console.log('Body:', parsed);
      } catch (e) {
        console.log('Body: (unable to parse)');
      }
      console.groupEnd();
      
      return response;
    } catch (error) {
      console.group(`❌ Network Error: ${typeof url === 'string' ? url : url.toString()}`);
      console.error('Error:', error);
      console.groupEnd();
      throw error;
    }
  };

  console.log('🔍 Network debugging enabled');
}

// Check current environment and capabilities
export function checkEnvironment() {
  console.group('🔧 Environment Check');
  console.log('URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Protocol:', window.location.protocol);
  console.log('User Agent:', navigator.userAgent);
  console.log('Cookies Enabled:', navigator.cookieEnabled);
  console.log('Online:', navigator.onLine);
  
  // Check if we're on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  console.log('GitHub Pages:', isGitHubPages);
  
  // Check localStorage access
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('localStorage:', 'Available');
  } catch (e) {
    console.log('localStorage:', 'Blocked');
  }
  
  console.groupEnd();
}