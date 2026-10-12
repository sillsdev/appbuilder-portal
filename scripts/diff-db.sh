#!/usr/bin/env sh
prisma migrate diff --from-schema-datasource src/lib/prisma/schema.prisma --to-schema-datamodel src/lib/prisma/schema.prisma --exit-code
EXIT=$?
[ $EXIT -eq 2 ] && echo '⚠️  Database is out of date. Run `npm run migrate-db` to update.'
exit $EXIT
