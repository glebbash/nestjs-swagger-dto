import { ApiPropertyOptions, getSchemaPath } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { compose, PropertyOptions } from '../core';

export type EnumValue<T extends number | string> = T[] | Record<string, T>;
export type EnumOptions<T extends number | string> = Record<string, EnumValue<T>>;

/**
 * Usage:
 * ```ts
 * enum OneOrTwo { One = 1, Two = 2, }
 * IsEnum({ enum: { OneOrTwo } })
 *
 * IsEnum({ enum: { OneOrTwo: [1, 2] } })
 * ```
 */
export const IsEnum = <T extends number | string>({
  enum: enumOptions,
  ...base
}: PropertyOptions<T, { enum: EnumOptions<T> }>): PropertyDecorator => {
  const { enumValues, enumName } = getEnumNameAndValues(enumOptions);

  let apiPropertyOptions: ApiPropertyOptions = {
    type: typeof enumValues[0],
    enum: enumValues,
    enumName,
  };
  // workaround for Nest's @Query handling
  if (typeof base.isArray === 'object' && base.isArray.force) {
    apiPropertyOptions = { type: 'array', items: { $ref: getSchemaPath(enumName) } };
  }

  return compose(apiPropertyOptions, base, IsIn(enumValues, { each: !!base.isArray }));
};

function getEnumNameAndValues<T extends number | string>(
  e: EnumOptions<T>,
): {
  enumValues: T[];
  enumName: string;
} {
  const keys = Object.keys(e);
  if (keys.length !== 1) {
    throw new Error('EnumOptions object should have exactly one key');
  }

  const [enumName] = keys;
  return { enumName, enumValues: Object.values(e[enumName]) };
}
