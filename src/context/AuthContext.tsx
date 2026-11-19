import { createContext, useContext, useState, ReactNode } from 'react';

// تعريف شكل بيانات المستخدم
interface User {
  id: number
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loginUser: (userData: User) => void;
  logoutUser: () => void;
}

// إنشاء المخزن (Context)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // هنا بنخزن بيانات المستخدم. في البداية بنحاول نقرأها من الـ localStorage
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const loginUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('userData', JSON.stringify(userData)); // بنحفظها عشان ما تضيع عند الريفريش
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// خطاف (Hook) عشان نستخدم هالمخزن بسهولة في أي مكان
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}