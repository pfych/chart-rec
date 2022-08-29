import { Request, Response } from 'express';
import path from 'node:path';
const puppeteer = require('puppeteer');

/** Yes I am aware of how dangerous this function is in practice. The UI will make this extremely prevalent! */
export const pullCSVFromKonami = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new Error('No username or password provided');
    }

    const browserPath = path.resolve(
      '.',
      'node_modules',
      'puppeteer',
      '.local-chromium',
      'linux-1022525',
      'chrome-linux',
      'chrome',
    );

    const browser = await puppeteer.launch({
      executablePath: browserPath,
    });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:103.0) Gecko/20100101 Firefox/103.0',
    );

    console.log('Going to site...');
    await page.goto('https://p.eagate.573.jp/');

    await page.evaluate(
      'javascript:ea_common_template.login.show_loginform();',
    );
    await page.waitForNavigation();

    console.log('Signing in...');
    await page.type('input[name=userId]', username);
    await page.type('input[name=password]', password);

    await page.click('a[href="#"]');
    console.log('Checking credentials...');

    if ((await page.$('.error')) !== null) {
      throw new Error('Invalid credentials');
    }

    console.log('Navigating to csv...');
    await page.goto(
      'https://p.eagate.573.jp/game/2dx/29/djdata/score_download.html',
    );
    await page.waitForSelector('.dl-select');
    await page.click('.submit_btn[value="SP"]');

    await page.waitForSelector('#download');

    console.log('Pulling scores...');
    const scoreElement = await page.waitForSelector('#score_data');
    const scoreData = await scoreElement.evaluate(
      (element) => element.textContent,
    );

    await browser.close();

    res.end(JSON.stringify({ csv: `${scoreData}` }));
  } catch (e) {
    console.error(e);
    res.end(JSON.stringify(e));
  }
};
