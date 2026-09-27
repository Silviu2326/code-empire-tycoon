const paths = {
  office: 'M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  projects: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  ai: 'M12 2l2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2zM19 16l1 2.5 2.5 1-2.5 1L19 23l-1-2.5-2.5-1 2.5-1z',
  employees:
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM1 21v-2a6 6 0 0 1 12 0v2zm14 0v-2a6 6 0 0 0-1.5-4 5 5 0 0 1 8.5 3.5V21z',
  marketing: 'M3 10v4h3l6 5V5L6 10zm13-2.5a5 5 0 0 1 0 9M18.5 5a8.5 8.5 0 0 1 0 14',
  menu: 'M4 6h16M4 12h16M4 18h16'
};

const stroked = new Set(['marketing', 'menu']);

export function Icon({ name, size = 22 }) {
  const isStroke = stroked.has(name);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill={isStroke ? 'none' : 'currentColor'}
      stroke={isStroke ? 'currentColor' : 'none'}
      strokeWidth={isStroke ? 2.2 : 0}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[name]} />
    </svg>
  );
}
