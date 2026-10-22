-- Create the two canonical application roles.
INSERT INTO "Role" ("name", "createdAt", "updatedAt")
VALUES
  ('USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;

-- Preserve users assigned to legacy case variants such as "User" or "Admin".
UPDATE "User"
SET "roleId" = canonical_role."id"
FROM "Role" AS legacy_role
CROSS JOIN "Role" AS canonical_role
WHERE "User"."roleId" = legacy_role."id"
  AND LOWER(legacy_role."name") = LOWER(canonical_role."name")
  AND canonical_role."name" IN ('USER', 'ADMIN')
  AND legacy_role."name" <> canonical_role."name";

-- Remove the now-unused legacy role rows.
DELETE FROM "Role"
WHERE LOWER("name") IN ('user', 'admin')
  AND "name" NOT IN ('USER', 'ADMIN')
  AND NOT EXISTS (
    SELECT 1 FROM "User" WHERE "User"."roleId" = "Role"."id"
  );
