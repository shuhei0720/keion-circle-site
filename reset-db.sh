#!/bin/bash
export $(cat .env.local | grep -v '^#' | xargs)
npx prisma db push --force-reset --accept-data-loss
