import { BodyParams, Controller, Post } from "@tsed/common";
import { OperationId, array, from, OneOf, Tags, Any, Description, Required, Example, Returns } from "@tsed/schema"
import { doesNotMatch } from "assert";


import { Device } from "../models/device"
import { ValueResponse, ValueResponseEntry } from "../models/ValueResponses";
//import { Hidden } from "@tsed/swagger";
import { ParameterRequest, ParameterSetRequest } from "../models/ParameterRequests";

@Controller("/")
@Tags("BSB Api")
export class BSBApiController {

  // @Hidden()
  // @Get("/")
  // getIndex() : string {
  //   return "Hallo"
  // }

  private MakeArray<T>(data: T | T[]): T[] {
    if (data instanceof Array)
      return data

    return [data]
  }

  @Post("/JR")
  @OperationId("fetchResetValues")
  async fetchResetValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterRequest object')
    @Example([{ parameter: 700 },{ parameter: 710 }])
    @Required()
    @OneOf(from(ParameterRequest), array().items(from(ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<string> {

    const payload = this.MakeArray(payloadArrayOrItem)

    const dd = new Device()
    dd.name = payload[0].parameter
    return new Promise((done)=> { done("Hallo") })
  }

  @Post("/JQ")
  @OperationId("fetchValues")
  @Returns(200, ValueResponse).ContentType("application/json")
  async fetchValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterRequest object')
    @Example([{ parameter: 700 },{ parameter: 710 }])
    @Required()
    @OneOf(from(ParameterRequest), array().items(from(ParameterRequest)))
    payloadArrayOrItem: ParameterRequest | ParameterRequest[]): Promise<ValueResponse> {

    const payload = this.MakeArray(payloadArrayOrItem)

    const result = new ValueResponse()
    result['700'] = new ValueResponseEntry()
    result['700'].value=payload[0].parameter.toString()
    return new Promise((done)=> done(result))
  }

  @Post("/JS")
  @OperationId("setValues")
  async setValues(
    @BodyParams()
    @Description('The body contains an array of just one simple ParameterSetRequest object')
    @Example([{ parameter: 700, type: 1, value:"22.5", destination: 0 },{ parameter: 710, type: 1, value:"35.5" }])
    @Required()
    @OneOf(from(ParameterSetRequest), array().items(from(ParameterSetRequest)))
    payloadArrayOrItem: ParameterSetRequest | ParameterSetRequest[]): Promise<string> {

    const payload = this.MakeArray(payloadArrayOrItem)

    const dd = new Device()
    dd.name = payload[0].parameter
    return new Promise((done)=> { done("Hallo") })
  }


  // @Get("/JQ=:id")
  // // @Schema({ "name": {
  // //   type: "string"
  // // }})
  // @OperationPath("PUT","/JQ=:id")
  // @Returns(200, Device2).ContentType("application/json")
  // @OperationId("getHelloWorld")
  // @Summary("summary of this function")
  // @Description("das ist dann ein längerere Text der Funktion")
  // get(@PathParams("id") id: string): Device2 {
  //   const dd = new Device2()
  //   dd.name = id
  //   return dd;
  // }
}
