export class Visitor {
  constructor(
  public name: string,
  public email: string,
  public isPresent: boolean,
  public totalTime: number,
  public formattedTotalTime: string,
  public lastVisit?: Date,
  public formattedLastVisit?: string
  ) {}
}
