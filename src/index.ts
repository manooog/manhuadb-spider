import { loadUrl } from "./pupppeteer";
import DotEnv from "dotenv";
import PDFDocument from "pdfkit";
import fs from "fs";
import { saveCachePath, resolvePath, saveFilePath } from "./file";

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
  const imgUrl = await page.$(".img-fluid.show-pic");

  if (!imgUrl) return "";

  await imgUrl?.screenshot({
    path: imgPath,
    omitBackground: true
  });

  return imgPath;
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

  const bookPDF = new PDFDocument();

  bookPDF.pipe(
    fs.createWriteStream(
      saveFilePath(resolvePath("../output", `${path.replace(/\//g, "-")}.pdf`))
    )
  );
  bookPDF.text(path);

  for (let index = 1; index <= allBookPage; index++) {
    const imagePath = await loadPage(path, index);
    if (!imagePath) break;
    bookPDF.addPage().image(imagePath, {
      align: "center",
      valign: "center",
      width: 450
    });
  }

  bookPDF.save().end();
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
