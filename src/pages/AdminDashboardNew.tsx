import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, TrendingUp, MessageSquare, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalProfiles: number;
  totalRatings: number;
  totalReviews: number;
  averageRating: number;
  totalUsers: number;
  verifiedProfiles: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalProfiles: 0,
    totalRatings: 0,
    totalReviews: 0,
    averageRating: 0,
    totalUsers: 0,
    verifiedProfiles: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!authLoading && (!user || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    if (user && isAdmin) {
      fetchAdminData();
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchAdminData = async () => {
    try {
      // Fetch all profiles
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const profilesData = profilesSnapshot.docs.map(doc => doc.data());
      
      // Fetch all ratings
      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      
      // Fetch all reviews
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      
      // Fetch all users (if users collection exists)
      let totalUsers = 0;
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        totalUsers = usersSnapshot.size;
      } catch (error) {
        // Users collection might not exist yet
        // Count unique users from profiles
        const uniqueUsers = new Set(profilesData.map((p: any) => p.createdBy));
        totalUsers = uniqueUsers.size;
      }

      // Calculate stats
      const totalRatings = ratingsSnapshot.size;
      const totalRatingValue = profilesData.reduce((sum: number, p: any) => 
        sum + (p.rating * p.ratingCount || 0), 0
      );
      const avgRating = totalRatings > 0 ? totalRatingValue / totalRatings : 0;
      
      const verifiedCount = profilesData.filter((p: any) => p.verified).length;

      setStats({
        totalProfiles: profilesSnapshot.size,
        totalRatings,
        totalReviews: reviewsSnapshot.size,
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalUsers,
        verifiedProfiles: verifiedCount,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all platform activities
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Total Users */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform registered users
              </p>
            </CardContent>
          </Card>

          {/* Total Profiles */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
              <Shield className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalProfiles}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.verifiedProfiles} verified profiles
              </p>
            </CardContent>
          </Card>

          {/* Total Ratings */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
              <Star className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalRatings}</div>
              <p className="text-xs text-muted-foreground mt-1">
                User ratings submitted
              </p>
            </CardContent>
          </Card>

          {/* Total Reviews */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-5 w-5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Written reviews by users
              </p>
            </CardContent>
          </Card>

          {/* Average Rating */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <TrendingUp className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.averageRating}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Platform-wide average
              </p>
            </CardContent>
          </Card>

          {/* Activity Status */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Activity className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">Active</div>
              <p className="text-xs text-muted-foreground mt-1">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate('/admin/users')}
                className="p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Users className="w-6 h-6 text-blue-500 mb-2" />
                <h3 className="font-semibold text-foreground">Manage Users</h3>
                <p className="text-sm text-muted-foreground">
                  View, ban, or deactivate users
                </p>
              </button>

              <button
                onClick={() => navigate('/admin/ratings')}
                className="p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Star className="w-6 h-6 text-yellow-500 mb-2" />
                <h3 className="font-semibold text-foreground">Manage Ratings</h3>
                <p className="text-sm text-muted-foreground">
                  Delete spam or fake ratings
                </p>
              </button>

              <button
                onClick={() => navigate('/admin/profiles')}
                className="p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Shield className="w-6 h-6 text-green-500 mb-2" />
                <h3 className="font-semibold text-foreground">Verify Profiles</h3>
                <p className="text-sm text-muted-foreground">
                  Mark profiles as verified
                </p>
              </button>

              <button
                onClick={() => navigate('/admin/logs')}
                className="p-4 text-left rounded-lg border border-border hover:bg-muted transition-colors"
              >
                <Activity className="w-6 h-6 text-purple-500 mb-2" />
                <h3 className="font-semibold text-foreground">System Logs</h3>
                <p className="text-sm text-muted-foreground">
                  View all admin actions
                </p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
