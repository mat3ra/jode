import type { PropertyHolderSchema } from "@mat3ra/esse/dist/js/types";

import type { JobPropertyRow } from "./properties";

type JupyterEndpointData = Extract<
    PropertyHolderSchema["data"],
    { name: "jupyter_notebook_endpoint" }
>;

export const JUPYTER_NOTEBOOK_ENDPOINT: JupyterEndpointData["name"] = "jupyter_notebook_endpoint";

/**
 * An endpoint a unit publishes while it runs, in the form its consumer needs: a label and where
 * it goes. What it looks like is not decided here.
 */
export type ExtraTab = {
    /** Stable identifier, unique within a unit. */
    id: string;
    /** Label shown on the tab. */
    itemName: string;
    /** Destination, relative to the platform origin. */
    href: string;
};

/**
 * Builds the extra tabs every unit in a job publishes, keyed by unit flowchart id
 * (`source.info.unitId` — the same identifier) and then by repetition: a unit inside a map
 * subworkflow runs once per branch and publishes its own endpoint, with its own token, per
 * repetition.
 *
 * Jupyter endpoints are the only source today. The unit's own property is what identifies it —
 * a row named `jupyter_notebook_endpoint` exists only for a Jupyter unit — so no consumer needs
 * to inspect `executable.name`, and nothing downstream of here names an application.
 *
 * `jobProperties` is expected to be already scoped to `jobId`; the jobId comparison is a
 * belt-and-braces check. Token presence is checked because these rows are database documents,
 * not type-checked values, and a missing token would otherwise build a dead link.
 *
 * The `/jupyter/<jobId>/<unitId>/` prefix is a contract shared by two other repositories, and
 * moving it here alone breaks them: rupy serves the notebook on exactly this path
 * (`c.NotebookApp.base_url` in `src/software/scripting/jupyter_lab/unit.py`) and the web-app proxy
 * reads jobId and unitId back out of it by position (`imports/proxy/server/jupyterProxy.js`).
 * The trailing slash on `tree/` deviates from what Jupyter itself advertises and is deliberate —
 * verified against jupyterLab 3.0.3, 4.3.0 and 4.6.0.
 */
export function getExtraTabsByUnitFlowchartId(
    jobId: string,
    jobProperties: readonly JobPropertyRow[] | null | undefined,
): Record<string, Record<number, ExtraTab[]>> {
    const tabsByUnitFlowchartId: Record<string, Record<number, ExtraTab[]>> = {};

    jobProperties?.forEach((property) => {
        if (property.data.name !== JUPYTER_NOTEBOOK_ENDPOINT) return;
        if (property.source.info.jobId !== jobId) return;

        const { unitId } = property.source.info;
        const { repetition } = property;
        const { token } = property.data;
        if (!token) return;

        const tabsByRepetition = tabsByUnitFlowchartId[unitId] ?? {};
        if (tabsByRepetition[repetition]) return;

        tabsByRepetition[repetition] = [
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
        tabsByUnitFlowchartId[unitId] = tabsByRepetition;
    });

    return tabsByUnitFlowchartId;
}
