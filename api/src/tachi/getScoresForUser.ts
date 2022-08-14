import axios from 'axios';
import { Request, Response } from 'express';
import { get } from '../db/db';
import { OAUTH_TABLE } from '../db/tables';
import { getUser } from '../utils/getUser';
import { whoAmI } from './utils';

const castHour11s =
  'F7aaf1fe3b7bc5a346106a596e67ae2c86462c671d11c7f1db1422d8e7a421735';
const castHour12s =
  'F4641845dcaacfc772a35291197128d6958a0b2551d0831ea1ab6bf2901bad44a';

export const getScoresForUser = async (req: Request, res: Response) => {
  try {
    let responseBody = {};
    const user = await getUser(req);

    if (user) {
      const item = await get<{ cognitoSub: string; tachiCode: string }>({
        table: OAUTH_TABLE,
        keyName: 'cognitoSub',
        keyValue: user.Username,
      });

      if (item?.tachiCode) {
        const apiKey = `Bearer ${item.tachiCode}`;

        const user = await whoAmI(apiKey);

        const user11pbs = (
          await axios({
            method: 'GET',
            headers: {
              Authorization: apiKey,
            },
            url: `https://kamaitachi.xyz/api/v1/users/${user.id}/games/iidx/SP/folders/${castHour11s}`,
          })
        ).data.body;

        const user12pbs = (
          await axios({
            method: 'GET',
            headers: {
              Authorization: apiKey,
            },
            url: `https://kamaitachi.xyz/api/v1/users/${user.id}/games/iidx/SP/folders/${castHour12s}`,
          })
        ).data.body;

        responseBody = {
          success: true,
          body: {
            SP11: user11pbs,
            SP12: user12pbs,
          },
        };
      } else {
        responseBody = {
          success: false,
          message: 'User not authenticated with tachi',
        };
      }
    }

    res.end(JSON.stringify(responseBody));
  } catch (e) {
    console.error(e);
    res.end(JSON.stringify(e));
  }
};
