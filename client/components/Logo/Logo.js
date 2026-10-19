export default function Logo({ className, alt = "Docstools" }) {
  return (
    <img
      src="/logo.jpeg"
      alt={alt}
      className={className}
    />
  );
}