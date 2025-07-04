import { CustomError } from './custom-error';

export class ForbiddenError extends CustomError {
  statusCode: number = 403;
  message: string = 'you are not allowed to access this';
  constructor(public forbaddinMessage?: string) {
    super(forbaddinMessage || 'you are not allowed to access this');

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors(): { message: string; fields?: string }[] {
    return [{ message: this.message || 'you are not allowed to access this' }];
  }
}
