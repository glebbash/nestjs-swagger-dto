import { Result } from 'true-myth';

import { input, make, output } from '../../tests/helpers';
import { IsDate } from '../nestjs-swagger-dto';

describe('IsDate', () => {
  describe('single date', () => {
    class Test {
      @IsDate({ format: 'date' })
      date!: Date;
    }

    class TestSerialize {
      @IsDate({ format: 'date', serialize: true })
      date!: Date;
    }

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
    });

    it('transforms to date formatted string', async () => {
      const dateToUse = new Date();
      const obj = new TestSerialize();
      obj.date = dateToUse;

      expect(await output(obj)).toStrictEqual({ date: dateToUse.toISOString().slice(0, 10) });
    });

    it('pass through when field is undefined', async () => {
      const obj = new TestSerialize();

      expect(await output(obj)).toStrictEqual({});
    });

    it('pass through value if no serialize', async () => {
      const dateToUse = new Date();
      const obj = new Test();
      obj.date = dateToUse;

      expect(await output(obj)).toStrictEqual({ date: dateToUse });
    });
  });

  describe('single date-time', () => {
    class Test {
      @IsDate({ format: 'date-time' })
      date?: Date;
    }

    class TestSerialize {
      @IsDate({ format: 'date-time', serialize: true })
      date?: Date;
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

    it('transforms to ISO formatted string', async () => {
      const dateToUse = new Date();
      const obj = new TestSerialize();
      obj.date = dateToUse;

      expect(await output(obj)).toStrictEqual({ date: dateToUse.toISOString() });
    });

    it('pass through when field is undefined', async () => {
      const obj = new TestSerialize();

      expect(await output(obj)).toStrictEqual({});
    });

    it('pass through value if no serialize', async () => {
      const dateToUse = new Date();
      const obj = new Test();
      obj.date = dateToUse;

      expect(await output(obj)).toStrictEqual({ date: dateToUse });
    });
  });
});
