import type { NonScalarPropertyEnum } from "@mat3ra/esse/dist/js/types";

const JUPYTER_NOTEBOOK_ENDPOINT: NonScalarPropertyEnum = "jupyter_notebook_endpoint";

export type JupyterEndpointProperty = {
    source: { info: { jobId: string; unitId: string } };
    data: { name: string; token?: string };
};

export type JupyterEndpointUrls = {
    notebookUrl: string;
    labUrl: string;
};

export function getJupyterEndpointUrls(
    jobId: string,
    unitFlowchartId: string,
    jobProperties: readonly JupyterEndpointProperty[] | null | undefined,
): JupyterEndpointUrls | undefined {
    const endpoint = jobProperties?.find(
        (property) =>
            property.data.name === JUPYTER_NOTEBOOK_ENDPOINT &&
            property.source.info.jobId === jobId &&
            property.source.info.unitId === unitFlowchartId,
    );
    const token = endpoint?.data.token;
    if (!token) {
        return undefined;
    }
    return {
        notebookUrl: `/jupyter/${jobId}/${unitFlowchartId}/tree/?token=${token}`,
        labUrl: `/jupyter/${jobId}/${unitFlowchartId}/lab/?token=${token}`,
    };
}
