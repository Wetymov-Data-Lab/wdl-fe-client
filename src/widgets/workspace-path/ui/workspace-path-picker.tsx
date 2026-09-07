type Props = {
  workspace: Schema.Workspace;
  realmId: Schema.Id | null;
  projectId: Schema.Id | null;
  databaseId: Schema.Id | null;
  onRealmChange: (realmId: Schema.Id | null) => void;
  onProjectChange: (projectId: Schema.Id | null) => void;
  onDatabaseChange: (databaseId: Schema.Id | null) => void;
};

export function WorkspacePathPicker({
  workspace,
  realmId,
  projectId,
  databaseId,
  onRealmChange,
  onProjectChange,
  onDatabaseChange,
}: Props) {
  const projects = realmId ? workspace.projects.filter((project) => project.realmId === realmId) : [];
  const databases = projectId ? workspace.databases.filter((database) => database.projectId === projectId) : [];

  return (
    <div className="workspace-path" aria-label="Путь к схеме">
      <span className="workspace-path__root" aria-hidden="true">
        ◫
      </span>
      <PathSegment
        ariaLabel="Выберите realm"
        value={realmId ?? ""}
        placeholder="Realm"
        options={workspace.realms.map((realm) => ({
          id: realm.id,
          label: realm.name,
          suffix: realm.visibility === "public" ? " · public" : "",
        }))}
        onChange={(value) => onRealmChange(value || null)}
      />
      <span className="workspace-path__separator" aria-hidden="true">
        ›
      </span>
      <PathSegment
        ariaLabel="Выберите проект"
        value={projectId ?? ""}
        placeholder="Проект"
        options={projects.map((project) => ({ id: project.id, label: project.name }))}
        disabled={!realmId}
        onChange={(value) => onProjectChange(value || null)}
      />
      <span className="workspace-path__separator" aria-hidden="true">
        ›
      </span>
      <PathSegment
        ariaLabel="Выберите базу данных"
        value={databaseId ?? ""}
        placeholder="База данных"
        options={databases.map((database) => ({ id: database.id, label: database.name, suffix: ` · ${database.type}` }))}
        disabled={!projectId}
        onChange={(value) => onDatabaseChange(value || null)}
      />
    </div>
  );
}

type PathSegmentProps = {
  ariaLabel: string;
  value: string;
  placeholder: string;
  options: Array<{ id: string; label: string; suffix?: string }>;
  disabled?: boolean;
  onChange: (value: string) => void;
};

function PathSegment({ ariaLabel, value, placeholder, options, disabled = false, onChange }: PathSegmentProps) {
  return (
    <label className="workspace-path__segment">
      <select aria-label={ariaLabel} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)}>
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option value={option.id} key={option.id}>
            {option.label}
            {option.suffix}
          </option>
        ))}
      </select>
      <span aria-hidden="true">⌄</span>
    </label>
  );
}
