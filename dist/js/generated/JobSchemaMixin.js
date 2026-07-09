"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobSchemaMixin = jobSchemaMixin;
function jobSchemaMixin(item) {
    Object.defineProperties(item, {
        workflow: {
            get() {
                return this.prop("workflow");
            },
            set(value) {
                this.setProp("workflow", value);
            },
            configurable: true,
            enumerable: true,
        },
        compute: {
            get() {
                return this.prop("compute");
            },
            set(value) {
                this.setProp("compute", value);
            },
            configurable: true,
            enumerable: true,
        },
        status: {
            get() {
                return this.prop("status");
            },
            set(value) {
                this.setProp("status", value);
            },
            configurable: true,
            enumerable: true,
        },
        rmsId: {
            get() {
                return this.prop("rmsId");
            },
            set(value) {
                this.setProp("rmsId", value);
            },
            configurable: true,
            enumerable: true,
        },
        startTime: {
            get() {
                return this.prop("startTime");
            },
            set(value) {
                this.setProp("startTime", value);
            },
            configurable: true,
            enumerable: true,
        },
        workDir: {
            get() {
                return this.prop("workDir");
            },
            set(value) {
                this.setProp("workDir", value);
            },
            configurable: true,
            enumerable: true,
        },
        _project: {
            get() {
                return this.prop("_project");
            },
            set(value) {
                this.setProp("_project", value);
            },
            configurable: true,
            enumerable: true,
        },
        _material: {
            get() {
                return this.prop("_material");
            },
            set(value) {
                this.setProp("_material", value);
            },
            configurable: true,
            enumerable: true,
        },
        parent: {
            get() {
                return this.prop("parent");
            },
            set(value) {
                this.setProp("parent", value);
            },
            configurable: true,
            enumerable: true,
        },
        runtimeContext: {
            get() {
                return this.prop("runtimeContext");
            },
            set(value) {
                this.setProp("runtimeContext", value);
            },
            configurable: true,
            enumerable: true,
        },
        scopeTrack: {
            get() {
                return this.prop("scopeTrack");
            },
            set(value) {
                this.setProp("scopeTrack", value);
            },
            configurable: true,
            enumerable: true,
        },
        // ExtendedJobSchema fields
        mode: {
            get() {
                return this.prop("mode");
            },
            set(value) {
                this.setProp("mode", value);
            },
            configurable: true,
            enumerable: true,
        },
        isExternal: {
            get() {
                return this.prop("isExternal");
            },
            set(value) {
                this.setProp("isExternal", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materials: {
            get() {
                return this.prop("_materials");
            },
            set(value) {
                this.setProp("_materials", value);
            },
            configurable: true,
            enumerable: true,
        },
        _materialsSet: {
            get() {
                return this.prop("_materialsSet");
            },
            set(value) {
                this.setProp("_materialsSet", value);
            },
            configurable: true,
            enumerable: true,
        },
        purged: {
            get() {
                return this.prop("purged");
            },
            set(value) {
                this.setProp("purged", value);
            },
            configurable: true,
            enumerable: true,
        },
        purgedAt: {
            get() {
                return this.prop("purgedAt");
            },
            set(value) {
                this.setProp("purgedAt", value);
            },
            configurable: true,
            enumerable: true,
        },
        dataset: {
            get() {
                return this.prop("dataset");
            },
            set(value) {
                this.setProp("dataset", value);
            },
            configurable: true,
            enumerable: true,
        },
    });
}
