import { FractalSDKError } from 'core/error/base';

export class FractalSDKOnrampUnknownError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKOnrampUnknownError';
    Object.setPrototypeOf(this, FractalSDKOnrampUnknownError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'The onramp session concluded with an unknown error.';
  }
}

export class FractalSDKOnrampAuthError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKOnrampAuthError';
    Object.setPrototypeOf(this, FractalSDKOnrampAuthError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'You must be signed in to purchase crypto.';
  }
}
