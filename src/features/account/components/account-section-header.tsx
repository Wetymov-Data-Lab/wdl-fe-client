type AccountSectionHeaderProps = {
  title: string;
  eyebrow?: string;
  description?: string;
};

export function AccountSectionHeader({ title, eyebrow, description }: AccountSectionHeaderProps) {
  return (
    <header className="section-heading">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}
