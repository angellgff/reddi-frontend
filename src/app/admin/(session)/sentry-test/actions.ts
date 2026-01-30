"use server";

import * as Sentry from "@sentry/nextjs";

export async function testSentryServerAction() {
  console.log("Testing Sentry Server Action...");
  try {
    throw new Error(
      "Sentry Test: Server Action Error " + new Date().toISOString(),
    );
  } catch (e) {
    Sentry.captureException(e);
    throw e; // Re-throw to be caught by the client
  }
}
