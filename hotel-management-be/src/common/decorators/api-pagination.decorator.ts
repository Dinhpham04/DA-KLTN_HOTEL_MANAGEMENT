import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

/**
 * Swagger decorator for paginated endpoints.
 * Adds page, limit, orderBy, order query params to docs.
 */
export function ApiPagination() {
  return applyDecorators(
    ApiQuery({ name: 'page', required: false, type: Number, example: 1 }),
    ApiQuery({ name: 'limit', required: false, type: Number, example: 20 }),
    ApiQuery({ name: 'orderBy', required: false, type: String }),
    ApiQuery({
      name: 'order',
      required: false,
      enum: ['asc', 'desc'],
      example: 'desc',
    }),
  );
}
