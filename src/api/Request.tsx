import axios, { Method } from 'axios';

export const request = async <T extends Record<string, any>>(args: {
  endpoint: string;
  method: Method;
  accessToken: string;
  idToken: string;
  data?: Record<string, any>;
}): Promise<T> => {
  const { endpoint, method, data = {}, accessToken, idToken } = args;

  const url =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000/local'
      : 'https://w4iayxg5a0.execute-api.ap-southeast-2.amazonaws.com/dev';

  const response = await axios({
    url: `${url}${endpoint}`,
    method: method,
    headers: {
      Authorization: idToken,
    },
    data: {
      accessToken: accessToken,
      ...data,
    },
  });

  return response.data as T;
};
