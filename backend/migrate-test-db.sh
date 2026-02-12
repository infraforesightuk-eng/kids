#!/bin/bash
set -e
DB_PATH="$(dirname "$0")/test.db"
if [ -f "$DB_PATH" ]; then
    rm "$DB_PATH"
fi
cd "$(dirname "$0")"
DATABASE_URL="file:./test.db" npx prisma migrate dev --name init
