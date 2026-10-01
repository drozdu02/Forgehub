export class UserLoggedInEvent {
    constructor(
        public readonly userId: number,
        public readonly email: string,
    ){}
}