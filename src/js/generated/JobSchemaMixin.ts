import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, BaseJobSchema } from "@mat3ra/esse/dist/js/types";

export type JobSchemaMixin = Omit<
    BaseJobSchema,
    | "workflow"
    | "_material"
    | "_materials"
    | "_materialsSet"
    | "parent"
    | "runtimeContext"
    | "scopeTrack"
    | "dataset"
    | "compute"
    | "statusTrack"
> & {
    get _material(): BaseJobSchema["_material"];
    set _material(value: BaseJobSchema["_material"] | InMemoryEntity);
    get _materials(): BaseJobSchema["_materials"];
    set _materials(
        value: (NonNullable<BaseJobSchema["_materials"]>[number] | InMemoryEntity)[] | undefined,
    );
    get _materialsSet(): BaseJobSchema["_materialsSet"];
    set _materialsSet(value: BaseJobSchema["_materialsSet"] | InMemoryEntity);
    get parent(): BaseJobSchema["parent"];
    set parent(value: BaseJobSchema["parent"] | InMemoryEntity);
    get runtimeContext(): BaseJobSchema["runtimeContext"];
    set runtimeContext(value: BaseJobSchema["runtimeContext"] | InMemoryEntity);
    get scopeTrack(): BaseJobSchema["scopeTrack"];
    set scopeTrack(
        value: (NonNullable<BaseJobSchema["scopeTrack"]>[number] | InMemoryEntity)[] | undefined,
    );
    get dataset(): BaseJobSchema["dataset"];
    set dataset(value: BaseJobSchema["dataset"] | InMemoryEntity);
    get compute(): BaseJobSchema["compute"];
    set compute(value: BaseJobSchema["compute"] | InMemoryEntity);
    get statusTrack(): BaseJobSchema["statusTrack"];
    set statusTrack(
        value: (NonNullable<BaseJobSchema["statusTrack"]>[number] | InMemoryEntity)[] | undefined,
    );
};

export type JobInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & JobSchemaMixin>;

export function jobSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & JobSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<JobSchemaMixin> & JobSchemaMixin = {
        get rmsId(): BaseJobSchema["rmsId"] {
            return this.prop("rmsId");
        },
        set rmsId(value: BaseJobSchema["rmsId"]) {
            this.setProp("rmsId", value);
        },
        get status(): BaseJobSchema["status"] {
            return this.requiredProp("status");
        },
        set status(value: BaseJobSchema["status"]) {
            this.setProp("status", value);
        },
        get startTime(): BaseJobSchema["startTime"] {
            return this.prop("startTime");
        },
        set startTime(value: BaseJobSchema["startTime"]) {
            this.setProp("startTime", value);
        },
        get workDir(): BaseJobSchema["workDir"] {
            return this.prop("workDir");
        },
        set workDir(value: BaseJobSchema["workDir"]) {
            this.setProp("workDir", value);
        },
        get _material(): BaseJobSchema["_material"] {
            return this.prop("_material");
        },
        set _material(value: BaseJobSchema["_material"] | InMemoryEntity) {
            this.setProp("_material", InMemoryEntity.getDataForEntity(value));
        },
        get _materials(): BaseJobSchema["_materials"] {
            return this.prop("_materials");
        },
        set _materials(
            value:
                | (NonNullable<BaseJobSchema["_materials"]>[number] | InMemoryEntity)[]
                | undefined,
        ) {
            this.setProp(
                "_materials",
                value?.map((item) => InMemoryEntity.getDataForEntity(item)),
            );
        },
        get _materialsSet(): BaseJobSchema["_materialsSet"] {
            return this.prop("_materialsSet");
        },
        set _materialsSet(value: BaseJobSchema["_materialsSet"] | InMemoryEntity) {
            this.setProp("_materialsSet", InMemoryEntity.getDataForEntity(value));
        },
        get parent(): BaseJobSchema["parent"] {
            return this.prop("parent");
        },
        set parent(value: BaseJobSchema["parent"] | InMemoryEntity) {
            this.setProp("parent", InMemoryEntity.getDataForEntity(value));
        },
        get runtimeContext(): BaseJobSchema["runtimeContext"] {
            return this.prop("runtimeContext");
        },
        set runtimeContext(value: BaseJobSchema["runtimeContext"] | InMemoryEntity) {
            this.setProp("runtimeContext", InMemoryEntity.getDataForEntity(value));
        },
        get scopeTrack(): BaseJobSchema["scopeTrack"] {
            return this.prop("scopeTrack");
        },
        set scopeTrack(
            value:
                | (NonNullable<BaseJobSchema["scopeTrack"]>[number] | InMemoryEntity)[]
                | undefined,
        ) {
            this.setProp(
                "scopeTrack",
                value?.map((item) => InMemoryEntity.getDataForEntity(item)),
            );
        },
        get dataset(): BaseJobSchema["dataset"] {
            return this.prop("dataset");
        },
        set dataset(value: BaseJobSchema["dataset"] | InMemoryEntity) {
            this.setProp("dataset", InMemoryEntity.getDataForEntity(value));
        },
        get purged(): BaseJobSchema["purged"] {
            return this.prop("purged");
        },
        set purged(value: BaseJobSchema["purged"]) {
            this.setProp("purged", value);
        },
        get purgedAt(): BaseJobSchema["purgedAt"] {
            return this.prop("purgedAt");
        },
        set purgedAt(value: BaseJobSchema["purgedAt"]) {
            this.setProp("purgedAt", value);
        },
        get compute(): BaseJobSchema["compute"] {
            return this.requiredProp("compute");
        },
        set compute(value: BaseJobSchema["compute"] | InMemoryEntity) {
            this.setProp("compute", InMemoryEntity.getDataForEntity(value));
        },
        get statusTrack(): BaseJobSchema["statusTrack"] {
            return this.prop("statusTrack");
        },
        set statusTrack(
            value:
                | (NonNullable<BaseJobSchema["statusTrack"]>[number] | InMemoryEntity)[]
                | undefined,
        ) {
            this.setProp(
                "statusTrack",
                value?.map((item) => InMemoryEntity.getDataForEntity(item)),
            );
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
