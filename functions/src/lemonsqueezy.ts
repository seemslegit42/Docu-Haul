/**
 * @fileoverview Cloud Function to handle Lemon Squeezy webhooks.
 * This function is responsible for verifying webhook signatures and updating
 * Firebase user claims based on successful payments.
 */

import * as functions from "firebase-functions/v2";
import * as admin from "firebase-admin";
import * as crypto from "crypto";
import {defineString} from "firebase-functions/params";

if (admin.apps.length === 0) {
  admin.initializeApp();
}

const webhookSecret = defineString("LEMONSQUEEZY_WEBHOOK_SECRET");

/**
 * Verifies the Lemon Squeezy webhook signature.
 * @param {functions.https.Request} request The incoming request.
 * @param {string} secret The webhook secret.
 * @throws {Error} If the signature is invalid.
 */
function verifyWebhookSignature(
  request: functions.https.Request,
  secret: string,
) {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(
    hmac.update(request.rawBody).digest("hex"), "utf8",
  );
  const signature = Buffer.from(
    request.get("X-Signature") || "", "utf8",
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    functions.logger.warn("Invalid webhook signature received.");
    throw new Error("Invalid signature.");
  }
}

/**
 * Processes the 'order_created' webhook event.
 * @param {any} requestBody The body of the webhook request.
 * @return {Promise<void>} A promise that resolves when processing is complete.
 */
async function processOrderCreated(requestBody: any): Promise<void> {
  const {meta, data} = requestBody;

  if (meta.event_name !== "order_created") {
    functions.logger.info(`Ignoring event: ${meta.event_name}`);
    return;
  }

  const orderStatus = data.attributes.status;
  if (orderStatus !== "paid") {
    functions.logger.info(
      `Order status is "${orderStatus}", not "paid". Ignoring.`,
    );
    return;
  }

  const userId = meta.custom_data?.user_id;
  if (!userId) {
    const err = "Webhook is missing user_id in custom_data.";
    functions.logger.error(err, {meta});
    throw new Error(err);
  }

  await admin.auth().setCustomUserClaims(userId, {premium: true});
  functions.logger.info(
    `Successfully granted premium access to user: ${userId}`,
  );
}

/**
 * Handles incoming webhook requests from Lemon Squeezy.
 * This is the main entry point for the Cloud Function.
 *
 * @param {functions.https.Request} request The Express-like request object.
 * @param {functions.Response} response The Express-like response object.
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
      verifyWebhookSignature(request, webhookSecret.value());
      await processOrderCreated(request.body);
      response.status(200).send("Webhook processed successfully.");
    } catch (error) {
      functions.logger.error("Error processing webhook:", error);
      if (error instanceof Error) {
        const isAuthError = error.message.includes("Invalid signature");
        const isDataError = error.message.includes("user_id");
        const statusCode = isAuthError ? 401 : isDataError ? 400 : 500;
        response.status(statusCode).send(error.message);
      } else {
        response.status(500).send("An unknown error occurred.");
      }
    }
  },
);
