"use client";

import { createContext, useContext, ReactNode } from "react";
import { usePublicProfile } from "@/hooks/usePublicProfile";

interface AdminProfileContextType {
  adminProfile: any;
  loading: boolean;
  error: string | null;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, loading, error } = usePublicProfile();

  return (
    <AdminProfileContext.Provider value={{ adminProfile: profile, loading, error }}>
      {children}
    </AdminProfileContext.Provider>
  );
}

export function useAdminProfile() {
  const context = useContext(AdminProfileContext);
  if (context === undefined) {
    throw new Error("useAdminProfile must be used within an AdminProfileProvider");
  }
  return context.adminProfile;
}

export function useAdminProfileContext() {
  const context = useContext(AdminProfileContext);
  if (context === undefined) {
    throw new Error("useAdminProfileContext must be used within an AdminProfileProvider");
  }
  return context;
}
