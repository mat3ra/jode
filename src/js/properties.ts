import type { PropertyHolderSchema } from "@mat3ra/esse/dist/js/types";

/** A job property row as it reaches the client: only the fields these helpers read. */
export type JobPropertyRow = Pick<PropertyHolderSchema, "source" | "data" | "repetition">;
