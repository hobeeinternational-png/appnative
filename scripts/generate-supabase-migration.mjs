import fs from "node:fs";
import path from "node:path";

const root = "/home/ubuntu/hobee-mobile";
const sourceTablesPath = "/home/ubuntu/.mcp/tool-results/2026-08-13_11-48-47.039104701_supabase_list_tables_da557f96.json";
const sourcePoliciesPath = "/home/ubuntu/.mcp/tool-results/2026-08-13_11-55-02.642233645_supabase_execute_sql_84dd34c1.json";
const sourceFunctionsPath = "/home/ubuntu/.mcp/tool-results/2026-08-13_11-56-01.787811403_supabase_execute_sql_f6290d69.json";
const outputPath = path.join(root, "supabase/migrations/20260813_hobee_platform_schema.sql");
const mcpInputPath = path.join(root, ".tmp-target-schema-migration.json");

function quotedIdentifier(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function tableRef(qualified) {
  const [schema, table] = qualified.split(".");
  return `${quotedIdentifier(schema)}.${quotedIdentifier(table)}`;
}

function extractEmbeddedJson(filePath) {
  const wrapped = JSON.parse(fs.readFileSync(filePath, "utf8")).result;
  const match = wrapped.match(/<untrusted-data-[^>]+>\n([\s\S]*?)\n<\/untrusted-data/);
  if (!match) throw new Error(`Cannot parse data response from ${filePath}`);
  return JSON.parse(match[1]);
}

function sqlType(column) {
  if (column.data_type === "timestamp with time zone") return "timestamptz";
  if (column.data_type === "timestamp without time zone") return "timestamp";
  if (column.data_type === "character") return column.name === "country_code" ? "char(2)" : "char(3)";
  return column.data_type;
}

function columnSql(column) {
  const nullable = column.options?.includes("nullable");
  const unique = column.options?.includes("unique");
  const parts = [quotedIdentifier(column.name), sqlType(column)];
  if (column.default_value) parts.push(`DEFAULT ${column.default_value}`);
  if (!nullable) parts.push("NOT NULL");
  if (unique) parts.push("UNIQUE");
  if (column.check) parts.push(`CHECK (${column.check})`);
  return parts.join(" ");
}

const sourceTables = JSON.parse(fs.readFileSync(sourceTablesPath, "utf8")).tables;
const sourcePolicies = extractEmbeddedJson(sourcePoliciesPath);
const sourceFunctions = extractEmbeddedJson(sourceFunctionsPath);
const sql = [];

sql.push("-- Generated from the authorized HOBEE PLATFORM1 schema on 2026-08-13.");
sql.push("-- This migration creates schema, helpers, RLS policies, and product image storage only; it does not copy customer data.");
sql.push("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
sql.push("CREATE SCHEMA IF NOT EXISTS private;");

for (const table of sourceTables) {
  const definitions = table.columns.map(columnSql);
  if (table.primary_keys?.length) {
    definitions.push(`PRIMARY KEY (${table.primary_keys.map(quotedIdentifier).join(", ")})`);
  }
  sql.push(`CREATE TABLE IF NOT EXISTS ${tableRef(table.name)} (\n  ${definitions.join(",\n  ")}\n);`);
}

const constraints = new Map();
for (const table of sourceTables) {
  for (const fk of table.foreign_key_constraints ?? []) {
    constraints.set(fk.name, {
      name: fk.name,
      sourceTable: fk.source_table,
      sourceColumns: fk.source_columns,
      targetTable: fk.target_table,
      targetColumns: fk.target_columns,
    });
  }
}
for (const fk of constraints.values()) {
  sql.push(`DO $$ BEGIN\n  ALTER TABLE ${tableRef(fk.sourceTable)} ADD CONSTRAINT ${quotedIdentifier(fk.name)} FOREIGN KEY (${fk.sourceColumns.map(quotedIdentifier).join(", ")}) REFERENCES ${tableRef(fk.targetTable)} (${fk.targetColumns.map(quotedIdentifier).join(", ")});\nEXCEPTION WHEN duplicate_object THEN NULL;\nEND $$;`);
}

for (const fn of sourceFunctions) sql.push(fn.definition.trim() + ";");

sql.push("DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;");
sql.push("CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();");
for (const table of sourceTables.filter((table) => table.columns.some((column) => column.name === "updated_at"))) {
  const triggerName = `set_${table.name.split(".")[1]}_updated_at`;
  sql.push(`DROP TRIGGER IF EXISTS ${quotedIdentifier(triggerName)} ON ${tableRef(table.name)};`);
  sql.push(`CREATE TRIGGER ${quotedIdentifier(triggerName)} BEFORE UPDATE ON ${tableRef(table.name)} FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();`);
}

for (const table of sourceTables) sql.push(`ALTER TABLE ${tableRef(table.name)} ENABLE ROW LEVEL SECURITY;`);
for (const policy of sourcePolicies) {
  const roles = policy.roles.replace(/^\{/, "").replace(/\}$/, "").split(",").filter(Boolean).join(", ");
  sql.push(`DROP POLICY IF EXISTS ${quotedIdentifier(policy.policyname)} ON public.${quotedIdentifier(policy.tablename)};`);
  let statement = `CREATE POLICY ${quotedIdentifier(policy.policyname)} ON public.${quotedIdentifier(policy.tablename)} AS PERMISSIVE FOR ${policy.cmd} TO ${roles}`;
  if (policy.qual) statement += ` USING (${policy.qual})`;
  if (policy.with_check) statement += ` WITH CHECK (${policy.with_check})`;
  sql.push(statement + ";");
}

sql.push("INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']) ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public, file_size_limit = EXCLUDED.file_size_limit, allowed_mime_types = EXCLUDED.allowed_mime_types;");
sql.push("DROP POLICY IF EXISTS product_images_public_read ON storage.objects;");
sql.push("CREATE POLICY product_images_public_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');");
sql.push("DROP POLICY IF EXISTS product_images_admin_insert ON storage.objects;");
sql.push("CREATE POLICY product_images_admin_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images' AND private.is_platform_admin());");
sql.push("DROP POLICY IF EXISTS product_images_admin_update ON storage.objects;");
sql.push("CREATE POLICY product_images_admin_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images' AND private.is_platform_admin()) WITH CHECK (bucket_id = 'product-images' AND private.is_platform_admin());");
sql.push("DROP POLICY IF EXISTS product_images_admin_delete ON storage.objects;");
sql.push("CREATE POLICY product_images_admin_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images' AND private.is_platform_admin());");
sql.push("REVOKE ALL ON FUNCTION public.create_order_from_items(uuid, uuid, jsonb) FROM PUBLIC;");
sql.push("GRANT EXECUTE ON FUNCTION public.create_order_from_items(uuid, uuid, jsonb) TO service_role;");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
const migrationSql = sql.join("\n\n") + "\n";
fs.writeFileSync(outputPath, migrationSql);
fs.writeFileSync(mcpInputPath, JSON.stringify({
  project_id: "tfqrykzqvdqxjnhzevvn",
  name: "hobee_platform_schema",
  query: migrationSql,
}, null, 2));
console.log(`Generated ${outputPath} and ${mcpInputPath} with ${sourceTables.length} tables, ${constraints.size} foreign keys, ${sourcePolicies.length} policies, and ${sourceFunctions.length} functions.`);
