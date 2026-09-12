/* eslint-disable @typescript-eslint/no-namespace -- namespaces keep service ownership visible at every type usage */
import type {
  AccountStatus as IdentityAccountStatus,
  AccountSubject,
  ColumnType,
  CoreEnumCatalogDto,
  DatabaseType,
  RealmStatus,
  RealmVisibility,
  ReferentialAction,
  RelationshipCardinality,
} from "@/shared/api/core-enums";

/**
 * Единственная точка описания HTTP-контрактов приложения.
 * Namespace разделяет одинаковые сущности разных сервисов, а потребитель всегда
 * видит происхождение типа: `IdentityApi.Account` или `CoreApi.Database`.
 */
export namespace CoreApi {
  export type Id = string;
  export type EnumCatalog = CoreEnumCatalogDto;

  export type Position = {
    x: number;
    y: number;
  };

  export type Audit = {
    id: Id;
    author_id: Id;
    created_at: string;
    updated_at: string | null;
  };

  export type Realm = Audit & {
    name: string;
    slug: string;
    status: RealmStatus;
    visibility: RealmVisibility;
    settings: Record<string, unknown>;
    notice: string | null;
    deleted_at: string | null;
    updated_by: string | null;
  };

  export type CreateRealm = {
    name: string;
    slug: string;
    status: RealmStatus;
    visibility: RealmVisibility;
    settings: Record<string, unknown>;
    notice: string | null;
  };

  export type UpdateRealm = CreateRealm;

  export type Project = Audit & {
    realm_id: Id;
    name: string;
    notice: string | null;
  };

  export type CreateProject = {
    name: string;
    realm_id: Id;
    notice: string | null;
    author_id: string;
  };

  export type UpdateProject = Pick<CreateProject, "name" | "notice">;

  export type Database = Audit & {
    project_id: Id;
    name: string;
    type: DatabaseType;
    notice: string | null;
    default_schema: string | null;
    charset: string | null;
    collation: string | null;
  };

  export type CreateDatabase = Omit<Database, keyof Audit> & { author_id: string };
  export type UpdateDatabase = Omit<CreateDatabase, "project_id" | "author_id">;

  export type Table = Audit & {
    database_id: Id;
    name: string;
    schema_name: string | null;
    description: string | null;
    notice: string | null;
    color: string | null;
    position: Position;
    width: number | null;
    is_collapsed: boolean;
    sort_order: number;
  };

  export type CreateTable = Omit<Table, keyof Audit> & { author_id: string };
  export type UpdateTable = Omit<Table, keyof Audit | "database_id">;

  export type Column = Audit & {
    table_id: Id;
    name: string;
    type: ColumnType;
    custom_type: string | null;
    length: number | null;
    precision: number | null;
    scale: number | null;
    array_dimensions: number;
    nullable: boolean;
    primary_key: boolean;
    unique: boolean;
    auto_increment: boolean;
    unsigned: boolean;
    default: string | null;
    check: string | null;
    enum_values: string[];
    sort_order: number;
    notice: string | null;
  };

  export type CreateColumn = Omit<Column, keyof Audit> & { author_id: string };
  export type UpdateColumn = Omit<Column, keyof Audit | "table_id">;

  export type RelationshipColumnPair = {
    source_column_id: Id;
    target_column_id: Id;
  };

  export type Relationship = Audit & {
    database_id: Id;
    name: string | null;
    source_table_id: Id;
    target_table_id: Id;
    columns: RelationshipColumnPair[];
    source_cardinality: RelationshipCardinality;
    target_cardinality: RelationshipCardinality;
    on_delete: ReferentialAction;
    on_update: ReferentialAction;
    waypoints: Position[];
  };

  export type CreateRelationship = Omit<Relationship, keyof Audit> & { author_id: string };

  export type DiagramGroup = {
    id: Id;
    database_id: Id;
    name: string;
    position: Position;
    width: number;
    height: number;
    color: string | null;
    is_collapsed: boolean;
    table_ids: Id[];
  };
}

export namespace IdentityApi {
  export type AccountStatus = IdentityAccountStatus;

  export type UserInfo = {
    sub: string;
    email: string | null;
    name: string | null;
    given_name: string | null;
    family_name: string | null;
    picture: string | null;
    locale: string | null;
  };

  export type TokenPair = {
    access_token: string;
    refresh_token: string;
    token_type: "bearer";
    expires_in: number;
  };

  export type Profile = {
    id: string;
    account_id: string;
    display_name: string;
    given_name: string | null;
    family_name: string | null;
    bio: string | null;
    job_title: string | null;
    organization: string | null;
    locale: string | null;
    time_zone: string | null;
    picture_url: string | null;
    website_url: string | null;
    created_at: string;
    updated_at: string | null;
  };

  export type UpdateProfile = Pick<
    Profile,
    | "display_name"
    | "given_name"
    | "family_name"
    | "bio"
    | "job_title"
    | "organization"
    | "locale"
    | "time_zone"
    | "picture_url"
    | "website_url"
  >;

  export type Identifier = {
    id: string;
    account_id: string;
    type: string;
    value: string;
    provider: string | null;
    provider_user_id: string | null;
    is_verified: boolean;
    is_public_contact: boolean;
    receive_notifications: boolean;
    verified_at: string | null;
    last_used_at: string | null;
    created_at: string;
  };

  export type CreateIdentifier = {
    type: string;
    value: string;
    provider: string | null;
    provider_user_id: string | null;
    is_public_contact: boolean;
    receive_notifications: boolean;
  };

  export type IdentifierPreferences = Pick<Identifier, "is_public_contact" | "receive_notifications">;

  export type Session = {
    id: string;
    account_id: string;
    ip: string;
    user_agent: string;
    expires_at: string;
    created_at: string;
    last_refreshed_at: string;
  };

  export type Account = {
    id: string;
    subject: AccountSubject;
    status: AccountStatus;
    is_2fa_enforced: boolean;
    created_at: string;
    updated_at: string | null;
    last_active_at: string | null;
    version: number;
    profile: Profile | null;
    identifiers: Identifier[];
    sessions: Session[];
  };

  export type Registration = {
    email: string;
    password: string;
    profile: {
      display_name: string;
      given_name?: string;
      family_name?: string;
      locale?: string;
      time_zone?: string;
    };
  };
}
