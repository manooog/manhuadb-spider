import { loadUrl } from "./pupppeteer";
import DotEnv from "dotenv";

DotEnv.config();

export const isDev = process.env.ENV === "development";

function getUrl(uri) {
  const domain = "https://www.manhuadb.com";
  return domain + uri;
}

async function loadPage(bookPath: string, pageNum: number) {
  const pagePath = bookPath.replace(".", `_p${pageNum}.`);
  const page = await loadUrl(getUrl(pagePath));
  const imgUrl = await page.$eval(".img-fluid.show-pic", img =>
    img.getAttribute("src")
  );

  console.log(imgUrl);
}

/**
 *
 * @param path eg: "/manhua/159/69_797.html"
 */
async function loadBook(path: string) {
  const page = await loadUrl(getUrl(path));
  const allBookPage: number | undefined = await (
    await page.$(".form-control.vg-page-selector")
  )?.$$eval("option", list => list.length);

  if (allBookPage === undefined) return;

  for (let index = 1; index <= allBookPage; index++) {
    await loadPage(path, index);
  }
}

(async () => {
  if (process.env.ID === undefined) return;
  const mainUrl = getUrl(`/manhua/${process.env.ID}`);
  const mainPage = await loadUrl(mainUrl);
  // 所有册的id
  let pids: string[] = await mainPage.$$eval(
    ".active .links-of-books.num_div .sort_div a",
    list => {
      let pids: string[] = [];
      for (const ele of list) {
        const id = ele.getAttribute("href");
        if (id) {
          pids.push(id);
        }
      }
      return pids;
    }
  );

  for (const book of pids) {
    await loadBook(book);
  }
})();
