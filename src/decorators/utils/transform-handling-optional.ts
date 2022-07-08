import { Transform, TransformFnParams } from 'class-transformer';

export function TransformHandlingOptional(
  config: { optional?: true; nullable?: true },
  transform: (params: TransformFnParams) => unknown
) {
  return Transform((params: TransformFnParams) => {
    if (config.optional && params.value === undefined) {
      return params.value;
    }

    if (config.nullable && params.value === null) {
      return params.value;
    }

    if (params.value === null || params.value === undefined) {
      return new Error(`${params.key} does not exist`);
    }

    return transform(params);
  });
}
