import BackButton from './BackButton';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  backLink?: string;
}

export default function PageHeader({
  title,
  subtitle,
  rightAction,
  backLink = '/',
}: PageHeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
        <BackButton to={backLink} ariaLabel="뒤로가기" />

        <div className="text-center">
          <h1 className="text-3xl font-black text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-gray-600">{subtitle}</p>}
        </div>

        <div className="w-10">{rightAction ? rightAction : null}</div>
      </div>
    </header>
  );
}
