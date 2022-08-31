export const FRACTAL_DOMAIN = 'fractal.is';
export const FRACTAL_DOMAIN_NON_WWW = 'https://fractal.is';

export enum Events {
  PROJECT_APPROVED = 'PROJECT_APPROVED',
  HANDSHAKE = 'HANDSHAKE',
  HANDSHAKE_ACK = 'HANDSHAKE_ACK',
}

export function validateOrigin(origin: string): boolean {
  return (
    origin === `https://www.${FRACTAL_DOMAIN}` ||
    origin === `https://${FRACTAL_DOMAIN}` ||
    // Enables local testing.
    origin === 'http://localhost:3000'
  );
}
