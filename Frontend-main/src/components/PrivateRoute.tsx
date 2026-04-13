// src/components/PrivateRoute.tsx
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { RootState } from '../store';

interface PrivateRouteProps {
  children: ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;