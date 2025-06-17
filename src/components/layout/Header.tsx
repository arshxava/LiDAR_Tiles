"use client";

import Link from 'next/link';
import { MountainSnow } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Header() {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  if (loading) {
    return (
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MountainSnow className="h-8 w-8" />
            <h1 className="text-2xl font-headline font-semibold">LiDAR Explorer</h1>
          </div>
          <div className="h-8 w-20 bg-primary-foreground/20 animate-pulse rounded"></div>
        </div>
      </header>
    );
  }
  
  // Don't render header on login/register pages
  if (!user && (pathname === '/login' || pathname === '/register')) {
    return null;
  }


  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
          <MountainSnow className="h-8 w-8" />
          <h1 className="text-2xl font-headline font-semibold">LiDAR Explorer</h1>
        </Link>
        <nav className="flex items-center space-x-4">
          {user && (
            <>
              {user.role === 'SUPER_ADMIN' && (
                <Link href="/admin" className={`hover:text-accent-foreground/80 transition-colors ${pathname === '/admin' ? 'font-bold underline' : ''}`}>
                  Admin Dashboard
                </Link>
              )}
              <Link href="/dashboard" className={`hover:text-accent-foreground/80 transition-colors ${pathname === '/dashboard' ? 'font-bold underline' : ''}`}>
                User Dashboard
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.name)}`} alt={user.name || user.email} data-ai-hint="profile avatar" />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email} ({user.role})
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!user && pathname !== '/login' && pathname !== '/register' && (
            <>
              <Button asChild variant="secondary" className="text-primary hover:bg-secondary/90">
                <Link href="/login">Login</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
