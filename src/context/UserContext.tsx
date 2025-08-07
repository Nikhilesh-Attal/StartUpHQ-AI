"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, logout } from "@/lib/auth";
import { ensureUserDocument } from "@/lib/db";
import type { Models } from "appwrite";

type User = Models.User<Models.Preferences> | null;

type UserContextType = {
  user: User;
  startupId: string | null;
  loading: boolean;
  logoutUser: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  user: null,
  startupId: null,
  loading: true,
  logoutUser: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [startupId, setStartupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        await new Promise((res) => setTimeout(res, 200)); // wait for session cookie
        const currentUser = await getCurrentUser();
        console.log("✅ Loaded user:", currentUser);

        const userDoc = await ensureUserDocument(
          currentUser.$id,
          currentUser.name,
          currentUser.email
        );
        console.log("✅ User document ensured:", userDoc);

        setUser(currentUser);
        setStartupId(userDoc.startupId); // ✅ set startupId from DB
      } catch (err) {
        console.warn("⚠️ Failed to load user:", err);
        setUser(null);
        setStartupId(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logoutUser = async () => {
    await logout();
    setUser(null);
    setStartupId(null);
    window.location.href = "/login";
  };

  return (
    <UserContext.Provider value={{ user, startupId, loading, logoutUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
