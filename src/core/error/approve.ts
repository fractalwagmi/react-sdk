import { FractalSDKError } from 'core/error';

export class FractalSDKApprovalDeniedError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKApprovalDeniedError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKApprovalDeniedError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'The user denied the project access to their information';
  }
}

/** Occurs when an approval flow is still occurring and a new one is requested. */
export class FractalSDKApprovalOccurringError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKApprovalOccurringError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKApprovalOccurringError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'Please complete the pending request to approve or deny the transaction.';
  }
}
