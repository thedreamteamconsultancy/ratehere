import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  'admin', 'api', 'auth', 'profile', 'profiles', 'user', 'users',
  'dashboard', 'leaderboard', 'settings', 'help', 'support',
  'about', 'contact', 'terms', 'privacy', 'login', 'signup',
  'create', 'edit', 'delete', 'update', 'new', 'ratehere',
  'root', 'system', 'test', 'demo', 'sample', 'example'
];

// Username validation rules
export const USERNAME_RULES = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 30,
  PATTERN: /^[a-zA-Z0-9_-]+$/,
  START_PATTERN: /^[a-zA-Z0-9]/,
};

/**
 * Normalizes a username to lowercase for case-insensitive comparison
 */
export function normalizeUsername(username: string): string {
  return username.toLowerCase().trim();
}

/**
 * Checks if a username is reserved
 */
export function isReservedUsername(username: string): boolean {
  return RESERVED_USERNAMES.includes(normalizeUsername(username));
}

/**
 * Validates username format
 * @returns Object with valid flag and optional error message
 */
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }

  const trimmed = username.trim();

  if (trimmed.length < USERNAME_RULES.MIN_LENGTH) {
    return { valid: false, error: `Username must be at least ${USERNAME_RULES.MIN_LENGTH} characters` };
  }

  if (trimmed.length > USERNAME_RULES.MAX_LENGTH) {
    return { valid: false, error: `Username must not exceed ${USERNAME_RULES.MAX_LENGTH} characters` };
  }

  if (!USERNAME_RULES.PATTERN.test(trimmed)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }

  if (!USERNAME_RULES.START_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Username must start with a letter or number' };
  }

  if (isReservedUsername(trimmed)) {
    return { valid: false, error: 'This username is reserved and cannot be used' };
  }

  return { valid: true };
}

/**
 * Checks if a username is available in Firestore
 * @param username The username to check
 * @param currentUserId Optional - exclude this user from the check (for profile edits)
 * @returns Promise<boolean> true if available, false if taken
 */
export async function checkUsernameAvailability(
  username: string,
  currentUserId?: string
): Promise<{ available: boolean; error?: string }> {
  try {
    const normalized = normalizeUsername(username);
    
    // Query Firestore for existing username (case-insensitive)
    const profilesRef = collection(db, 'profiles');
    const q = query(
      profilesRef,
      where('usernameLower', '==', normalized)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return { available: true };
    }
    
    // If editing own profile, allow the username to remain the same
    if (currentUserId && snapshot.docs.length === 1) {
      const existingProfile = snapshot.docs[0];
      if (existingProfile.data().createdBy === currentUserId) {
        return { available: true };
      }
    }
    
    return { available: false, error: 'This username is already taken' };
  } catch (error) {
    console.error('Error checking username availability:', error);
    return { available: false, error: 'Failed to check username availability' };
  }
}

/**
 * Validates username and checks availability
 * Comprehensive validation function
 */
export async function validateUsername(
  username: string,
  currentUserId?: string
): Promise<{ valid: boolean; error?: string }> {
  // First check format
  const formatCheck = validateUsernameFormat(username);
  if (!formatCheck.valid) {
    return formatCheck;
  }

  // Then check availability
  const availabilityCheck = await checkUsernameAvailability(username, currentUserId);
  if (!availabilityCheck.available) {
    return { valid: false, error: availabilityCheck.error };
  }

  return { valid: true };
}

/**
 * Generates a username suggestion from a name
 * Useful for pre-filling the username field
 */
export function suggestUsername(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .slice(0, USERNAME_RULES.MAX_LENGTH);
}
