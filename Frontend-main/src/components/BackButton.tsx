import { Link } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export default function BackButton({
  to,
  onClick,
  ariaLabel = '뒤로가기',
}: BackButtonProps) {
  const commonClasses =
    'inline-flex h-10 items-center justify-center rounded-full border border-gray-300 bg-white px-4 text-gray-700 shadow-sm transition hover:border-gray-400 hover:bg-gray-100';

  if (to) {
    return (
      <Link to={to} aria-label={ariaLabel} className={commonClasses}>
        ←
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} className={commonClasses}>
      ←
    </button>
  );
}
