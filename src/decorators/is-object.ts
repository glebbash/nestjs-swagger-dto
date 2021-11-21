import { IsObject as IsObjectCV, ValidateBy } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

export const IsObject = <T extends Record<string, unknown>>({
  message,
  minProperties,
  ...base
}: PropertyOptions<
  T,
  {
    message?: string;
    minProperties?: number;
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
            validate: (v) => Object.keys(v).length >= minProperties,
            defaultMessage: (args) =>
              `${args?.property} must have at least ${minProperties} properties`,
          },
        })
      : noop
  );
