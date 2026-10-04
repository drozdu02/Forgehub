export class MemberRoleChangedEvent {
    constructor(
        public readonly organizationId: string,
        public readonly memberId: string,
        public readonly role: string,
    ) {}
}