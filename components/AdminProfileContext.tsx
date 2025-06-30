"use client";

import { createContext, useContext, ReactNode } from "react";
import { AdminProfile } from "@/lib/admin-profile";

interface AdminProfileContextType {
  adminProfile: AdminProfile | null;
}

const AdminProfileContext = createContext<AdminProfileContextType | undefined>(undefined);

export function AdminProfileProvider({ 
  children, 
  adminProfile 
}: { 
  children: ReactNode;
  adminProfile: AdminProfile | null;
}) {
  return (
    <AdminProfileContext.Provider value={{ adminProfile }}>
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