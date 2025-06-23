/**
 * @fileoverview Cloud Function to handle Lemon Squeezy webhooks.
 * This function is responsible for verifying webhook signatures and updating
 * Firebase user claims based on successful payments.
 */

import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {defineString} from "firebase-functions/params";

// Initialize Firebase Admin SDK if not already done.
// This allows the function to interact with Firebase services like Auth.
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * The secret key used to verify webhook requests from Lemon Squeezy.
 * This is configured as a secret in the Google Cloud Secret Manager for
 * enhanced security, rather than being hardcoded.
 */
const webhookSecret = defineString("LEMONSQUEEZY_WEBHOOK_SECRET");

/**
 * Handles incoming webhook requests from Lemon Squeezy.
 *
 * This function performs several key tasks:
 * 1. Verifies the request signature using the shared secret to ensure it
 *    genuinely originates from Lemon Squeezy.
 * 2. Checks if the webhook event is an `order_created` event.
 * 3. Confirms the order status is `paid`.
 * 4. Extracts the user's Firebase UID from the custom data sent during checkout.
 * 5. Grants a `premium` custom claim to the user in Firebase Authentication.
 *
 * @param {functions.https.Request} request The Express-like request object
 *   from Cloud Functions, containing the request payload and headers.
 * @param {functions.Response} response The Express-like response object
 *   used to send a response back to the caller.
 * @return {Promise<void>} A promise that resolves when the function is done.
 */
export const lemonsqueezyWebhook = functions.https.onRequest(
  {secrets: [webhookSecret]},
  async (request, response): Promise<void> => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      const secret = webhookSecret.value();

      // 1. Verify the signature.
      const hmac = crypto.createHmac("sha256", secret);
      const digestHex = hmac.update(request.rawBody).digest("hex");
      const signature = Buffer.from(
        request.get("X-Signature") || "",
        "utf8",
      );

      if (!crypto.timingSafeEqual(Buffer.from(digestHex, "utf8"), signature)) {
        functions.logger.warn("Invalid webhook signature received.");
        response.status(401).send("Invalid signature.");
        return;
      }

      // 2. Process the webhook payload.
      const {meta, data} = request.body;

      if (meta.event_name !== "order_created") {
        functions.logger.info(`Ignoring event: ${meta.event_name}`);
        response.status(200).send("OK (event ignored)");
        return;
      }

      const orderStatus = data.attributes.status;
      if (orderStatus !== "paid") {
        functions.logger.info(
          `Order status is "${orderStatus}", not "paid". Ignoring.`,
        );
        response.status(200).send("OK (status not paid)");
        return;
      }

      const userId = meta.custom_data?.user_id;

      if (!userId) {
        const err = "Webhook is missing user_id in custom_data.";
        functions.logger.error(err, {meta: meta});
        response.status(400).send("Missing user_id in custom_data.");
        return;
      }

      // 3. Grant premium access by setting a custom claim.
      await admin.auth().setCustomUserClaims(userId, {premium: true});
      functions.logger.info(
        `Successfully granted premium access to user: ${userId}`,
      );

      response.status(200).send("Webhook processed successfully.");
    } catch (error) {
      functions.logger.error("Error processing webhook:", error);
      if (error instanceof Error) {
        const failureMessage = `Webhook handler failed: ${error.message}`;
        response.status(500).send(failureMessage);
      } else {
        response.status(500).send("An unknown error occurred.");
      }
    }
  },
);
