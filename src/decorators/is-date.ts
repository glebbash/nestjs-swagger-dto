import { TransformationType, TransformFnParams } from 'class-transformer';
import { IsDate as IsDateCV, isDateString } from 'class-validator';

import { compose, PropertyOptions } from '../core';
import { TransformHandlingOptional } from './utils/transform-handling-optional';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// TODO: array support
export const IsDate = ({
  format,
  default: def,
  example,
  ...base
}: Omit<PropertyOptions<Date, { format: 'date' | 'date-time' }>, 'isArray'>): PropertyDecorator => {
  const dateTime = format === 'date-time';

  return compose(
    { type: 'string', format },
    { ...base, default: stringify(def, dateTime), example: stringify(example, dateTime) },
    TransformHandlingOptional(base, dateTime ? transformDateTime : transformDate),
    IsDateCV({ message: ({ value }) => value?.message }),
  );
};

function transformDate({ key, value, type }: TransformFnParams) {
  if (type === TransformationType.CLASS_TO_PLAIN) {
    if (typeof value === 'string') {
      return value;
    }

    return dateToString(value);
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
    if (typeof value === 'string') {
      return value;
    }

    return dateTimeToString(value);
  }

  if (!isDateString(value, { strict: true })) {
    return new Error(`${key} is not ISO8601 format`);
  }

  return new Date(value);
}

function stringify(
  value: Date | Date[] | undefined,
  dateTime: boolean,
): string | string[] | undefined {
  if (value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return dateTime ? dateTimeToString(value) : dateToString(value);
  }

  return value.map((v) => stringify(v, dateTime) as string);
}

function dateTimeToString(date: Date): string {
  return date.toISOString();
}

function dateToString(date: Date): string {
  return date.toISOString().split('T')[0];
}
