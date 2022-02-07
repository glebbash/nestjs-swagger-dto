import { IsObject as IsObjectCV, ValidateBy } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

function validateObjectSize(
  obj: Record<string, unknown> | undefined | null,
  check: (len: number) => boolean
): boolean {
  if (!obj) {
    return true;
  }

  return check(Object.keys(obj).length);
}

export const IsObject = <T extends Record<string, unknown>>({
  message,
  minProperties,
  maxProperties,
  ...base
}: PropertyOptions<
  T,
  {
    message?: string;
    minProperties?: number;
    maxProperties?: number;
  }
> = {}): PropertyDecorator =>
  compose(
    { type: 'object', minProperties, maxProperties },
    base,
    IsObjectCV({ each: !!base.isArray, message }),
    minProperties
      ? ValidateBy({
          name: 'minProperties',
          validator: {
            validate: (v) => validateObjectSize(v, (length) => length >= minProperties),
            defaultMessage: (args) =>
              `${args?.property} must have at least ${minProperties} properties`,
          },
        })
      : noop,
    maxProperties
      ? ValidateBy({
          name: 'maxProperties',
          validator: {
            validate: (v) => validateObjectSize(v, (length) => length <= maxProperties),
            defaultMessage: (args) =>
              `${args?.property} must have at most ${maxProperties} properties`,
          },
        })
      : noop
  );
