
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Menu, LogOut } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Header = () => {
  const isMobile = useIsMobile();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    
    const name = user.user_metadata?.name || user.email || '';
    if (!name) return '?';
    
    if (name.includes('@')) {
      // It's an email address
      return name.substring(0, 2).toUpperCase();
    }
    
    // It's a name
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length === 1) {
      return nameParts[0].substring(0, 2).toUpperCase();
    }
    
    return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 w-full py-4 border-b bg-white/90 backdrop-blur-md z-10 shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center group">
            <div className="bg-app-blue rounded-full p-2 mr-2 group-hover:bg-app-dark-blue transition-colors">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-app-blue group-hover:text-app-dark-blue transition-colors">
              MeetingScribe
            </span>
          </Link>
        </div>
        
        {user ? (
          isMobile ? (
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          ) : (
            <div className="flex items-center gap-4">
              <NavigationMenu>
                <NavigationMenuList className="gap-2">
                  <NavigationMenuItem>
                    <Button variant="ghost" asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </Button>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <Button className="bg-app-blue hover:bg-app-dark-blue" asChild>
                      <Link to="/new-meeting">New Meeting</Link>
                    </Button>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        ) : (
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
