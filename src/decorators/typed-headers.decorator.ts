import {
  createParamDecorator,
  ExecutionContext,
  Headers,
  Type,
  ValidationPipe,
} from '@nestjs/common';

export type TypedHeadersOptions = {
  validationPipe?: ValidationPipe;
};

export const TypedHeaders =
  (options?: TypedHeadersOptions) =>
  // eslint-disable-next-line @typescript-eslint/ban-types
  (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
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

    const validationPipe = options?.validationPipe ?? new ValidationPipe({ transform: true });
    const paramType = types[parameterIndex];

    Headers()(target, propertyKey, parameterIndex);
    HeaderSchema({ paramType, validationPipe })(target, propertyKey, parameterIndex);
  };

const HeaderSchema = createParamDecorator(
  async (
    options: { paramType: Type<unknown>; validationPipe: ValidationPipe },
    ctx: ExecutionContext
  ) => {
    // Extract headers
    const headers = ctx.switchToHttp().getRequest().headers;

    // Validate and transform
    return options.validationPipe.transform(headers, {
      type: 'body',
      metatype: options.paramType,
    });
  }
);
