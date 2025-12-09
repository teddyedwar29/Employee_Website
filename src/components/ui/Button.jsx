export default function Button({ children, variant = 'primary', className = '', ...props }) {
    const styles = {
        primary: 'bg-[#800020] text-white hover:bg-[#6e001b]',
        ghost: 'bg-transparent text-[#800020] hover:bg-[#800020]/10',
    };
    return (
        <button {...props} className={`px-4 py-2 rounded-lg transition ${styles[variant]} ${className}`}>
        {children}
        </button>
    );
}