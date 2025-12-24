
import { Instability } from '../types';
import { ATLAS_DATA } from '../components/constants';

// Define the endpoint. In a real app, this might be an environment variable.
const DATA_ENDPOINT = '/instabilities.json';
const LOCAL_STORAGE_KEY = 'polymath_generated_instabilities';

export const loadInstabilities = async (): Promise<Instability[]> => {
  try {
    // Attempt to fetch from the external endpoint
    const response = await fetch(DATA_ENDPOINT);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // specific validation could be added here
    if (Array.isArray(data)) {
      return data as Instability[];
    } else {
      throw new Error('Invalid data format: Expected an array.');
    }
  } catch (error) {
    console.warn('External data load failed, falling back to built-in Atlas data.', error);
    
    // Simulate network latency for the fallback to ensure consistent async behavior
    return new Promise<Instability[]>((resolve) => {
      setTimeout(() => {
        resolve(ATLAS_DATA);
      }, 800);
    });
  }
};

export const loadGeneratedInstabilities = (): Instability[] => {
    try {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
            return JSON.parse(stored) as Instability[];
        }
    } catch (error) {
        console.error("Error loading generated instabilities from local storage:", error);
    }
    return [];
};

export const saveGeneratedInstability = (instability: Instability): void => {
    try {
        const current = loadGeneratedInstabilities();
        // Check for duplicates based on ID just in case
        if (!current.some(i => i.id === instability.id)) {
             const updated = [instability, ...current];
             localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        }
    } catch (error) {
        console.error("Error saving generated instability to local storage:", error);
    }
};
