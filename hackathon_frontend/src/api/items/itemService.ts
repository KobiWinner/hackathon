import { type QueryParams, createCrudService, extendCrudService } from "../createService";

import type {
    ItemCreate,
    ItemResponse,
    ItemUpdate,
} from "./types";

/**
 * Item Service - createCrudService factory ile oluşturulmuş
 * 
 * Temel CRUD metodları otomatik:
 * - itemService.getAll()
 * - itemService.getById(id)
 * - itemService.create(data)
 * - itemService.update(id, data)
 * - itemService.delete(id)
 * - itemService.search(params)
 */
export const itemService = extendCrudService(
    createCrudService<ItemResponse, ItemCreate, ItemUpdate>("/items"),
    (base) => ({
        /**
         * Title'a göre arama yapar
         */
        searchByTitle: async (title: string) => {
            return base.search({
                filters: [{ field: "title", operator: "contains", value: title }],
            });
        },

        /**
         * Description'a göre arama yapar
         */
        searchByDescription: async (description: string) => {
            return base.search({
                filters: [{ field: "description", operator: "contains", value: description }],
            });
        },
    })
);

// ==================== Legacy Exports (Geriye uyumluluk) ====================
// Mevcut kodun çalışmaya devam etmesi için eski fonksiyon isimleri

/**
 * @deprecated Use itemService.search() instead
 */
export const searchItems = (params?: QueryParams) => itemService.search(params ?? {});

/**
 * @deprecated Use itemService.getById() instead
 */
export const getItemById = (id: number) => itemService.getById(id);

/**
 * @deprecated Use itemService.create() instead
 */
export const createItem = (data: ItemCreate) => itemService.create(data);

/**
 * @deprecated Use itemService.update() instead
 */
export const updateItem = (id: number, data: ItemUpdate) => itemService.update(id, data);

/**
 * @deprecated Use itemService.delete() instead
 */
export const deleteItem = (id: number) => itemService.delete(id);
