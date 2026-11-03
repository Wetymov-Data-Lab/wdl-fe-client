import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { loadWorkspace } from "@/entities/schema/api";
import { schemaQueryKeys } from "@/entities/schema/model/query-keys";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";
import { accountSectionEyebrow } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

export function RealmsRoute() {
  const { account } = useAccountOutlet();
  const workspaceQuery = useQuery({ queryKey: schemaQueryKeys.workspace, queryFn: loadWorkspace });
  const realms = workspaceQuery.data?.realms.filter((realm) => realm.authorId === account.id) ?? [];

  return (
    <section className="account-section">
      <AccountSectionHeader
        eyebrow={accountSectionEyebrow("realms")}
        title="Мои реалмы"
        description="Реалмы, которые вы создали."
      />
      {workspaceQuery.isLoading && <p className="empty-list">Загружаем реалмы…</p>}
      {workspaceQuery.isError && <p className="empty-list">Не удалось загрузить реалмы.</p>}
      {workspaceQuery.isSuccess && !realms.length && <p className="empty-list">Вы пока не создали ни одного реалма.</p>}
      {realms.map((realm) => {
        const projectsCount = workspaceQuery.data?.projects.filter((project) => project.realmId === realm.id).length ?? 0;
        return (
          <div className="account-summary__row" key={realm.id}>
            <div>
              <strong>{realm.name}</strong>
              <span>
                {realm.slug} · проектов: {projectsCount}
              </span>
            </div>
            <Link className="button button--sm" to="/realms">
              Открыть
            </Link>
          </div>
        );
      })}
    </section>
  );
}
