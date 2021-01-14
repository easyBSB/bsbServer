import { BodyParams, Configuration, Controller, Get, PathParams, Post } from "@tsed/common";
import { OperationId, array, from, OneOf, Tags, Description, Required, Example, Returns } from "@tsed/schema"
import { ResetValueResponse, ResetValueResponseEntry, SetValueResponse, SetValueResponseEntry, ValueResponse, ValueResponseEntry } from "../models/ValueResponses";
import { Hidden } from "@tsed/swagger";
import { ParameterRequest, ParameterSetRequest } from "../models/ParameterRequests";
import { ApiVersionResponse } from "../models/ApiVersionResponse";
import { InformationResponse, InformationResponseExample } from "../models/InformationResponse";
import { ParameterDetailResponse } from "../models/ParameterDetailResponse";
import { Categories } from "../models/Categorie";

@Controller("/")
export class BSBApiController {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bsbSettings: any

  constructor(@Configuration() private configuration: Configuration){
    this.bsbSettings = this.configuration.get<any>('bsbServiceOptions');

    console.log("*************************")
    console.log(this.bsbSettings)
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
  getIndex() : string {
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

    const result = new ValueResponse()
    result['700'] = new ValueResponseEntry()
    result['700'].value = payload[0].parameter.toString()
    return new Promise((done) => done(result))
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

}
