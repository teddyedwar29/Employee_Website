export default function Badge({ children, color = 'blue' }) {
    const map = {
        blue: 'bg-blue-100 text-blue-700',
        green: 'bg-green-100 text-green-700',
        yellow: 'bg-yellow-100 text-yellow-700',
    };
    return <span className={`text-xs px-3 py-1 rounded-full ${map[color]}`}>{children}</span>;
}