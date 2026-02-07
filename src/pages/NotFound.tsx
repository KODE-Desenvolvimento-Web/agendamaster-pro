import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="text-center animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary mx-auto mb-6 shadow-glow">
          <Calendar className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-8xl font-bold text-gradient mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
