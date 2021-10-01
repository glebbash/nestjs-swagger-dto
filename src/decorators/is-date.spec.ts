import { Result } from 'true-myth';

import { input, make } from '../../tests/helpers';
import { IsDate } from '../nestjs-swagger-dto';

describe('IsDate', () => {
  describe('single date', () => {
    class Test {
      @IsDate({ format: 'date' })
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
  });

  describe('single date-time', () => {
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
  });
});
