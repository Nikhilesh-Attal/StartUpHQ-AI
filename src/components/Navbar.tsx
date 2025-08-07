"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { LogOut, UserCircle } from "lucide-react";
import { AppLogo } from "./app-logo";

export default function Navbar() {
  const { user, logoutUser } = useUser();

  return (
    <header className="w-full px-6 py-4 border-b shadow-sm bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-headline font-bold text-primary">
          <AppLogo/><span className="text-muted-foreground"></span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:underline">
                Dashboard
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logoutUser}
                className="flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium hover:underline">
                Login
              </Link>
              <Link href="/signup">
                <Button size="sm" className="text-sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
