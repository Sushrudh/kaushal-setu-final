import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebase';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on initialization per Firebase Skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

// Call on startup
testConnection().catch(() => {});

export interface FirestoreUserProfile {
  userId: string;
  email: string;
  role: 'student' | 'institution' | 'industry' | 'admin';
  fullName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FirestoreSupportTicket {
  id: string;
  userId: string;
  userEmail: string;
  role: string;
  subject: string;
  message: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Waiting' | 'Resolved' | 'Closed';
  createdAt: string;
}

/**
 * Persist or synchronize user profile document in Firestore (/users/{userId})
 */
export async function syncUserProfileToFirestore(profileData: {
  userId?: string;
  email: string;
  role: string;
  fullName: string;
  avatarUrl?: string;
  isVerified?: boolean;
}): Promise<FirestoreUserProfile | null> {
  const currentUid = profileData.userId || auth.currentUser?.uid;
  if (!currentUid) {
    console.warn('Cannot sync user profile: No active Firebase Auth UID');
    return null;
  }

  const validRole = (['student', 'institution', 'industry', 'admin'].includes(profileData.role)
    ? profileData.role
    : 'student') as FirestoreUserProfile['role'];

  const path = `users/${currentUid}`;
  const now = new Date().toISOString();

  const userDoc: FirestoreUserProfile = {
    userId: currentUid,
    email: profileData.email || auth.currentUser?.email || '',
    role: validRole,
    fullName: profileData.fullName || auth.currentUser?.displayName || 'User',
    avatarUrl: profileData.avatarUrl || auth.currentUser?.photoURL || '',
    isVerified: profileData.isVerified ?? Boolean(auth.currentUser?.emailVerified),
    createdAt: now
  };

  try {
    const userRef = doc(db, 'users', currentUid);
    const existingSnap = await getDoc(userRef).catch(() => null);

    if (existingSnap && existingSnap.exists()) {
      const existingData = existingSnap.data() as FirestoreUserProfile;
      const updateData: Partial<FirestoreUserProfile> = {
        email: userDoc.email,
        fullName: userDoc.fullName,
        avatarUrl: userDoc.avatarUrl || existingData.avatarUrl,
        isVerified: userDoc.isVerified,
        updatedAt: now
      };
      await updateDoc(userRef, updateData as any);
      return { ...existingData, ...updateData };
    } else {
      await setDoc(userRef, userDoc);
      return userDoc;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    return null;
  }
}

/**
 * Retrieve user profile from Firestore
 */
export async function getUserProfileFromFirestore(userId: string): Promise<FirestoreUserProfile | null> {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as FirestoreUserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Real-time listener for user profile updates
 */
export function listenToUserProfile(
  userId: string,
  onProfileChange: (profile: FirestoreUserProfile | null) => void
): () => void {
  const path = `users/${userId}`;
  const userRef = doc(db, 'users', userId);

  return onSnapshot(
    userRef,
    (snap) => {
      if (snap.exists()) {
        onProfileChange(snap.data() as FirestoreUserProfile);
      } else {
        onProfileChange(null);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Save user support ticket to Firestore (/support_tickets/{ticketId})
 */
export async function createSupportTicketInFirestore(params: {
  subject: string;
  message: string;
  category?: string;
  priority?: 'Low' | 'Medium' | 'High' | 'Urgent';
  role?: string;
  email?: string;
}): Promise<FirestoreSupportTicket> {
  const ticketId = 'tkt_' + Math.random().toString(36).substring(2, 10);
  const path = `support_tickets/${ticketId}`;
  const uid = auth.currentUser?.uid || 'anon_user';

  const ticket: FirestoreSupportTicket = {
    id: ticketId,
    userId: uid,
    userEmail: params.email || auth.currentUser?.email || '',
    role: params.role || 'student',
    subject: params.subject,
    message: params.message,
    category: params.category || 'General Inquiries',
    priority: params.priority || 'Medium',
    status: 'Open',
    createdAt: new Date().toISOString()
  };

  try {
    const ticketRef = doc(db, 'support_tickets', ticketId);
    await setDoc(ticketRef, ticket);
    return ticket;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return ticket;
  }
}

/**
 * Listen to support tickets for the current authenticated user
 */
export function listenToUserSupportTickets(
  userId: string,
  onTicketsChange: (tickets: FirestoreSupportTicket[]) => void
): () => void {
  const path = 'support_tickets';
  const ticketsCol = collection(db, 'support_tickets');
  const q = query(ticketsCol, where('userId', '==', userId));

  return onSnapshot(
    q,
    (snapshot) => {
      const tickets: FirestoreSupportTicket[] = [];
      snapshot.forEach((docSnap) => {
        tickets.push(docSnap.data() as FirestoreSupportTicket);
      });
      onTicketsChange(tickets);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
