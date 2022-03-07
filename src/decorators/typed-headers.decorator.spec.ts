import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';

import { IsString } from './is-string';
import { TypedHeaders } from './typed-headers.decorator';

export class TestHeaders {
  @IsString({
    description: '[ISO_3166-1_alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2)',
    name: 'country-code',
    maxLength: 2,
    minLength: 2,
    example: 'US',
  })
  countryCode!: string;

  @IsString({
    isDate: { format: 'date-time' },
    example: '2011-12-01T00:00:00.000Z',
    description: '[ISO 8601](https://en.wikipedia.org/wiki/ISO_8601)',
    name: 'timestamp',
  })
  timestamp!: string;
}

@Controller({ path: 'test', version: '1' })
export class TestController {
  @Get()
  async test(@TypedHeaders() headers: TestHeaders): Promise<string> {
    return headers.countryCode;
  }
}

describe('TypedHeaders decorator', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TestController],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  it('creates class with transformed properties', async () => {
    await request(app.getHttpServer())
      .get('/test')
      .set({
        'Country-Code': 'US',
        Timestamp: '2011-12-01T00:00:00.000Z',
      })
      .expect(200)
      .expect('US'); // Country code
  });

  it('uses decorators to validate headers', async () => {
    await request(app.getHttpServer())
      .get('/test')
      .set({
        'Country-Code': 'USA',
      })
      .expect(400)
      .expect({
        statusCode: 400,
        message: [
          'countryCode must be shorter than or equal to 2 characters',
          'timestamp must be a string',
          'timestamp is not in a ISO8601 format.',
        ],
        error: 'Bad Request',
      });
  });

  it('fails when emitDecoratorMetadata is disabled', async () => {
    expect(() => {
      jest.spyOn(Reflect, 'getOwnMetadata').mockReturnValue(undefined);

      @Controller({ path: 'test', version: '1' })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      class TestControllerWithoutEmitDecoratorMetadata {
        @Get()
        async test(@TypedHeaders() headers: TestHeaders): Promise<string> {
          return headers.countryCode;
        }
      }
    }).toThrow(
      new Error(
        'Type metadata not found. See https://www.typescriptlang.org/docs/handbook/decorators.html#metadata'
      )
    );
  });
});
