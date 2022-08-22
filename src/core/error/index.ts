export class FractalError extends Error {
  name: string;
  constructor(message: string) {
    super(message);
    this.name = 'FractalError';

    // 👇️ because we are extending a built-in class
    Object.setPrototypeOf(this, FractalError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'Something went wrong: ' + this.message;
  }
}
