import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Increment profile view count
 */
export const incrementProfileViews = async (profileId: string) => {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    await updateDoc(profileRef, {
      views: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing profile views:', error);
  }
};

/**
 * Increment social link click count
 */
export const incrementLinkClick = async (profileId: string, platform: string) => {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    const platformKey = platform.toLowerCase().replace(/\s+/g, '');
    
    await updateDoc(profileRef, {
      [`linkClicks.${platformKey}`]: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing link click:', error);
  }
};

/**
 * Record rating history for trend analysis
 */
export const recordRatingHistory = async (profileId: string, rating: number) => {
  try {
    const historyRef = doc(db, 'ratingHistory', profileId);
    const historyDoc = await getDoc(historyRef);
    
    const now = new Date();
    const weekKey = `${now.getFullYear()}-W${getWeekNumber(now)}`;
    
    if (historyDoc.exists()) {
      const data = historyDoc.data();
      const weekData = data.weeks || {};
      
      if (weekData[weekKey]) {
        weekData[weekKey] = {
          sum: weekData[weekKey].sum + rating,
          count: weekData[weekKey].count + 1,
          average: (weekData[weekKey].sum + rating) / (weekData[weekKey].count + 1),
        };
      } else {
        weekData[weekKey] = {
          sum: rating,
          count: 1,
          average: rating,
        };
      }
      
      await updateDoc(historyRef, {
        weeks: weekData,
        lastUpdated: now,
      });
    } else {
      await setDoc(historyRef, {
        weeks: {
          [weekKey]: {
            sum: rating,
            count: 1,
            average: rating,
          },
        },
        lastUpdated: now,
      });
    }
  } catch (error) {
    console.error('Error recording rating history:', error);
  }
};

/**
 * Get ISO week number
 */
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

/**
 * Initialize analytics fields for a profile
 */
export const initializeAnalytics = async (profileId: string) => {
  try {
    const profileRef = doc(db, 'profiles', profileId);
    await updateDoc(profileRef, {
      views: 0,
      linkClicks: {},
    });
  } catch (error) {
    console.error('Error initializing analytics:', error);
  }
};
