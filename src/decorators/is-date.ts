import { Transform, TransformationType } from 'class-transformer';
import { IsDate as IsDateCV, isDateString } from 'class-validator';

import { compose, PropertyOptions } from '../core';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// TODO: array support
export const IsDate = ({
  format,
  ...base
}: Omit<PropertyOptions<Date, { format: 'date' | 'date-time' }>, 'isArray'>): PropertyDecorator =>
  compose(
    { type: 'string', format },
    base,
    format === 'date' ? TransformDate : TransformDateTime,
    IsDateCV({ message: ({ value }) => value?.message })
  );

const TransformDate = Transform(({ key, value, type }) => {
  if (value === undefined) {
    return new Error(`${key} does not exist`);
  }

  if (type === TransformationType.CLASS_TO_PLAIN) {
    return stripTime(value.toISOString());
  }

  if (!dateRegex.test(value)) {
    return new Error(`${key} is not formatted as \`yyyy-mm-dd\``);
  }

  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return new Error(`${key} is not a valid Date`);
  }

  return date;
});

const TransformDateTime = Transform(({ key, value, type }) => {
  if (value === undefined) {
    return new Error(`${key} does not exist`);
  }

  if (type === TransformationType.CLASS_TO_PLAIN) {
    return value.toISOString();
  }

  if (!isDateString(value, { strict: true })) {
    return new Error(`${key} is not ISO8601 format`);
  }

  return new Date(value);
});

function stripTime(isoDate: string) {
  return isoDate.split('T')[0];
}
