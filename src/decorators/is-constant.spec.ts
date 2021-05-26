import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsConstant } from '../nestjs-swagger-dto';

describe('IsConstant', () => {
  describe('single', () => {
    class Test {
      @IsConstant({ value: 123 })
      constantField!: 123;
    }

    it('accepts specified constant', async () => {
      expect(await transform(Test, { constantField: 123 })).toStrictEqual(
        Result.ok(createDto(Test, { constantField: 123 }))
      );
    });

    it('accepts specified constant', async () => {
      class Test {
        @IsConstant({ value: [1, 2, 3] })
        constantField!: [1, 2, 3];
      }

      expect(await transform(Test, { constantField: [1, 2, 3] })).toStrictEqual(
        Result.err('constantField must be equal to 1, 2, 3')
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { constantField: 'true' },
        { constantField: 'false' },
        { constantField: 124 },
        { constantField: [] },
        { constantField: {} },
        { constantField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('constantField must be equal to 123')
        );
      }
    });
  });

  describe('array', () => {
    class Test {
      @IsConstant({ value: 1, isArray: { length: 3 } })
      constantField!: [1, 1, 1];
    }

    it('accepts specified constant array', async () => {
      expect(await transform(Test, { constantField: [1, 1, 1] })).toStrictEqual(
        Result.ok(createDto(Test, { constantField: [1, 1, 1] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { constantField: [1] })).toStrictEqual(
        Result.err('constantField must contain at least 3 elements')
      );
      expect(await transform(Test, { constantField: ['1'] })).toStrictEqual(
        Result.err('each value in constantField must be equal to 1')
      );
      expect(await transform(Test, { constantField: ['1', '1', '1'] })).toStrictEqual(
        Result.err('each value in constantField must be equal to 1')
      );
      expect(await transform(Test, { constantField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in constantField must be equal to 1')
      );
      expect(await transform(Test, { constantField: [2, 2, 2] })).toStrictEqual(
        Result.err('each value in constantField must be equal to 1')
      );
    });
  });
});
