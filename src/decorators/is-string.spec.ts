import { Result } from 'true-myth';

import { createDto, transform } from '../../tests/helpers';
import { IsString } from '../nestjs-swagger-dto';

describe('IsString', () => {
  describe('single', () => {
    class Test {
      @IsString()
      stringField!: string;
    }

    it('accepts strings', async () => {
      expect(await transform(Test, { stringField: 'abc' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'abc' }))
      );
      expect(await transform(Test, { stringField: '' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: '' }))
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { stringField: true },
        { stringField: 1 },
        { stringField: [] },
        { stringField: {} },
        { stringField: null },
        {},
      ];

      for (const testValue of testValues) {
        expect(await transform(Test, testValue)).toStrictEqual(
          Result.err('stringField must be a string')
        );
      }
    });
  });

  describe('length', () => {
    it('checks minLength', async () => {
      class Test {
        @IsString({ minLength: 5 })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'aaaaa' }))
      );
      expect(await transform(Test, { stringField: 'aaa' })).toStrictEqual(
        Result.err('stringField must be longer than or equal to 5 characters')
      );
      expect(await transform(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });

    it('checks maxLength', async () => {
      class Test {
        @IsString({ maxLength: 10 })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'aaa' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'aaa' }))
      );
      expect(await transform(Test, { stringField: 'a'.repeat(11) })).toStrictEqual(
        Result.err('stringField must be shorter than or equal to 10 characters')
      );
      expect(await transform(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });

    it('checks minLength and maxLength', async () => {
      class Test {
        @IsString({ minLength: 5, maxLength: 10 })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'aaaaa' }))
      );
      expect(await transform(Test, { stringField: 'a' })).toStrictEqual(
        Result.err('stringField must be longer than or equal to 5 characters')
      );
      expect(await transform(Test, { stringField: 'a'.repeat(11) })).toStrictEqual(
        Result.err('stringField must be shorter than or equal to 10 characters')
      );
      expect(await transform(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });
  });

  describe('pattern', () => {
    it('accepts strings with specified pattern and rejects other ones', async () => {
      class Test {
        @IsString({ pattern: { regex: /^a+$/ } })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'aaaaa' }))
      );
      expect(await transform(Test, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must match /^a+$/ regular expression')
      );
      expect(await transform(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });

    it('returns custom message if pattern fails to match', async () => {
      class Test {
        @IsString({
          pattern: { regex: /^a+$/, message: 'stringField must only contain "a" letters' },
        })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must only contain "a" letters')
      );
    });
  });

  describe('email', () => {
    it('accepts email strings and rejects other ones', async () => {
      class Test {
        @IsString({ isEmail: true })
        stringField!: string;
      }

      expect(await transform(Test, { stringField: 'abc@abc.abc' })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: 'abc@abc.abc' }))
      );
      expect(await transform(Test, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must be an email')
      );
      expect(await transform(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });
  });

  describe('array', () => {
    class Test {
      @IsString({ isArray: true })
      stringField!: string[];
    }

    it('accepts string arrays', async () => {
      expect(await transform(Test, { stringField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: ['a', 'b', 'c'] }))
      );
      expect(await transform(Test, { stringField: [] })).toStrictEqual(
        Result.ok(createDto(Test, { stringField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await transform(Test, { stringField: true })).toStrictEqual(
        Result.err('each value in stringField must be a string')
      );
      expect(await transform(Test, { stringField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in stringField must be a string')
      );
    });
  });
});
