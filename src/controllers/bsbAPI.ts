import { BodyParams, Configuration, Controller, Get, PathParams, Post } from "@tsed/common";
import { OperationId, array, from, OneOf, Tags, 
  Description, Required, Example, Returns,
  Default,
  Minimum,
  Maximum } from "@tsed/schema"
import { Hidden } from "@tsed/swagger";

import * as config from "@easybsb/bsbdef"

import {
  ApiVersionResponse,
  ParameterSetConfigRequest,
  ParameterSetRequest,
  InformationResponse,
  InformationResponseExample,
  ParameterDetailResponse,
  Categories,
  ResetValueResponse,
  ResetValueResponseEntry,
  SetValueResponse,
  SetValueResponseEntry,
  ValueResponse
} from "./../models";

import * as Models from "./../models";


import { BSB, MSG_TYPE } from "@easybsb/bsbjs/bsb"
import { bsbAPI } from "@easybsb/bsbjs/bsbAPI"
import { Definition } from "@easybsb/bsbjs/Definition"

import { Helper } from "@easybsb/bsbjs/Helper";

import { BSBServiceOptions } from "src/Server";

@Example({ parameter: 700 })
export class Parameter {
    
    @Required()
    @Description('The id of the parameter.')
    parameter: number
}

@Example({ parameter: 700, destination: 0 })
export class ParameterRequest extends Models.Parameter {
    @Default(0)
    @Minimum(0)
    @Maximum(127)
    @Description('The DST address there the packet is sent on the Bus')
    destination: number
}

export class ModelsParameterRequest extends Models.ParameterRequest {

} 

@Controller("/")
export class BSBApiController {

  bsbSettings: BSBServiceOptions

  bsb: bsbAPI

  constructor(@Configuration() private configuration: Configuration) {

    this.bsbSettings = this.configuration.get<BSBServiceOptions>('bsbServiceOptions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const definition = new Definition(config as any)

    const bsb = new BSB(definition, { family: 0, var: 0 }, 0xC3)

    bsb.connect(this.bsbSettings.connection.ip, this.bsbSettings.connection.port)

    this.bsb = new bsbAPI(bsb, this.bsbSettings.language)

    const language = 'DE'

    const nm = bsb.Log$.subscribe((log) => {

      // ToDo implement equivalent to telnet log
      console.log(
        Helper.toHexString(log.msg.data).padEnd(50, ' ') + MSG_TYPE[log.msg.typ].padStart(4, ' ') + ' '
        + Helper.toHexString([log.msg.src])
        + ' -> ' + Helper.toHexString([log.msg.dst])
        + ' ' + log.command?.command + ' ' + Helper.getLanguage(log.command?.description, language) + ' (' + log.command?.parameter + ') = '
        + (log.value?.toString(language) ?? '---')
      )
    });
  }

  //#region helpers
  private MakeArray<T>(data: T | T[]): T[] {
    if (data instanceof Array)
      return data

    return [data]
  }

  private id2ParameterRequest(id: string): ParameterRequest[] {
    return id
      .split(',')
      .map(item => {
        const res = new ParameterRequest()
        res.parameter = parseInt(item, 10)
        return res
      })
  }
  //#endregion

  //#region Index
  @Hidden()
  @Get("/")
  // maybe redirect to -> web
  getIndex(): string {
    return "Hallo"
  }
  //#endregion

  //#region General
  @Get("/JV")
  @Tags('General')
  @Returns(200, ApiVersionResponse).ContentType("application/json")
  getApiVersion(): ApiVersionResponse {
    return {
      api_version: '2.0'
    }
  }

  @Get("/JI")
  @Tags('General')
  @Returns(200, InformationResponse).ContentType("application/json")
  getInformations(): InformationResponse {
    return InformationResponseExample
  }
  //#endregion

  //#region Request per Parameter
  @Post("/JC")
  @OperationId("fetchParameterDetails")
  @Tags('Parameter')
  @Returns(200, ParameterDetailResponse).ContentType("application/json")
  async fetchParameterDetails(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterRequest object')
    @Example([{ parameter: 700 }, { parameter: 710 }])
    @Required()
    @OneOf(from(ParameterRequest), array().items(from(ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<ParameterDetailResponse> {

    // eslint-disable-next-line
    const payload = this.MakeArray(payloadArrayOrItem)

    const result = new ParameterDetailResponse()


    // eslint-disable-next-line
    return new Promise((done) => done(result as any))
  }

  @Get("/JC=:id")
  @OperationId("getParameterDetails")
  @Tags('Parameter')
  @Returns(200, ParameterDetailResponse).ContentType("application/json")
  async getParameterDetails(
    @PathParams("id")
    @Description('This can be an parameter of multiple parameter separated by comma.')
    @Example('700,710')
    id: string): Promise<ParameterDetailResponse> {
    return this.fetchParameterDetails(this.id2ParameterRequest(id))
  }


  @Post("/JR")
  @OperationId("fetchResetValues")
  @Tags('Parameter')
  @Returns(200, ResetValueResponse).ContentType("application/json")
  async fetchResetValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterRequest object')
    @Example([{ parameter: 700 }, { parameter: 710 }])
    @Required()
    @OneOf(from(ParameterRequest), array().items(from(ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<ResetValueResponse> {

    const payload = this.MakeArray(payloadArrayOrItem)

    const result = new ResetValueResponse()
    result['700'] = new ResetValueResponseEntry()
    result['700'].error = 0
    result['700'].value = payload[0].parameter.toString()
    return new Promise((done) => done(result))
  }

  @Get("/JR=:id")
  @OperationId("getResetValues")
  @Tags('Parameter')
  @Returns(200, ResetValueResponse).ContentType("application/json")
  async getResetValues(
    @PathParams("id")
    @Description('This can be an parameter of multiple parameter separated by comma.')
    @Example('700,710')
    id: string): Promise<ResetValueResponse> {
    return this.fetchResetValues(this.id2ParameterRequest(id))
  }

  @Post("/JQ")
  @OperationId("fetchValues")
  @Tags('Parameter')
  @Returns(200, ValueResponse).ContentType("application/json")
  async fetchValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterRequest object')
    @Example([{ parameter: 700 }, { parameter: 710 }])
    @Required()
    @OneOf(from(Models.ParameterRequest), array().items(from(Models.ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<ValueResponse> {

    return this.bsb.fetchValues(payloadArrayOrItem)
  }

  @Get("/JQ=:id")
  @OperationId("getValues")
  @Tags('Parameter')
  @Returns(200, ValueResponse).ContentType("application/json")
  async getValues(
    @PathParams("id")
    @Description('This can be an parameter of multiple parameter separated by comma.')
    @Example('700,710')
    id: string): Promise<ValueResponse> {
    return this.fetchValues(this.id2ParameterRequest(id))
  }

  @Post("/JS")
  @OperationId("setValues")
  @Tags('Parameter')
  @Returns(200, SetValueResponse).ContentType("application/json")
  async setValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterSetRequest object')
    @Example([{ parameter: 700, type: 1, value: "22.5", destination: 0 }, { parameter: 710, type: 1, value: "35.5" }])
    @Required()
    @OneOf(from(ParameterSetRequest), array().items(from(ParameterSetRequest)))
    payloadArrayOrItem: ParameterSetRequest | ParameterSetRequest[]): Promise<SetValueResponse> {

    const payload = this.MakeArray(payloadArrayOrItem)

    const result = new SetValueResponse()
    result['700'] = new SetValueResponseEntry()
    result['700'].status = payload[0].parameter
    return new Promise((done) => done(result))
  }
  //#endregion

  //#region Category
  @Get("/JK=ALL")
  @OperationId("getCategories")
  @Tags('Category')
  @Returns(200, Categories).ContentType("application/json")
  async getCategories(): Promise<Categories> {
    // eslint-disable-next-line
    return new Promise((done) => done({ all: true } as any))
  }

  @Get("/JK=:id")
  @OperationId("getCategory")
  @Tags('Category')
  @Returns(200, ParameterDetailResponse).ContentType("application/json")
  async getCategorie(
    @PathParams("id")
    @Description('This can be an parameter of multiple parameter separated by comma.')
    @Example('700,710')
    id: string): Promise<ParameterDetailResponse> {

    // eslint-disable-next-line
    return new Promise((done) => done({ all: id } as any))
    // et alle ids from category and than fetch ids
    //return this.fetchParameterDetails(this.id2ParameterRequest(id))
  }
  //#endregion

  //#region Configuration


  @Post("/JW")
  @OperationId("setConfigValues")
  @Tags('Configuration')
  @Returns(200, SetValueResponse).ContentType("application/json")
  async setConfigValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterSetConfigRequest object')
    @Example([{ parameter: 0, value: "15" }, { parameter: 6, value: "5" }])
    @Required()
    @OneOf(from(ParameterSetConfigRequest), array().items(from(ParameterSetConfigRequest)))
    payloadArrayOrItem: ParameterSetConfigRequest | ParameterSetConfigRequest[]): Promise<SetValueResponse> {

    const payload = this.MakeArray(payloadArrayOrItem)

    // TODO check RESUL
    // [
    //   {
    //     "0": null,
    //     "status": 1
    //   },
    //   {
    //     "6": null,
    //     "status": 1
    //   }
    // ]

    const result = new SetValueResponse()
    result['700'] = new SetValueResponseEntry()
    result['700'].status = payload[0].parameter
    return new Promise((done) => done(result))
  }
  //#endregion

}
