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
