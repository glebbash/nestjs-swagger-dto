import { TransformationType, TransformFnParams } from 'class-transformer';
import { IsDate as IsDateCV, isDateString } from 'class-validator';

import { compose, PropertyOptions } from '../core';
import { TransformHandlingOptional } from './utils/transform-handling-optional';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// TODO: array support
export const IsDate = ({
  format,
  ...base
}: Omit<PropertyOptions<Date, { format: 'date' | 'date-time' }>, 'isArray'>): PropertyDecorator =>
  compose(
    { type: 'string', format },
    base,
    TransformHandlingOptional(base, format === 'date' ? transformDate : transformDateTime),
    IsDateCV({ message: ({ value }) => value?.message })
  );

function transformDate({ key, value, type }: TransformFnParams) {
  if (type === TransformationType.CLASS_TO_PLAIN) {
    return value.toISOString().split('T')[0];
  }

  if (!dateRegex.test(value)) {
    return new Error(`${key} is not formatted as \`yyyy-mm-dd\``);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Error(`${key} is not a valid Date`);
  }

  return date;
}

function transformDateTime({ key, value, type }: TransformFnParams) {
  if (type === TransformationType.CLASS_TO_PLAIN) {
    return value.toISOString();
  }

  if (!isDateString(value, { strict: true })) {
    return new Error(`${key} is not ISO8601 format`);
  }

  return new Date(value);
}
