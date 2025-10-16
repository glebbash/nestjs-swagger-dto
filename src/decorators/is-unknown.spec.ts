import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../../tests/helpers';
import { IsUnknown } from '../nestjs-swagger-dto';

describe('IsUnknown', () => {
  describe('single (required, non nullable)', () => {
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

    it('transforms to plain', async () => {
      const dto = make(Test, { unknownField: true });
      expect(output(dto)).toStrictEqual({ unknownField: true });
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

    it('rejects null and undefined', async () => {
      expect(await input(Test, { unknownField: null })).toStrictEqual(
        Result.err('unknownField should not be null or undefined'),
      );
      expect(await input(Test, {})).toStrictEqual(
        Result.err('unknownField should not be null or undefined'),
      );
    });
  });

  describe('single (required, nullable)', () => {
    class Test {
      @IsUnknown({ nullable: true })
      unknownField!: unknown;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
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
          required: ['unknownField'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { unknownField: true });
      expect(output(dto)).toStrictEqual({ unknownField: true });
    });

    it('accepts anything except undefined', async () => {
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
      expect(await input(Test, { unknownField: null })).toStrictEqual(
        Result.ok(make(Test, { unknownField: null })),
      );
    });

    it('rejects undefined', async () => {
      expect(await input(Test, {})).toStrictEqual(
        Result.err('unknownField should not be null or undefined'),
      );
    });
  });

  describe('single (optional, nullable)', () => {
    class Test {
      @IsUnknown({ nullable: true, optional: true })
      unknownField?: unknown;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
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

    it('transforms to plain', async () => {
      const dto = make(Test, { unknownField: true });
      expect(output(dto)).toStrictEqual({ unknownField: true });
    });

    it('accepts anything', async () => {
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
      expect(await input(Test, { unknownField: null })).toStrictEqual(
        Result.ok(make(Test, { unknownField: null })),
      );
      expect(await input(Test, { unknownField: undefined })).toStrictEqual(
        Result.ok(make(Test, {})),
      );
    });
  });
});
