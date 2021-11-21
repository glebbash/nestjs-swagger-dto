import { Transform } from 'class-transformer';
import { IsDate as IsDateCV, isDateString } from 'class-validator';

import { compose, PropertyOptions } from '../core';

const crudeDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// TODO: array support
export const IsDate = ({
  format,
  ...base
}: Omit<PropertyOptions<Date, { format: 'date' | 'date-time' }>, 'isArray'>): PropertyDecorator =>
  compose(
    { type: 'string', format },
    base,
    format === 'date'
      ? Transform(({ key, value }) => {
          if (!crudeDateRegex.test(value)) {
            return new Error(`${key} is not formatted as \`yyyy-mm-dd\``);
          }

          const date = new Date(value);
          if (isNaN(date.getTime())) {
            return new Error(`${key} is not a valid Date`);
          }

          return date;
        })
      : Transform(({ key, value }) => {
          if (!isDateString(value, { strict: true })) {
            return new Error(`${key} is not ISO8601 format`);
          }

          return new Date(value);
        }),
    IsDateCV({ message: ({ value }) => value.message })
  );
