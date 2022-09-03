/** Creates a random string. Useful for using as a cache token. */
export function createCacheToken() {
  return random11CharString() + random11CharString();
}

function random11CharString() {
  // See https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript for details.
  return Math.random().toString(36).slice(2);
}
