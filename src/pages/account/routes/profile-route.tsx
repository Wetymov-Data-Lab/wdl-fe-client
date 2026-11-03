import { useState } from "react";
import type { IdentityApi } from "@/shared/api/contracts";
import { ProfileForm } from "@/features/account/components/profile-form";
import { ProfilePreview } from "@/features/account/components/profile-preview";
import { accountSectionEyebrow } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

function toDraft(profile: IdentityApi.Profile | null): IdentityApi.UpdateProfile {
  return {
    display_name: profile?.display_name ?? "",
    given_name: profile?.given_name ?? null,
    family_name: profile?.family_name ?? null,
    bio: profile?.bio ?? null,
    job_title: profile?.job_title ?? null,
    organization: profile?.organization ?? null,
    locale: profile?.locale ?? null,
    time_zone: profile?.time_zone ?? null,
    picture_url: profile?.picture_url ?? null,
    website_url: profile?.website_url ?? null,
  };
}

export function ProfileRoute() {
  const { account, profile } = useAccountOutlet();
  // The form remounts when the saved profile changes, so the draft is tied to that version too.
  const version = account.profile?.updated_at ?? account.profile?.created_at ?? "new";
  const [edited, setEdited] = useState<{ version: string; draft: IdentityApi.UpdateProfile } | null>(null);
  const draft = edited?.version === version ? edited.draft : toDraft(account.profile);

  return (
    <div className="account-profile-layout">
      <ProfileForm
        eyebrow={accountSectionEyebrow("profile")}
        profile={account.profile}
        pending={profile.pending}
        saved={profile.saved}
        error={profile.error}
        onSubmit={profile.submit}
        onDraftChange={(value) => setEdited({ version, draft: value })}
      />
      <ProfilePreview profile={draft} />
    </div>
  );
}
