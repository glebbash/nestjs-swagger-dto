import {
  IsEmail,
  isISO8601,
  IsNotEmpty,
  IsString as IsStringCV,
  Length,
  Matches,
  ValidateBy,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

import { compose, noop, PropertyOptions } from '../core';

export type CustomValidateOptions<T = unknown> = {
  validator: (value: T, args: ValidationArguments) => boolean;
  message: string | ((validationArguments: ValidationArguments) => string);
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
    canBeEmpty?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: { regex: RegExp; message?: ValidationOptions['message'] };
    isEmail?: true;
    isDate?: { format: 'date' | 'date-time' };
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
    canBeEmpty === false ? IsNotEmpty({ each: !!base.isArray }) : noop,
    minLength !== undefined || maxLength !== undefined
      ? Length(minLength ?? 0, maxLength, { each: !!base.isArray })
      : noop,
    isEmail ? IsEmail(undefined, { each: !!base.isArray }) : noop,
    pattern ? Matches(pattern.regex, { message: pattern.message, each: !!base.isArray }) : noop,
    isDate
      ? CustomValidate(
          isDate.format === 'date'
            ? {
                validator: (value) =>
                  typeof value === 'string' &&
                  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
                  !isNaN(new Date(value).getDate()),
                message: ({ property }) =>
                  `${property} is not formatted as \`yyyy-mm-dd\` or not a valid Date`,
              }
            : {
                validator: (value) =>
                  typeof value === 'string' &&
                  isISO8601(value, { strict: true }) &&
                  !isNaN(new Date(value).getDate()),
                message: ({ property }) => `${property} is not in a ISO8601 format.`,
              },
          { each: !!base.isArray },
        )
      : noop,
    customValidate ? CustomValidate(customValidate, { each: !!base.isArray }) : noop,
  );

function CustomValidate<T = unknown>(
  options: CustomValidateOptions<T>,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'CustomValidate',
      constraints: [options],
      validator: {
        validate: options.validator,
        defaultMessage: (args: ValidationArguments) =>
          typeof options.message === 'string' ? options.message : options.message(args),
      },
    },
    validationOptions,
  );
}
