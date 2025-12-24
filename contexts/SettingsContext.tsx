import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type LlmProvider = 'gemini' | 'ollama';

interface SettingsContextType {
  llmProvider: LlmProvider;
  setLlmProvider: (provider: LlmProvider) => void;
  ollamaBaseUrl: string;
  setOllamaBaseUrl: (url: string) => void;
  ollamaModel: string;
  setOllamaModel: (model: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Helper to get from localStorage
const getInitialState = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [llmProvider, setLlmProvider] = useState<LlmProvider>(() => getInitialState('llmProvider', 'gemini'));
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState<string>(() => getInitialState('ollamaBaseUrl', 'http://127.0.0.1:11434'));
  const [ollamaModel, setOllamaModel] = useState<string>(() => getInitialState('ollamaModel', 'llama3'));

  useEffect(() => {
    try {
      localStorage.setItem('llmProvider', JSON.stringify(llmProvider));
    } catch (error) {
      console.warn('Failed to save llmProvider to localStorage:', error);
    }
  }, [llmProvider]);

  useEffect(() => {
    try {
      localStorage.setItem('ollamaBaseUrl', JSON.stringify(ollamaBaseUrl));
    } catch (error) {
      console.warn('Failed to save ollamaBaseUrl to localStorage:', error);
    }
  }, [ollamaBaseUrl]);

  useEffect(() => {
    try {
      localStorage.setItem('ollamaModel', JSON.stringify(ollamaModel));
    } catch (error) {
      console.warn('Failed to save ollamaModel to localStorage:', error);
    }
  }, [ollamaModel]);


  return (
    <SettingsContext.Provider value={{ 
      llmProvider, 
      setLlmProvider,
      ollamaBaseUrl,
      setOllamaBaseUrl,
      ollamaModel,
      setOllamaModel
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
