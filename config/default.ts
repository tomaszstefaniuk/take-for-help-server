let origin:
  | "https://take-for-help-eyrqfjk52-tstefaniuk.vercel.app"
  | "http://localhost:3000";

if (process.env.NODE_ENV === "production") {
  origin = "https://take-for-help-eyrqfjk52-tstefaniuk.vercel.app";
} else {
  origin = "http://localhost:3000";
}

export default {
  redisCacheExpiresIn: 60,
  refreshTokenExpiresIn: 60,
  accessTokenExpiresIn: 15,
  origin,
};
