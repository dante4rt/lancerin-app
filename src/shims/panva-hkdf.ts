import { hkdfSync } from "node:crypto";

function toBuffer(input: string | Buffer | Uint8Array): Buffer {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof Uint8Array) {
    return Buffer.from(input);
  }
  return Buffer.from(input, "utf8");
}

export function hkdf(
  digest: string,
  ikm: string | Buffer | Uint8Array,
  salt: string | Buffer | Uint8Array,
  info: string | Buffer | Uint8Array,
  keylen: number,
): Promise<Uint8Array> {
  const derived = hkdfSync(
    digest,
    toBuffer(ikm),
    toBuffer(salt),
    toBuffer(info),
    keylen,
  );

  return Promise.resolve(new Uint8Array(derived));
}

export default hkdf;
