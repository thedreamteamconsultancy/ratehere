import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Ban, CheckCircle, Search, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { logAdminAction, LOG_ACTIONS } from '@/lib/systemLogs';

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt?: any;
  status?: 'active' | 'banned' | 'deactivated';
  bannedAt?: any;
  bannedBy?: string;
  bannedReason?: string;
  // Contact information from profiles
  phoneNumber?: string;
  whatsappNumber?: string;
  address?: string;
  profileCount?: number;
}

export default function ManageUsers() {
  const navigate = useNavigate();
  const { user: currentUser, isAdmin, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'deactivate' | 'activate' | null>(null);
  const [banReason, setBanReason] = useState('');

  useEffect(() => {
    if (!authLoading && (!currentUser || !isAdmin)) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin');
      return;
    }

    if (currentUser && isAdmin) {
      fetchUsers();
    }
  }, [currentUser, isAdmin, authLoading, navigate]);

  useEffect(() => {
    // Filter users based on search term (name, UID, email)
    if (searchTerm) {
      const filtered = users.filter(u => 
        u.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    try {
      let usersData: User[] = [];
      
      // First, get all profiles to find unique users and their contact info
      const profilesSnapshot = await getDocs(collection(db, 'profiles'));
      const uniqueUserIds = new Set<string>();
      const profilesData = new Map<string, any>();
      const userProfileCounts = new Map<string, number>();
      
      profilesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.createdBy) {
          uniqueUserIds.add(data.createdBy);
          
          // Count profiles per user
          userProfileCounts.set(data.createdBy, (userProfileCounts.get(data.createdBy) || 0) + 1);
          
          if (!profilesData.has(data.createdBy)) {
            profilesData.set(data.createdBy, {
              createdAt: data.createdAt,
              email: data.createdByEmail || data.email || null,
              displayName: data.createdByName || null,
              phoneNumber: data.phoneNumber || null,
              whatsappNumber: data.whatsappNumber || null,
              address: data.address || null,
            });
          }
        }
      });

      // For each unique user ID, try to get user data from users collection or Firebase Auth
      for (const userId of uniqueUserIds) {
        try {
          // Try to get from users collection first
          const userDocRef = doc(db, 'users', userId);
          const userDoc = await getDoc(userDocRef);
          
          const profileData = profilesData.get(userId);
          const profileCount = userProfileCounts.get(userId) || 0;
          
          if (userDoc.exists()) {
            // User document exists in users collection, merge with profile data
            usersData.push({
              id: userId,
              ...userDoc.data(),
              phoneNumber: profileData?.phoneNumber || null,
              whatsappNumber: profileData?.whatsappNumber || null,
              address: profileData?.address || null,
              profileCount: profileCount,
            } as User);
          } else {
            // User document doesn't exist, get from Firebase Auth or profiles data
            
            // Try to get current user's info if this is the current user
            let email = profileData?.email || 'Unknown';
            let displayName = profileData?.displayName || null;
            
            if (auth.currentUser && auth.currentUser.uid === userId) {
              email = auth.currentUser.email || email;
              displayName = auth.currentUser.displayName || displayName;
            }
            
            usersData.push({
              id: userId,
              email: email,
              displayName: displayName,
              status: 'active',
              createdAt: profileData?.createdAt || null,
              phoneNumber: profileData?.phoneNumber || null,
              whatsappNumber: profileData?.whatsappNumber || null,
              address: profileData?.address || null,
              profileCount: profileCount,
            });
          }
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
          // Still add the user with basic info
          const profileData = profilesData.get(userId);
          usersData.push({
            id: userId,
            email: profileData?.email || 'Unknown',
            displayName: profileData?.displayName || null,
            status: 'active',
            createdAt: profileData?.createdAt || null,
          });
        }
      }

      // Sort by creation date (newest first)
      usersData.sort((a, b) => {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        const aTime = a.createdAt.seconds || 0;
        const bTime = b.createdAt.seconds || 0;
        return bTime - aTime;
      });

      setUsers(usersData);
      setFilteredUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async () => {
    if (!actionUser || !actionType || !currentUser) return;

    try {
      const userRef = doc(db, 'users', actionUser.id);
      
      switch (actionType) {
        case 'ban':
          await updateDoc(userRef, {
            status: 'banned',
            bannedAt: new Date(),
            bannedBy: currentUser.uid,
            bannedReason: banReason || 'No reason provided',
          });
          
          await logAdminAction(
            LOG_ACTIONS.USER_BANNED,
            'user',
            currentUser.uid,
            currentUser.email || 'admin',
            actionUser.id,
            actionUser.email,
            `Reason: ${banReason || 'No reason provided'}`
          );
          
          toast.success('User banned successfully');
          break;

        case 'unban':
          await updateDoc(userRef, {
            status: 'active',
            bannedAt: null,
            bannedBy: null,
            bannedReason: null,
          });
          
          await logAdminAction(
            LOG_ACTIONS.USER_UNBANNED,
            'user',
            currentUser.uid,
            currentUser.email || 'admin',
            actionUser.id,
            actionUser.email
          );
          
          toast.success('User unbanned successfully');
          break;

        case 'deactivate':
          await updateDoc(userRef, {
            status: 'deactivated',
          });
          
          await logAdminAction(
            LOG_ACTIONS.USER_DEACTIVATED,
            'user',
            currentUser.uid,
            currentUser.email || 'admin',
            actionUser.id,
            actionUser.email
          );
          
          toast.success('User deactivated successfully');
          break;

        case 'activate':
          await updateDoc(userRef, {
            status: 'active',
          });
          
          await logAdminAction(
            LOG_ACTIONS.USER_ACTIVATED,
            'user',
            currentUser.uid,
            currentUser.email || 'admin',
            actionUser.id,
            actionUser.email
          );
          
          toast.success('User activated successfully');
          break;
      }

      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user status');
    } finally {
      setActionUser(null);
      setActionType(null);
      setBanReason('');
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'banned':
        return <Badge variant="destructive">Banned</Badge>;
      case 'deactivated':
        return <Badge variant="secondary">Deactivated</Badge>;
      default:
        return <Badge variant="default" className="bg-green-500">Active</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading users...</p>
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
          <h1 className="text-4xl font-bold text-foreground">Manage Users</h1>
          <p className="text-muted-foreground mt-2">
            View, ban, or deactivate platform users
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {users.filter(u => u.status === 'active' || !u.status).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {users.filter(u => u.status === 'banned').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage user accounts and permissions</CardDescription>
              </div>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or UID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-[300px]"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">No users found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg truncate">
                        {user.displayName || 'Unknown User'}
                      </CardTitle>
                      <CardDescription className="text-xs font-mono mt-1 break-all">
                        UID: {user.id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(user.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Basic Info */}
                  <div className="space-y-2 text-sm">
                    {user.email && user.email !== 'Unknown' && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium break-all">{user.email}</p>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-muted-foreground">Profiles:</span>
                      <p className="font-medium">{user.profileCount || 0}</p>
                    </div>
                    
                    {user.createdAt && (
                      <div>
                        <span className="text-muted-foreground">Joined:</span>
                        <p className="font-medium">
                          {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Contact Information (if available) */}
                  {(user.phoneNumber || user.whatsappNumber || user.address) && (
                    <div className="pt-3 border-t space-y-2 text-sm">
                      <p className="text-xs font-semibold text-muted-foreground uppercase">
                        Contact Info (Private)
                      </p>
                      
                      {user.phoneNumber && (
                        <div>
                          <span className="text-muted-foreground">Phone:</span>
                          <p className="font-medium">{user.phoneNumber}</p>
                        </div>
                      )}
                      
                      {user.whatsappNumber && (
                        <div>
                          <span className="text-muted-foreground">WhatsApp:</span>
                          <p className="font-medium">{user.whatsappNumber}</p>
                        </div>
                      )}
                      
                      {user.address && (
                        <div>
                          <span className="text-muted-foreground">Address:</span>
                          <p className="font-medium text-xs">{user.address}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t flex flex-wrap gap-2">
                    {user.status === 'banned' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setActionUser(user);
                          setActionType('unban');
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Unban
                      </Button>
                    ) : user.status === 'deactivated' ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setActionUser(user);
                            setActionType('activate');
                          }}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Activate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setActionUser(user);
                            setActionType('ban');
                          }}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setActionUser(user);
                            setActionType('deactivate');
                          }}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Deactivate
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setActionUser(user);
                            setActionType('ban');
                          }}
                        >
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={!!actionUser && !!actionType} onOpenChange={() => {
        setActionUser(null);
        setActionType(null);
        setBanReason('');
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'ban' && 'Ban User'}
              {actionType === 'unban' && 'Unban User'}
              {actionType === 'deactivate' && 'Deactivate User'}
              {actionType === 'activate' && 'Activate User'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} user <strong>{actionUser?.email}</strong>?
              {actionType === 'ban' && ' This will prevent them from accessing the platform.'}
              {actionType === 'deactivate' && ' This will temporarily disable their account.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {actionType === 'ban' && (
            <div className="my-4">
              <label className="text-sm font-medium mb-2 block">
                Reason for ban (optional)
              </label>
              <Input
                placeholder="Enter reason..."
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
              />
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUserAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
