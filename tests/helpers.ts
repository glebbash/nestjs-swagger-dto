import { INestApplication, Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { ClassConstructor, instanceToPlain, plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { Result } from 'true-myth';

export function make<T, D extends T>(cls: ClassConstructor<T>, object: D): D {
  return Object.assign(new cls() as never, object);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function input<T extends Record<string, any>>(
  cls: ClassConstructor<T>,
  object: unknown,
): Promise<Result<T, string>> {
  const res = plainToClass(cls, object, { exposeUnsetFields: false });
  const errors = await validate(res, {
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
  });
  return errors.length === 0 ? Result.ok(res) : Result.err(getValidationError(errors[0]));
}

export function output<T>(instance: T): T {
  return instanceToPlain(instance, {
    strategy: 'exposeAll',
    excludeExtraneousValues: true,
    exposeUnsetFields: false,
  }) as T;
}

function getValidationError(error: ValidationError): string {
  return error.constraints
    ? Object.values(error.constraints)[0]
    : getValidationError((error.children as ValidationError[])[0]);
}

export async function generateSchemas(
  models: Type[],
): Promise<Record<string, SchemaObject | ReferenceObject>> {
  class AppModule {}

  const spec = SwaggerModule.createDocument(
    await NestFactory.create<INestApplication>(AppModule, { logger: false }),
    new DocumentBuilder().build(),
    { extraModels: models },
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return spec.components!.schemas!;
}
