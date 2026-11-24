import { parseKtp } from "./ktp.parser.js";
import { parseIc } from "./ic.parser.js";
import { parsePassport } from "./passport.parser.js";
import { parseStruk } from "./struk.parser.js";
import { parseLandingPage } from "./landing-page.parser.js";

export const DOCUMENT_PARSERS = {
  ktp: parseKtp,
  ic: parseIc,
  passport: parsePassport,
  struk: parseStruk,
  landing_page: parseLandingPage,
};
