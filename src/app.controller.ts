import { Controller, Get, Post, Param, Req } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger'
import { AppService } from './app.service'
import { IsNotEmpty, IsString } from 'class-validator'
import { Request } from 'express'

export class postHelloBody {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'testtext' })
  name: string

  @ApiProperty()
  test: string
}

@Controller()
@ApiExtraModels(postHelloBody)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/JC=:id')
  // @ApiResponse({
  //   type: postHelloBody,
  // })
  getHello(@Param('id') id: number): postHelloBody {
    return (this.appService.getHello() + ' ' + id) as any
  }

  @Post('/JC')
  @ApiResponse({
    status: 202,
    content: {
      'application/json': {
        schema: {
          $ref: getSchemaPath(postHelloBody),
        },
        example: {
          value: {
            name: 'bar name diffrent',
            age: 30,
            type: 'BAR',
          },
          description: 'This is Bar user Example',
        },
      },
    },
  })
  @ApiOperation({
    operationId: 'fetchDataHello',
    description: 'Generate an Helo',
    requestBody: {
      description: 'User body Example',
      required: true,
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: getSchemaPath(postHelloBody) },
              {
                type: 'array',
                items: { $ref: getSchemaPath(postHelloBody) },
              },
            ],
          },
          examples: {
            'Foo User': {
              value: {
                name: 'foo name diffrent',
                age: 20,
                type: 'FOO',
              },
              description: 'This is Foo user Example',
            },
            'Bar User': {
              value: {
                name: 'bar name diffrent',
                age: 30,
                type: 'BAR',
              },
              description: 'This is Bar user Example',
            },
          },
        },
      },
    },
  })
  postHello(@Req() request: Request): string {
    // if (data instanceof Array) {
    //   data = data[0]
    // }
    console.log(request.body)
    return this.appService.getHello() + request.body.name
  }
}
