import type { PropertyHolderSchema } from "@mat3ra/esse/dist/js/types";

type JupyterEndpointData = Extract<
    PropertyHolderSchema["data"],
    { name: "jupyter_notebook_endpoint" }
>;

export const JUPYTER_NOTEBOOK_ENDPOINT: JupyterEndpointData["name"] = "jupyter_notebook_endpoint";

/** A job property row as it reaches the client: only the fields this module reads. */
export type JupyterEndpointProperty = Pick<PropertyHolderSchema, "source" | "data" | "repetition">;

export type JupyterEndpointUrls = {
    notebookUrl: string;
    labUrl: string;
};

/**
 * Builds the platform-relative notebook and lab URLs of every Jupyter unit in a job, keyed by
 * unit flowchart id (`source.info.unitId` — the same identifier) and then by repetition: a unit
 * inside a map subworkflow runs once per branch and publishes one endpoint, with its own token,
 * per repetition.
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
export function getJupyterEndpointUrlsByUnitFlowchartId(
    jobId: string,
    jobProperties: readonly JupyterEndpointProperty[] | null | undefined,
): Record<string, Record<number, JupyterEndpointUrls>> {
    const urlsByUnitFlowchartId: Record<string, Record<number, JupyterEndpointUrls>> = {};

    jobProperties?.forEach((property) => {
        if (property.data.name !== JUPYTER_NOTEBOOK_ENDPOINT) return;
        if (property.source.info.jobId !== jobId) return;

        const { unitId } = property.source.info;
        const { repetition } = property;
        const { token } = property.data;
        if (!token) return;

        const urlsByRepetition = urlsByUnitFlowchartId[unitId] ?? {};
        if (urlsByRepetition[repetition]) return;

        urlsByRepetition[repetition] = {
            notebookUrl: `/jupyter/${jobId}/${unitId}/tree/?token=${token}`,
            labUrl: `/jupyter/${jobId}/${unitId}/lab/?token=${token}`,
        };
        urlsByUnitFlowchartId[unitId] = urlsByRepetition;
    });

    return urlsByUnitFlowchartId;
}
