type AccountSectionHeaderProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function AccountSectionHeader({ eyebrow, title, description }: AccountSectionHeaderProps) {
  return (
    <header className="section-heading">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}
