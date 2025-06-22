import * as functions from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {defineString} from "firebase-functions/params";

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Define the Lemon Squeezy webhook secret as a Firebase secret.
// Set this in your terminal with:
// firebase secrets:set LEMONSQUEEZY_WEBHOOK_SECRET
// Then deploy with:
// firebase deploy --only functions
const webhookSecret = defineString("LEMONSQUEEZY_WEBHOOK_SECRET");

/**
 * Firebase Function to handle Lemon Squeezy webhooks.
 * This function verifies the request signature and updates user roles (custom
 * claims) upon a successful purchase.
 */
export const lemonsqueezyWebhook = functions.https.onRequest(
  {secrets: [webhookSecret]},
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method Not Allowed");
      return;
    }

    try {
      // 1. Verify the webhook signature to ensure it's from Lemon Squeezy
      const secret = webhookSecret.value();
      const hmac = crypto.createHmac("sha256", secret);
      const digest = Buffer.from(
        hmac.update(request.rawBody).digest("hex"),
        "utf8"
      );
      const signature = Buffer.from(
        request.get("X-Signature") || "",
        "utf8"
      );

      if (!crypto.timingSafeEqual(digest, signature)) {
        functions.logger.warn("Invalid webhook signature received.");
        response.status(401).send("Invalid signature.");
        return;
      }

      // 2. Process the webhook payload
      const {meta, data} = request.body;

      // We only care about successful order creations
      if (meta.event_name !== "order_created") {
        functions.logger.info(`Ignoring event: ${meta.event_name}`);
        response.status(200).send("OK (event ignored)");
        return;
      }
      
      const orderStatus = data.attributes.status;
      if (orderStatus !== "paid") {
        const logMessage = `Order status is '${orderStatus}', not "paid". Ignoring.`;
        functions.logger.info(logMessage);
        response.status(200).send("OK (status not paid)");
        return;
      }

      // 3. Extract the user ID from the custom data passed during checkout
      const userId = meta.custom_data?.user_id;

      if (!userId) {
        const err = "Webhook for paid order missing user_id in custom_data.";
        functions.logger.error(err, {meta});
        response.status(400).send("Missing user_id in custom_data.");
        return;
      }

      // 4. Update the user's custom claims in Firebase Authentication
      await admin.auth().setCustomUserClaims(userId, {premium: true});
      functions.logger.info(
        `Successfully granted premium access to user: ${userId}`
      );

      response.status(200).send("Webhook processed successfully.");
    } catch (error) {
      functions.logger.error("Error processing Lemon Squeezy webhook:", error);
      if (error instanceof Error) {
        const failureMessage = `Webhook handler failed: ${error.message}`;
        response.status(500).send(failureMessage);
      } else {
        response.status(500).send("An unknown error occurred.");
      }
    }
  }
);
