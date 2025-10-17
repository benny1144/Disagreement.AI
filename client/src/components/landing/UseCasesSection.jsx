export default function UseCasesSection() {
    const useCases = [
        "Freelancers & Clients",
        "Small Businesses",
        "Landlords & Tenants",
        "Teachers & Students",
        "Coaches & Athletes",
        "Structured Debates",
        "...and countless more."
    ];

    return (
        <section className="bg-slate-50 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Designed for Any Disagreement</h2>
                    <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                        Our platform is built to handle conflicts of all shapes and sizes, providing a fair and structured path to
                        resolution for everyone.
                    </p>
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-x-4 gap-y-4">
                    {useCases.map((useCase) => (
                        <span
                            key={useCase}
                            className="rounded-full bg-[#5D5FEF]/10 px-4 py-2 text-sm font-semibold leading-6 text-[#5D5FEF]"
                        >
                            {useCase}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
