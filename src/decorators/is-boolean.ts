import { Transform } from 'class-transformer';
import { IsBoolean as IsBooleanCV } from 'class-validator';

import { Base, compose } from '../core';

export const IsBoolean = ({
  stringified,
  ...base
}: Base<boolean> & { stringified?: true } = {}): PropertyDecorator =>
  compose(
    { type: 'boolean' },
    base,
    IsBooleanCV({ each: !!base.isArray }),
    ...(stringified
      ? [
          Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value), {
            toClassOnly: true,
          }),
          Transform(({ value }) => (value === undefined ? value : `${value}`), {
            toPlainOnly: true,
          }),
        ]
      : [])
  );
