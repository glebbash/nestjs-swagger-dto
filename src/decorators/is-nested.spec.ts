import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
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
      expect(await transform(Test, { nestedField: { numberField: 1 } })).toStrictEqual(
        Result.ok(createDto(Test, { nestedField: createDto(Nested, { numberField: 1 }) }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { nestedField: { numberField: 'abc' } })).toStrictEqual(
        Result.err('numberField must be a number conforming to the specified constraints')
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
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('nested property nestedField must be an object')
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

    it('accepts nested object arrays', async () => {
      expect(
        await transform(Test, {
          nestedField: [{ numberField: 1 }, { numberField: 2 }, { numberField: 3 }],
        })
      ).toStrictEqual(
        Result.ok(
          createDto(Test, {
            nestedField: [
              createDto(Nested, { numberField: 1 }),
              createDto(Nested, { numberField: 2 }),
              createDto(Nested, { numberField: 3 }),
            ],
          })
        )
      );
      expect(await transform(Test, { nestedField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { nestedField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(
        await transform(Test, {
          nestedField: [{ a: 1 }, { b: 2 }, { c: 3 }],
        })
      ).toStrictEqual(Result.err('property a should not exist'));
      expect(await transform(Test, { nestedField: true })).toStrictEqual(
        Result.err('nestedField must be an array')
      );
      expect(await transform(Test, { nestedField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.err('nested property nestedField must only contain objects')
      );
    });
  });
});
