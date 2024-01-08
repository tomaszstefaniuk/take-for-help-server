import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
  if (process.env.NODE_ENV === "development") {
    cleanEnv(process.env, {
      DATABASE_URL: str(),

      POSTGRES_HOST: str(),
      POSTGRES_PORT: port(),
      POSTGRES_USER: str(),
      POSTGRES_PASSWORD: str(),
      POSTGRES_DB: str(),
    });
  } else {
    cleanEnv(process.env, {
      PORT: port(),
      NODE_ENV: str(),
    });
  }
};

export default validateEnv;
