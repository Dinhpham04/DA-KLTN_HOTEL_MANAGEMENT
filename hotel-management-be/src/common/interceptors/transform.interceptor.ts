import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode as number;

    return next.handle().pipe(
      map((data) => {
        // Flatten paginated responses: { items, meta } → { data: items, meta }
        if (data && typeof data === 'object' && 'items' in data && 'meta' in data) {
          const { items, meta } = data as { items: unknown; meta: unknown };
          return {
            statusCode,
            message: 'success',
            data: items,
            meta,
            timestamp: new Date().toISOString(),
          } as ApiResponse<T>;
        }

        return {
          statusCode,
          message: 'success',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
