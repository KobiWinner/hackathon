// Backend'deki Item schema'larına uygun tipler

export type ItemBase = {
    title: string;
    description: string;
};

export type ItemCreate = ItemBase;

export type ItemUpdate = {
    title?: string;
    description?: string;
};

export type ItemResponse = ItemBase & {
    id: number;
};

// Backend QueryParams için
export type QueryFilter = {
    field: string;
    operator: string;
    value: string | number | boolean;
};

export type QueryParams = {
    filters?: QueryFilter[];
    sort_by?: string;
    sort_order?: "asc" | "desc";
    skip?: number;
    limit?: number;
};
