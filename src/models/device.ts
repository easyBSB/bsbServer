import {
  Default,
  Description,
  Example,
  from,
  Maximum,
  Minimum,
  Property,
  Required,
  Schema,
  string
} from "@tsed/schema";

//   enum Categories {
//     CAT1 = "cat1",
//     CAT2 = "cat2"
//   }

@Example({ name: "test", value: "hello" })
export class Device {

  @Required()
  @Schema({
    oneOf: [
      {
        type: "array",
        items: {
          type: "string"
        }
      },
      { type: "string" }
    ]
  })
  name: string | number

  @Property()
  value: string
}



export class ParameterPostRequest {
  @Required()
  // @Schema({
  //   oneOf: [
  //     {
  //       type: "array",
  //       items: {
  //         type: "string"
  //       }
  //     },
  //     { type: "string" }
  //   ]
  // })

  @Schema({
    type: "array",
    items: {
      oneOf: [
        { type: "string" },
        {
          "$ref": '#/components/schemas/Device'
        }
      ]
    }
  })
  parameter: string | number

  @Description("")
  @Default(0)
  @Minimum(0)
  @Maximum(127)
  destination: number
}