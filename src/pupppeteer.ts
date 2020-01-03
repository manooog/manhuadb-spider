import { Browser, launch, Page } from "puppeteer";
import { sleep } from "./utils";
import { loggy } from "./loggy";

type SharedPage = {
  pageIns: Page;
  status: "pending" | "free";
  id: string;
};

let browser: Browser;
const maxPageCount: number = 5;
let sharedPages: Array<SharedPage | undefined> = [];

async function makeSureBrowser() {
  if (!browser) {
    browser = await launch({ timeout: 0 });
  }
}

async function getFreePageIns(): Promise<SharedPage | undefined> {
  let page: SharedPage | undefined;
  if (sharedPages.length < maxPageCount) {
    sharedPages.push(undefined);
    let index = sharedPages.length - 1;
    page = {
      pageIns: await browser.newPage(),
      status: "free",
      id: `NO.${index + 1}`
    };
    sharedPages.splice(index, 1, page);
  } else {
    page = sharedPages.find(page => page?.status === "free");
  }
  return page;
}

export const loadUrl = async (url: string): Promise<[Page, SharedPage]> => {
  await makeSureBrowser();
  let sharedPage: Page;
  let _resolve;
  let loadResult: boolean = true;
  const ins = await getFreePageIns();
  const _timeStart = +new Date();
  const loadFn = async () => {
    if (!loadResult) return;
    try {
      loggy(`使用${ins?.id}实例加载 ${url} 完成\n${await sharedPage.title()}`);
    } catch (error) {
      // err but don't know why.
    } finally {
      _resolve();
    }
  };

  if (!!ins && ins.status === "free") {
    sharedPage = ins.pageIns;
    // ins is mutable, set this value change sharedPages value too.
    ins.status = "pending";
  } else {
    await sleep(1);
    return await loadUrl(url);
  }
  sharedPage.once("load", loadFn);
  sharedPage
    .goto(url, {
      // if set 0, the instace will not get free again.
      timeout: Number(process.env.TIMEOUT || 30) * 1000
    })
    .catch(err => {
      loggy(
        `使用${ins.id}加载 ${url} 失败\n${err.toString().slice(0, 50)}...`,
        { type: "error", always: true }
      );
      loadResult = false;
      _resolve();
    });

  return await new Promise(resolve => {
    _resolve = () => {
      const deltaTime = (+new Date() - _timeStart) / 1000 + "s";
      loggy(`耗时${deltaTime}`, { always: true });
      resolve([sharedPage, ins]);
    };
  });
};
