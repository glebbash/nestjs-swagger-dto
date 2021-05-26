import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsObject } from '../nestjs-swagger-dto';

describe('IsObject', () => {
  describe('single', () => {
    class Test {
      @IsObject()
      objectField!: Record<string, unknown>;
    }

    it('accepts objects', async () => {
      expect(await transform(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.ok(createDto(Test, { objectField: { a: 1 } }))
      );
      expect(await transform(Test, { objectField: {} })).toStrictEqual(
        Result.ok(createDto(Test, { objectField: {} }))
      );
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
        expect(await transform(Test, testValue)).toStrictEqual(
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

      expect(await transform(Test, { objectField: { a: 1, b: 2, c: 3 } })).toStrictEqual(
        Result.ok(createDto(Test, { objectField: { a: 1, b: 2, c: 3 } }))
      );
      expect(await transform(Test, { objectField: { a: 1 } })).toStrictEqual(
        Result.err('objectField must have at least 3 properties')
      );
      expect(await transform(Test, { objectField: false })).toStrictEqual(
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
      expect(await transform(Test, { objectField: [{ a: 1 }, { b: 2 }, { c: 3 }] })).toStrictEqual(
        Result.ok(createDto(Test, { objectField: [{ a: 1 }, { b: 2 }, { c: 3 }] }))
      );
      expect(await transform(Test, { objectField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { objectField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { objectField: true })).toStrictEqual(
        Result.err('each value in objectField must be an object')
      );
      expect(await transform(Test, { objectField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('each value in objectField must be an object')
      );
    });
  });
});
