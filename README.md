# DocuHaul - AI-Powered Vehicle Documentation

This is a Next.js application built in Firebase Studio. DocuHaul leverages Generative AI to automate the creation, validation, and management of essential vehicle documents like VIN labels, NVIS certificates, and Bills of Sale.

## Getting Started

To run the application locally, you first need to install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:6000](http://localhost:6000) with your browser to see the result.

### Environment Setup

#### Client-Side Firebase Setup (for Auth UI)

This application uses the Firebase client SDK for authentication features like login and sign-up.

Create a `.env` file in the root of the project and add the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can find these values in your Firebase project's settings. If these are not provided, authentication features will be disabled.

#### Server-Side Firebase Admin Setup (for AI Flows)

The application uses the Firebase Admin SDK for secure server-side actions (like validating user tokens in AI flows). For this to work in your local environment, you need to provide service account credentials. The deployed application on App Hosting uses Application Default Credentials automatically, so this setup is only for **local development**.

1.  **Generate a Service Account Key:**
    *   Go to your Firebase Project Settings > Service accounts.
    *   Select "Node.js" and click "Generate new private key".
    *   A JSON file will be downloaded. Save it securely in your project, for example, at the root of the project. **Do not commit this file to version control.**

2.  **Set the Environment Variable:**
    *   Create a new file named `.env.local` in the root of your project. Next.js automatically loads this file for local development.
    *   Add the following line to `.env.local`, replacing the path with the actual path to your key file:
        ```env
        GOOGLE_APPLICATION_CREDENTIALS=./your-service-account-key-file.json
        ```

3.  **IMPORTANT: Secure Your Credentials:**
    *   The service account key file is highly sensitive. You must ensure it is not committed to your Git repository.
    *   We strongly recommend creating a `.gitignore` file in your project root if you don't have one, and adding the following lines to it:
        ```
        # Local environment variables
        .env.local

        # Firebase service account keys
        *.json
        ```
        
#### Payments and Premium Access (Lemon Squeezy)

This application is set up to handle premium feature access via payments through Lemon Squeezy. A Cloud Function listens for webhook events to grant users a `premium` role.

**Local Setup & Deployment:**

1.  **Get Checkout Link**:
    *   In your Lemon Squeezy dashboard, create a product and get its Checkout Link.
    *   Add this URL to your `.env` file:
        ```env
        NEXT_PUBLIC_LEMON_SQUEEZY_CHECKOUT_URL=https://your-store.lemonsqueezy.com/checkout/buy/your-variant-id
        ```

2.  **Configure Webhook Secret**:
    *   In your Lemon Squeezy dashboard, go to Settings > Webhooks. Create a new webhook.
    *   The webhook URL will be your deployed Cloud Function URL. You can get this from the Firebase Console after deploying. It will look like: `https://lemonsqueezywebhook-<your-project-hash>-<region>.a.run.app`.
    *   Copy the **Signing Secret** provided by Lemon Squeezy.
    *   Set this secret in your local environment for the Firebase CLI to use during deployment. **Do not commit this to your code.**
        ```bash
        firebase secrets:set LEMONSQUEEZY_WEBHOOK_SECRET
        ```
    *   When prompted, paste your signing secret.

3.  **Deploy the Webhook Function**:
    *   Deploy your functions. The CLI will automatically detect that the `lemonsqueezyWebhook` function requires the `LEMONSQUEEZY_WEBHOOK_SECRET` and grant it access.
        ```bash
        firebase deploy --only functions
        ```

After deployment, ensure the webhook URL in Lemon Squeezy is correct and that it is configured to send `order_created` events.

## Core Features

-   **Smart Docs**: AI-powered generation of NVIS and Bill of Sale documents.
-   **Label Forge**: Create compliant VIN labels with AI-optimized layouts (Premium Feature).
-   **Compliance Check**: Validate documents against regulations.
-   **VIN Decoder**: Break down and understand any 17-digit VIN.

## Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **UI**: [React](https://react.dev/) with [ShadCN UI](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Authentication**: [Firebase Authentication](https://firebase.google.com/docs/auth)
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
