/**
 * Simulated handoff to an outside identity provider.
 *
 * Everything here stands in for a hosted verification session (Stripe Identity,
 * Persona, Veriff and friends all follow the same shape): the app hands the
 * person over, the provider does the document and liveness check, and only a
 * pass/fail plus a reference code comes back. No image ever reaches this app.
 * Swap `runVerification` for the provider SDK call when a backend exists.
 */

export const VERIFY_PROVIDER = 'Verity ID';

export const VERIFY_STEPS: string[] = [
  `Opening ${VERIFY_PROVIDER}`,
  'Checking your ID document',
  'Matching your live selfie',
  'Sending the result back',
];

const STEP_MS = 900;

const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** The only thing the app keeps from the provider. */
export function verificationReference(): string {
  let code = '';
  for (let index = 0; index < 8; index += 1) {
    code += REFERENCE_ALPHABET[Math.floor(Math.random() * REFERENCE_ALPHABET.length)];
  }
  return `VRT-${code}`;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Walks through the provider's steps, reporting progress, and resolves with the
 * reference code the provider returns.
 */
export async function runVerification(
  onStep: (stepIndex: number) => void,
  isCancelled: () => boolean,
): Promise<string | undefined> {
  for (let index = 0; index < VERIFY_STEPS.length; index += 1) {
    if (isCancelled()) return undefined;
    onStep(index);
    await wait(STEP_MS);
  }
  if (isCancelled()) return undefined;
  return verificationReference();
}
