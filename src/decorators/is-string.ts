import { IsEmail, IsString as IsStringCV, Length, Matches } from 'class-validator';

import { Base, compose, noop } from '../core';

export const IsString = ({
  maxLength,
  minLength,
  pattern,
  canBeEmpty,
  isEmail,
  ...base
}: Base<string> & {
  canBeEmpty?: true;
  maxLength?: number;
  minLength?: number;
  pattern?: { regex: RegExp; message?: string };
  isEmail?: true;
} = {}): PropertyDecorator =>
  compose(
    {
      type: 'string',
      minLength,
      maxLength,
      ...(isEmail && { format: 'email' }),
      pattern: pattern?.regex.toString().slice(1, 1), // removes trailing slashes
    },
    base,
    IsStringCV({ each: !!base.isArray }),
    canBeEmpty || minLength !== undefined || maxLength !== undefined
      ? Length(minLength ?? 0, maxLength, { each: !!base.isArray })
      : noop,
    isEmail ? IsEmail(undefined, { each: !!base.isArray }) : noop,
    pattern ? Matches(pattern.regex, { message: pattern.message, each: !!base.isArray }) : noop
  );
