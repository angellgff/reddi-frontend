export default function DesktopHeroSearch() {
  return (
    <section className="hidden lg:block p-4 md:px-6 lg:px-8">
      <div
        className="
          relative isolate mx-auto w-full rounded-[30px] bg-[#04BD88] 
          shadow-[0px_1px_0.5px_0.05px_rgba(29,41,61,0.02)] 
          flex flex-col items-center gap-6 px-[60px] py-6 h-[224px] overflow-hidden
          
          // --- Clases añadidas ---
          bg-[url('/bg.svg')] 
          bg-cover 
          bg-center 
          bg-no-repeat
        "
      >
        {/* Decorative overlay to emulate Figma isolation layer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20 z-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 2px, transparent 2px), radial-gradient(circle at 80% 30%, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 2px, transparent 2px), radial-gradient(circle at 30% 80%, rgba(0,0,0,0.18) 0, rgba(0,0,0,0.18) 2px, transparent 2px)",
            backgroundSize: "120px 120px, 160px 160px, 200px 200px",
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-3 max-w-[672px] w-full">
          <h3 className="text-white font-bold text-[28px] leading-8 md:text-[32px] md:leading-10 text-center">
            Con Reddi, pide fácil y disfruta el momento
          </h3>

          {/* Search input */}
          <form action="" method="get" className="w-full">
            <div className="flex items-center justify-between gap-3 bg-white rounded-xl px-3 py-3">
              <input
                type="text"
                name="q"
                placeholder="Platos, alimentos, etc."
                className="flex-1 outline-none bg-transparent text-[14px] leading-[18px] text-[#1A1A1A] placeholder:text-[#ADAEBC]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center h-[39px] px-6 rounded-lg bg-black text-white"
                aria-label="Buscar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-search"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
