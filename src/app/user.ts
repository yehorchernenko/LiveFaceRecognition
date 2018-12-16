export class User {
  constructor(
    public displayName: string,
    public email: string,
    public images?: [File]
  ) {  }
}
