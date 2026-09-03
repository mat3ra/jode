#!/usr/bin/env node

/**
 * Script to generate mixin properties from JSON schema
 *
 * Usage:
 *   npx ts-node scripts/generate-mixins.ts
 */

import generateSchemaMixin from "@mat3ra/code/dist/js/generateSchemaMixin";
import allSchemas from "@mat3ra/esse/dist/js/schemas.json";
import type { JSONSchema7 } from "json-schema";

/**
 * `workflow` is skipped: the schema's own recursive `workflow.workflows` field (sub-workflows
 * share the parent's schema) resolves to a bare `{ type: "object" }` with no properties, so the
 * generated type would be `{}[]` - unusable. `Job.ts` hand-writes `workflow` against wode's real
 * `WorkflowSchema` instead (same reason wode's own `Workflow.workflows` is hand-written rather
 * than generated - see `workflow/base`'s `OUTPUT_PATHS` entry in wode's own generate-mixins.ts).
 */
const SKIP_FIELDS = ["workflow"];

/**
 * Output file paths for each schema. `job/base` (job's own properties - status, compute,
 * _material, etc.) generates a mixin without `_project` (composed onto the full `job` schema
 * separately, see `system/has-project`) or `owner`/`creator`/`name`/etc. (those come from
 * InMemoryEntity / NamedInMemoryEntity / DefaultableMixin, applied to `Job.prototype` directly
 * in `Job.ts`, not schema-generated) - mirrors `workflow/base`/`material/material-properties` in
 * wode/made rather than generating one mixin from the whole resolved `job` schema.
 */
const OUTPUT_PATHS = {
    "job/base": "src/js/generated/JobSchemaMixin.ts",
    "system/has-project": "src/js/generated/HasProjectSchemaMixin.ts",
};

function main() {
    // Type assertion to handle schema compatibility - the schemas from esse may have slightly different types
    const result = generateSchemaMixin(allSchemas as JSONSchema7[], OUTPUT_PATHS, SKIP_FIELDS);

    if (result.errorCount > 0) {
        process.exit(1);
    }
}

// Run the script if it's executed directly
main();
