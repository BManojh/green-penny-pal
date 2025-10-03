import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Plus,
  BarChart3,
  Trophy,
  Users,
  Lightbulb,
  Settings,
  Bell,
  User,
  LogOut,
  Menu,
  Leaf,
  Target,
  TrendingUp,
  Share2,
  Globe,
  Zap,
  Calendar,
  Crown,
  Flame,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: any;
  onSignOut: () => void;
  notifications?: number;
}

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
    description: "Your eco-journey overview"
  },
  {
    title: "Track Activities",
    href: "/track",
    icon: Plus,
    description: "Log your eco-friendly activities"
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Deep dive into your impact data",
    submenu: [
      { title: "Overview", href: "/analytics", icon: TrendingUp },
      { title: "Trends", href: "/analytics/trends", icon: BarChart3 },
      { title: "Predictions", href: "/analytics/predictions", icon: Target },
      { title: "Comparisons", href: "/analytics/compare", icon: Globe }
    ]
  },
  {
    title: "Progress",
    href: "/progress",
    icon: Trophy,
    description: "Achievements, levels, and streaks",
    submenu: [
      { title: "Achievements", href: "/progress/achievements", icon: Trophy },
      { title: "Levels", href: "/progress/levels", icon: Crown },
      { title: "Streaks", href: "/progress/streaks", icon: Flame },
      { title: "Challenges", href: "/progress/challenges", icon: Target }
    ]
  },
  {
    title: "Community",
    href: "/community",
    icon: Users,
    description: "Connect with eco-warriors worldwide",
    submenu: [
      { title: "Leaderboard", href: "/community/leaderboard", icon: Trophy },
      { title: "Challenges", href: "/community/challenges", icon: Target },
      { title: "Social Feed", href: "/community/feed", icon: Share2 },
      { title: "Global Impact", href: "/community/impact", icon: Globe }
    ]
  },
  {
    title: "AI Insights",
    href: "/insights",
    icon: Lightbulb,
    description: "Personalized eco-suggestions"
  },
  {
    title: "Finance Manager",
    href: "/finance",
    icon: Wallet,
    description: "Manage your money and eco-savings"
  }
];

export const Navbar = ({ user, onSignOut, notifications = 0 }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const NavigationItem = ({ item, mobile = false }: { item: any; mobile?: boolean }) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = isActivePath(item.href);

    if (mobile) {
      return (
        <div className="space-y-2">
          <Link
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
            onClick={() => setMobileMenuOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </Link>
          {hasSubmenu && (
            <div className="pl-6 space-y-1">
              {item.submenu.map((subItem: any) => (
                <Link
                  key={subItem.href}
                  to={subItem.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-colors",
                    isActivePath(subItem.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <subItem.icon className="h-3 w-3" />
                  {subItem.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (hasSubmenu) {
      return (
        <NavigationMenuItem>
          <NavigationMenuTrigger className={cn(
            isActive && "bg-accent text-accent-foreground"
          )}>
            <item.icon className="h-4 w-4 mr-2" />
            {item.title}
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="grid gap-3 p-6 w-[400px]">
              <div className="row-span-3">
                <NavigationMenuLink asChild>
                  <Link
                    to={item.href}
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                  >
                    <item.icon className="h-6 w-6" />
                    <div className="mb-2 mt-4 text-lg font-medium">
                      {item.title}
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      {item.description}
                    </p>
                  </Link>
                </NavigationMenuLink>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.submenu.map((subItem: any) => (
                  <NavigationMenuLink key={subItem.href} asChild>
                    <Link
                      to={subItem.href}
                      className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        isActivePath(subItem.href) && "bg-primary text-primary-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <subItem.icon className="h-4 w-4" />
                        <div className="text-sm font-medium">{subItem.title}</div>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      );
    }

    return (
      <NavigationMenuItem>
        <NavigationMenuLink asChild>
          <Link
            to={item.href}
            className={cn(
              "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
              isActive && "bg-accent text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 mr-2" />
            {item.title}
          </Link>
        </NavigationMenuLink>
      </NavigationMenuItem>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="hidden sm:inline-block font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Green Penny Pal
          </span>
          <span className="sm:hidden font-bold text-lg">GPP</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationItem key={item.href} item={item} />
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {notifications > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {notifications > 99 ? "99+" : notifications}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url} alt={user?.full_name} />
                  <AvatarFallback>
                    {user?.full_name?.charAt(0) || user?.email?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Zap className="mr-2 h-4 w-4" />
                    <span>Quick Actions</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => navigate("/track")}>
                        <Plus className="mr-2 h-4 w-4" />
                        <span>Log Activity</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/insights")}>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        <span>Get Suggestions</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate("/community/challenges")}>
                        <Target className="mr-2 h-4 w-4" />
                        <span>Join Challenge</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuGroup>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="flex flex-col h-full">
                {/* Mobile Header */}
                <div className="flex items-center justify-between py-4 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-6 h-6 rounded bg-primary">
                      <Leaf className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-bold">Green Penny Pal</span>
                  </div>
                </div>

                {/* Mobile User Info */}
                <div className="py-4 border-b">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback>
                        {user?.full_name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {user?.full_name || "User"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Mobile Navigation */}
                <nav className="flex-1 py-4 space-y-2">
                  {navigationItems.map((item) => (
                    <NavigationItem key={item.href} item={item} mobile />
                  ))}
                </nav>

                {/* Mobile Footer */}
                <div className="border-t pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/settings");
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={() => {
                      onSignOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};