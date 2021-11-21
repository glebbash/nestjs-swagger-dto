import { Transform } from 'class-transformer';
import { IsNumber as IsNumberCV, isNumberString, Max, Min } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

export const IsNumber = ({
  min,
  max,
  stringified,
  ...base
}: PropertyOptions<
  number,
  { min?: number; max?: number; stringified?: true }
> = {}): PropertyDecorator =>
  compose(
    { type: 'number', minimum: min, maximum: max },
    base,
    IsNumberCV(undefined, { each: !!base.isArray }),
    stringified ? Transform(({ value }) => (isNumberString(value) ? Number(value) : value)) : noop,
    min !== undefined ? Min(min, { each: !!base.isArray }) : noop,
    max !== undefined ? Max(max, { each: !!base.isArray }) : noop
  );
