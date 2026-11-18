const email = "contact.maiznadeem@gmail.com";

export default function Home() {
    return (
        <main className="p-[var(--gutter)]">
            <h1 className="display text-5xl">Maiz Nadeem</h1>
            <p className="mt-4">
                <a className="underline" href={`mailto:${email}`}>
                    {email}
                </a>
            </p>
        </main>
    );
}
