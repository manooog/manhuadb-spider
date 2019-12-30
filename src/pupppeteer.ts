import { Browser, launch, Page } from "puppeteer";
import { isDev } from ".";

let b: Browser;
let sharedPage: Page;

export const loadUrl = async (url: string): Promise<Page> => {
  if (!b) {
    b = await launch();
  }
  let _resolve;
  const loadFn = async () => {
    console.log(
      `加载${url}完成`,
      isDev && `页面内容: \n ${(await sharedPage.content()).slice(0, 100)}`
    );

    _resolve(sharedPage);
  };
  if (!sharedPage) {
    sharedPage = await b.newPage();
  }
  sharedPage.once("load", loadFn);
  await sharedPage.goto(url);

  return await new Promise(resolve => {
    _resolve = resolve;
  });
};
