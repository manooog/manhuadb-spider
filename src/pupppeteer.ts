import { Browser, launch, Page } from "puppeteer";
import { isDev } from ".";

let b: Browser;
let sharedPage: Page;

export const loadUrl = async (url: string): Promise<Page> => {
  if (!b) {
    b = await launch({ timeout: 0 });
  }
  let _resolve;
  const loadFn = async () => {
    console.log(
      `\n加载 ${url} 完成`,
      isDev &&
        `页面内容: \n ${(
          await sharedPage.$eval("title", ele => ele.innerHTML)
        ).slice(0, 30)}`
    );

    _resolve(sharedPage);
  };
  if (!sharedPage) {
    sharedPage = await b.newPage();
  }
  sharedPage.once("load", loadFn);
  sharedPage.goto(url).catch(err => {
    _resolve(sharedPage);
  });

  return await new Promise(resolve => {
    _resolve = resolve;
  });
};
