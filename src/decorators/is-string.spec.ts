import { Result } from 'true-myth';

import { input, make } from '../../tests/helpers';
import { IsString } from '../nestjs-swagger-dto';

describe('IsString', () => {
  describe('single', () => {
    class Test {
      @IsString()
      stringField!: string;
    }

    it('accepts strings', async () => {
      expect(await input(Test, { stringField: 'abc' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'abc' }))
      );
      expect(await input(Test, { stringField: '' })).toStrictEqual(
        Result.ok(make(Test, { stringField: '' }))
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
        expect(await input(Test, testValue)).toStrictEqual(
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

      expect(await input(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'aaaaa' }))
      );
      expect(await input(Test, { stringField: 'aaa' })).toStrictEqual(
        Result.err('stringField must be longer than or equal to 5 characters')
      );
      expect(await input(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });

    it('checks maxLength', async () => {
      class Test {
        @IsString({ maxLength: 10 })
        stringField!: string;
      }

      expect(await input(Test, { stringField: 'aaa' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'aaa' }))
      );
      expect(await input(Test, { stringField: 'a'.repeat(11) })).toStrictEqual(
        Result.err('stringField must be shorter than or equal to 10 characters')
      );
      expect(await input(Test, { stringField: false })).toStrictEqual(
        Result.err('stringField must be a string')
      );
    });

    it('checks minLength and maxLength', async () => {
      class Test {
        @IsString({ minLength: 5, maxLength: 10 })
        stringField!: string;
      }

      expect(await input(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'aaaaa' }))
      );
      expect(await input(Test, { stringField: 'a' })).toStrictEqual(
        Result.err('stringField must be longer than or equal to 5 characters')
      );
      expect(await input(Test, { stringField: 'a'.repeat(11) })).toStrictEqual(
        Result.err('stringField must be shorter than or equal to 10 characters')
      );
      expect(await input(Test, { stringField: false })).toStrictEqual(
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

      expect(await input(Test, { stringField: 'aaaaa' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'aaaaa' }))
      );
      expect(await input(Test, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must match /^a+$/ regular expression')
      );
      expect(await input(Test, { stringField: false })).toStrictEqual(
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

      expect(await input(Test, { stringField: 'aaab' })).toStrictEqual(
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

      expect(await input(Test, { stringField: 'abc@abc.abc' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'abc@abc.abc' }))
      );
      expect(await input(Test, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must be an email')
      );
      expect(await input(Test, { stringField: false })).toStrictEqual(
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
      expect(await input(Test, { stringField: ['a', 'b', 'c'] })).toStrictEqual(
        Result.ok(make(Test, { stringField: ['a', 'b', 'c'] }))
      );
      expect(await input(Test, { stringField: [] })).toStrictEqual(
        Result.ok(make(Test, { stringField: [] }))
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { stringField: true })).toStrictEqual(
        Result.err('each value in stringField must be a string')
      );
      expect(await input(Test, { stringField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in stringField must be a string')
      );
    });
  });
});
