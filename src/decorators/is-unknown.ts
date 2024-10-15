import { IsDefined } from 'class-validator';

import { BasePropertyOptions, compose } from '../core';

export const IsUnknown = ({
  nullable,
  ...base
}: BasePropertyOptions & {
  example?: unknown;
  default?: unknown;
} = {}): PropertyDecorator =>
  compose(
    {
      oneOf: [
        { type: 'string', ...(nullable && { nullable }) },
        { type: 'number', ...(nullable && { nullable }) },
        { type: 'integer', ...(nullable && { nullable }) },
        { type: 'boolean', ...(nullable && { nullable }) },
        { type: 'array', ...(nullable && { nullable }) },
        { type: 'object', ...(nullable && { nullable }) },
      ],
    },
    base,
    IsDefined(),
  );
