import { IsIn } from 'class-validator';

import { compose, PropertyOptions } from '../core';

export type EnumValue<T extends number | string> = T[] | Record<string, T>;
export type EnumOptions<T extends number | string> =
  | { raw: EnumValue<T> }
  | { name: string; values: EnumValue<T> }
  | (() => EnumValue<T>);

/**
 * Usage:
 * ```ts
 * enum OneOrTwo { One = 1, Two = 2, }
 * IsEnum({ enum: () => OneOrTwo })
 *
 * const OneOrTwo = [1, 2];
 * IsEnum({ enum: () => OneOrTwo })
 *
 * IsEnum({ enum: { name: 'OneOrTwo', values: [1, 2] } })
 *
 * IsEnum({ enum: { raw: [1, 2] } }) // Will not create a new type
 * ```
 *
 * Note: Enum name is extracted from the string representation
 * of lambda function excluding `() => ` part
 */
export const IsEnum = <T extends number | string>({
  enum: enumOptions,
  ...base
}: PropertyOptions<T, { enum: EnumOptions<T> }>): PropertyDecorator => {
  const { enumValues, enumName } = getEnumNameAndValues(enumOptions);

  const enumValuesArray = Object.values(enumValues);

  return compose(
    { type: typeof enumValuesArray[0], enum: enumValuesArray, enumName },
    base,
    IsIn(enumValuesArray, { each: !!base.isArray })
  );
};

function getEnumNameAndValues<T extends number | string>(
  e: EnumOptions<T>
): {
  enumValues: T[] | Record<string, T>;
  enumName?: string;
} {
  if ('raw' in e) {
    return { enumValues: e.raw };
  }

  if (typeof e !== 'function') {
    return { enumValues: e.values, enumName: e.name };
  }

  return { enumValues: e(), enumName: getEnumNameFromFunction(e) };
}

function getEnumNameFromFunction(e: () => unknown) {
  const enumName = e.toString().split('=>')[1].trim();

  if (!/^\w+$/.test(enumName)) {
    throw new Error(`Invalid enum name: ${enumName}`);
  }

  return enumName;
}
