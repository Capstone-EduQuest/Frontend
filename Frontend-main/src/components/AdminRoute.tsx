import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { RootState } from '../store';

interface AdminRouteProps {
  children: ReactNode;
}

const AdminRoute = ({ children }: AdminRouteProps) => {
  const auth = useSelector((state: RootState) => state.auth);
  const isAdmin = auth.isLoggedIn && (auth.user?.role === 'admin' || auth.user?.role === 'admine');

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
