import { expect } from "chai";

import { getExtraTabsByUnitFlowchartId, JUPYTER_NOTEBOOK_ENDPOINT } from "../../src/js/jupyter";
import type { JobPropertyRow } from "../../src/js/properties";

function makeEndpointProperty(
    jobId: string,
    unitId: string,
    token: string,
    repetition = 0,
): JobPropertyRow {
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

/** The mirror of makeEndpointProperty: what that row is expected to produce. */
function expectedTabs(jobId: string, unitId: string, token: string) {
    return [
        {
            id: "notebook",
            itemName: "Notebook",
            href: `/jupyter/${jobId}/${unitId}/tree/?token=${token}`,
        },
        {
            id: "lab",
            itemName: "Lab",
            href: `/jupyter/${jobId}/${unitId}/lab/?token=${token}`,
        },
    ];
}

describe("getExtraTabsByUnitFlowchartId", () => {
    it("builds notebook and lab tabs per unit", () => {
        const properties = [
            makeEndpointProperty("job1", "unit1", "tok123"),
            makeEndpointProperty("job1", "unit2", "tok456"),
        ];

        expect(getExtraTabsByUnitFlowchartId("job1", properties)).to.deep.equal({
            unit1: { 0: expectedTabs("job1", "unit1", "tok123") },
            unit2: { 0: expectedTabs("job1", "unit2", "tok456") },
        });
    });

    it("keeps one entry per repetition of a mapped unit", () => {
        const properties = [
            makeEndpointProperty("job1", "unit1", "tok-rep0", 0),
            makeEndpointProperty("job1", "unit1", "tok-rep1", 1),
        ];

        const tabs = getExtraTabsByUnitFlowchartId("job1", properties);

        expect(tabs.unit1[0]).to.deep.equal(expectedTabs("job1", "unit1", "tok-rep0"));
        expect(tabs.unit1[1]).to.deep.equal(expectedTabs("job1", "unit1", "tok-rep1"));
    });

    it("ignores properties belonging to another job", () => {
        const properties = [
            makeEndpointProperty("job2", "unit1", "wrong"),
            makeEndpointProperty("job1", "unit1", "tok123"),
        ];

        expect(getExtraTabsByUnitFlowchartId("job1", properties).unit1[0]).to.deep.equal(
            expectedTabs("job1", "unit1", "tok123"),
        );
        expect(getExtraTabsByUnitFlowchartId("job2", properties).unit1[0]).to.deep.equal(
            expectedTabs("job2", "unit1", "wrong"),
        );
    });

    it("ignores properties of other names and rows without a token", () => {
        const otherProperty = {
            source: { type: "exabyte", info: { jobId: "job1", unitId: "unit1" } },
            repetition: 0,
            data: { name: "band_gaps" as const, values: [] },
        } as unknown as JobPropertyRow;
        const tokenless = makeEndpointProperty("job1", "unit2", "");

        expect(getExtraTabsByUnitFlowchartId("job1", [otherProperty, tokenless])).to.deep.equal({});
    });

    it("returns an empty map for missing or empty properties", () => {
        expect(getExtraTabsByUnitFlowchartId("job1", undefined)).to.deep.equal({});
        expect(getExtraTabsByUnitFlowchartId("job1", null)).to.deep.equal({});
        expect(getExtraTabsByUnitFlowchartId("job1", [])).to.deep.equal({});
    });
});
