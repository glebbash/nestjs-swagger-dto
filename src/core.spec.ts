import { IsBoolean } from 'class-validator';
import { Result } from 'true-myth';

import { generateSchemas, input, make, output } from '../tests/helpers';
import { compose, PropertyOptions } from './core';

describe('core options', () => {
  const DtoDecorator = ({
    meta,
    ...base
  }: PropertyOptions<boolean, { meta?: string }>): PropertyDecorator =>
    compose(
      { type: 'boolean' },
      base,
      IsBoolean({ each: !!base.isArray }),
      Reflect.metadata('meta', meta),
    );

  describe('support for custom options', () => {
    class Test {
      @DtoDecorator({ meta: 'hello' })
      booleanField!: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
            },
          },
          required: ['booleanField'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: true });
      expect(output(dto)).toStrictEqual({ booleanField: true });
    });

    it('applies property decorator correctly', async () => {
      const testInstance = new Test();

      expect(Reflect.getMetadata('meta', testInstance, 'booleanField')).toBe('hello');
    });
  });

  describe('description and depreacted properties', () => {
    class Test {
      @DtoDecorator({
        description: 'Deprecated. Just a normal boolean field',
        deprecated: true,
      })
      booleanField!: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
              description: 'Deprecated. Just a normal boolean field',
              deprecated: true,
            },
          },
          required: ['booleanField'],
        },
      });
    });
  });

  describe('optional', () => {
    class Test {
      @DtoDecorator({ optional: true, meta: 'hello' })
      booleanField?: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
            },
          },
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, {});
      expect(output(dto)).toStrictEqual({});
    });

    it('accepts value and undefined', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, {})));
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
        { booleanField: null },
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value'),
        );
      }
    });
  });

  describe('default', () => {
    class Test {
      @DtoDecorator({ optional: true, default: false })
      booleanField?: boolean;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
              default: false,
            },
          },
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, {});
      expect(output(dto)).toStrictEqual({ booleanField: false });
    });

    it('returns specified defaults if value is undefined', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, { booleanField: false })));
    });
  });

  describe('nullable', () => {
    class Test {
      @DtoDecorator({ nullable: true })
      booleanField!: boolean | null;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
              nullable: true,
            },
          },
          required: ['booleanField'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: null });
      expect(output(dto)).toStrictEqual({ booleanField: null });
    });

    it('accepts value and null', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
      expect(await input(Test, { booleanField: null })).toStrictEqual(
        Result.ok(make(Test, { booleanField: null })),
      );
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
        {},
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value'),
        );
      }
    });
  });

  describe('optional and nullable', () => {
    class Test {
      @DtoDecorator({ optional: true, nullable: true })
      booleanField?: boolean | null;
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'boolean',
              nullable: true,
            },
          },
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: null });
      expect(output(dto)).toStrictEqual({ booleanField: null });

      const dto2 = make(Test, {});
      expect(output(dto2)).toStrictEqual({});
    });

    it('accepts value, null and undefined', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.ok(make(Test, { booleanField: true })),
      );
      expect(await input(Test, { booleanField: false })).toStrictEqual(
        Result.ok(make(Test, { booleanField: false })),
      );
      expect(await input(Test, { booleanField: null })).toStrictEqual(
        Result.ok(make(Test, { booleanField: null })),
      );
      expect(await input(Test, {})).toStrictEqual(Result.ok(make(Test, {})));
    });

    it('rejects everything else', async () => {
      const testValues: unknown[] = [
        { booleanField: 'true' },
        { booleanField: 'false' },
        { booleanField: 'abc' },
        { booleanField: 0 },
        { booleanField: [] },
        { booleanField: {} },
      ];

      for (const testValue of testValues) {
        expect(await input(Test, testValue)).toStrictEqual(
          Result.err('booleanField must be a boolean value'),
        );
      }
    });
  });

  describe('array', () => {
    class Test {
      @DtoDecorator({ isArray: true })
      booleanField!: boolean[];
    }

    it('generates correct schema', async () => {
      expect(await generateSchemas([Test])).toStrictEqual({
        Test: {
          type: 'object',
          properties: {
            booleanField: {
              type: 'array',
              items: {
                type: 'boolean',
              },
            },
          },
          required: ['booleanField'],
        },
      });
    });

    it('transforms to plain', async () => {
      const dto = make(Test, { booleanField: [true, false] });
      expect(output(dto)).toStrictEqual({ booleanField: [true, false] });
    });

    it('accepts value arrays', async () => {
      expect(await input(Test, { booleanField: [true, false] })).toStrictEqual(
        Result.ok(make(Test, { booleanField: [true, false] })),
      );
      expect(await input(Test, { booleanField: [] })).toStrictEqual(
        Result.ok(make(Test, { booleanField: [] })),
      );
    });

    it('rejects everything else', async () => {
      expect(await input(Test, { booleanField: true })).toStrictEqual(
        Result.err('booleanField must be an array'),
      );
      expect(await input(Test, { booleanField: [1, 2, 3] })).toStrictEqual(
        Result.err('each value in booleanField must be a boolean value'),
      );
    });
  });
});
