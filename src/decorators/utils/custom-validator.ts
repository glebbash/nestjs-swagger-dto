import { ValidateBy, ValidationArguments, ValidationOptions } from 'class-validator';

export type CustomValidateOptions = {
  validator: (value: unknown, args: ValidationArguments) => boolean;
  message: string | ((validationArguments: ValidationArguments) => string);
};

export function CustomValidate(
  options: CustomValidateOptions,
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'CustomValidate',
      constraints: [options],
      validator: {
        validate: options.validator,
        defaultMessage: (args: ValidationArguments) => {
          const eachPrefix = validationOptions?.each ? 'each value in ' : '';
          const msg = typeof options.message === 'string' ? options.message : options.message(args);
          return eachPrefix + msg;
        },
      },
    },
    validationOptions
  );
}
