import { Scope } from 'types/scope';

export function verifyScopes(scopes: string[]): boolean {
  return scopes.every((maybeScope: string) => isValidScope(maybeScope));
}

function isValidScope(maybeScope: string): maybeScope is Scope {
  return new Set(Object.values(Scope)).has(maybeScope as Scope);
}
