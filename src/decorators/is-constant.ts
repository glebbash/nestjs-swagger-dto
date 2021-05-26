import { Equals } from 'class-validator';

import { Base, compose } from '../core';

export const IsConstant = <T>({ value, ...base }: Base<T> & { value: T }): PropertyDecorator =>
  compose({ enum: [value] }, base, Equals(value, { each: !!base.isArray }));
