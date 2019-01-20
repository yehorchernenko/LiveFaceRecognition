export class UserEdit {
  constructor(
    public id: string,
    public displayName: string,
    public email: string,
    public password: string,
    public images: string[]
  ) {  }
}
