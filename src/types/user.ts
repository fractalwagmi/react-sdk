export interface BaseUser {
  /** A user identifier within Fractal. */
  userId: string;
}

export interface User extends BaseUser {
  /** The user's email as configured in Fractal. */
  email?: string;

  /** The user's username as configured in Fractal. */
  username?: string;
}
