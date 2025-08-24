import React, { createContext, useContext, useState, ReactNode } from 'react';'
interface SessionContextType {
  session: any
  setSession: (session: any) => void
  };
const SessionContext = createContext<SessionContextType | undefined>(undefined);
export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => { const [session, setSession] = useState<any>(null };

  return (
    <SessionContext.Provider value={{ session, setSession  }>
      {children}
    </SessionContext.Provider>
  );
  };
export const useSession = () => { ;
const context = useContext(SessionContext  );
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider') }'
  return context;
  };