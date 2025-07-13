import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Set base URL for all axios requests
axios.defaults.baseURL = 'http://localhost:8080';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (token && username) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser({ id: 0, username, email: '' });
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('Attempting login with:', { username });
      console.log('Request URL:', axios.defaults.baseURL + '/api/auth/public/login');
      
      const response = await axios.post('/api/auth/public/login', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        const token = response.data.token;
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser({ id: 0, username, email: '' });
        setIsAuthenticated(true);
        navigate('/dashboard');
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          }
        });
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          throw new Error('Invalid username or password. Please try again.');
        } else if (error.response?.status === 400) {
          throw new Error('Invalid request format');
        } else if (error.response?.status === 404) {
          throw new Error('Endpoint not found. Please check the server is running and the endpoint is correct.');
        } else if (error.response?.status === 500) {
          throw new Error('Server error: ' + (error.response.data?.message || 'Internal server error'));
        } else {
          throw new Error('Login failed: ' + (error.response?.data?.message || error.message));
        }
      }
      throw new Error('An unexpected error occurred during login.');
    }
  };

  const register = async (username: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with:', { username, email });
      console.log('Request URL:', axios.defaults.baseURL + '/api/auth/public/register');
      
      await axios.post('/api/auth/public/register', {
        username,
        email,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      // After successful registration, automatically log the user in
      await login(username, password);
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error)) {
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          }
        });
        if (error.response?.status === 400) {
          throw new Error('Invalid registration data');
        } else if (error.response?.status === 409) {
          throw new Error('Username or email already exists');
        } else {
          throw new Error('Server error occurred: ' + (error.response?.data?.message || error.message));
        }
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 