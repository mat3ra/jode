import { expect } from "chai";
import type { OrderedMaterial } from "@mat3ra/wode";

import { Job, type JobEntity } from "../../src/js/Job";
import {
    JOB_FINAL_STATUS_LIST,
    JobStatus,
    JOB_STATUS_CLS,
    SINGLE_JOB_SUFFIX,
} from "../../src/js/enums";
import { defaultDataset } from "../../src/js/dataset";
import { renderJinjaTemplate, setJobNameBasedOnMaterials } from "../../src/js/utils";

// ─── Minimal fixtures ────────────────────────────────────────────────────────

const minimalWorkflowJson = {
    name: "Total Energy",
    properties: [],
    subworkflows: [],
    units: [],
    workflows: [],
};

function makeJobConfig(overrides: Partial<JobEntity> = {}): JobEntity {
    return {
        name: "Test Job",
        status: JobStatus.pre_submission,
        statusTrack: [],
        workflow: minimalWorkflowJson,
        dataset: defaultDataset,
        ...overrides,
    } as JobEntity;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Job", () => {
    describe("construction", () => {
        it("creates a Job from a minimal config with correct name and status", () => {
            const job = new Job(makeJobConfig());

            expect(job.name).to.equal("Test Job");
            expect(job.status).to.equal(JobStatus.pre_submission);
        });

        it("creates a Job with default dataset when none is provided", () => {
            const job = new Job(makeJobConfig({ dataset: undefined }));

            expect(job.dataset).to.deep.equal(defaultDataset);
        });

        it("initializes a WodeWorkflow instance from the workflow JSON", () => {
            const job = new Job(makeJobConfig());

            expect(job._workflow).to.exist;
            expect(job._workflow?.name).to.equal("Total Energy");
        });
    });

    describe("status helpers", () => {
        it("reports isInInitialStatus = true for pre_submission", () => {
            const job = new Job(makeJobConfig({ status: JobStatus.pre_submission }));

            expect(job.isInInitialStatus).to.equal(true);
        });

        it("reports isSubmitted = true for submitted status", () => {
            const job = new Job(makeJobConfig({ status: JobStatus.submitted }));

            expect(job.isSubmitted).to.equal(true);
        });

        it("reports isActive = true for active status", () => {
            const job = new Job(makeJobConfig({ status: JobStatus.active }));

            expect(job.isActive).to.equal(true);
        });

        it("reports isError = true for error status", () => {
            const job = new Job(makeJobConfig({ status: JobStatus.error }));

            expect(job.isError).to.equal(true);
        });

        it("reports isInFinalStatus = true for all terminal statuses", () => {
            for (const terminalStatus of JOB_FINAL_STATUS_LIST) {
                const job = new Job(makeJobConfig({ status: terminalStatus }));
                expect(
                    job.isInFinalStatus,
                    `Expected ${terminalStatus} to be a final status`,
                ).to.equal(true);
            }
        });

        it("reports isInFinalStatus = false for active status", () => {
            const job = new Job(makeJobConfig({ status: JobStatus.active }));

            expect(job.isInFinalStatus).to.equal(false);
        });
    });

    describe("JOB_STATUS_CLS", () => {
        it("returns 'success' for finished status", () => {
            expect(JOB_STATUS_CLS(JobStatus.finished)).to.equal("success");
        });

        it("returns 'error' for error status", () => {
            expect(JOB_STATUS_CLS(JobStatus.error)).to.equal("error");
        });

        it("returns 'default' for undefined status", () => {
            expect(JOB_STATUS_CLS(undefined)).to.equal("default");
        });
    });

    describe("setWorkflow / workflow getter", () => {
        it("allows setting a new workflow and reading it back", () => {
            const WodeWorkflow = require("@mat3ra/wode/dist/js/Workflow").default;
            const job = new Job(makeJobConfig());
            const newWorkflow = new WodeWorkflow({ ...minimalWorkflowJson, name: "Band Gap" });

            job.setWorkflow(newWorkflow);

            expect((job.workflow as { name?: string } | undefined)?.name).to.equal("Band Gap");
        });

        it("throws when accessing .workflowInstance when no workflow is set", () => {
            const job = new Job({
                name: "No Workflow",
                status: JobStatus.pre_submission,
            } as JobEntity);

            expect(() => job.workflowInstance).to.throw("Workflow not found");
        });
    });

    describe("toJSON", () => {
        it("includes workflow in the JSON output", () => {
            const job = new Job(makeJobConfig());
            const json = job.toJSON();

            expect(json).to.have.property("workflow");
            expect(json.workflow).to.have.property("name", "Total Energy");
        });
    });

    describe("createDefault", () => {
        it("creates a Job with pre_submission status", () => {
            const WodeWorkflow = require("@mat3ra/wode/dist/js/Workflow").default;
            const workflow = new WodeWorkflow(minimalWorkflowJson);

            // Use a plain object with minimum interface as a material stand-in
            const mockMaterial = {
                _id: "mat-1",
                name: "Silicon",
                getAsEntityReference: () => ({ _id: "mat-1", cls: "Material" }),
            } as unknown as OrderedMaterial;

            const job = Job.createFromWorkflow(workflow, mockMaterial);

            expect(job.status).to.equal(JobStatus.pre_submission);
            expect(job.dataset).to.deep.equal(defaultDataset);
        });
    });

    describe("statusTrack helpers", () => {
        it("statusTrackSorted returns items sorted chronologically", () => {
            const statusTrack = [
                { status: "active", trackedAt: 2000 },
                { status: "submitted", trackedAt: 1000 },
            ];
            const job = new Job(makeJobConfig({ statusTrack }));
            const sorted = job.statusTrackSorted;

            expect(sorted[0].trackedAt).to.be.lessThan(sorted[1].trackedAt);
        });

        it("submittedTimestamp returns the submitted track entry", () => {
            const statusTrack = [
                { status: "submitted", trackedAt: 1000 },
                { status: "active", trackedAt: 2000 },
            ];
            const job = new Job(makeJobConfig({ status: JobStatus.active, statusTrack }));

            expect(job.submittedTimestamp?.status).to.equal("submitted");
        });
    });
});

describe("renderJinjaTemplate", () => {
    it("renders a simple template with material context", () => {
        const result = renderJinjaTemplate("Hello {{ material.formula }}", {
            material: { formula: "Si" },
        });

        expect(result).to.equal("Hello Si");
    });

    it("returns the template unchanged when context is empty", () => {
        const result = renderJinjaTemplate("Hello world");

        expect(result).to.equal("Hello world");
    });
});

describe("setJobNameBasedOnMaterials", () => {
    it("appends jinja suffix when multi materials and no existing jinja pattern", () => {
        const WodeWorkflow = require("@mat3ra/wode/dist/js/Workflow").default;
        const workflow = new WodeWorkflow(minimalWorkflowJson);
        const job = new Job({
            name: "My Job",
            status: JobStatus.pre_submission,
            workflow: minimalWorkflowJson,
        } as unknown as JobEntity);
        job._workflow = workflow;
        const materials = [
            { _id: "1" } as unknown as OrderedMaterial,
            { _id: "2" } as unknown as OrderedMaterial,
        ];

        setJobNameBasedOnMaterials(job, materials);

        expect(job.name).to.equal(`My Job ${SINGLE_JOB_SUFFIX}`);
    });
});
