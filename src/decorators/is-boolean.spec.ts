import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsBoolean } from '../nestjs-swagger-dto';

describe('IsBoolean', () => {
  describe('single', () => {
    class Test {
      @IsBoolean()
      booleanField!: boolean;
    }

    it('accepts booleans', async () => {
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: false })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
      );
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
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('stringified', () => {
    class Test {
      @IsBoolean({ stringified: true })
      booleanField!: boolean;
    }

    it('accepts boolean strings and booleans', async () => {
      expect(await transform(Test, { booleanField: 'true' })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: 'false' })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
      );
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: false })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
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
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('optional', () => {
    class Test {
      @IsBoolean({ optional: true })
      booleanField?: boolean;
    }

    it('accepts boolean and undefined', async () => {
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: false })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
      );
      expect(await transform(Test, {})).toStrictEqual(Result.ok(createDto(Test, {})));
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
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('nullable', () => {
    class Test {
      @IsBoolean({ nullable: true })
      booleanField!: boolean | null;
    }

    it('accepts boolean and null', async () => {
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: false })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
      );
      expect(await transform(Test, { booleanField: null })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: null }))
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
        {},
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('nullable and optional', () => {
    class Test {
      @IsBoolean({ optional: true, nullable: true })
      booleanField?: boolean | null;
    }

    it('accepts boolean and null and undefined', async () => {
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: true }))
      );
      expect(await transform(Test, { booleanField: false })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: false }))
      );
      expect(await transform(Test, { booleanField: null })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: null }))
      );
      expect(await transform(Test, {})).toStrictEqual(Result.ok(createDto(Test, {})));
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('array', () => {
    class Test {
      @IsBoolean({ isArray: true })
      booleanField!: boolean[];
    }

    it('accepts boolean arrays', async () => {
      expect(await transform(Test, { booleanField: [true, false] })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: [true, false] }))
      );
      expect(await transform(Test, { booleanField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { booleanField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { booleanField: true })).toStrictEqual(
        Result.err('booleanField must be an array')
      );
      expect(await transform(Test, { booleanField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in booleanField must be a boolean value')
      );
    });
  });
});
