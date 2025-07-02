import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../response/api-response';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    let message = 'Something went wrong';
    let errors = null;

    if (typeof responseMessage === 'string') {
      message = responseMessage;
    } else if (typeof responseMessage === 'object' && responseMessage !== null) {
      message = (responseMessage as any).message || 'Something went wrong';
      errors = (responseMessage as any).message || null;
    }

    response.status(status).json(ApiResponse.error(message, errors));
  }
}

