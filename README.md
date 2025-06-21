# VINscribe - AI-Powered Vehicle Documentation

This is a Next.js application built in Firebase Studio. VINscribe leverages Generative AI to automate the creation, validation, and management of essential vehicle documents like VIN labels, NVIS certificates, and Bills of Sale.

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

### Environment Variables

This application uses Firebase for authentication. To enable login and other authenticated features, you need to create a `.env` file in the root of the project and add your Firebase project credentials.

Create a `.env` file and add the following variables:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

You can find these values in your Firebase project's settings. If these are not provided, authentication features will be disabled.

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
