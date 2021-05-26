import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsNumber } from '../nestjs-swagger-dto';

describe('IsNumber', () => {
  describe('single', () => {
    class Test {
      @IsNumber()
      numberField!: number;
    }

    it('accepts numbers', async () => {
      expect(await transform(Test, { numberField: 1 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 1 }))
      );
      expect(await transform(Test, { numberField: 1.1 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 1.1 }))
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { numberField: 'true' },
        { numberField: 'false' },
        { numberField: [] },
        { numberField: {} },
        { numberField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('numberField must be a number conforming to the specified constraints')
        );
      }
    });
  });

  describe('bounds', () => {
    it('checks minimum', async () => {
      class Test {
        @IsNumber({ min: 5 })
        numberField!: number;
      }

      expect(await transform(Test, { numberField: 10 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 10 }))
      );
      expect(await transform(Test, { numberField: 1 })).toStrictEqual(
        Result.err('numberField must not be less than 5')
      );
      expect(await transform(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints')
      );
    });

    it('checks maximum', async () => {
      class Test {
        @IsNumber({ max: 10 })
        numberField!: number;
      }

      expect(await transform(Test, { numberField: 5 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 5 }))
      );
      expect(await transform(Test, { numberField: 11 })).toStrictEqual(
        Result.err('numberField must not be greater than 10')
      );
      expect(await transform(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints')
      );
    });

    it('checks minimum and maximum', async () => {
      class Test {
        @IsNumber({ min: 5, max: 10 })
        numberField!: number;
      }

      expect(await transform(Test, { numberField: 5 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 5 }))
      );
      expect(await transform(Test, { numberField: 1 })).toStrictEqual(
        Result.err('numberField must not be less than 5')
      );
      expect(await transform(Test, { numberField: 11 })).toStrictEqual(
        Result.err('numberField must not be greater than 10')
      );
      expect(await transform(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints')
      );
    });
  });

  describe('stringified', () => {
    class Test {
      @IsNumber({ stringified: true })
      numberField!: number;
    }

    it('accepts number strings and numbers', async () => {
      expect(await transform(Test, { numberField: '10' })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 10 }))
      );
      expect(await transform(Test, { numberField: '-10.5' })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: -10.5 }))
      );
      expect(await transform(Test, { numberField: 10 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: 10 }))
      );
      expect(await transform(Test, { numberField: -10.5 })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: -10.5 }))
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { numberField: 'true' },
        { numberField: 'false' },
        { numberField: '1 ' },
        { numberField: ' 1' },
        { numberField: [] },
        { numberField: {} },
        { numberField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('numberField must be a number conforming to the specified constraints')
        );
      }
    });
  });

  describe('array', () => {
    class Test {
      @IsNumber({ isArray: true })
      numberField!: number[];
    }

    it('accepts number arrays', async () => {
      expect(await transform(Test, { numberField: [1, 2, 3] })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: [1, 2, 3] }))
      );
      expect(await transform(Test, { numberField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { numberField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { numberField: true })).toStrictEqual(
        Result.err(
          'each value in numberField must be a number conforming to the specified constraints'
        )
      );
      expect(await transform(Test, { numberField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err(
          'each value in numberField must be a number conforming to the specified constraints'
        )
      );
    });
  });
});
