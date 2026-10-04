import { MigrationInterface, QueryRunner } from 'typeorm';


export class AddEventIdToAuditLogs1791072000000 implements MigrationInterface {
    name = 'AddEventIdToAuditLogs1791072000000';

    public async up(
        queryRunner: QueryRunner
    ): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "audit_logs" ADD "eventId" uuid`,
        );
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_f953f2cb581d00109a05741e13" ON "audit_logs" ("eventId")`,
        );
    }

    public async down(
        queryRunner: QueryRunner
    ): Promise<void> {
        await queryRunner.query(
            `DROP INDEX "IDX_f953f2cb581d00109a05741e13"`,
        );

        await queryRunner.query(
            `ALTER TABLE "audit_logs" DROP COLUMN "eventId"`,
        );
    }
}