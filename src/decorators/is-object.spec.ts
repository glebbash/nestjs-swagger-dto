import { Result } from 'true-myth';

import { input, make, output } from '../../tests/helpers';
import { IsObject } from '../nestjs-swagger-dto';

describe('IsObject', () => {
  describe('single', () => {
    class Test {
      @IsObject()
      objectField!: Record<string, unknown>;
    }

    it('accepts objects', async () => {
      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: {} })).toStrictEqual(
        Result.ok(make(Test, { objectField: {} }))
      );
    });

    it('transforms objects', async () => {
      expect(output(make(Test, { objectField: { a: 1 }, b: 2 }))).toStrictEqual({
        objectField: { a: 1 },
      });
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { objectField: 'abc' },
        { objectField: false },
        { objectField: [] },
        { objectField: 0 },
        { objectField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('objectField must be an object')
        );
      }
    });
  });

  describe('properties', () => {
    it('checks minProperties', async () => {
      class Test {
        @IsObject({ minProperties: 3 })
        objectField!: Record<string, unknown>;
      }

      expect(await input(Test, { objectField: { a: 1, b: 2, c: 3 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1, b: 2, c: 3 } }))
      );
      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.err('objectField must have at least 3 properties')
      );
      expect(await input(Test, { objectField: false })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.err('objectField must be an object')
      );
    });

    it('checks maxProperties', async () => {
      class Test {
        @IsObject({ maxProperties: 1 })
        objectField!: Record<string, unknown>;
      }

      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: { a: 1, b: 2 } })).toStrictEqual(
        Result.err('objectField must have at most 1 properties')
      );
      expect(await input(Test, { objectField: false })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.err('objectField must be an object')
      );
    });

    it('works with minProperties && nullable', async () => {
      class Test {
        @IsObject({ minProperties: 1, nullable: true })
        objectField!: Record<string, unknown> | null;
      }

      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.ok(make(Test, { objectField: null }))
      );
    });

    it('works with minProperties && optional', async () => {
      class Test {
        @IsObject({ minProperties: 1, optional: true })
        objectField?: Record<string, unknown>;
      }

      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.ok(make(Test, {}))
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.err('objectField must be an object')
      );
    });

    it('works with maxProperties && nullable', async () => {
      class Test {
        @IsObject({ maxProperties: 1, nullable: true })
        objectField!: Record<string, unknown> | null;
      }

      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.err('objectField must be an object')
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.ok(make(Test, { objectField: null }))
      );
    });

    it('works with maxProperties && optional', async () => {
      class Test {
        @IsObject({ maxProperties: 1, optional: true })
        objectField?: Record<string, unknown>;
      }

      expect(await input(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(make(Test, { objectField: { a: 1 } }))
      );
      expect(await input(Test, { objectField: undefined })).toStrictEqual(
        Result.ok(make(Test, {}))
      );
      expect(await input(Test, { objectField: null })).toStrictEqual(
        Result.err('objectField must be an object')
      );
    });
  });

  describe('array', () => {
    class Test {
      @IsObject({ isArray: true })
      objectField!: Record<string, unknown>[];
    }

    it('accepts object arrays', async () => {
      expect(await input(Test, { objectField: [{ a: 1 }, { b: 2 }, { c: 3 }] })).toStrictEqual(
        Result.ok(make(Test, { objectField: [{ a: 1 }, { b: 2 }, { c: 3 }] }))
      );
      expect(await input(Test, { objectField: [] })).toStrictEqual(
        Result.ok(make(Test, { objectField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { objectField: true })).toStrictEqual(
        Result.err('each value in objectField must be an object')
      );
      expect(await input(Test, { objectField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('each value in objectField must be an object')
      );
    });
  });
});
