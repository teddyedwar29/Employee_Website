export default function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl shadow-sm ${className}`}>{children}</div>;
}
