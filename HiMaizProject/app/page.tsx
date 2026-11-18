import { LeafMark } from "@/components/LeafMark";

const email = "contact.maiznadeem@gmail.com";

export default function Home() {
    return (
        <main className="p-[var(--gutter)]">
            <LeafMark size={160} title="Leaf and pebble logo" />
            <h1 className="display text-5xl">Maiz Nadeem</h1>
            <p className="mt-4">
                <a className="underline" href={`mailto:${email}`}>
                    {email}
                </a>
            </p>
        </main>
    );
}
