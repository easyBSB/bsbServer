import { Configuration, Inject } from "@tsed/di";
import { $log, PlatformApplication } from "@tsed/common";
import "@tsed/platform-express"; // /!\ keep this import
import bodyParser from "body-parser";
import compress from "compression";
import cookieParser from "cookie-parser";
import methodOverride from "method-override";
import cors from "cors";
import "@tsed/ajv";
import "@tsed/swagger";

export const rootDir = __dirname;
export const isProduction = false //process.env.NODE_ENV === Env.PROD;

if (isProduction) {
  $log.appenders.set("stdout", {
    type: "stdout",
    levels: ["info", "debug"],
    layout: {
      type: "json"
    }
  });

  $log.appenders.set("stderr", {
    levels: ["trace", "fatal", "error", "warn"],
    type: "stderr",
    layout: {
      type: "json"
    }
  });
}


const bsbServiceOptions = {
  connection: {
    type: process.env.CONNECTION_TYPE || 'ip',
    ip: process.env.CONNECTION_IP || '192.168.203.179',
    port: parseInt(process.env.CONNECTION_PORT ?? '1000', 10),
  },
  language: 'DE'
}

export type BSBServiceOptions = typeof bsbServiceOptions
@Configuration({
  rootDir,
  acceptMimes: ["application/json"],
  httpPort: process.env.PORT || 8083,
  httpsPort: false, // CHANGE
  debug: false,

  logger: {
    disableRoutesSummary: isProduction,
    level: isProduction ? "error" : "info"
  },
  mount: {
    "/": [
      `${rootDir}/controllers/**/*.ts`
    ],
  },
  componentsScan: [
    `${rootDir}/services/**/*.ts`
  ],
  bsbServiceOptions: bsbServiceOptions,
  swagger: [
    {
      path: "/v2/docs",
      specVersion: "2.0"
    },
    {
      path: "/v3/docs",
      specVersion: "3.0.1"
    }
  ],
  // views: {
  //   root: `${rootDir}/../views`,
  //   viewEngine: "ejs"
  // },
  exclude: [
    "**/*.spec.ts"
  ]
})
export class Server {
  @Inject()
  app: PlatformApplication;

  @Configuration()
  settings: Configuration;

  $beforeRoutesInit(): void {

    this.app
      .use(cors())
      .use(cookieParser())
      .use(compress({}))
      .use(methodOverride())
      .use(bodyParser.json())
      .use(bodyParser.urlencoded({
        extended: true
      }));
  }
}
