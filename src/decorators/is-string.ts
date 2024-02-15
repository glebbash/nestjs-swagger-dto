import {
  IsEmail,
  isISO8601,
  IsString as IsStringCV,
  Length,
  Matches,
  ValidationOptions,
} from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';
import { CustomValidate, CustomValidateOptions } from './utils/custom-validator';

export type { CustomValidateOptions };

export type DateFormat = 'date' | 'date-time';

const dateValidators: Record<DateFormat, CustomValidateOptions<string>> = {
  date: {
    validator: (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !isNaN(new Date(value).getDate()),
    message: ({ property }) => `${property} is not formatted as \`yyyy-mm-dd\` or not a valid Date`,
  },
  'date-time': {
    validator: (value) => isISO8601(value, { strict: true }) && !isNaN(new Date(value).getDate()),
    message: ({ property }) => `${property} is not in a ISO8601 format.`,
  },
};

export const IsString = ({
  maxLength,
  minLength,
  pattern,
  canBeEmpty,
  isEmail,
  isDate,
  customValidate,
  ...base
}: PropertyOptions<
  string,
  {
    canBeEmpty?: true;
    maxLength?: number;
    minLength?: number;
    pattern?: { regex: RegExp; message?: ValidationOptions['message'] };
    isEmail?: true;
    isDate?: { format: DateFormat };
    customValidate?: CustomValidateOptions;
  }
> = {}): PropertyDecorator =>
  compose(
    {
      type: 'string',
      minLength,
      maxLength,
      ...(isEmail && { format: 'email' }),
      ...(isDate && { format: isDate.format }),
      pattern: pattern?.regex?.toString()?.slice(1, -1), // removes trailing slashes
    },
    base,
    IsStringCV({ each: !!base.isArray }),
    canBeEmpty || minLength !== undefined || maxLength !== undefined
      ? Length(minLength ?? 0, maxLength, { each: !!base.isArray })
      : noop,
    isEmail ? IsEmail(undefined, { each: !!base.isArray }) : noop,
    pattern ? Matches(pattern.regex, { message: pattern.message, each: !!base.isArray }) : noop,
    isDate ? CustomValidate(dateValidators[isDate.format], { each: !!base.isArray }) : noop,
    customValidate ? CustomValidate(customValidate, { each: !!base.isArray }) : noop,
  );
