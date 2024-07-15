import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../../tests/helpers';
import { IsNumber } from '../nestjs-swagger-dto';

describe('IsNumber', () => {
  describe('single', () => {
    class Test {
      @IsNumber()
      numberField!: number;
    }

    it('accepts numbers', async () => {
      expect(await input(Test, { numberField: 1 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 1 })),
      );
      expect(await input(Test, { numberField: 1.1 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 1.1 })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { numberField: 'true' },
        { numberField: 'false' },
        { numberField: '10' },
        { numberField: [] },
        { numberField: {} },
        { numberField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('numberField must be a number conforming to the specified constraints'),
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

      expect(await input(Test, { numberField: 10 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 10 })),
      );
      expect(await input(Test, { numberField: 1 })).toStrictEqual(
        Result.err('numberField must not be less than 5'),
      );
      expect(await input(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints'),
      );
    });

    it('checks maximum', async () => {
      class Test {
        @IsNumber({ max: 10 })
        numberField!: number;
      }

      expect(await input(Test, { numberField: 5 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 5 })),
      );
      expect(await input(Test, { numberField: 11 })).toStrictEqual(
        Result.err('numberField must not be greater than 10'),
      );
      expect(await input(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints'),
      );
    });

    it('checks minimum and maximum', async () => {
      class Test {
        @IsNumber({ min: 5, max: 10 })
        numberField!: number;
      }

      expect(await input(Test, { numberField: 5 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 5 })),
      );
      expect(await input(Test, { numberField: 1 })).toStrictEqual(
        Result.err('numberField must not be less than 5'),
      );
      expect(await input(Test, { numberField: 11 })).toStrictEqual(
        Result.err('numberField must not be greater than 10'),
      );
      expect(await input(Test, { numberField: false })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints'),
      );
    });
  });

  describe('stringified', () => {
    class Test {
      @IsNumber({ stringified: true })
      numberField!: number;
    }

    it('accepts number strings and numbers', async () => {
      expect(await input(Test, { numberField: '10' })).toStrictEqual(
        Result.ok(make(Test, { numberField: 10 })),
      );
      expect(await input(Test, { numberField: '-10.5' })).toStrictEqual(
        Result.ok(make(Test, { numberField: -10.5 })),
      );
      expect(await input(Test, { numberField: 10 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 10 })),
      );
      expect(await input(Test, { numberField: -10.5 })).toStrictEqual(
        Result.ok(make(Test, { numberField: -10.5 })),
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
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('numberField must be a number conforming to the specified constraints'),
        );
      }
    });
  });

  describe('integer', () => {
    class Test {
      @IsNumber({ type: 'integer', format: 'int32' })
      integerField!: number;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            integerField: {
              type: 'integer',
              format: 'int32',
            },
          },
          required: ['integerField'],
        },
      });
    });

    it('transforms to plain without converting floats to ints', async () => {
      const dto = make(Test, { integerField: 10.5 });
      expect(output(dto)).toStrictEqual({ integerField: 10.5 });
    });

    it('accepts integers', async () => {
      expect(await input(Test, { integerField: 10 })).toStrictEqual(
        Result.ok(make(Test, { integerField: 10 })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { integerField: 10.5 },
        { integerField: 'true' },
        { integerField: 'false' },
        { integerField: [] },
        { integerField: {} },
        { integerField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('integerField must be a number conforming to the specified constraints'),
        );
      }
    });
  });

  describe('default and stringified', () => {
    class Test {
      @IsNumber({ optional: true, stringified: true, default: 25 })
      numberField?: number;
    }

    it('returns specified defaults and parses stringified fields', async () => {
      expect(await input(Test, { numberField: '1' })).toStrictEqual(
        Result.ok(make(Test, { numberField: 1 })),
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, { numberField: 25 })));
    });
  });

  describe('default stringified min', () => {
    class Test {
      @IsNumber({ stringified: true, optional: true, default: 200, min: 0 })
      numberField?: number;
    }

    it('returns specified defaults and parses stringified fields', async () => {
      expect(await input(Test, { numberField: '2' })).toStrictEqual(
        Result.ok(make(Test, { numberField: 2 })),
      );
    });
    it('returns specified defaults and parses stringified fields', async () => {
      expect(await input(Test, { numberField: 2 })).toStrictEqual(
        Result.ok(make(Test, { numberField: 2 })),
      );
    });
  });

  describe('array', () => {
    class Test {
      @IsNumber({ isArray: true })
      numberField!: number[];
    }

    it('accepts number arrays', async () => {
      expect(await input(Test, { numberField: [1, 2, 3] })).toStrictEqual(
        Result.ok(make(Test, { numberField: [1, 2, 3] })),
      );
      expect(await input(Test, { numberField: [] })).toStrictEqual(
        Result.ok(make(Test, { numberField: [] })),
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { numberField: true })).toStrictEqual(
        Result.err(
          'each value in numberField must be a number conforming to the specified constraints',
        ),
      );
      expect(await input(Test, { numberField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err(
          'each value in numberField must be a number conforming to the specified constraints',
        ),
      );
    });
  });
});
