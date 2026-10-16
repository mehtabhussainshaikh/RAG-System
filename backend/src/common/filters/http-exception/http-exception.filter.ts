import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message: string | string[] = 'Internal server error';

    // Preserve client-facing HTTP errors, including validation messages.
    if (exception instanceof HttpException && statusCode < 500) {
      const body = exception.getResponse();

      message =
        typeof body === 'string'
          ? body
          : ((body as { message?: string | string[] }).message ??
            exception.message);
    }

    if (statusCode >= 500) {
      this.logger.error(
        exception instanceof Error ? exception.stack : 'Unknown server error',
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      data: null,
    });
  }
}