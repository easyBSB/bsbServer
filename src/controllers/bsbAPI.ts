import { BodyParams, Configuration, Controller, Get, PathParams, Post } from "@tsed/common";
import { OperationId, array, from, OneOf, Tags, Description, Required, Example, Returns } from "@tsed/schema"
import { ResetValueResponse, ResetValueResponseEntry, SetValueResponse, SetValueResponseEntry, ValueResponse } from "../models/ValueResponses";
import { Hidden } from "@tsed/swagger";
import { ParameterRequest, ParameterSetConfigRequest, ParameterSetRequest } from "../models/ParameterRequests";
import { ApiVersionResponse } from "../models/ApiVersionResponse";
import { InformationResponse, InformationResponseExample } from "../models/InformationResponse";
import { ParameterDetailResponse } from "../models/ParameterDetailResponse";
import { Categories } from "../models/Categorie";

import { BSB, MSG_TYPE} from "@bsbJS/bsb"
import { Definition } from "@bsbJS/Definition"
import config from "@easybsb/bsbdef"
import * as Payloads from "@bsbJS/Payloads"
import { Helper } from "@bsbJS/Helper";

@Controller("/")
export class BSBApiController {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bsbSettings: any

  bsb:BSB

  constructor(@Configuration() private configuration: Configuration) {
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.bsbSettings = this.configuration.get<any>('bsbServiceOptions');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const definition = new Definition(config as any)

    this.bsb = new BSB(definition, { family:0, var: 0}, 0xC3)

    this.bsb.connect('192.168.203.179', 1000)

    console.log("*************************")
    console.log(this.bsbSettings)

    const language = 'DE'

    const nm = this.bsb.Log$.subscribe((log) => {

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
    @OneOf(from(ParameterRequest), array().items(from(ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<ValueResponse> {

    const payload = this.MakeArray(payloadArrayOrItem)

      const query = []
      for(const item of payload)
      {
        query.push(item.parameter)
      }

    const language = 'DE'
    
    
    return  await this.bsb.get(query)
            .then(data => {
                const result: ValueResponse = {}
                for (const res of data) {
                  
                    if (res) {

                        let error = 0
                        let value = res.value?.toString(language)
                        let desc = ''
                        if (res.value instanceof Payloads.Error) {
                            error = res.value.value ?? 0
                            value = ''
                        }

                        if (res.value instanceof Payloads.Enum) {
                            desc = value
                            value = res.value.value?.toString() ?? ''
                        }

                        result[res.command.parameter] = {
                            name: Helper.getLanguage(res.command.description, language) ?? '',
                            error: error,
                            value: value,
                            desc: desc,
                            dataType: res.command.type.datatype_id,
                            readonly: ((res.command.flags?.indexOf('READONLY') ?? -1) != -1) ? 1 : 0,
                            unit: Helper.getLanguage(res.command.type.unit, language) ?? ''
                        }
                    }
                }
                return result
            })
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
