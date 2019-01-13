import {VisitHistory} from './visit-history';

export class Visitor {
  constructor(
  public name: string,
  public email: string,
  public isPresent: boolean,
  public history: [VisitHistory],
  ) {}
}
