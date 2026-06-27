type PageHeaderProps = {
  label: string;
  title: string;
  description?: string;
};

export function PageHeader({ label, title, description }: PageHeaderProps) {
  return (
    <div className="mb-10 max-w-2xl">
      <p className="font-heading text-xs text-muted">{label}</p>
      <h1 className="font-heading mt-3 text-4xl text-foreground sm:text-5xl">{title}</h1>
      {description ? (
        <p className="mt-4 text-base leading-7 text-muted">{description}</p>
      ) : null}
    </div>
  );
}
