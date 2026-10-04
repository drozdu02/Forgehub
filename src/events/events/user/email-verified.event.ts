export class UserVerifiedEvent {
    constructor(
        public readonly userId: number,
        public readonly email: string,
    ){}
}