import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../../tests/helpers';
import { IsDate } from '../nestjs-swagger-dto';

describe('IsDate', () => {
  describe('single date', () => {
    class Test {
      @IsDate({ format: 'date' })
      date!: Date;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date',
            },
          },
          required: ['date'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { date: new Date('2011-12-30') });
      expect(output(dto)).toStrictEqual({ date: '2011-12-30' });
    });

    it('accepts date', async () => {
      expect(await input(Test, { date: '2011-12-30' })).toStrictEqual(
        Result.ok(make(Test, { date: new Date('2011-12-30') }))
      );
    });

    it('rejects invalid date', async () => {
      expect(await input(Test, { date: '2011-13-13' })).toStrictEqual(
        Result.err('date is not a valid Date')
      );

      expect(await input(Test, { date: 'not a date' })).toStrictEqual(
        Result.err('date is not formatted as `yyyy-mm-dd`')
      );

      expect(await input(Test, { date: '2011/12/02' })).toStrictEqual(
        Result.err('date is not formatted as `yyyy-mm-dd`')
      );

      expect(await input(Test, {})).toStrictEqual(Result.err('date does not exist'));
    });

    it('works with optional fields', async () => {
      class TestOptional {
        @IsDate({ format: 'date', optional: true })
        date?: Date;
      }

      const dto = make(TestOptional, {});
      expect(output(dto)).toStrictEqual({});

      expect(await input(TestOptional, {})).toStrictEqual(Result.ok(make(TestOptional, {})));
    });

    it('works with nullable fields', async () => {
      class TestNullable {
        @IsDate({ format: 'date', nullable: true })
        date!: Date | null;
      }

      const dto = make(TestNullable, { date: null });
      expect(output(dto)).toStrictEqual({ date: null });

      expect(await input(TestNullable, { date: null })).toStrictEqual(
        Result.ok(make(TestNullable, { date: null }))
      );
    });
  });

  describe('single date-time', () => {
    class Test {
      @IsDate({ format: 'date-time' })
      date!: Date;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            date: {
              type: 'string',
              format: 'date-time',
            },
          },
          required: ['date'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { date: new Date('2017-06-01T18:43:26.000Z') });
      expect(output(dto)).toStrictEqual({ date: '2017-06-01T18:43:26.000Z' });
    });

    it('accepts date-time', async () => {
      expect(await input(Test, { date: '2017-06-01T18:43:26.000Z' })).toStrictEqual(
        Result.ok(make(Test, { date: new Date('2017-06-01T18:43:26.000Z') }))
      );
    });

    it('rejects invalid date-time', async () => {
      expect(await input(Test, { date: '2011-13-13' })).toStrictEqual(
        Result.err('date is not ISO8601 format')
      );

      expect(await input(Test, { date: 'not a date' })).toStrictEqual(
        Result.err('date is not ISO8601 format')
      );

      expect(await input(Test, { date: '2011/12/02' })).toStrictEqual(
        Result.err('date is not ISO8601 format')
      );

      expect(await input(Test, {})).toStrictEqual(Result.err('date does not exist'));
    });

    it('works with optional fields', async () => {
      class TestOptional {
        @IsDate({ format: 'date-time', optional: true })
        date?: Date;
      }

      const dto = make(TestOptional, {});
      expect(output(dto)).toStrictEqual({});

      expect(await input(TestOptional, {})).toStrictEqual(Result.ok(make(TestOptional, {})));
    });

    it('works with nullable fields', async () => {
      class TestNullable {
        @IsDate({ format: 'date-time', nullable: true })
        date!: Date | null;
      }

      const dto = make(TestNullable, { date: null });
      expect(output(dto)).toStrictEqual({ date: null });

      expect(await input(TestNullable, { date: null })).toStrictEqual(
        Result.ok(make(TestNullable, { date: null }))
      );
    });
  });
});
