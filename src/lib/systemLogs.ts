import { collection, addDoc, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface SystemLog {
  id?: string;
  action: string;
  targetType: 'profile' | 'user' | 'rating' | 'review' | 'system';
  targetId?: string;
  targetName?: string;
  adminId: string;
  adminEmail: string;
  details?: string;
  timestamp: Timestamp;
  metadata?: Record<string, any>;
}

/**
 * Log an admin action to the systemLogs collection
 */
export async function logAdminAction(
  action: string,
  targetType: SystemLog['targetType'],
  adminId: string,
  adminEmail: string,
  targetId?: string,
  targetName?: string,
  details?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await addDoc(collection(db, 'systemLogs'), {
      action,
      targetType,
      targetId: targetId || null,
      targetName: targetName || null,
      adminId,
      adminEmail,
      details: details || null,
      metadata: metadata || null,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Don't throw - logging should not break the main functionality
  }
}

/**
 * Fetch recent system logs
 */
export async function fetchSystemLogs(limitCount: number = 100): Promise<SystemLog[]> {
  try {
    const logsRef = collection(db, 'systemLogs');
    const logsQuery = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const snapshot = await getDocs(logsQuery);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SystemLog));
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return [];
  }
}

/**
 * Action type constants for consistency
 */
export const LOG_ACTIONS = {
  // Profile actions
  PROFILE_VERIFIED: 'Profile Verified',
  PROFILE_UNVERIFIED: 'Profile Unverified',
  PROFILE_DELETED: 'Profile Deleted',
  
  // User actions
  USER_BANNED: 'User Banned',
  USER_UNBANNED: 'User Unbanned',
  USER_DEACTIVATED: 'User Deactivated',
  USER_ACTIVATED: 'User Activated',
  
  // Rating actions
  RATING_DELETED: 'Rating Deleted',
  RATING_FLAGGED: 'Rating Flagged as Spam',
  
  // Review actions
  REVIEW_DELETED: 'Review Deleted',
  REVIEW_FLAGGED: 'Review Flagged as Spam',
  
  // System actions
  ADMIN_LOGIN: 'Admin Logged In',
  ADMIN_LOGOUT: 'Admin Logged Out',
  SETTINGS_CHANGED: 'System Settings Changed',
} as const;
