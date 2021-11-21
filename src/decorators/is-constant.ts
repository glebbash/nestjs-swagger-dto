import { Equals } from 'class-validator';

import { compose, PropertyOptions } from '../core';

export const IsConstant = <T>({
  value,
  ...base
}: PropertyOptions<T, { value: T }>): PropertyDecorator =>
  compose({ enum: [value] }, base, Equals(value, { each: !!base.isArray }));
