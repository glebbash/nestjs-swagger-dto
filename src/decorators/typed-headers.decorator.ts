import {
  BadRequestException,
  createParamDecorator,
  ExecutionContext,
  Headers,
  Type,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validateOrReject, ValidationError } from 'class-validator';

export const TypedHeaders =
  // eslint-disable-next-line @typescript-eslint/ban-types
  () => (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
    const types: Type[] | undefined = Reflect.getOwnMetadata(
      'design:paramtypes',
      target,
      propertyKey,
    );

    if (types === undefined) {
      throw new Error(
        'Type metadata not found. See https://www.typescriptlang.org/docs/handbook/decorators.html#metadata',
      );
    }

    const paramType = types[parameterIndex];
    Headers()(target, propertyKey, parameterIndex);
    HeaderSchema(paramType)(target, propertyKey, parameterIndex);
  };

const HeaderSchema = createParamDecorator(async (value, ctx: ExecutionContext) => {
  // Extract headers
  const headers = ctx.switchToHttp().getRequest().headers;

  // Convert headers to DTO object
  const dto = plainToClass(value, headers, { excludeExtraneousValues: true });

  // Validate
  return validateOrReject(dto).then(
    () => dto,
    (err: ValidationError[]) => {
      throw new BadRequestException(err.map((e) => Object.values(e.constraints as never)).flat());
    },
  );
});
