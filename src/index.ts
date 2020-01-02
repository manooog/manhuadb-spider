import { loadUrl } from "./pupppeteer";
import DotEnv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import {
  saveCachePath,
  resolvePath,
  saveFilePath,
  execInChildProcess
} from "./file";

DotEnv.config();

export const isDev = process.env.ENV === "development";

function getUrl(uri) {
  const domain = "https://www.manhuadb.com";
  return domain + uri;
}

async function loadPage(bookPath: string, pageNum: number) {
  const imgPath = saveCachePath(
    bookPath.replace(/\//g, "-") + "-" + pageNum + ".png"
  );

  if (fs.existsSync(imgPath)) {
    return imgPath;
  }
  const pagePath = bookPath.replace(".", `_p${pageNum}.`);
  const page = await loadUrl(getUrl(pagePath));

  try {
    const img = await page.$(".img-fluid.show-pic");
    if (!img) return "";
    await img?.screenshot({
      path: imgPath,
      omitBackground: true
    });
  } catch (error) {
    return "";
  }

  return imgPath;
}

/**
 *
 * @param path eg: "/manhua/159/69_797.html"
 */
async function loadBook(path: string) {
  const page = await loadUrl(getUrl(path));
  let allBookPage: number | undefined;
  let title: string = "";
  try {
    allBookPage = await (
      await page.$(".form-control.vg-page-selector")
    )?.$$eval("option", list => list.length);

    title = await page.$eval("title", ele => ele.innerHTML);
  } catch (error) {
    allBookPage = undefined;
  }

  if (allBookPage === undefined) return;

  const pdfPath = saveFilePath(resolvePath("../output", `${title}.pdf`));

  if (fs.existsSync(pdfPath)) return;

  const pdfCachePath = saveFilePath(resolvePath("../output", `.${title}.pdf`));

  const bookPDF = new PDFDocument();
  bookPDF.pipe(fs.createWriteStream(pdfCachePath));
  bookPDF.text(path);

  let index = 1;

  for (; index <= allBookPage; index++) {
    const imagePath = await loadPage(path, index);
    if (!imagePath) break;
    bookPDF.addPage().image(imagePath, {
      align: "center",
      valign: "center",
      width: 450
    });
  }

  if (index < allBookPage) {
    execInChildProcess(`rm '${pdfCachePath}'`);
    // retry
    loadBook(path);
  } else {
    bookPDF.save().end();
    // 删除缓存文件？
    execInChildProcess(
      `rm ${saveCachePath(path.replace(/\//g, "-") + "-*.png")}`
    );
    execInChildProcess(`mv '${pdfCachePath}' '${pdfPath}'`);
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
    loadBook(book);
  }
})();
