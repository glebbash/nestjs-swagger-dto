import { ClassConstructor, Type } from 'class-transformer';
import { IsObject, ValidateNested, ValidationArguments } from 'class-validator';
import { noop } from 'rxjs';

import { compose, PropertyOptions } from '../core';

const nestedFieldMessage =
  (isArray: boolean) =>
  ({ property }: ValidationArguments) =>
    isArray
      ? `nested property ${property} must only contain objects`
      : `nested property ${property} must be an object`;

export const IsNested = <T>({
  type,
  ...base
}: PropertyOptions<T, { type: ClassConstructor<T> }>): PropertyDecorator =>
  compose(
    { type },
    base,
    Type(() => type),
    !base.isArray
      ? IsObject({
          message: nestedFieldMessage(!!base.isArray),
        })
      : noop,
    ValidateNested({
      each: !!base.isArray,
      message: nestedFieldMessage(!!base.isArray),
    }),
  );
