export enum ErrorTypes {
  VALIDATION = 'ValidationError',
  AUTHENTICATION = 'AuthenticationError',
  AUTHORIZATION = 'AuthorizationError',
  NOT_FOUND = 'NotFoundError',
  DUPLICATE = 'DuplicateError',
  SERVER = 'ServerError',
  DATABASE = 'DatabaseError',
  THIRD_PARTY = 'ThirdPartyError',
  REQUEST = 'RequestError',
  PRECONDITION_FAILED = 'PreconditionFailedError',
}

export class AppError extends Error {
  statusCode: number;
  status: 'error' | 'fail';
  isOperational: boolean;
  errorType: ErrorTypes;
  errors?: string[];

  constructor(
    message: string,
    statusCode: number,
    errorType: ErrorTypes = ErrorTypes.SERVER,
    isOperational = true,
    errors?: string[],
  ) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = isOperational;
    this.errorType = errorType;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }

  // Static factory methods for common error types
  static badRequest(message = 'Bad request', errors?: string[]) {
    return new AppError(message, 400, ErrorTypes.REQUEST, true, errors);
  }

  static validation(message = 'Validation error', errors?: string[]) {
    return new AppError(message, 400, ErrorTypes.VALIDATION, true, errors);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new AppError(message, 401, ErrorTypes.AUTHENTICATION);
  }

  static forbidden(message = 'Forbidden') {
    return new AppError(message, 403, ErrorTypes.AUTHORIZATION);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404, ErrorTypes.NOT_FOUND);
  }

  static duplicate(message = 'Duplicate entry') {
    return new AppError(message, 409, ErrorTypes.DUPLICATE);
  }

  static database(message = 'Database error') {
    return new AppError(message, 500, ErrorTypes.DATABASE, false);
  }

  static thirdParty(message = 'Third party service error') {
    return new AppError(message, 503, ErrorTypes.THIRD_PARTY, false);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, ErrorTypes.SERVER, false);
  }

  static preconditionFailed(message = 'Precondition failed') {
    return new AppError(message, 412, ErrorTypes.PRECONDITION_FAILED, true);
  }
}
