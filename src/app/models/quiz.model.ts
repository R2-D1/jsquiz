import {Option} from "./option.model";

export interface Quiz {
  question: string;
  code: string;
  options: Option[];
}
