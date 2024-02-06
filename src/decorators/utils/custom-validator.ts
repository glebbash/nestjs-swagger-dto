import { ValidateBy, ValidationArguments, ValidationOptions } from 'class-validator';

export type CustomValidateOptions<T = unknown> = {
  validator: (value: T, args: ValidationArguments) => boolean;
  message: string | ((validationArguments: ValidationArguments) => string);
};

export function CustomValidate<T = unknown>(
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
