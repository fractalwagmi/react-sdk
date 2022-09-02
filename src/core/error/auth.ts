import { FractalSDKError } from 'core/error';

export class FractalSDKAuthenticationError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKAuthenticationError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKAuthenticationError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'The user is not properly authenticated';
  }
}
