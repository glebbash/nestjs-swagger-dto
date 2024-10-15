import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../../tests/helpers';
import { IsUnknown } from '../nestjs-swagger-dto';

describe('IsUnknown', () => {
  describe('single', () => {
    class Test {
      @IsUnknown()
      unknownField!: unknown;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            unknownField: {
              oneOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'integer' },
                { type: 'boolean' },
                { type: 'array' },
                { type: 'object' },
              ],
            },
          },
          required: ['unknownField'],
        },
      });
    });

    it('generates correct schema (nullable)', async () => {
      class TestNullable {
        @IsUnknown({ nullable: true, optional: true })
        unknownField?: unknown;
      }

      expect(await generateSchemas([TestNullable])).toStrictEqual({
        TestNullable: {
          type: 'object',
          properties: {
            unknownField: {
              oneOf: [
                { type: 'string', nullable: true },
                { type: 'number', nullable: true },
                { type: 'integer', nullable: true },
                { type: 'boolean', nullable: true },
                { type: 'array', nullable: true },
                { type: 'object', nullable: true },
              ],
            },
          },
        },
      });
    });

    it('accepts anything except null and undefined', async () => {
      expect(await input(Test, { unknownField: false })).toStrictEqual(
        Result.ok(make(Test, { unknownField: false })),
      );
      expect(await input(Test, { unknownField: 123 })).toStrictEqual(
        Result.ok(make(Test, { unknownField: 123 })),
      );
      expect(await input(Test, { unknownField: 'abc' })).toStrictEqual(
        Result.ok(make(Test, { unknownField: 'abc' })),
      );
      expect(await input(Test, { unknownField: [] })).toStrictEqual(
        Result.ok(make(Test, { unknownField: [] })),
      );
      expect(await input(Test, { unknownField: {} })).toStrictEqual(
        Result.ok(make(Test, { unknownField: {} })),
      );
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { unknownField: true });
      expect(output(dto)).toStrictEqual({ unknownField: true });
    });

    it('rejects null and undefined by default', async () => {
      expect(await input(Test, { unknownField: null })).toStrictEqual(
        Result.err('unknownField should not be null or undefined'),
      );
      expect(await input(Test, {})).toStrictEqual(
        Result.err('unknownField should not be null or undefined'),
      );
    });
  });
});
