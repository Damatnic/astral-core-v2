/**
 * Helper function to set up production environment for ApiClient tests
 * Ensures tests don't inadvertently trigger demo mode
 */
export function setupProductionEnvironment() {
  process.env.NODE_ENV = 'production';
  process.env.VITE_API_URL = '/.netlify/functions';  // Ensure API URL is defined
  process.env.VITE_USE_DEMO_DATA = undefined;
  
  Object.defineProperty(global, 'location', {
    value: { 
      hostname: 'example.com', 
      port: '443', 
      origin: 'https://example.com',
      host: 'example.com',
      protocol: 'https:',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true,
    configurable: true,
  });
  
  jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
  jest.spyOn(sessionStorage, 'getItem').mockReturnValue(null);
  
  // Reset the netlifyFunctionsAvailable flag
  (global as any).netlifyFunctionsAvailable = null;
}

export function setupDevelopmentEnvironment() {
  process.env.NODE_ENV = 'development';
  process.env.VITE_API_URL = '/.netlify/functions';  // Ensure API URL is defined
  process.env.VITE_USE_DEMO_DATA = undefined;
  
  Object.defineProperty(global, 'location', {
    value: { 
      hostname: 'localhost', 
      port: '3000', 
      origin: 'http://localhost:3000',
      host: 'localhost:3000',
      protocol: 'http:',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true,
    configurable: true,
  });
  
  jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
  jest.spyOn(sessionStorage, 'getItem').mockReturnValue(null);
  
  // Reset the netlifyFunctionsAvailable flag
  (global as any).netlifyFunctionsAvailable = null;
}

export function setupNetlifyDevEnvironment() {
  process.env.NODE_ENV = 'development';
  process.env.VITE_API_URL = '/.netlify/functions';  // Ensure API URL is defined
  process.env.VITE_USE_DEMO_DATA = undefined;
  
  Object.defineProperty(global, 'location', {
    value: { 
      hostname: 'localhost', 
      port: '8888',  // Netlify Dev port
      origin: 'http://localhost:8888',
      host: 'localhost:8888',
      protocol: 'http:',
      pathname: '/',
      search: '',
      hash: ''
    },
    writable: true,
    configurable: true,
  });
  
  jest.spyOn(localStorage, 'getItem').mockReturnValue(null);
  jest.spyOn(sessionStorage, 'getItem').mockReturnValue(null);
  
  // Reset the netlifyFunctionsAvailable flag
  (global as any).netlifyFunctionsAvailable = null;
}