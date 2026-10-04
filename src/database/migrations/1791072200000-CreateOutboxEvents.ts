import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOutboxEvents1791072200000 implements MigrationInterface {
    name = 'CreateOutboxEvents1791072200000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "outbox_events" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "type" character varying(100) NOT NULL,
                "payload" jsonb NOT NULL,
                "occuredAt" TIMESTAMP WITH TIME ZONE NOT NULL,
                "processedAt" TIMESTAMP WITH TIME ZONE,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_6689a16c00d09b8089f6237f1d2" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "outbox_events"`);
    }
}