import { Result } from 'true-myth';

import { input, make, output } from '../../tests/helpers';
import { IsBoolean } from '../nestjs-swagger-dto';

describe('IsBoolean', () => {
  describe('single', () => {
    class Test {
      @IsBoolean()
      booleanField!: boolean;
    }

    it('accepts booleans', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
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
      expect(await input(Test, { booleanField: 'true' })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: 'false' })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
      );
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
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
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, {})));
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
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value')
        );
      }
    });
  });

  describe('default', () => {
    class Test {
      @IsBoolean({ optional: true, default: false })
      booleanField?: boolean;
    }

    it('returns specified defaults if value is undefined', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, { booleanField: false })));
    });
  });

  describe('nullable', () => {
    class Test {
      @IsBoolean({ nullable: true })
      booleanField!: boolean | null;
    }

    it('accepts boolean and null', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
      );
      expect(await input(Test, { booleanField: null })).toStrictEqual(
        Result.ok(make(Test, { booleanField: null }))
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
        expect(await input(Test, testValue)).toStrictEqual(
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
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true }))
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false }))
      );
      expect(await input(Test, { booleanField: null })).toStrictEqual(
        Result.ok(make(Test, { booleanField: null }))
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, {})));
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
        expect(await input(Test, testValue)).toStrictEqual(
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
      expect(await input(Test, { booleanField: [true, false] })).toStrictEqual(
        Result.ok(make(Test, { booleanField: [true, false] }))
      );
      expect(await input(Test, { booleanField: [] })).toStrictEqual(
        Result.ok(make(Test, { booleanField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.err('booleanField must be an array')
      );
      expect(await input(Test, { booleanField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in booleanField must be a boolean value')
      );
    });
  });
});
