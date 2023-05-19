export function createNonce(): string {
  return `${randomString()}${randomString()}${randomString()}`;
}

/** @url https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript */
function randomString(): string {
  return (Math.random() + 1).toString(36).substring(7);
}
