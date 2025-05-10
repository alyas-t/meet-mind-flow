
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Mic, Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink
} from '@/components/ui/navigation-menu';

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 w-full py-4 border-b bg-white/90 backdrop-blur-md z-10 shadow-sm">
      <div className="container flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center group">
            <div className="bg-app-blue rounded-full p-2 mr-2 group-hover:bg-app-dark-blue transition-colors">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-app-blue group-hover:text-app-dark-blue transition-colors">
              MeetingScribe
            </span>
          </Link>
        </div>
        
        {isMobile ? (
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
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
        )}
      </div>
    </header>
  );
};

export default Header;
