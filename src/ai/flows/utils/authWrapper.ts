
'use server';
/**
 * @fileOverview A higher-order function to wrap Genkit flows with authentication and authorization checks.
 */

import admin from '@/lib/firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { handleFlowError } from './errorHandler';

interface AuthWrapperOptions {
  premiumRequired?: boolean;
  premiumCheckError?: string;
  customAuthCheck?: (decodedToken: DecodedIdToken) => void;
}

/**
 * Creates an authenticated flow wrapper.
 * This function takes a Genkit flow and returns a new function that performs
 * authentication and authorization checks before executing the original flow.
 *
 * @param flow The Genkit flow function to wrap. It should take an input of type TInput and return a Promise of TOutput.
 * @param options Configuration options for the authorization check.
 * @param options.premiumRequired If true, checks if the user has a `premium` custom claim. Admins bypass this check.
 * @param options.premiumCheckError The error message to throw if the premium check fails.
 * @param options.customAuthCheck A custom function to perform additional authorization checks.
 * @returns An async function that takes the flow input and an auth token, and returns the flow's output.
 */
export function createAuthenticatedFlow<TInput, TOutput>(
  flow: (input: TInput) => Promise<TOutput>,
  options: AuthWrapperOptions = {}
): (input: TInput, authToken: string | undefined) => Promise<TOutput> {
  return async (input: TInput, authToken: string | undefined) => {
    if (!authToken) {
      throw new Error('Authentication required. Access denied.');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(authToken);

      // Enforce role-based access for premium features.
      if (options.premiumRequired) {
        const isPremium = decodedToken.premium === true;
        // Admins are granted access to all features regardless of premium status.
        const isAdmin = decodedToken.admin === true;

        // If the user is not premium AND not an admin, deny access.
        if (!isPremium && !isAdmin) {
          throw new Error(options.premiumCheckError || 'This is a premium feature. Please upgrade your plan.');
        }
      }
      
      // Perform custom authorization check if provided (e.g., for admin-only routes).
      if (options.customAuthCheck) {
        options.customAuthCheck(decodedToken);
      }

      // If all checks pass, execute the original flow.
      return await flow(input);

    } catch (error) => {
      // Use the centralized error handler
      handleFlowError(error);
    }
  };
}
