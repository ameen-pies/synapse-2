import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Avatar options matching ProfileSettings and EditProfile
const AVATAR_OPTIONS = [
  { id: "avatar-1", type: "boy", seed: "Felix" },
  { id: "avatar-2", type: "girl", seed: "Lily" },
  { id: "avatar-3", type: "boy", seed: "Oliver" },
  { id: "avatar-4", type: "girl", seed: "Emma" },
  { id: "avatar-5", type: "girl", seed: "Ava" },
  { id: "avatar-6", type: "boy", seed: "Noah" },
  { id: "avatar-7", type: "girl", seed: "Sophia" },
  { id: "avatar-8", type: "boy", seed: "Liam" },
  { id: "avatar-9", type: "boy", seed: "Ethan" },
  { id: "avatar-10", type: "girl", seed: "Isabella" },
  { id: "avatar-11", type: "boy", seed: "Lucas" },
  { id: "avatar-12", type: "girl", seed: "Mia" },
  { id: "avatar-13", type: "girl", seed: "Charlotte" },
  { id: "avatar-14", type: "boy", seed: "Mason" },
  { id: "avatar-15", type: "boy", seed: "James" },
  { id: "avatar-16", type: "girl", seed: "Amelia" },
  { id: "avatar-17", type: "girl", seed: "Harper" },
  { id: "avatar-18", type: "boy", seed: "Benjamin" },
  { id: "avatar-19", type: "boy", seed: "Alexander" },
  { id: "avatar-20", type: "girl", seed: "Evelyn" },
  { id: "avatar-21", type: "girl", seed: "Abigail" },
  { id: "avatar-22", type: "boy", seed: "Henry" },
  { id: "avatar-23", type: "boy", seed: "Sebastian" },
  { id: "avatar-24", type: "girl", seed: "Emily" }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userAvatar, setUserAvatar] = useState("initials");
  const [userName, setUserName] = useState("Utilisateur");

  // Get avatar URL helper function
  const getAvatarUrl = (avatarId: string) => {
    if (avatarId === 'initials') {
      return `https://avatar.iran.liara.run/username?username=${encodeURIComponent(userName)}`;
    }
    // Find the avatar by ID in our options
    const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
    if (avatar) {
      return `https://avatar.iran.liara.run/public/${avatar.type}?username=${avatar.seed}`;
    }
    // Fallback to general public avatar
    return `https://avatar.iran.liara.run/public`;
  };

  // Load user data from localStorage
  useEffect(() => {
    const storedAvatar = localStorage.getItem('userAvatar');
    const storedName = localStorage.getItem('userName');
    
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
    if (storedName) {
      setUserName(storedName);
    }

    // Listen for storage changes (when profile is updated)
    const handleStorageChange = () => {
      const newAvatar = localStorage.getItem('userAvatar');
      const newName = localStorage.getItem('userName');
      
      if (newAvatar) setUserAvatar(newAvatar);
      if (newName) setUserName(newName);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events from the same tab
    const handleProfileUpdate = () => {
      const newAvatar = localStorage.getItem('userAvatar');
      const newName = localStorage.getItem('userName');
      
      if (newAvatar) setUserAvatar(newAvatar);
      if (newName) setUserName(newName);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userAvatar');
    
    // Navigate to landing page
    navigate("/");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-6 bg-card border-b border-border backdrop-blur-sm bg-card/80">
            <SidebarTrigger className="text-foreground" />
            
            <div className="flex items-center gap-4">
              <Button size="icon" variant="ghost" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage src={getAvatarUrl(userAvatar)} key={userAvatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {userName?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {localStorage.getItem('userEmail') || 'email@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile-settings" className="cursor-pointer flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres du profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-destructive focus:text-destructive flex items-center"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}