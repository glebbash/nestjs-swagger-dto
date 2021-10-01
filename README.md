# nestjs-swagger-dto

[![Deploy](https://github.com/glebbash/nestjs-swagger-dto/workflows/build/badge.svg)](https://github.com/glebbash/nestjs-swagger-dto/actions)
[![Coverage Status](https://coveralls.io/repos/github/glebbash/nestjs-swagger-dto/badge.svg?branch=master)](https://coveralls.io/github/glebbash/nestjs-swagger-dto?branch=master)

## Nest.js Swagger DTO decorators

This library combines common `@nestjs/swagger`, `class-transformer` and `class-validator` decorators that are used together into one decorator for full Nest.js DTO lifecycle including OpenAPI schema descriptions.

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

All of the decorators support the following parameters:

| Name        | Description                                                 |
| ----------- | ----------------------------------------------------------- |
| description | adds description                                            |
| example     | adds example                                                |
| name        | sets the name for serialized property                       |
| optional    | makes property optional                                     |
| nullable    | makes property nullable                                     |
| isArray     | changes the type of property to array of items of this type |

Also decorators have additional parameters like: `min`, `max` for `IsNumber`.

## Other

Bootstrapped with: [create-ts-lib-gh](https://github.com/glebbash/create-ts-lib-gh)

This project is [Mit Licensed](LICENSE).
