import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Trash2, Star, Search, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { logAdminAction, LOG_ACTIONS } from '@/lib/systemLogs';

interface Rating {
  id: string;
  profileId: string;
  profileName?: string;
  userId: string;
  userEmail?: string;
  ratingValue: number;
  createdAt: any;
}

export default function ManageRatings() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteRating, setDeleteRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin');
      return;
    }

    if (currentUser && isAdmin) {
      fetchRatings();
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = ratings.filter(r => 
        r.profileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.profileId.includes(searchTerm)
      );
      setFilteredRatings(filtered);
    } else {
      setFilteredRatings(ratings);
    }
  }, [searchTerm, ratings]);

  const fetchRatings = async () => {
    try {
      const ratingsSnapshot = await getDocs(
        query(collection(db, 'ratings'), orderBy('createdAt', 'desc'))
      );
      
      const ratingsData = await Promise.all(
        ratingsSnapshot.docs.map(async (ratingDoc) => {
          const data = ratingDoc.data();
          
          // Fetch profile name
          let profileName = 'Unknown Profile';
          try {
            const profileDoc = await getDoc(doc(db, 'profiles', data.profileId));
            if (profileDoc.exists()) {
              profileName = profileDoc.data().name;
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
          
          return {
            id: ratingDoc.id,
            profileId: data.profileId,
            profileName,
            userId: data.userId,
            userEmail: data.userEmail || 'unknown@example.com',
            ratingValue: data.ratingValue,
            createdAt: data.createdAt,
          } as Rating;
        })
      );

      setRatings(ratingsData);
      setFilteredRatings(ratingsData);
    } catch (error) {
      console.error('Error fetching ratings:', error);
      toast.error('Failed to load ratings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRating = async () => {
    if (!deleteRating || !currentUser) return;

    try {
      // Delete rating document
      await deleteDoc(doc(db, 'ratings', deleteRating.id));

      // Update profile rating stats
      const profileRef = doc(db, 'profiles', deleteRating.profileId);
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        const newRatingCount = (profileData.ratingCount || 1) - 1;
        const newTotalValue = (profileData.totalRatingValue || deleteRating.ratingValue) - deleteRating.ratingValue;
        const newRating = newRatingCount > 0 ? newTotalValue / newRatingCount : 0;

        await import('firebase/firestore').then(({ updateDoc }) => 
          updateDoc(profileRef, {
            ratingCount: Math.max(0, newRatingCount),
            totalRatingValue: Math.max(0, newTotalValue),
            rating: newRating,
          })
        );
      }

      // Log the action
      await logAdminAction(
        LOG_ACTIONS.RATING_DELETED,
        'rating',
        currentUser.uid,
        currentUser.email || 'admin',
        deleteRating.id,
        deleteRating.profileName,
        `Deleted ${deleteRating.ratingValue}-star rating`
      );

      setRatings(ratings.filter(r => r.id !== deleteRating.id));
      toast.success('Rating deleted successfully');
    } catch (error) {
      console.error('Error deleting rating:', error);
      toast.error('Failed to delete rating');
    } finally {
      setDeleteRating(null);
    }
  };

  const getRatingStars = (value: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading ratings...</p>
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
          <h1 className="text-4xl font-bold text-foreground">Manage Ratings</h1>
          <p className="text-muted-foreground mt-2">
            View and delete fake or spam ratings
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ratings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {ratings.length > 0 
                  ? (ratings.reduce((sum, r) => sum + r.ratingValue, 0) / ratings.length).toFixed(2)
                  : '0.00'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ratings Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Ratings</CardTitle>
                <CardDescription>Review and manage user ratings</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search ratings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profile</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRatings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No ratings found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRatings.map((rating) => (
                      <TableRow key={rating.id}>
                        <TableCell className="font-medium">
                          {rating.profileName}
                        </TableCell>
                        <TableCell>{rating.userEmail}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getRatingStars(rating.ratingValue)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rating.createdAt 
                            ? new Date(rating.createdAt.seconds * 1000).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteRating(rating)}
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
          </CardContent>
        </Card>

        {/* Warning Card */}
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950 dark:border-orange-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  Warning
                </h3>
                <p className="text-sm text-orange-800 dark:text-orange-200">
                  Deleting a rating will permanently remove it and update the profile's rating statistics. 
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteRating} onOpenChange={() => setDeleteRating(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rating</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteRating?.ratingValue}-star rating 
              for <strong>{deleteRating?.profileName}</strong>? 
              This will update the profile's rating statistics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRating} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
