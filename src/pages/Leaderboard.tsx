import { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Navigation from '@/components/Navigation';
import ProfileCard from '@/components/ProfileCard';
import ProfileSearch from '@/components/ProfileSearch';
import TrophyBadge from '@/components/TrophyBadge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, TrendingUp, Calendar } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  username?: string;
  sector: string;
  logoUrl: string;
  rating: number;
  ratingCount: number;
  verified?: boolean;
}

export default function Leaderboard() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [weeklyProfiles, setWeeklyProfiles] = useState<Profile[]>([]);
  const [monthlyProfiles, setMonthlyProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'allTime' | 'weekly' | 'monthly'>('allTime');
  const [sectors, setSectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Fetch all profiles
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, orderBy('rating', 'desc'));
        const snapshot = await getDocs(q);
        
        const profilesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Profile));
        
        setProfiles(profilesData);
        
        // Extract unique sectors
        const uniqueSectors = Array.from(new Set(profilesData.map(p => p.sector)));
        setSectors(uniqueSectors);

        // Fetch weekly leaderboard (ratings from last 7 days)
        await fetchWeeklyLeaderboard(profilesData);

        // Fetch monthly leaderboard (ratings from last 30 days)
        await fetchMonthlyLeaderboard(profilesData);
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  const fetchWeeklyLeaderboard = async (allProfiles: Profile[]) => {
    try {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef,
        where('createdAt', '>=', Timestamp.fromDate(weekAgo))
      );
      const snapshot = await getDocs(q);

      // Count ratings per profile in the last week
      const ratingCounts = new Map<string, number>();
      snapshot.docs.forEach(doc => {
        const profileId = doc.data().profileId;
        ratingCounts.set(profileId, (ratingCounts.get(profileId) || 0) + 1);
      });

      // Sort profiles by weekly rating count
      const weeklyData = allProfiles
        .map(profile => ({
          ...profile,
          weeklyRatingCount: ratingCounts.get(profile.id) || 0
        }))
        .filter(p => p.weeklyRatingCount > 0)
        .sort((a, b) => b.weeklyRatingCount - a.weeklyRatingCount);

      setWeeklyProfiles(weeklyData);
    } catch (error) {
      console.error('Error fetching weekly leaderboard:', error);
    }
  };

  const fetchMonthlyLeaderboard = async (allProfiles: Profile[]) => {
    try {
      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);

      const ratingsRef = collection(db, 'ratings');
      const q = query(
        ratingsRef,
        where('createdAt', '>=', Timestamp.fromDate(monthAgo))
      );
      const snapshot = await getDocs(q);

      // Count ratings per profile in the last month
      const ratingCounts = new Map<string, number>();
      snapshot.docs.forEach(doc => {
        const profileId = doc.data().profileId;
        ratingCounts.set(profileId, (ratingCounts.get(profileId) || 0) + 1);
      });

      // Sort profiles by monthly rating count
      const monthlyData = allProfiles
        .map(profile => ({
          ...profile,
          monthlyRatingCount: ratingCounts.get(profile.id) || 0
        }))
        .filter(p => p.monthlyRatingCount > 0)
        .sort((a, b) => b.monthlyRatingCount - a.monthlyRatingCount);

      setMonthlyProfiles(monthlyData);
    } catch (error) {
      console.error('Error fetching monthly leaderboard:', error);
    }
  };

  useEffect(() => {
    let sourceProfiles = profiles;
    if (selectedPeriod === 'weekly') {
      sourceProfiles = weeklyProfiles;
    } else if (selectedPeriod === 'monthly') {
      sourceProfiles = monthlyProfiles;
    }

    let filtered = sourceProfiles;

    // Filter by sector
    if (selectedSector !== 'all') {
      filtered = filtered.filter(p => p.sector === selectedSector);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.sector.toLowerCase().includes(term) ||
        (p.username && p.username.toLowerCase().includes(term))
      );
    }

    setFilteredProfiles(filtered);
  }, [selectedSector, searchTerm, selectedPeriod, profiles, weeklyProfiles, monthlyProfiles]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto max-w-7xl px-4 pt-24 pb-12">
        <div className="space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
              <Trophy className="w-5 h-5 text-accent" />
              <span className="text-sm font-medium text-accent">Leaderboard</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">Top Rated Profiles</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Compete for glory and climb the rankings
            </p>
          </div>

          {/* Period Tabs */}
          <div className="flex justify-center">
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="allTime" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  All Time
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="weekly" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Weekly
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <ProfileSearch 
              onSearch={setSearchTerm}
              placeholder="Search by name, sector, or username..."
              className="w-full sm:w-auto"
            />
            <div className="w-full sm:w-64">
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredProfiles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProfiles.map((profile, index) => (
                <div key={profile.id} className="relative">
                  {/* Trophy Badge for Top 3 */}
                  {index < 3 && (
                    <div className="absolute -top-4 -right-4 z-10">
                      <TrophyBadge rank={index + 1} size="lg" showLabel={false} />
                    </div>
                  )}
                  {/* Rank Badge for positions 4+ */}
                  {index >= 3 && (
                    <div className="absolute -top-3 -left-3 z-10 w-10 h-10 rounded-full bg-muted border-2 border-background flex items-center justify-center font-bold text-sm shadow-md">
                      #{index + 1}
                    </div>
                  )}
                  <ProfileCard {...profile} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-xl">
              <p className="text-muted-foreground">
                {searchTerm
                  ? `No profiles found matching "${searchTerm}"`
                  : selectedSector === 'all'
                  ? 'No profiles yet. Be the first to create one!'
                  : `No profiles found in ${selectedSector} sector`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
