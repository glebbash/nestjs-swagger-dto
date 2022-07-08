import { Transform, TransformFnParams, TransformOptions } from 'class-transformer';
import { IsDate as IsDateCV, isDateString } from 'class-validator';

import { compose, PropertyOptions } from '../core';

const crudeDateRegex = /^\d{4}-\d{2}-\d{2}$/;

function TransformDate({ key, value }: TransformFnParams): Date | Error {
  if (!crudeDateRegex.test(value)) {
    return new Error(`${key} is not formatted as \`yyyy-mm-dd\``);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Error(`${key} is not a valid Date`);
  }

  return date;
}

function TransformDateTime({ key, value }: TransformFnParams): Date | Error {
  if (!isDateString(value, { strict: true })) {
    return new Error(`${key} is not ISO8601 format`);
  }

  return new Date(value);
}

type TransformFn = (params: TransformFnParams) => any;

function TransformToClass(transformFn: TransformFn, options?: TransformOptions): PropertyDecorator {
  return Transform(transformFn, { ...options, toClassOnly: true });
}

function TransformToPlain(transformFn: TransformFn, options?: TransformOptions): PropertyDecorator {
  return Transform(transformFn, { ...options, toPlainOnly: true });
}

const isDate = (format: 'date' | 'date-time') => format === 'date';

// TODO: array support
/***
 * Date-decorator used for deserializing and serializing dates.
 * @param format Either 'date' or 'date-time'. The value determines what kind of validations and transformations to apply.
 * @param serialize If not set, only input is transformed. If set to `true`, output is a date or date-time formatted string.
 * @param base
 * @constructor
 */
export const IsDate = ({
  format,
  serialize,
  ...base
}: Omit<
  PropertyOptions<Date, { format: 'date' | 'date-time'; serialize?: true }>,
  'isArray'
>): PropertyDecorator => {
  return compose(
    { type: 'string', format },
    base,
    TransformToClass((params) => {
      if (base.optional && !params.value) return undefined;

      return isDate(format) ? TransformDate(params) : TransformDateTime(params);
    }),
    TransformToPlain(({ value }) => {
      if (!serialize) return value;

      if (!value) return undefined;

      const isoDate = value.toISOString();
      return isDate(format) ? isoDate.slice(0, 10) : isoDate;
    }),
    IsDateCV({ message: ({ value }) => value.message })
  );
};
