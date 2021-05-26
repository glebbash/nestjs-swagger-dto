import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsEnum } from '../nestjs-swagger-dto';

describe('IsEnum', () => {
  describe('array enum', () => {
    class Test {
      @IsEnum({ enum: [1, 2] })
      enumField!: 1 | 2;
    }

    it('accepts specified enum', async () => {
      expect(await transform(Test, { enumField: 1 })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: 1 }))
      );
      expect(await transform(Test, { enumField: 2 })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: 2 }))
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
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('enumField must be one of the following values: 1, 2')
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
      @IsEnum({ enum: Enum })
      enumField!: Enum;
    }

    it('accepts specified enum', async () => {
      expect(await transform(Test, { enumField: 'On' })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: Enum.On }))
      );
      expect(await transform(Test, { enumField: 'Off' })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: Enum.Off }))
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
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('enumField must be a valid enum value')
        );
      }
    });
  });

  describe('array', () => {
    class Test {
      @IsEnum({ enum: ['a', 'b'], isArray: true })
      enumField!: ('a' | 'b')[];
    }

    it('accepts enum arrays', async () => {
      expect(await transform(Test, { enumField: ['a', 'b'] })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: ['a', 'b'] }))
      );
      expect(await transform(Test, { enumField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { enumField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { enumField: true })).toStrictEqual(
        Result.err('each value in enumField must be one of the following values: a, b')
      );
      expect(await transform(Test, { enumField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('each value in enumField must be one of the following values: a, b')
      );
    });
  });
});
