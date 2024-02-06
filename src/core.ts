import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, ValidateIf } from 'class-validator';

export type PropertyOptions<T, CustomOptions = Record<string, never>> = BasePropertyOptions &
  CustomOptions &
  (SingularPropertyOptions<T> | ArrayPropertyOptions<T>);

export type BasePropertyOptions = {
  name?: string;
  optional?: true;
  description?: string;
  deprecated?: true;
  nullable?: true;
};

export type SingularPropertyOptions<T> = {
  example?: T;
  default?: T;
  isArray?: undefined;
};

export type ArrayPropertyOptions<T> = {
  example?: T[];
  default?: T[];
  isArray: true | { minLength?: number; maxLength?: number; length?: number };
};

export const noop = (): void => undefined;

export const compose = <T, CustomOptions>(
  apiPropertyOptions: ApiPropertyOptions,
  {
    isArray,
    nullable,
    example,
    optional,
    description,
    deprecated,
    default: def,
    name,
  }: PropertyOptions<T, CustomOptions>,
  ...decorators: PropertyDecorator[]
): PropertyDecorator => {
  const isArrayObj = typeof isArray === 'object' ? isArray : {};
  const length = isArrayObj.length;
  const minLength = length ?? isArrayObj.minLength;
  const maxLength = length ?? isArrayObj.maxLength;

  return applyDecorators(
    ...decorators,
    Expose({ name }),
    optional ? ValidateIf((_, v) => v !== undefined) : noop,
    nullable ? ValidateIf((_, v) => v !== null) : noop,
    !!isArray ? IsArray() : noop,
    minLength ? ArrayMinSize(minLength) : noop,
    maxLength ? ArrayMaxSize(maxLength) : noop,
    def !== undefined ? Transform(({ value }) => (value === undefined ? def : value)) : noop,
    ApiProperty({
      ...apiPropertyOptions,
      minItems: minLength,
      maxItems: maxLength,
      ...(nullable && { nullable }),
      isArray: !!isArray,
      name,
      description,
      deprecated,
      example,
      default: def,
      required: !optional,
    }),
  );
};

function applyDecorators(...decorators: PropertyDecorator[]): PropertyDecorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey);
    }
  };
}
