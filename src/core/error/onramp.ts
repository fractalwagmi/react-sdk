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
