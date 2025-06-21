'use server';
/**
 * @fileOverview A higher-order function to wrap Genkit flows with authentication and authorization checks.
 */

import admin from '@/lib/firebase-admin';

interface AuthWrapperOptions {
  premiumRequired?: boolean;
  premiumCheckError?: string;
}

/**
 * Creates an authenticated flow wrapper.
 * This function takes a Genkit flow and returns a new function that performs
 * authentication and authorization checks before executing the original flow.
 *
 * @param flow The Genkit flow function to wrap. It should take an input of type TInput and return a Promise of TOutput.
 * @param options Configuration options for the authorization check.
 * @param options.premiumRequired If true, checks if the user has a `premium` custom claim.
 * @param options.premiumCheckError The error message to throw if the premium check fails.
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

      if (options.premiumRequired) {
        const isPremium = decodedToken.premium === true;
        if (!isPremium) {
          throw new Error(options.premiumCheckError || 'This is a premium feature. Please upgrade your plan.');
        }
      }

      // If all checks pass, execute the original flow.
      return await flow(input);

    } catch (error) {
      console.error('Authorization check failed:', error);

      // A list of strings that indicate a developer configuration error, not a user auth error.
      const configErrorIndicators = [
        'credential',
        'GOOGLE_APPLICATION_CREDENTIALS',
        'initialize',
        'Could not load the default credentials'
      ];

      if (error instanceof Error) {
        // If it's a known server configuration error, re-throw the original error.
        // This provides a clear message to the developer in the server logs instead of a generic auth error.
        if (configErrorIndicators.some(indicator => error.message.includes(indicator))) {
            throw error;
        }

        // Re-throw specific, intentional user-facing errors (like premium checks).
        if (error.message.includes('premium')) {
            throw error;
        }
      }
      
      // For all other runtime errors (e.g., invalid/expired token), throw a generic one to avoid leaking implementation details.
      throw new Error('You are not authorized to perform this action. Please sign in and try again.');
    }
  };
}
