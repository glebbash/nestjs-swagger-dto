import { IsDefined } from 'class-validator';

import { BasePropertyOptions, compose } from '../core';

export const IsUnknown = ({
  ...base
}: BasePropertyOptions & {
  example?: unknown;
  default?: unknown;
} = {}): PropertyDecorator =>
  compose(
    {
      oneOf: [
        { type: 'string' },
        { type: 'number' },
        { type: 'integer' },
        { type: 'boolean' },
        { type: 'array' },
        { type: 'object' },
      ],
    },
    base,
    IsDefined(),
  );
