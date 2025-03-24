import { Controller, Get, Query } from '@nestjs/common';
import { Result } from 'true-myth';

import { generateSchemas, generateSpec, input, make } from '../../tests/helpers';
import { IsEnum } from '../nestjs-swagger-dto';

describe('IsEnum', () => {
  describe('array enum', () => {
    class Test {
      @IsEnum({ enum: { OneOrTwo: [1, 2] } })
      enumField!: 1 | 2;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        OneOrTwo: {
          enum: [1, 2],
          type: 'number',
        },
        Test: {
          type: 'object',
          properties: {
            enumField: {
              $ref: '#/components/schemas/OneOrTwo',
            },
          },
          required: ['enumField'],
        },
      });
    });

    it('accepts specified enum', async () => {
      expect(await input(Test, { enumField: 1 })).toStrictEqual(
        Result.ok(make(Test, { enumField: 1 })),
      );
      expect(await input(Test, { enumField: 2 })).toStrictEqual(
        Result.ok(make(Test, { enumField: 2 })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { enumField: 'true' },
        { enumField: 'false' },
        { enumField: 0 },
        { enumField: [] },
        { enumField: {} },
        { enumField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('enumField must be one of the following values: 1, 2'),
        );
      }
    });
  });

  describe('object enum', () => {
    enum Enum {
      On = 'On',
      Off = 'Off',
    }

    class Test {
      @IsEnum({ enum: { Enum } })
      enumField!: Enum;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Enum: {
          enum: ['On', 'Off'],
          type: 'string',
        },
        Test: {
          type: 'object',
          properties: {
            enumField: {
              $ref: '#/components/schemas/Enum',
            },
          },
          required: ['enumField'],
        },
      });
    });

    it('accepts specified enum', async () => {
      expect(await input(Test, { enumField: 'On' })).toStrictEqual(
        Result.ok(make(Test, { enumField: Enum.On })),
      );
      expect(await input(Test, { enumField: 'Off' })).toStrictEqual(
        Result.ok(make(Test, { enumField: Enum.Off })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { enumField: true },
        { enumField: 'abc' },
        { enumField: 0 },
        { enumField: [] },
        { enumField: {} },
        { enumField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('enumField must be one of the following values: On, Off'),
        );
      }
    });
  });

  describe('enum name validation', () => {
    it('throws if enum name cannot be extracted', () => {
      expect(() => IsEnum({ enum: {} })).toThrow(
        new Error('EnumOptions object should have exactly one key'),
      );
      expect(() => IsEnum({ enum: { a: [1, 2, 3], b: [3, 4, 5] } })).toThrow(
        new Error('EnumOptions object should have exactly one key'),
      );
    });
  });

  describe('array of enums', () => {
    const AOrB = ['a', 'b'];

    class Test {
      @IsEnum({ enum: { AOrB }, isArray: true })
      enumField!: ('a' | 'b')[];
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        AOrB: {
          enum: ['a', 'b'],
          type: 'string',
        },
        Test: {
          type: 'object',
          properties: {
            enumField: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/AOrB',
              },
            },
          },
          required: ['enumField'],
        },
      });
    });

    it('generates correct schema including minLength and maxLength when used in @Query', async () => {
      enum Flag {
        On = 'On',
        Off = 'Off',
      }

      class TestQuery {
        @IsEnum({
          enum: { Flag },
          isArray: { minLength: 1, maxLength: 2, force: true },
          optional: true,
        })
        enumField?: Flag;
      }

      @Controller('x')
      class AppController {
        @Get()
        someEndpoint(@Query() {}: TestQuery) {}
      }

      const spec = await generateSpec([AppController]);

      expect(spec.paths['/x'].get).toStrictEqual({
        operationId: 'AppController_someEndpoint',
        parameters: [
          {
            in: 'query',
            name: 'enumField',
            required: false,
            schema: {
              items: { $ref: '#/components/schemas/Flag' },
              maxItems: 2,
              minItems: 1,
              type: 'array',
            },
          },
        ],
        responses: { '200': { description: '' } },
      });
    });

    it('accepts enum arrays', async () => {
      expect(await input(Test, { enumField: ['a', 'b'] })).toStrictEqual(
        Result.ok(make(Test, { enumField: ['a', 'b'] })),
      );
      expect(await input(Test, { enumField: [] })).toStrictEqual(
        Result.ok(make(Test, { enumField: [] })),
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { enumField: true })).toStrictEqual(
        Result.err('each value in enumField must be one of the following values: a, b'),
      );
      expect(await input(Test, { enumField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('each value in enumField must be one of the following values: a, b'),
      );
    });
  });
});
