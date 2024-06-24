import { AxiosRequestConfig, Method } from "axios";
import { apiKey } from "../constants";

export const isEmpty = (value: any): boolean =>
  value === undefined ||
  value === null ||
  (typeof value === "object" && Object.keys(value).length === 0) ||
  (typeof value === "string" && value.trim().length === 0);

export const createConfig = ({
  url,
  method,
  body,
}: {
  url: string;
  method: Method;
  body?: Object;
}) => {
  const config: AxiosRequestConfig = {
    method: method,
    maxBodyLength: Infinity,
    url,
    headers: {
      accept: "application/json",
      "X-Authorization": `Bearer ${apiKey}`,
    },
  };
  if (!isEmpty(body)) {
    config.data = body;
  }
  return config;
};
