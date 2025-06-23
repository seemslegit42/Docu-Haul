/**
 * @fileOverview Centralized error handling utility for authenticated flows.
 */

/**
 * Handles errors thrown within server-side flows.
 * It distinguishes between Firebase authentication errors and other application-level errors.
 * Auth errors are masked with a generic message, while application errors are re-thrown
 * so the client can handle them specifically (e.g., "Premium feature required").
 *
 * @param error The error object caught in a try/catch block.
 */
export function handleFlowError(error: unknown): never {
  // Check if the error is a Firebase Admin SDK Auth error (e.g., invalid token)
  const isFirebaseAuthError =
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as any).code === 'string' &&
    (error as any).code.startsWith('auth/');

  if (isFirebaseAuthError) {
    console.error('Authentication token verification failed:', error);
    // Throw a new, generic error to avoid leaking implementation details.
    throw new Error('You are not authorized to perform this action. Please sign in and try again.');
  }

  // If it's not a Firebase Auth error, it's likely a specific application error
  // (e.g., from a premium check, validation, or the flow's own logic).
  // We should let it pass through so the client can handle it.
  console.error('An application or configuration error occurred within a flow:', error);
  throw error;
}
