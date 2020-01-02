import { isDev } from ".";

type Options = {
  type?: "info" | "error";
  always?: boolean;
};

export function loggy(str: string, _opt?: Options) {
  let opt = Object.assign(
    {
      type: "info",
      always: false
    },
    _opt
  );

  const _loggy = () => {
    console[opt.type || "log"](str);
  };

  if (opt.always) {
    _loggy();
  } else if (isDev) {
    _loggy();
  }
}
