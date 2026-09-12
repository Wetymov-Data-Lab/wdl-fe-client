import type { CoreApi } from "@/shared/api/contracts";
import { request } from "@/shared/api/http";

export const schemaEnums = {
  get: () =>
    request<CoreApi.EnumCatalog>("/metadata/enums").then((dto): Schema.EnumCatalog => ({
      databaseTypes: dto.database_types,
      columnTypes: dto.column_types,
      indexTypes: dto.index_types,
      sortOrders: dto.sort_orders,
      referentialActions: dto.referential_actions,
      relationshipCardinalities: dto.relationship_cardinalities,
      realmStatuses: dto.realm_statuses,
      realmVisibilities: dto.realm_visibilities,
    })),
};
