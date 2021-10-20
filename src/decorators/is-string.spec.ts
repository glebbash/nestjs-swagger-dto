import { Result } from 'true-myth';

import { generateSchemas, input, make } from '../../tests/helpers';
import { IsString } from '../nestjs-swagger-dto';

describe('IsString', () => {
  describe('single', () => {
    class Test {
      @IsString()
      stringField!: string;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            stringField: {
              type: 'string',
            },
          },
          required: ['stringField'],
        },
      });
    });

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
    class Test {
      @IsString({ minLength: 5, maxLength: 10 })
      stringField!: string;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            stringField: {
              type: 'string',
              minLength: 5,
              maxLength: 10,
            },
          },
          required: ['stringField'],
        },
      });
    });

    it('checks minLength and maxLength', async () => {
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
    class Test {
      @IsString({ pattern: { regex: /^a+$/ } })
      stringField!: string;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            stringField: {
              type: 'string',
              pattern: '^a+$',
            },
          },
          required: ['stringField'],
        },
      });
    });

    it('accepts strings with specified pattern and rejects other ones', async () => {
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
      class TestCustomMessage {
        @IsString({
          pattern: { regex: /^a+$/, message: 'stringField must only contain "a" letters' },
        })
        stringField!: string;
      }

      expect(await input(TestCustomMessage, { stringField: 'aaab' })).toStrictEqual(
        Result.err('stringField must only contain "a" letters')
      );
    });
  });

  describe('email', () => {
    class Test {
      @IsString({ isEmail: true })
      stringField!: string;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            stringField: {
              type: 'string',
              format: 'email',
            },
          },
          required: ['stringField'],
        },
      });
    });

    it('accepts email strings and rejects other ones', async () => {
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

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            stringField: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
          required: ['stringField'],
        },
      });
    });

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

  describe('date', () => {
    describe('date', () => {
      class Test {
        @IsString({ isDate: { format: 'date' } })
        stringField!: string;
      }

      it('generates correct schema', async () => {
        expect(await generateSchemas([Test])).toStrictEqual({
          Test: {
            type: 'object',
            properties: {
              stringField: {
                type: 'string',
                format: 'date',
              },
            },
            required: ['stringField'],
          },
        });
      });

      it('accepts date as YYYY-MM-DD', async () => {
        expect(await input(Test, { stringField: '2020-01-01' })).toStrictEqual(
          Result.ok(make(Test, { stringField: '2020-01-01' }))
        );
      });

      test.each([
        ['2020-01-01_not_a_date'],
        ['2020-01-01 01:01:01'],
        ['2020-01-01T01:01:01.000Z'],
        [''],
        ['not_a_date'],
      ])('rejects %s', async (value) => {
        expect(await input(Test, { stringField: value })).toStrictEqual(
          Result.err('date is not formatted as `yyyy-mm-dd` or not a valid Date')
        );
      });
    });

    describe('date-time', () => {
      class Test {
        @IsString({ isDate: { format: 'date-time' } })
        stringField!: string;
      }

      it('generates correct schema', async () => {
        expect(await generateSchemas([Test])).toStrictEqual({
          Test: {
            type: 'object',
            properties: {
              stringField: {
                type: 'array',
                format: 'date-time',
              },
            },
            required: ['stringField'],
          },
        });
      });

      test.each([
        ['2020'],
        ['2020-01-01'],
        ['2020-01-01 00:00'],
        ['2020-01-01 00:00:00'],
        ['2020-01-01T00:00:00.000Z'],
        ['2020-01-01T00:00:00+00:00'],
      ])('accepts %s', async (value) => {
        expect(await input(Test, { stringField: value })).toStrictEqual(
          Result.ok(make(Test, { stringField: value }))
        );
      });

      test.each([
        ['2020-01-01 100'],
        ['2020-01-01 00'],
        ['-1'],
        ['1633099642455'],
        ['Fri Oct 01 2021 18:14:15 GMT+0300 (Eastern European Summer Time)'],
        ['2020333'],
        [''],
        ['not_a_date'],
      ])('rejects %s', async (value) => {
        expect(await input(Test, { stringField: value })).toStrictEqual(
          Result.err('date is not in a ISO8601 format.')
        );
      });
    });
  });

  describe('custom validator', () => {
    it('does not fail, if validator returns true', async () => {
      class Test {
        @IsString({
          customValidate: {
            validator: () => true,
            message: 'test error message',
          },
        })
        stringField!: string;
      }

      expect(await input(Test, { stringField: 'any' })).toStrictEqual(
        Result.ok(make(Test, { stringField: 'any' }))
      );
    });

    it('returns message, if validator returns false', async () => {
      class Test {
        @IsString({
          customValidate: {
            validator: () => false,
            message: 'test error message',
          },
        })
        stringField!: string;
      }

      expect(await input(Test, { stringField: 'any' })).toStrictEqual(
        Result.err('test error message')
      );
    });

    it('returns custom message, if validator returns false', async () => {
      class Test {
        @IsString({
          customValidate: {
            validator: () => false,
            message: ({ property }) => `${property} is invalid`,
          },
        })
        stringField!: string;
      }

      expect(await input(Test, { stringField: 'any' })).toStrictEqual(
        Result.err('stringField is invalid')
      );
    });

    it('works with arrays', async () => {
      class Test {
        @IsString({
          isArray: true,
          customValidate: {
            validator: () => false,
            message: ({ property }) => `each value in ${property} is invalid`,
          },
        })
        stringField!: string[];
      }

      expect(await input(Test, { stringField: 'any' })).toStrictEqual(
        Result.err('each value in stringField is invalid')
      );
    });
  });
});
