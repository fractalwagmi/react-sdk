import { FractalSDKError } from 'core/error/base';

export class FractalSDKAuthenticationError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKAuthenticationError';
    Object.setPrototypeOf(this, FractalSDKAuthenticationError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'The user is not properly authenticated';
  }
}
