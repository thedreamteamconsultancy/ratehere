import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Eye, MousePointerClick, TrendingUp, Trophy, Activity } from 'lucide-react';

interface AnalyticsProps {
  profileId: string;
  profileName: string;
}

interface ProfileAnalytics {
  views: number;
  linkClicks: Record<string, number>;
  rating: number;
  ratingCount: number;
}

interface RatingHistoryData {
  week: string;
  average: number;
  count: number;
}

export default function AnalyticsDashboard({ profileId, profileName }: AnalyticsProps) {
  const [analytics, setAnalytics] = useState<ProfileAnalytics>({
    views: 0,
    linkClicks: {},
    rating: 0,
    ratingCount: 0,
  });
  const [ratingHistory, setRatingHistory] = useState<RatingHistoryData[]>([]);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [profileId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch profile analytics
      const profileRef = doc(db, 'profiles', profileId);
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        const data = profileSnap.data();
        setAnalytics({
          views: data.views || 0,
          linkClicks: data.linkClicks || {},
          rating: data.rating || 0,
          ratingCount: data.ratingCount || 0,
        });

        // Fetch leaderboard position
        const profilesRef = collection(db, 'profiles');
        const q = query(profilesRef, orderBy('rating', 'desc'));
        const snapshot = await getDocs(q);
        
        const profiles = snapshot.docs.map(doc => ({
          id: doc.id,
          rating: doc.data().rating || 0,
        }));
        
        const position = profiles.findIndex(p => p.id === profileId);
        setLeaderboardPosition(position >= 0 ? position + 1 : null);
      }

      // Fetch rating history
      const historyRef = doc(db, 'ratingHistory', profileId);
      const historySnap = await getDoc(historyRef);
      
      if (historySnap.exists()) {
        const weeks = historySnap.data().weeks || {};
        const historyData: RatingHistoryData[] = Object.entries(weeks)
          .map(([week, data]: [string, any]) => ({
            week,
            average: parseFloat(data.average.toFixed(2)),
            count: data.count,
          }))
          .sort((a, b) => a.week.localeCompare(b.week))
          .slice(-12); // Last 12 weeks
        
        setRatingHistory(historyData);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalLinkClicks = Object.values(analytics.linkClicks).reduce((sum, count) => sum + count, 0);

  const linkClicksData = Object.entries(analytics.linkClicks)
    .map(([platform, clicks]) => ({
      platform: platform.charAt(0).toUpperCase() + platform.slice(1),
      clicks,
    }))
    .sort((a, b) => b.clicks - a.clicks);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.views.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Profile page views
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Link Clicks</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLinkClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Social link clicks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.rating.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {analytics.ratingCount} ratings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaderboardPosition ? `#${leaderboardPosition}` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current position
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="rating" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rating">Rating Trend</TabsTrigger>
          <TabsTrigger value="clicks">Link Clicks</TabsTrigger>
        </TabsList>

        <TabsContent value="rating" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Rating Trend
              </CardTitle>
              <CardDescription>
                Average rating per week over the last 12 weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratingHistory.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ratingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Average Rating"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No rating history yet</p>
                    <p className="text-sm mt-2">Rating trends will appear as you receive more ratings</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clicks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MousePointerClick className="w-5 h-5" />
                Social Link Clicks
              </CardTitle>
              <CardDescription>
                Breakdown of clicks by platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {linkClicksData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={linkClicksData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="clicks" 
                      fill="hsl(var(--primary))" 
                      name="Clicks"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <MousePointerClick className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No link clicks yet</p>
                    <p className="text-sm mt-2">Analytics will appear when people click your social links</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detailed Stats */}
      {linkClicksData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Link Performance Details</CardTitle>
            <CardDescription>Detailed breakdown of social link engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linkClicksData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.platform.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{item.platform}</p>
                      <p className="text-sm text-muted-foreground">
                        {((item.clicks / totalLinkClicks) * 100).toFixed(1)}% of total clicks
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold">{item.clicks}</p>
                    <p className="text-xs text-muted-foreground">clicks</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
