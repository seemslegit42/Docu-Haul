'use server';
/**
 * @fileOverview A set of flows for administrative functions.
 * These flows require the user to have an 'admin' custom claim.
 *
 * - listAllUsers - Fetches a list of all users in the system.
 * - getDashboardStats - Fetches key statistics for the admin dashboard.
 */

import { z } from 'genkit';
import admin from '@/lib/firebase-admin';
import { createAuthenticatedFlow } from './utils/authWrapper';
import type { DecodedIdToken } from 'firebase-admin/auth';

// Common admin check function
const adminOnlyCheck = (decodedToken: DecodedIdToken) => {
    if (decodedToken.admin !== true) {
      throw new Error('You must be an administrator to perform this action.');
    }
};

// --- List All Users Flow ---

const AdminUserSchema = z.object({
  uid: z.string(),
  email: z.string().optional(),
  displayName: z.string().optional(),
  photoURL: z.string().optional(),
  disabled: z.boolean(),
  emailVerified: z.boolean(),
  creationTime: z.string(),
  lastSignInTime: z.string(),
  isPremium: z.boolean(),
  isAdmin: z.boolean(),
});
export type AdminUser = z.infer<typeof AdminUserSchema>;
export const ListAllUsersOutputSchema = z.array(AdminUserSchema);

const listAllUsersFlow = async (): Promise<AdminUser[]> => {
  try {
    const listUsersResult = await admin.auth().listUsers(1000); // Note: For >1000 users, pagination would be required.
    const users = listUsersResult.users.map((userRecord) => ({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      disabled: userRecord.disabled,
      emailVerified: userRecord.emailVerified,
      creationTime: userRecord.metadata.creationTime,
      lastSignInTime: userRecord.metadata.lastSignInTime,
      isPremium: userRecord.customClaims?.premium === true,
      isAdmin: userRecord.customClaims?.admin === true,
    }));
    // Sort users by creation time, newest first
    return users.sort((a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime());
  } catch (error) {
    console.error('Error listing users:', error);
    throw new Error('Failed to retrieve user list from Firebase Authentication.');
  }
};

export const listAllUsers = createAuthenticatedFlow(listAllUsersFlow, {
  customAuthCheck: adminOnlyCheck
});


// --- Get Dashboard Stats Flow ---

const DashboardStatsSchema = z.object({
  totalUsers: z.number(),
  totalDocuments: z.number(),
  premiumUsers: z.number(),
});
export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

const getDashboardStatsFlow = async (): Promise<DashboardStats> => {
  try {
    // Note: For >1000 users, this user count will be inaccurate without pagination.
    const listUsersResult = await admin.auth().listUsers(1000);
    const totalUsers = listUsersResult.users.length;
    const premiumUsers = listUsersResult.users.filter(u => u.customClaims?.premium === true).length;

    const db = admin.firestore();
    const documentsCountSnapshot = await db.collection('generatedDocuments').count().get();
    const totalDocuments = documentsCountSnapshot.data().count;

    return {
      totalUsers,
      totalDocuments,
      premiumUsers,
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to retrieve dashboard statistics.');
  }
};

export const getDashboardStats = createAuthenticatedFlow(getDashboardStatsFlow, {
   customAuthCheck: adminOnlyCheck
});
