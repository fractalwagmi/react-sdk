import { FractalSDKError } from 'core/error';

export class FractalSDKSignTransactionDeniedError extends FractalSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKSignTransactionDeniedError';

    Object.setPrototypeOf(this, FractalSDKSignTransactionDeniedError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'The request to sign the transaction was denied';
  }
}

export class FractalSDKSignTransactionUnknownError extends FractalSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKSignTransactionUnknownError';

    Object.setPrototypeOf(
      this,
      FractalSDKSignTransactionUnknownError.prototype,
    );
  }

  getUserFacingErrorMessage() {
    return 'An unknown error occured while signing the transaction. Please try again in a few minutes.';
  }
}
