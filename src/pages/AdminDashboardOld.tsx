import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Star, TrendingUp, MessageSquare, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
  id: string;
  name: string;
  sector: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
  createdBy: string;
  createdAt: any;
  verified?: boolean;
  verifiedBy?: string;
}

interface Stats {
  totalProfiles: number;
  totalRatings: number;
  averageRating: number;
  totalUsers: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalProfiles: 0,
    totalRatings: 0,
    averageRating: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

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
      const profilesRef = collection(db, 'profiles');
      const profilesQuery = query(profilesRef, orderBy('createdAt', 'desc'));
      const profilesSnapshot = await getDocs(profilesQuery);
      
      const profilesData = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Profile));
      
      setProfiles(profilesData);

      // Calculate stats
      const totalRatings = profilesData.reduce((sum, p) => sum + (p.ratingCount || 0), 0);
      const totalRatingValue = profilesData.reduce((sum, p) => sum + (p.rating * p.ratingCount || 0), 0);
      const avgRating = totalRatings > 0 ? totalRatingValue / totalRatings : 0;

      // Get unique users count
      const uniqueUsers = new Set(profilesData.map(p => p.createdBy));

      setStats({
        totalProfiles: profilesData.length,
        totalRatings,
        averageRating: parseFloat(avgRating.toFixed(2)),
        totalUsers: uniqueUsers.size,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfile = async (profileId: string, currentVerified: boolean) => {
    try {
      const profileRef = doc(db, 'profiles', profileId);
      await updateDoc(profileRef, {
        verified: !currentVerified,
        verifiedBy: !currentVerified ? user?.uid : null,
      });

      // Update local state
      setProfiles(profiles.map(p => 
        p.id === profileId 
          ? { ...p, verified: !currentVerified, verifiedBy: !currentVerified ? user?.uid : undefined }
          : p
      ));

      toast.success(!currentVerified ? 'Profile verified successfully' : 'Profile verification removed');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteId) return;

    try {
      // Delete ratings for this profile
      const ratingsRef = collection(db, 'ratings');
      const ratingsQuery = query(ratingsRef);
      const ratingsSnapshot = await getDocs(ratingsQuery);
      
      const deletePromises = ratingsSnapshot.docs
        .filter(doc => doc.data().profileId === deleteId)
        .map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletePromises);

      // Delete profile
      await deleteDoc(doc(db, 'profiles', deleteId));

      setProfiles(profiles.filter(p => p.id !== deleteId));
      toast.success('Profile deleted successfully');
      
      // Refresh stats
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    } finally {
      setDeleteId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto max-w-7xl px-4 pt-24 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-12">
        <div className="space-y-8 animate-fade-in">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Manage and monitor all platform activities
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProfiles}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRatings}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>
          </div>

          {/* Profiles Management */}
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">All Profiles</TabsTrigger>
              <TabsTrigger value="unverified">Unverified</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Profiles</CardTitle>
                  <CardDescription>
                    View and manage all profiles on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profiles.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No profiles found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profiles.map((profile) => (
                        <div key={profile.id} className="relative group">
                          <ProfileCard {...profile} />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant={profile.verified ? "outline" : "default"}
                              className={profile.verified ? "bg-background" : "bg-blue-500 hover:bg-blue-600"}
                              onClick={() => handleVerifyProfile(profile.id, profile.verified || false)}
                            >
                              {profile.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="unverified" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Unverified Profiles</CardTitle>
                  <CardDescription>
                    Profiles awaiting verification approval
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profiles.filter(p => !p.verified).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No unverified profiles</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profiles.filter(p => !p.verified).map((profile) => (
                        <div key={profile.id} className="relative group">
                          <ProfileCard {...profile} />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="default"
                              className="bg-blue-500 hover:bg-blue-600"
                              onClick={() => handleVerifyProfile(profile.id, false)}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="verified" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Verified Profiles</CardTitle>
                  <CardDescription>
                    Profiles that have been verified by admin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profiles.filter(p => p.verified).length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No verified profiles yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {profiles.filter(p => p.verified).map((profile) => (
                        <div key={profile.id} className="relative group">
                          <ProfileCard {...profile} />
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-background"
                              onClick={() => handleVerifyProfile(profile.id, true)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteId(profile.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Profiles</CardTitle>
                  <CardDescription>
                    Recently created profiles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {profiles.slice(0, 6).map((profile) => (
                      <div key={profile.id} className="relative group">
                        <ProfileCard {...profile} />
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant={profile.verified ? "outline" : "default"}
                            className={profile.verified ? "bg-background" : "bg-blue-500 hover:bg-blue-600"}
                            onClick={() => handleVerifyProfile(profile.id, profile.verified || false)}
                          >
                            {profile.verified ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteId(profile.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the profile
              and all associated ratings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
