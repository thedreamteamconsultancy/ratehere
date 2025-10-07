import { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:ml-72 min-h-screen">
        <div className="container mx-auto px-4 py-8 lg:px-8 lg:py-12 pt-20 lg:pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}
