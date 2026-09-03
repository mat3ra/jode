import type { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, HasProjectSchema } from "@mat3ra/esse/dist/js/types";

export type HasProjectSchemaMixin = Omit<HasProjectSchema, "workflow">;

export type HasProjectInMemoryEntity = InMemoryEntity<
    BaseInMemoryEntitySchema & HasProjectSchemaMixin
>;

export function hasProjectSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & HasProjectSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<HasProjectSchemaMixin> & HasProjectSchemaMixin = {
        get _project() {
            return this.requiredProp("_project");
        },
        set _project(value: HasProjectSchema["_project"]) {
            this.setProp("_project", value);
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
