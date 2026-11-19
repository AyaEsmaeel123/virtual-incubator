import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // الأدوار المسموح لها بالدخول
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  // 1. إذا ما في توكن أو ما في مستخدم، نطرده لصفحة الدخول
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. إذا كان في أدوار محددة للمسار، والمستخدم الحالي مو من ضمنها، نطرده لصفحة الخطأ
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />; // سننشئ هذه الصفحة لاحقاً أو نوجهه للوحة تحكمه
  }

  // 3. إذا اجتاز كل الشروط، نعرض الصفحة
  return <>{children}</>;
}