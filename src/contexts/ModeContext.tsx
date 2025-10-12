import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type AppMode = 'student' | 'work';

interface ModeContextType {
  mode: AppMode;
  toggleMode: () => void;
  setMode: (mode: AppMode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AppMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('app-mode') as AppMode) || 'work';
    }
    return 'work';
  });

  useEffect(() => {
    localStorage.setItem('app-mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode(prevMode => prevMode === 'work' ? 'student' : 'work');
  };

  return (
    <ModeContext.Provider value={{ mode, toggleMode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error('useMode must be used within a ModeProvider');
  }
  return context;
}
