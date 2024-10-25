export const BASE_URL = 'https://cyberjam-duncan-backend.railway.internal';

interface ApiOptions extends RequestInit {
  params?: Record<string, string>;
  responseType?: 'json' | 'blob' | 'text' | 'arrayBuffer';
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const api = {
  request: async <T>(endpoint: string, options: ApiOptions = {}): Promise<T> => {
    const { params, responseType = 'json', ...fetchOptions } = options;
    
    // Add /api prefix if we're going through nginx
    const isProxied = BASE_URL.includes('8443');
    const prefix = isProxied ? '/api' : '';
    
    // Build URL with query parameters
    const url = new URL(`${prefix}${endpoint}`, BASE_URL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url.toString(), {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      throw new ApiError(
        response.status,
        `API error: ${response.status} ${response.statusText}`
      );
    }

    return response[responseType]() as Promise<T>;
  },

  get: <T>(endpoint: string, options: ApiOptions = {}) => {
    return api.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post: <T>(endpoint: string, data: unknown, options: ApiOptions = {}) => {
    return api.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put: <T>(endpoint: string, data: unknown, options: ApiOptions = {}) => {
    return api.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: <T>(endpoint: string, options: ApiOptions = {}) => {
    return api.request<T>(endpoint, { ...options, method: 'DELETE' });
  },

  // Utility method for downloading files
  download: async (endpoint: string, filename?: string) => {
    const blob = await api.request<Blob>(endpoint, { 
      responseType: 'blob',
      headers: {
        'Accept': '*/*'  // Override default JSON accept header
      }
    });
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};