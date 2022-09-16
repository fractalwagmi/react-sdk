import { FractalSDKError } from 'core/error/base';

export class FractalSDKGetCoinsUnknownError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKGetCoinsUnknownError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKGetCoinsUnknownError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'Unable to retrieve coins for the user';
  }
}
