import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'super_admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary mx-auto mb-4 animate-pulse-glow">
          <span className="text-primary-foreground font-bold text-xl">A</span>
        </div>
        <h1 className="text-2xl font-bold">AgendaMaster Pro</h1>
        <p className="text-muted-foreground mt-2">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
