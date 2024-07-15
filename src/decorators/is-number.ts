import { Transform } from 'class-transformer';
import { IsNumber as IsNumberCV, isNumberString, Max, Min } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

export type IsNumberProps = {
  min?: number;
  max?: number;
  /** Will convert number strings into numbers. Useful for `@Query` DTOs */
  stringified?: true;
} & (
  | {
      type?: undefined;
      format?: 'float' | 'double';
    }
  | {
      type: 'integer';
      format?: 'int32' | 'int64';
    }
);

/**
 * *NOTE*: If type is not set it defaults to number
 *
 * *NOTE*: `format` is only used for OpenAPI spec
 *
 * **WARNING**: Setting `type: 'integer'` will not convert floats to integers during `classToPlain`
 */
export const IsNumber = ({
  min,
  max,
  stringified,
  type,
  format,
  ...base
}: PropertyOptions<number, IsNumberProps> = {}): PropertyDecorator =>
  compose(
    { type: type ?? 'number', format, minimum: min, maximum: max },
    base,
    IsNumberCV({ ...(type === 'integer' && { maxDecimalPlaces: 0 }) }, { each: !!base.isArray }),
    stringified ? Transform(({ value }) => (isNumberString(value) ? Number(value) : value)) : noop,
    min !== undefined ? Min(min, { each: !!base.isArray }) : noop,
    max !== undefined ? Max(max, { each: !!base.isArray }) : noop,
  );
