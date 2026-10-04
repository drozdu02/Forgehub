import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganizationAuditActions1791072100000 implements MigrationInterface {
    name = 'AddOrganizationAuditActions1791072100000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TYPE "audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'ORGANIZATION_CREATED'`,
        );
        await queryRunner.query(
            `ALTER TYPE "audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'MEMBER_ADDED'`,
        );
        await queryRunner.query(
            `ALTER TYPE "audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'MEMBER_ROLE_CHANGED'`,
        );
        await queryRunner.query(
            `ALTER TYPE "audit_logs_action_enum" ADD VALUE IF NOT EXISTS 'MEMBER_REMOVED'`,
        );
    }

    public async down(): Promise<void> {}
}