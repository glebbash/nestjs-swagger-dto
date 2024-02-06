# nestjs-swagger-dto

[![Deploy](https://github.com/glebbash/nestjs-swagger-dto/workflows/build/badge.svg)](https://github.com/glebbash/nestjs-swagger-dto/actions)
[![Coverage Status](https://coveralls.io/repos/github/glebbash/nestjs-swagger-dto/badge.svg?branch=master)](https://coveralls.io/github/glebbash/nestjs-swagger-dto?branch=master)

## Nest.js Swagger DTO decorators

This library combines common `@nestjs/swagger`, `class-transformer` and `class-validator` decorators that are used together into one decorator for full Nest.js DTO lifecycle including OpenAPI schema descriptions.

<table>
<tr>
<th>DTO with nestjs-swagger-dto</th>
<th>DTO without nestjs-swagger-dto</th>
</tr>
<tr>
<td>

```ts
import { IsEnum, IsNested, IsString } from 'nestjs-swagger-dto';

class RoleDto {
  @IsString({
    optional: true,
    minLength: 3,
    maxLength: 256,
  })
  name?: string;

  @IsString({ optional: true, maxLength: 255 })
  description?: string;

  @IsEnum({ enum: { RoleStatus } })
  status!: RoleStatus;

  @IsNested({ type: PermissionDto, isArray: true })
  permissions!: PermissionDto[];
}
```

</td>
<td>

```ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength, ValidateNested } from 'class-validator';

export class RoleDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(256)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  description?: string;

  @ApiProperty({ enum: RoleStatus, enumName: 'RoleStatus' })
  status!: RoleStatus;

  @ValidateNested({ each: true })
  @Type(() => PermissionDto)
  @ApiProperty({ type: [PermissionDto] })
  permissions!: PermissionDto[];
}
```

</td>
</tr>
</table>

## Installation

```sh
npm i nestjs-swagger-dto
```

## Contents

This library contains the following decorators

| Name       | Description                   |
| ---------- | ----------------------------- |
| IsBoolean  | boolean                       |
| IsConstant | constant                      |
| IsDate     | date / date-time              |
| IsEnum     | enum object / array of values |
| IsNested   | nested DTO                    |
| IsNumber   | numbers                       |
| IsObject   | typed plain js objects        |
| IsString   | strings                       |
| IsUnknown  | any json value                |

All of the decorators support the following parameters:

| Name        | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| description | adds description                                            |
| deprecated  | deprecates a field                                          |
| example     | adds example                                                |
| name        | sets the name for serialized property                       |
| optional    | makes property optional                                     |
| nullable    | makes property nullable                                     |
| isArray     | changes the type of property to array of items of this type |

Also decorators have additional parameters like: `min`, `max` for `IsNumber`.

### Headers validation

You can also validate request headers using `TypedHeaders` decorator.

```ts
export class TestHeaders {
  @IsString({
    // Note: header names will be lowercased automatically
    name: 'country-code',
    maxLength: 2,
    minLength: 2,
    example: 'US',
  })
  countryCode!: string;

  @IsString({
    name: 'timestamp',
    isDate: { format: 'date-time' },
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
```

## Other

Bootstrapped with: [create-ts-lib-gh](https://github.com/glebbash/create-ts-lib-gh)

This project is [Mit Licensed](LICENSE).
