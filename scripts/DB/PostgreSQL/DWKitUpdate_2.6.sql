BEGIN;

DO $CanBeInlined$ 
BEGIN
    BEGIN
        BEGIN
            ALTER TABLE "WorkflowScheme" ADD COLUMN "CanBeInlined" boolean NOT NULL DEFAULT FALSE;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column CanBeInlined already exists in WorkflowScheme.';
        END;
    END;
END $CanBeInlined$;

DO $InlinedSchemes$ 
BEGIN
    BEGIN
        BEGIN
            ALTER TABLE "WorkflowScheme" ADD COLUMN "InlinedSchemes" character varying(1024) NULL;
        EXCEPTION
            WHEN duplicate_column THEN RAISE NOTICE 'column InlinedSchemes already exists in WorkflowScheme.';
        END;
    END;
END $InlinedSchemes$;

COMMIT;