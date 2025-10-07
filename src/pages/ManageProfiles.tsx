import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle2, XCircle, Trash2, Shield, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { logAdminAction, LOG_ACTIONS } from '@/lib/systemLogs';

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

export default function ManageProfiles() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteProfile, setDeleteProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin');
      return;
    }

    if (currentUser && isAdmin) {
      fetchProfiles();
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    // Filter profiles based on search and tab
    let filtered = profiles;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case 'verified':
        filtered = filtered.filter(p => p.verified);
        break;
      case 'unverified':
        filtered = filtered.filter(p => !p.verified);
        break;
      case 'recent':
        filtered = filtered.slice(0, 20); // Show 20 most recent
        break;
    }

    setFilteredProfiles(filtered);
  }, [searchTerm, profiles, activeTab]);

  const fetchProfiles = async () => {
    try {
      const profilesSnapshot = await getDocs(
        query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
      );
      
      const profilesData = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Profile));

      setProfiles(profilesData);
      setFilteredProfiles(profilesData);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Failed to load profiles');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyProfile = async (profileId: string, currentVerified: boolean, profileName: string) => {
    if (!currentUser) return;

    try {
      const profileRef = doc(db, 'profiles', profileId);
      await updateDoc(profileRef, {
        verified: !currentVerified,
        verifiedBy: !currentVerified ? currentUser.uid : null,
      });

      // Log the action
      await logAdminAction(
        !currentVerified ? LOG_ACTIONS.PROFILE_VERIFIED : LOG_ACTIONS.PROFILE_UNVERIFIED,
        'profile',
        currentUser.uid,
        currentUser.email || 'admin',
        profileId,
        profileName
      );

      setProfiles(profiles.map(p => 
        p.id === profileId 
          ? { ...p, verified: !currentVerified, verifiedBy: !currentVerified ? currentUser.uid : undefined }
          : p
      ));

      toast.success(!currentVerified ? 'Profile verified successfully' : 'Profile verification removed');
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Failed to update verification status');
    }
  };

  const handleDeleteProfile = async () => {
    if (!deleteProfile || !currentUser) return;

    try {
      // Delete ratings for this profile
      const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
      const deleteRatingsPromises = ratingsSnapshot.docs
        .filter(doc => doc.data().profileId === deleteProfile.id)
        .map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deleteRatingsPromises);

      // Delete reviews for this profile
      const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
      const deleteReviewsPromises = reviewsSnapshot.docs
        .filter(doc => doc.data().profileId === deleteProfile.id)
        .map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deleteReviewsPromises);

      // Delete profile
      await deleteDoc(doc(db, 'profiles', deleteProfile.id));

      // Log the action
      await logAdminAction(
        LOG_ACTIONS.PROFILE_DELETED,
        'profile',
        currentUser.uid,
        currentUser.email || 'admin',
        deleteProfile.id,
        deleteProfile.name
      );

      setProfiles(profiles.filter(p => p.id !== deleteProfile.id));
      toast.success('Profile deleted successfully');
    } catch (error) {
      console.error('Error deleting profile:', error);
      toast.error('Failed to delete profile');
    } finally {
      setDeleteProfile(null);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading profiles...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground">Manage Profiles</h1>
          <p className="text-muted-foreground mt-2">
            Verify profiles and manage platform content
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {profiles.filter(p => p.verified).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Unverified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {profiles.filter(p => !p.verified).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profiles.length > 0
                  ? (profiles.reduce((sum, p) => sum + p.rating, 0) / profiles.length).toFixed(2)
                  : '0.00'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profiles Table with Tabs */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Profiles</CardTitle>
                <CardDescription>Verify and manage profiles</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search profiles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unverified">Unverified</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="recent">Recent</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Profile</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProfiles.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No profiles found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProfiles.map((profile) => (
                          <TableRow key={profile.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={profile.logoUrl}
                                  alt={profile.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div>
                                  <div className="font-medium">{profile.name}</div>
                                  {profile.verified && (
                                    <div className="flex items-center gap-1 text-xs text-blue-500">
                                      <Shield className="w-3 h-3" />
                                      Verified
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{profile.sector}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span>{profile.rating.toFixed(1)}</span>
                                <span className="text-xs text-muted-foreground">
                                  ({profile.ratingCount})
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {profile.verified ? (
                                <Badge variant="default" className="bg-green-500">Verified</Badge>
                              ) : (
                                <Badge variant="secondary">Unverified</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                size="sm"
                                variant={profile.verified ? "outline" : "default"}
                                onClick={() => handleVerifyProfile(profile.id, !!profile.verified, profile.name)}
                              >
                                {profile.verified ? (
                                  <>
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Unverify
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Verify
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => setDeleteProfile(profile)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteProfile} onOpenChange={() => setDeleteProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Profile</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteProfile?.name}</strong>? 
              This will also delete all associated ratings and reviews. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProfile} className="bg-destructive text-destructive-foreground">
              Delete Profile
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
