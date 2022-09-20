import { FractalSDKError } from 'core/error/base';

export class FractalSDKGetItemsUnknownError extends FractalSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKGetItemsUnknownError';
    Object.setPrototypeOf(this, FractalSDKGetItemsUnknownError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'An unknown error occured while fetching items. Please try again in a few minutes.';
  }
}

export class FractalSDKBuyItemUnknownError extends FractalSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKBuyItemUnknownError';
    Object.setPrototypeOf(this, FractalSDKBuyItemUnknownError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'An unknown error occured while buying item. Please try again in a few minutes.';
  }
}

export class FractalSDKListItemUnknownError extends FractalSDKError {
  constructor(message: string) {
    super(message);
    this.name = 'FractalSDKListItemUnknownError';
    Object.setPrototypeOf(this, FractalSDKListItemUnknownError.prototype);
  }

  getUserFacingErrorMessage() {
    return 'An unknown error occured while buying item. Please try again in a few minutes.';
  }
}
