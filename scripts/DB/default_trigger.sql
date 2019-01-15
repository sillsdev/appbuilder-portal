-- Trigger notification for messaging to PG Notify
CREATE OR REPLACE FUNCTION notify_trigger() RETURNS trigger AS $trigger$
DECLARE
  rec RECORD;
  payload TEXT;
  id TEXT;
BEGIN
  -- Set record row depending on operation
  CASE TG_OP
  WHEN 'INSERT', 'UPDATE' THEN
     rec := NEW;
  WHEN 'DELETE' THEN
     rec := OLD;
  ELSE
     RAISE EXCEPTION 'Unknown TG_OP: "%". Should not occur!', TG_OP;
  END CASE;
  EXECUTE format('SELECT $1.%I::TEXT', 'Id')
    INTO id
    USING rec;
  -- Build the payload
  payload := '' 
              || '{'
              || '"table":"'     || TG_TABLE_NAME || '",'
              || '"id":"'        || id      || '",'
              || '"operation":"' || TG_OP         || '"'
              || '}';

  -- Notify the channel
  PERFORM pg_notify('db_notifications', payload);

  RETURN rec;
END;
$trigger$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS project_notify ON "Projects";
CREATE TRIGGER project_notify AFTER INSERT OR UPDATE OR DELETE ON "Projects"
FOR EACH ROW EXECUTE PROCEDURE notify_trigger();
