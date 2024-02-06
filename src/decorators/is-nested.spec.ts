import { Result } from 'true-myth';

import { input, make, output } from '../../tests/helpers';
import { IsNested, IsNumber } from '../nestjs-swagger-dto';

describe('IsNested', () => {
  describe('single', () => {
    class Nested {
      @IsNumber()
      numberField!: number;
    }

    class Test {
      @IsNested({ type: Nested })
      nestedField!: Nested;
    }

    it('accepts nested object fields', async () => {
      expect(await input(Test, { nestedField: { numberField: 1 } })).toStrictEqual(
        Result.ok(make(Test, { nestedField: make(Nested, { numberField: 1 }) })),
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { nestedField: { numberField: 'abc' } })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints'),
      );

      const testValues: unknown[] = [
        { nestedField: 'abc' },
        { nestedField: false },
        { nestedField: [] },
        { nestedField: 0 },
        { nestedField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('nested property nestedField must be an object'),
        );
      }
    });
  });

  describe('array', () => {
    class Nested {
      @IsNumber()
      numberField!: number;
    }

    class Test {
      @IsNested({ type: Nested, isArray: true })
      nestedField!: Nested[];
    }

    it('transforms nested object arrays', async () => {
      expect(
        output(
          make(Test, {
            nestedField: [
              make(Nested, { numberField: 1 }),
              make(Nested, { numberField: 2 }),
              make(Nested, { numberField: 3 }),
            ],
          }),
        ),
      ).toStrictEqual({
        nestedField: [{ numberField: 1 }, { numberField: 2 }, { numberField: 3 }],
      });
    });

    it('accepts nested object arrays', async () => {
      expect(
        await input(Test, {
          nestedField: [{ numberField: 1 }, { numberField: 2 }, { numberField: 3 }],
        }),
      ).toStrictEqual(
        Result.ok(
          make(Test, {
            nestedField: [
              make(Nested, { numberField: 1 }),
              make(Nested, { numberField: 2 }),
              make(Nested, { numberField: 3 }),
            ],
          }),
        ),
      );
      expect(await input(Test, { nestedField: [] })).toStrictEqual(
        Result.ok(make(Test, { nestedField: [] })),
      );
    });

    it('rejects everything else', async () => {
      expect(
        await input(Test, {
          nestedField: [{ a: 1 }, { b: 2 }, { c: 3 }],
        }),
      ).toStrictEqual(Result.err('property a should not exist'));
      expect(await input(Test, { nestedField: true })).toStrictEqual(
        Result.err('nestedField must be an array'),
      );
      expect(await input(Test, { nestedField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('nested property nestedField must only contain objects'),
      );
    });
  });
});
