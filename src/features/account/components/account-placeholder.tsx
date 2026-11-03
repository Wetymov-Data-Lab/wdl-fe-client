import { AccountSectionHeader } from "@/features/account/components/account-section-header";

type AccountPlaceholderProps = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function AccountPlaceholder({ eyebrow, title, description, items }: AccountPlaceholderProps) {
  return (
    <section className="account-section account-placeholder">
      <AccountSectionHeader eyebrow={eyebrow} title={title} />
      <div className="account-placeholder__body">
        <span className="account-placeholder__badge">SOON</span>
        <p>{description}</p>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
