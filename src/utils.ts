/**
 *
 * @param time 秒
 */
export const sleep = async (time: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time * 1000);
  });
};
