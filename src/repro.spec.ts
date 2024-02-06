import { ClassConstructor, plainToInstance } from 'class-transformer';

import { IsDate } from '../lib/nestjs-swagger-dto';

export class ReportDto {
  @IsDate({ format: 'date-time' })
  createdAt!: Date;
}

describe('x', () => {
  it('works 1', () => {
    make1(ReportDto, { createdAt: new Date() });
    make1(ReportDto, { createdAt: '' as never });
    make1(ReportDto, {} as never);
  });

  it('works 2', () => {
    make2(ReportDto, { createdAt: new Date() });
    make2(ReportDto, { createdAt: '' as never });
    make2(ReportDto, {} as never);
  });
});

export function make1<T, D extends T>(cls: ClassConstructor<T>, data: D): T {
  return plainToInstance(cls, data);
}

export function make2<T, D extends T>(cls: ClassConstructor<T>, object: D): D {
  return Object.assign(new cls() as never, object);
}
