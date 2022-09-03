import axios from 'axios';
import { Request, Response } from 'express';
import fs from 'fs';
import FormData from 'form-data';
import { Blob } from 'buffer';
import UserAgent from 'user-agents';
import { get } from '../db/db';
import { OAUTH_TABLE } from '../db/tables';
import { getUser } from '../utils/getUser';
const chromium = require('@sparticuz/chrome-aws-lambda');

/** Yes I am aware of how dangerous this function is in practice. The UI will make this extremely prevalent! */
export const pullCSVFromKonami = async (req: Request, res: Response) => {
  try {
    const user = await getUser(req);

    const item = await get<{ cognitoSub: string; tachiCode: string }>({
      table: OAUTH_TABLE,
      keyName: 'cognitoSub',
      keyValue: user.Username,
    });

    if (!item?.tachiCode) {
      throw new Error('User does not have tachi configured');
    }

    console.log('Fetching CSV');
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error('No username or password provided');
    } else {
      console.log(`Fetching csv for user ${username}...`);
    }

    const browser = await chromium.puppeteer.launch({
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
      args: [...chromium.args, '--proxy-server=home.pfy.ch:8080'],
    });

    console.log('Successfully created browser instance...');

    const page = await browser.newPage();
    const userAgent = new UserAgent({ deviceCategory: 'desktop' });
    await page.setUserAgent(userAgent.toString());
    await page.setViewport({
      width: Math.floor(Math.random() * (1440 - 1920 + 1) + 1920),
      height: Math.floor(Math.random() * (1920 - 1080 + 1) + 1080),
    });

    console.log('Going to site...');
    await page.goto('https://p.eagate.573.jp/');
    await page.evaluate(
      'javascript:ea_common_template.login.show_loginform();',
    );
    await page.waitForNavigation();

    console.log('Signing in...');
    console.log(await page.content());
    await page.type('input[name=userId]', username);
    await page.type('input[name=password]', password);
    await page.click('.submit');

    console.log('Navigating to csv...');
    await page.goto(
      'https://p.eagate.573.jp/game/2dx/29/djdata/score_download.html',
    );

    await page.waitForSelector('.dl-select');
    await page.click('.submit_btn[value="SP"]');
    await page.waitForSelector('#download');

    console.log('Pulling scores...');
    const scoreElement = await page.waitForSelector('#score_data');
    const scoreData = await scoreElement?.evaluate(
      (element) => element.textContent,
    );
    await browser.close();

    await fs.writeFileSync(
      `/tmp/${username}_score.csv`,
      scoreData.csv.replace(/\r/g, '\n'),
    );

    const file = fs.createReadStream(`/tmp/${username}_score.csv`, {
      encoding: 'utf8',
    });

    const form = new FormData();
    form.append('importType', 'file/eamusement-iidx-csv');
    form.append('scoreData', file);

    const apiKey = `Bearer ${item.tachiCode}`;
    await axios({
      url: 'https://kamaitachi.xyz/api/v1/import/file',
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: apiKey,
        'X-User-Intent': 'true',
      },
      data: form,
    });

    res.end(JSON.stringify({ csv: `${scoreData}` }));
  } catch (e) {
    console.error(e);
    res.end(JSON.stringify(e || { error: 'Unknown error occurred' }));
  }
};
