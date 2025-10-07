import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Star, 
  Shield, 
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Manage Ratings', href: '/admin/ratings', icon: Star },
  { name: 'Manage Profiles', href: '/admin/profiles', icon: Shield },
  { name: 'System Logs', href: '/admin/logs', icon: FileText },
];

export default function AdminSidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const SidebarContent = () => (
    <>
      {/* Logo/Header */}
      <div className="px-6 py-8">
        <div className="flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">RateHere</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info & Sign Out */}
      <div className="p-4 border-t border-border">
        <div className="px-4 py-3 rounded-lg bg-muted">
          <p className="text-xs text-muted-foreground mb-1">Signed in as</p>
          <p className="text-sm font-medium text-foreground truncate">
            {user?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full mt-3 justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed top-0 left-0 bottom-0 z-40 w-72 bg-card border-r border-border flex flex-col transition-transform duration-300',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 w-72 bg-card border-r border-border flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
