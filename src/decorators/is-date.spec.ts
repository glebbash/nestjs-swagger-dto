import { Result } from 'true-myth';

import { input, make, output, outputValidate } from '../../tests/helpers';
import { IsDate } from '../nestjs-swagger-dto';

describe('IsDate', () => {
  describe('date is optional', () => {
    class TestDateInput {
      @IsDate({ format: 'date', optional: true })
      date?: Date;
    }

    class TestDateOutput {
      @IsDate({ format: 'date', optional: true, formatOutput: true })
      date?: Date;
    }

    class TestDateTimeInput {
      @IsDate({ format: 'date', optional: true })
      date?: Date;
    }

    class TestDateTimeOutput {
      @IsDate({ format: 'date', optional: true, formatOutput: true })
      date?: Date;
    }

    it('pass through when no date is set on input', async () => {
      expect(await input(TestDateInput, {})).toStrictEqual(Result.ok(new TestDateInput()));
      expect(await input(TestDateTimeInput, {})).toStrictEqual(Result.ok(new TestDateTimeInput()));
    });

    it('pass through if no date is set on output', async () => {
      expect(output(make(TestDateOutput, {}))).toStrictEqual({});
      expect(output(make(TestDateTimeOutput, {}))).toStrictEqual({});
    });
  });

  describe('date is mandatory', () => {
    describe('single date', () => {
      describe('input', () => {
        class TestInput {
          @IsDate({ format: 'date' })
          date!: Date;
        }

        it('accepts date', async () => {
          expect(await input(TestInput, { date: '2011-12-30' })).toStrictEqual(
            Result.ok(make(TestInput, { date: new Date('2011-12-30') }))
          );
        });

        it('rejects invalid date', async () => {
          expect(await input(TestInput, { date: '2011-13-13' })).toStrictEqual(
            Result.err('date is not a valid Date')
          );

          expect(await input(TestInput, { date: 'not a date' })).toStrictEqual(
            Result.err('date is not formatted as `yyyy-mm-dd`')
          );

          expect(await input(TestInput, { date: '2011/12/02' })).toStrictEqual(
            Result.err('date is not formatted as `yyyy-mm-dd`')
          );
        });

        it('pass through value if no serialize', async () => {
          const date = new Date();

          expect(output(make(TestInput, { date }))).toStrictEqual({ date: date });
        });
      });

      describe('output', () => {
        class TestOutput {
          @IsDate({ format: 'date', formatOutput: true })
          date!: Date;
        }

        it('rejects output if no date is set', async () => {
          expect(await outputValidate(new TestOutput())).toStrictEqual(
            Result.err('an unknown value was passed to the validate function')
          );
        });

        it('transforms to date formatted string', async () => {
          const date = new Date();
          expect(output(make(TestOutput, { date }))).toStrictEqual({
            date: date.toISOString().slice(0, 10),
          });
        });
      });
    });

    describe('single date-time', () => {
      describe('input', () => {
        class Test {
          @IsDate({ format: 'date-time' })
          date!: Date;
        }

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
        });

        it('pass through value if no serialize', async () => {
          const date = new Date();
          expect(output(make(Test, { date }))).toStrictEqual({ date });
        });
      });

      describe('output', () => {
        class TestOutput {
          @IsDate({ format: 'date-time', formatOutput: true })
          date!: Date;
        }

        it('rejects output if no date is set', async () => {
          expect(await outputValidate(new TestOutput())).toStrictEqual(
            Result.err('an unknown value was passed to the validate function')
          );
        });

        it('transforms to ISO formatted string', async () => {
          const date = new Date();
          expect(output(make(TestOutput, { date }))).toStrictEqual({ date: date.toISOString() });
        });
      });
    });
  });
});
