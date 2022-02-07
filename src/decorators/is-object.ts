import { IsObject as IsObjectCV, ValidateBy } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

function validateObjectSize(
  obj: Record<string, unknown> | undefined | null,
  check: (len: number) => boolean,
  optional = true
): boolean {
  if (!obj) {
    return optional;
  }

  const { length } = Object.keys(obj);
  return check(length);
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
    { type: 'object', minProperties },
    base,
    IsObjectCV({ each: !!base.isArray, message }),
    minProperties
      ? ValidateBy({
          name: 'minProperties',
          validator: {
            validate: (v) =>
              validateObjectSize(
                v,
                (length) => length >= minProperties,
                base.optional || base.nullable
              ),
            defaultMessage: (args) =>
              `${args?.property} must have at least ${minProperties} properties`,
          },
        })
      : noop,
    maxProperties
      ? ValidateBy({
          name: 'maxProperties',
          validator: {
            validate: (v) =>
              validateObjectSize(
                v,
                (length) => length <= maxProperties,
                base.optional || base.nullable
              ),
            defaultMessage: (args) =>
              `${args?.property} must have at most ${maxProperties} properties`,
          },
        })
      : noop
  );
