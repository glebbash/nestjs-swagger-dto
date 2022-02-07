import { IsObject as IsObjectCV, ValidateBy } from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

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
            validate: (v) => Object.keys(v).length >= minProperties,
            defaultMessage: (args) =>
              `${args?.property} must have at least ${minProperties} properties`,
          },
        })
      : noop,
    maxProperties
      ? ValidateBy({
        name: 'maxProperties',
        validator: {
          validate: (v) => Object.keys(v).length <= maxProperties,
          defaultMessage: (args) =>
            `${args?.property} must have at most ${maxProperties} properties`,
        },
      })
      : noop,
  );
