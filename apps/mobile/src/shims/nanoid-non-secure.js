// Local shim for expo-router: Metro cannot resolve `nanoid/non-secure` in this monorepo.
const urlAlphabet =
  "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

function customAlphabet(alphabet, defaultSize = 21) {
  return (size = defaultSize) => {
    let id = "";
    let i = size | 0;
    while (i--) {
      id += alphabet[(Math.random() * alphabet.length) | 0];
    }
    return id;
  };
}

function nanoid(size = 21) {
  let id = "";
  let i = size | 0;
  while (i--) {
    id += urlAlphabet[(Math.random() * 64) | 0];
  }
  return id;
}

module.exports = { nanoid, customAlphabet };
