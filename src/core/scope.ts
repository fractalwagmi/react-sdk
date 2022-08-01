import { Scope } from 'types/scope';

export function verifyScopes(scopes: string[]): boolean {
  return scopes.every((maybeScope: string) => isValidScope(maybeScope));
}

function isValidScope(maybeScope: string) {
  switch (maybeScope) {
    case Scope.ITEMS_READ:
    case Scope.COINS_READ:
    case Scope.IDENTIFY:
      return true;
    default:
      return false;
  }
}
