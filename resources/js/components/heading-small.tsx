export default function HeadingSmall({ title, description }: { title: string; description?: string }) {
    return (
        <header>
            <h3 className="mb-0.5 text-base font-medium text-neutral-100">{title}</h3>
            {description && <p className="text-sm text-neutral-400">{description}</p>}
        </header>
    );
}
