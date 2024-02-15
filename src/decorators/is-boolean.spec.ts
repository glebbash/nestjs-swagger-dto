import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../../tests/helpers';
import { IsBoolean } from '../nestjs-swagger-dto';

describe('IsBoolean', () => {
  describe('normal', () => {
    class Test {
      @IsBoolean()
      booleanField!: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
            },
          },
          required: ['booleanField'],
        },
      });
    });

    it('accepts booleans', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: true });
      expect(output(dto)).toStrictEqual({ booleanField: true });
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
        { booleanField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value'),
        );
      }
    });
  });

  describe('stringified', () => {
    class Test {
      @IsBoolean({ stringified: true })
      booleanField!: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
            },
          },
          required: ['booleanField'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: true });
      expect(output(dto)).toStrictEqual({ booleanField: 'true' });
    });

    it('accepts boolean strings and booleans', async () => {
      expect(await input(Test, { booleanField: 'true' })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: 'false' })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'True' },
        { booleanField: 'False' },
        { booleanField: 'true ' },
        { booleanField: ' false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
        { booleanField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value'),
        );
      }
    });
  });

  describe('stringified and optional', () => {
    class Test {
      @IsBoolean({ stringified: true, optional: true })
      booleanField?: boolean;
    }

    it('transforms to plain', async () => {
      const dto = make(Test, {});
      expect(output(dto)).toStrictEqual({});
    });

    it('accepts undefined value', async () => {
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, {})));
    });
  });
});
