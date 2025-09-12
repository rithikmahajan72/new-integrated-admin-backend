import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  console.log('ProtectedRoute - Auth state:', { isAuthenticated, user: user?.isAdmin ? 'admin' : 'not admin' });
  
  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    console.log('ProtectedRoute - Not authenticated, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  // If authenticated but not admin, redirect to auth page with error
  if (!user?.isAdmin) {
    console.log('ProtectedRoute - Not admin, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }
  
  console.log('ProtectedRoute - Authenticated admin, rendering children');
  // If authenticated and admin, render the protected component
  return children;
};

export default ProtectedRoute;
