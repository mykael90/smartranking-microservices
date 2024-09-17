import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, timeout } from 'rxjs';

@Injectable()
export class TimeOutInterceptor implements NestInterceptor {
  private readonly logger: Logger;
  constructor() {
    this.logger = new Logger(TimeOutInterceptor.name);
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(timeout(30 * 1000));
  }
}
