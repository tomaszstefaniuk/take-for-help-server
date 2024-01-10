import { cleanEnv, port, str } from "envalid";

const validateEnv = () => {
  cleanEnv(process.env, {
    PORT: port(),
    NODE_ENV: str(),

    JWT_KEY: str(),

    DATABASE_URL: str(),
    POSTGRES_HOST: str(),
    POSTGRES_PORT: port(),
    POSTGRES_USER: str(),
    POSTGRES_PASSWORD: str(),
    POSTGRES_DB: str(),

    EMAIL_USER: str(),
    EMAIL_PASS: str(),
    EMAIL_HOST: str(),
    EMAIL_PORT: str(),
  });
};

export default validateEnv;
