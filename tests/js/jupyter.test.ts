import { expect } from "chai";

import {
    type JupyterEndpointProperty,
    getJupyterEndpointUrlsByUnitFlowchartId,
    JUPYTER_NOTEBOOK_ENDPOINT,
} from "../../src/js/jupyter";

function makeEndpointProperty(
    jobId: string,
    unitId: string,
    token: string,
    repetition = 0,
): JupyterEndpointProperty {
    return {
        source: { type: "exabyte", info: { jobId, unitId } },
        repetition,
        data: {
            name: JUPYTER_NOTEBOOK_ENDPOINT,
            host: "master-vagrant-cluster-001.mat3ra.com",
            port: 8888,
            token,
        },
    };
}

describe("getJupyterEndpointUrlsByUnitFlowchartId", () => {
    it("builds notebook and lab URLs per unit", () => {
        const properties = [
            makeEndpointProperty("job1", "unit1", "tok123"),
            makeEndpointProperty("job1", "unit2", "tok456"),
        ];

        expect(getJupyterEndpointUrlsByUnitFlowchartId("job1", properties)).to.deep.equal({
            unit1: {
                0: {
                    notebookUrl: "/jupyter/job1/unit1/tree/?token=tok123",
                    labUrl: "/jupyter/job1/unit1/lab/?token=tok123",
                },
            },
            unit2: {
                0: {
                    notebookUrl: "/jupyter/job1/unit2/tree/?token=tok456",
                    labUrl: "/jupyter/job1/unit2/lab/?token=tok456",
                },
            },
        });
    });

    it("keeps one entry per repetition of a mapped unit", () => {
        const properties = [
            makeEndpointProperty("job1", "unit1", "tok-rep0", 0),
            makeEndpointProperty("job1", "unit1", "tok-rep1", 1),
        ];

        const urls = getJupyterEndpointUrlsByUnitFlowchartId("job1", properties);

        expect(urls.unit1[0].notebookUrl).to.contain("tok-rep0");
        expect(urls.unit1[1].notebookUrl).to.contain("tok-rep1");
    });

    it("ignores properties belonging to another job", () => {
        const properties = [
            makeEndpointProperty("job2", "unit1", "wrong"),
            makeEndpointProperty("job1", "unit1", "tok123"),
        ];

        expect(getJupyterEndpointUrlsByUnitFlowchartId("job1", properties).unit1[0]).to.deep.equal({
            notebookUrl: "/jupyter/job1/unit1/tree/?token=tok123",
            labUrl: "/jupyter/job1/unit1/lab/?token=tok123",
        });
        expect(
            getJupyterEndpointUrlsByUnitFlowchartId("job2", properties).unit1[0].notebookUrl,
        ).to.contain("wrong");
    });

    it("ignores properties of other names and rows without a token", () => {
        const otherProperty = {
            source: { type: "exabyte", info: { jobId: "job1", unitId: "unit1" } },
            repetition: 0,
            data: { name: "band_gaps" as const, values: [] },
        } as unknown as JupyterEndpointProperty;
        const tokenless = makeEndpointProperty("job1", "unit2", "");

        expect(
            getJupyterEndpointUrlsByUnitFlowchartId("job1", [otherProperty, tokenless]),
        ).to.deep.equal({});
    });

    it("returns an empty map for missing or empty properties", () => {
        expect(getJupyterEndpointUrlsByUnitFlowchartId("job1", undefined)).to.deep.equal({});
        expect(getJupyterEndpointUrlsByUnitFlowchartId("job1", null)).to.deep.equal({});
        expect(getJupyterEndpointUrlsByUnitFlowchartId("job1", [])).to.deep.equal({});
    });
});
