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
 * Fields already provided by InMemoryEntity / NamedInMemoryEntity / DefaultableMixin
 * (via the `job` schema's `named_defaultable_has_metadata` composition) - skipped so
 * the generated mixin does not redeclare them.
 */
const SKIP_FIELDS = ["_id", "slug", "systemName", "schemaVersion", "name", "isDefault", "metadata"];

/**
 * Output file paths for each schema
 */
const OUTPUT_PATHS = {
    job: "src/js/generated/JobSchemaMixin.ts",
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
