import { IsEnum as IsEnumCV, IsIn } from 'class-validator';

import { Base, compose } from '../core';

export const IsEnum = <T>({
  enum: e,
  ...base
}: Base<T> & { enum: T[] | Record<string, T> }): PropertyDecorator =>
  compose(
    { type: 'enum', enum: e },
    base,
    Array.isArray(e) ? IsIn(e, { each: !!base.isArray }) : IsEnumCV(e, { each: !!base.isArray })
  );
