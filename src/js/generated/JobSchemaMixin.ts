import { InMemoryEntity } from "@mat3ra/code/dist/js/entity";
import type { BaseInMemoryEntitySchema, BaseJobSchema } from "@mat3ra/esse/dist/js/types";

export type JobSchemaMixin = Omit<BaseJobSchema, "workflow">;

export type JobInMemoryEntity = InMemoryEntity<BaseInMemoryEntitySchema & JobSchemaMixin>;

export function jobSchemaMixin<T extends InMemoryEntity>(
    item: InMemoryEntity,
): asserts item is T & JobSchemaMixin {
    // @ts-expect-error
    const properties: InMemoryEntity<JobSchemaMixin> & JobSchemaMixin = {
        get rmsId() {
            return this.prop("rmsId");
        },
        set rmsId(value: BaseJobSchema["rmsId"]) {
            this.setProp("rmsId", value);
        },
        get status() {
            return this.requiredProp("status");
        },
        set status(value: BaseJobSchema["status"]) {
            this.setProp("status", value);
        },
        get startTime() {
            return this.prop("startTime");
        },
        set startTime(value: BaseJobSchema["startTime"]) {
            this.setProp("startTime", value);
        },
        get workDir() {
            return this.prop("workDir");
        },
        set workDir(value: BaseJobSchema["workDir"]) {
            this.setProp("workDir", value);
        },
        get _material() {
            return this.prop("_material");
        },
        set _material(value: BaseJobSchema["_material"]) {
            this.setProp(
                "_material",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get _materials() {
            return this.prop("_materials");
        },
        set _materials(value: BaseJobSchema["_materials"]) {
            this.setProp(
                "_materials",
                value?.map((item: unknown) =>
                    item instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(item) : item,
                ),
            );
        },
        get _materialsSet() {
            return this.prop("_materialsSet");
        },
        set _materialsSet(value: BaseJobSchema["_materialsSet"]) {
            this.setProp(
                "_materialsSet",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get parent() {
            return this.prop("parent");
        },
        set parent(value: BaseJobSchema["parent"]) {
            this.setProp(
                "parent",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get runtimeContext() {
            return this.prop("runtimeContext");
        },
        set runtimeContext(value: BaseJobSchema["runtimeContext"]) {
            this.setProp(
                "runtimeContext",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get scopeTrack() {
            return this.prop("scopeTrack");
        },
        set scopeTrack(value: BaseJobSchema["scopeTrack"]) {
            this.setProp(
                "scopeTrack",
                value?.map((item: unknown) =>
                    item instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(item) : item,
                ),
            );
        },
        get dataset() {
            return this.prop("dataset");
        },
        set dataset(value: BaseJobSchema["dataset"]) {
            this.setProp(
                "dataset",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get purged() {
            return this.prop("purged");
        },
        set purged(value: BaseJobSchema["purged"]) {
            this.setProp("purged", value);
        },
        get purgedAt() {
            return this.prop("purgedAt");
        },
        set purgedAt(value: BaseJobSchema["purgedAt"]) {
            this.setProp("purgedAt", value);
        },
        get compute() {
            return this.requiredProp("compute");
        },
        set compute(value: BaseJobSchema["compute"]) {
            this.setProp(
                "compute",
                value instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(value) : value,
            );
        },
        get statusTrack() {
            return this.prop("statusTrack");
        },
        set statusTrack(value: BaseJobSchema["statusTrack"]) {
            this.setProp(
                "statusTrack",
                value?.map((item: unknown) =>
                    item instanceof InMemoryEntity ? InMemoryEntity.getDataForEntity(item) : item,
                ),
            );
        },
    };

    Object.defineProperties(item, Object.getOwnPropertyDescriptors(properties));
}
