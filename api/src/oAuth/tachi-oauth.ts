/* eslint-disable camelcase */
import axios from 'axios';
import { Request, Response } from 'express';
import { get, put } from '../db/db';
import { OAUTH_TABLE } from '../db/tables';
import { getUser } from '../utils/getUser';

export const tachiOAuth = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);

    if (user && req.body.code) {
      const tokenResponse = await axios({
        url: 'https://kamaitachi.xyz/api/v1/oauth/token',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          code: req.body.code,
          client_id: 'CIa631a6f1cc474efe82e44a6ca0aff8d03d0b3f9e',
          client_secret: process.env.TACHI_SECRET,
          grant_type: 'authorization_code',
          redirect_uri: 'https://chart.pfy.ch/tachi-callback',
        }),
      });

      await put<{ cognitoSub: string; tachiCode: string }>({
        table: OAUTH_TABLE,
        object: {
          cognitoSub: user.Username,
          tachiCode: tokenResponse.data.body.token,
        },
      });
    }

    res.end(JSON.stringify({ status: 'success' }));
  } catch (e) {
    console.error(e);
    res.end(JSON.stringify(e));
  }
};

export const oAuthStatus = async (req: Request, res: Response) => {
  try {
    let responseBody = {};
    const user = await getUser(req);

    if (user) {
      const item = await get<{ cognitoSub: string; tachiCode: string }>({
        table: OAUTH_TABLE,
        keyName: 'cognitoSub',
        keyValue: user.Username,
      });

      responseBody = { tachiCode: !!item?.tachiCode };
    }

    res.end(JSON.stringify(responseBody));
  } catch (e) {
    res.end(JSON.stringify(e));
  }
};
