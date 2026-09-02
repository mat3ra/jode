import { expect } from "chai";

import { type JupyterEndpointProperty, getJupyterEndpointUrls } from "../../src/js/jupyter";

function makeEndpointProperty(
    jobId: string,
    unitId: string,
    token?: string,
): JupyterEndpointProperty {
    return {
        source: { info: { jobId, unitId } },
        data: { name: "jupyter_notebook_endpoint", token },
    };
}

describe("getJupyterEndpointUrls", () => {
    it("builds notebook and lab URLs from the matching endpoint property", () => {
        const properties = [
            makeEndpointProperty("job1", "unit-other", "wrong"),
            makeEndpointProperty("job1", "unit1", "tok123"),
        ];

        expect(getJupyterEndpointUrls("job1", "unit1", properties)).to.deep.equal({
            notebookUrl: "/jupyter/job1/unit1/tree/?token=tok123",
            labUrl: "/jupyter/job1/unit1/lab/?token=tok123",
        });
    });

    it("returns undefined when no property matches the job and unit", () => {
        const properties = [makeEndpointProperty("job2", "unit1", "tok123")];

        expect(getJupyterEndpointUrls("job1", "unit1", properties)).to.equal(undefined);
        expect(getJupyterEndpointUrls("job2", "unit2", properties)).to.equal(undefined);
    });

    it("returns undefined when the property has no token", () => {
        const properties = [makeEndpointProperty("job1", "unit1")];

        expect(getJupyterEndpointUrls("job1", "unit1", properties)).to.equal(undefined);
    });

    it("returns undefined for missing or empty properties", () => {
        expect(getJupyterEndpointUrls("job1", "unit1", undefined)).to.equal(undefined);
        expect(getJupyterEndpointUrls("job1", "unit1", null)).to.equal(undefined);
        expect(getJupyterEndpointUrls("job1", "unit1", [])).to.equal(undefined);
    });
});
