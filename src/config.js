import * as url from "url";
import { Command } from "commander";
import dotenv from "dotenv";

const CommandLine = new Command();

// Options menu
CommandLine
  .option("--mode <mode>", "Modo de trabajo", "prod")
  .option("--appname <appname>", "Nombre de la app en Compass")
  .option("--port <port>", "Puerto de ejecución")
  .option("--server <server>", "Nombre del servidor")
  .option("--mongouri <mongouri>", "URI de MongoDB")
  .option("--secret <secret>", "Secret de activación")
  .option("--ghclientid <ghclientid>", "ID del cliente de GitHub")
  .option("--ghclientsecret <ghclientsecret>", "Secret del cliente de GitHub")
  .option("--ghcallbackurl <ghcallbackurl>", "Callback URL de GitHub")
CommandLine.parse()

export const CLOptions = CommandLine.opts();

const envPath = CLOptions.mode == "prod" ? "../environment/.env_production" : "../environment/.env_development";

dotenv.config({ path: envPath }); 


const { APP_NAME, PORT, SERVER, MONGO_URI, SECRET, GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, GITHUB_CALLBACK_URL } = process.env;

const config = {
  APP_NAME: CLOptions.appname || APP_NAME,
  PORT: CLOptions.port || PORT,
  DIRNAME: url.fileURLToPath(new URL(".", import.meta.url)),
  SERVER: CLOptions.server || SERVER,
  get UPLOAD_DIR() {
    return `${this.DIRNAME}/public/img`;
  },
  MONGO_URI: CLOptions.mongouri || MONGO_URI,
  MONGODB_ID_REGEX: /^[a-fA-F0-9]{24}$/,
  SECRET: CLOptions.secret || SECRET,
  GITHUB_CLIENT_ID: CLOptions.ghclientid || GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: CLOptions.ghclientsecret || GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL: CLOptions.ghcallbackurl || GITHUB_CALLBACK_URL
};

export default config;
