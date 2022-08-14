import { Request } from 'express';
import * as AWS from 'aws-sdk';

const provider = new AWS.CognitoIdentityServiceProvider();

/** @TODO aws-sdk types? */
export const getUser = async (req: Request): Promise<any> => {
  try {
    return (
      await provider
        .getUser({ AccessToken: `${req.body.accessToken}` })
        .promise()
    ).$response.data;
  } catch (e) {
    throw new Error('Cannot get user');
  }
};
