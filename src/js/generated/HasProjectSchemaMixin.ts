import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, HasProjectSchema } from "@mat3ra/esse/dist/js/types";

export type HasProjectSchemaMixin = Omit<HasProjectSchema, "workflow" | "_project"> & {
    get _project(): HasProjectSchema["_project"];
    set _project(value: HasProjectSchema["_project"] | InMemoryEntity);
};

export type HasProjectInMemoryEntity = InMemoryEntity<
    BaseInMemoryEntitySchema & HasProjectSchemaMixin
>;

export function hasProjectSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & HasProjectSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<HasProjectSchemaMixin> & HasProjectSchemaMixin = {
        get _project(): HasProjectSchema["_project"] {
            return this.requiredProp("_project");
        },
        set _project(value: HasProjectSchema["_project"] | InMemoryEntity) {
            this.setProp("_project", InMemoryEntity.getDataForEntity(value));
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
