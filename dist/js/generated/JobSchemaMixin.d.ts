import type { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { JobSchema, ExtendedJobSchema } from "@mat3ra/esse/dist/js/types";
/**
 * Combined partial schema type for the Job mixin. Fields that conflict with
 * InMemoryEntity / NamedInMemoryEntity (_id, slug, systemName, schemaVersion,
 * name, isDefault, metadata) are omitted — they are already provided by the
 * base class hierarchy.
 */
type ConflictingKeys = "_id" | "slug" | "systemName" | "schemaVersion" | "name" | "isDefault" | "metadata";
export type JobSchemaMixin = Omit<Partial<JobSchema>, ConflictingKeys> & Partial<ExtendedJobSchema>;
export type JobInMemoryEntity = InMemoryEntity & JobSchemaMixin;
export declare function jobSchemaMixin<T extends InMemoryEntity>(item: InMemoryEntity): asserts item is T & JobSchemaMixin;
export {};
