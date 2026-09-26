import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

// Load config from firebase-applet-config.json
let firebaseConfig: {
  projectId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
} = {
  projectId: 'gifted-slate-0vxch',
  apiKey: '',
  authDomain: 'gifted-slate-0vxch.firebaseapp.com'
};

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const raw = fs.readFileSync(configPath, 'utf8');
    firebaseConfig = JSON.parse(raw);
  }
} catch (e) {
  console.warn('[FirebaseAuth] Could not load firebase-applet-config.json:', e);
}

const PROJECT_ID = firebaseConfig.projectId || 'gifted-slate-0vxch';
const API_KEY = firebaseConfig.apiKey || '';

export interface VerifiedFirebaseUser {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  provider: string;
}

// In-memory cache for Google public certs
interface CertCache {
  certs: Record<string, string>;
  expiresAt: number;
}
let certCache: CertCache | null = null;

async function getGooglePublicCerts(): Promise<Record<string, string>> {
  if (certCache && Date.now() < certCache.expiresAt) {
    return certCache.certs;
  }

  const certsUrl = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
  const res = await fetch(certsUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch Google public certs: ${res.statusText}`);
  }

  // Parse cache-control header
  const cacheControl = res.headers.get('cache-control') || '';
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

  const certs = (await res.json()) as Record<string, string>;
  certCache = {
    certs,
    expiresAt: Date.now() + maxAge * 1000
  };
  return certs;
}

/**
 * Cryptographically verifies a Firebase ID token.
 * 1. Validates standard JWT claims (aud, iss, sub, exp, auth_time).
 * 2. Validates RS256 signature against Google's public X509 certificates.
 * 3. Falls back to Google Identity Toolkit API lookup if cert retrieval experiences network issues.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseUser> {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing or invalid Firebase ID token');
  }

  // 1. Decode token header to obtain 'kid'
  const decodedComplete = jwt.decode(idToken, { complete: true });
  if (!decodedComplete || typeof decodedComplete !== 'object') {
    throw new Error('Malformed Firebase ID token');
  }

  const { header, payload } = decodedComplete as { header: any; payload: any };
  if (!header || header.alg !== 'RS256' || !header.kid) {
    throw new Error('Invalid Firebase ID token header or algorithm');
  }

  // Pre-validate essential claims before crypto verification
  const nowInSec = Math.floor(Date.now() / 1000);
  const expectedIssuer = `https://securetoken.google.com/${PROJECT_ID}`;

  if (payload.aud !== PROJECT_ID) {
    throw new Error(`Firebase token audience mismatch. Expected ${PROJECT_ID}, got ${payload.aud}`);
  }

  if (payload.iss !== expectedIssuer) {
    throw new Error(`Firebase token issuer mismatch. Expected ${expectedIssuer}, got ${payload.iss}`);
  }

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Firebase token subject (UID) is missing or invalid');
  }

  if (payload.exp && payload.exp < nowInSec) {
    throw new Error('Firebase ID token has expired');
  }

  // 2. Primary: Cryptographic verification using Google X509 certificates
  try {
    const certs = await getGooglePublicCerts();
    const cert = certs[header.kid];
    if (cert) {
      const verified = jwt.verify(idToken, cert, {
        algorithms: ['RS256'],
        audience: PROJECT_ID,
        issuer: expectedIssuer
      }) as any;

      return {
        uid: verified.sub,
        email: verified.email,
        email_verified: Boolean(verified.email_verified),
        name: verified.name,
        picture: verified.picture,
        provider: verified.firebase?.sign_in_provider || 'google.com'
      };
    }
  } catch (certError: any) {
    console.warn('[FirebaseAuth] Google public cert verification error, attempting Identity Toolkit fallback:', certError?.message);
  }

  // 3. Fallback: Verify via Google Identity Toolkit lookup API using project API key
  if (API_KEY) {
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${API_KEY}`;
    const lookupRes = await fetch(lookupUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (lookupRes.ok) {
      const lookupData = (await lookupRes.json()) as any;
      if (lookupData.users && lookupData.users.length > 0) {
        const user = lookupData.users[0];
        const providerInfo = user.providerUserInfo?.[0];
        return {
          uid: user.localId,
          email: user.email,
          email_verified: Boolean(user.emailVerified),
          name: user.displayName || providerInfo?.displayName,
          picture: user.photoUrl || providerInfo?.photoUrl,
          provider: providerInfo?.providerId || 'google.com'
        };
      }
    } else {
      const errorJson = (await lookupRes.json().catch(() => ({}))) as any;
      const msg = errorJson.error?.message || 'Token verification failed';
      throw new Error(`Firebase token validation failed: ${msg}`);
    }
  }

  throw new Error('Unable to verify Firebase ID token: No matching public key or validation service available');
}
