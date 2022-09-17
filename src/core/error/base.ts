export class FractalSDKError extends Error {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}

export class FractalSDKNetworkError extends FractalSDKError {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKNetworkError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalSDKNetworkError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'A network error occurred';
  }
}
