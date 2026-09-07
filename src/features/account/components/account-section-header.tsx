type AccountSectionHeaderProps = {
  title: string;
  description?: string;
};

export function AccountSectionHeader({ title, description }: AccountSectionHeaderProps) {
  return (
    <header className="section-heading">
      <div>
        <h2>{title}</h2>
      </div>
      {description && <p>{description}</p>}
    </header>
  );
}
