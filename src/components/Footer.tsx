import { HeartIcon } from "@radix-ui/react-icons";

const Footer = () => {
  return (
    <footer className="bg-black/40 px-6 py-4 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
      <div className="flex items-center justify-center gap-1.5 text-center">
        <span>Hecho con</span>
        <HeartIcon className="h-3.5 w-3.5 text-red-500" aria-label="amor" />
        <span>por Cristopher Avila, Valentina Vivas y Christian Martinez</span>
      </div>
    </footer>
  );
};

export default Footer;
