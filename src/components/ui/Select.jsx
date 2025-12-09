export default function Select({ className = '', ...props }) {
  return (
    <select
      {...props}
      className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#800020] bg-white ${className}`}
    />
  );
}
