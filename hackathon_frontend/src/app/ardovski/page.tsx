import { Text, Heading, Label, Caption } from '../../components/ui/typography/Text';

export default function ArdovskiPage() {
    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            <Heading level={1} className="mb-8">Typography Component Test</Heading>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Sizes</Heading>
                <div className="flex flex-col gap-2">
                    <Text size="xs">Extra Small (xs)</Text>
                    <Text size="sm">Small (sm)</Text>
                    <Text size="base">Base (base)</Text>
                    <Text size="lg">Large (lg)</Text>
                    <Text size="xl">Extra Large (xl)</Text>
                    <Text size="2xl">2XL</Text>
                    <Text size="3xl">3XL</Text>
                    <Text size="4xl">4XL</Text>
                </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Weights</Heading>
                <div className="flex flex-col gap-2">
                    <Text weight="normal">Normal Weight</Text>
                    <Text weight="medium">Medium Weight</Text>
                    <Text weight="semibold">Semibold Weight</Text>
                    <Text weight="bold">Bold Weight</Text>
                </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Colors</Heading>
                <div className="flex flex-col gap-2">
                    <Text color="default">Default Color</Text>
                    <Text color="muted">Muted Color (might be invisible if not defined)</Text>
                    <Text color="primary">Primary Color</Text>
                    <Text color="secondary">Secondary Color</Text>
                    <Text color="accent">Accent Color</Text>
                    <Text color="success">Success Color</Text>
                    <Text color="warning">Warning Color</Text>
                    <Text color="danger">Danger Color</Text>
                </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Align & Decorations</Heading>
                <div className="flex flex-col gap-2">
                    <Text underline>Underlined Text</Text>
                    <Text italic>Italic Text</Text>
                    <Text lineThrough>Line Through Text</Text>

                    <div className="border p-2 mt-2">
                        <Text align="left">Left Aligned</Text>
                    </div>
                    <div className="border p-2">
                        <Text align="center">Center Aligned</Text>
                    </div>
                    <div className="border p-2">
                        <Text align="right">Right Aligned</Text>
                    </div>
                </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Helpers</Heading>
                <div className="flex flex-col gap-4">
                    <div className="space-y-1">
                        <Label htmlFor="test-input">Test Label</Label>
                        <input id="test-input" className="border rounded p-1 block w-full max-w-xs" placeholder="Input field..." />
                    </div>

                    <div className="space-y-1">
                        <Label required>Required Field Label</Label>
                        <input className="border rounded p-1 block w-full max-w-xs" />
                    </div>

                    <div>
                        <Heading level={4}>Caption Example</Heading>
                        <Text>Here is an image description or something.</Text>
                        <Caption>Figure 1: This is a caption text (xs, muted).</Caption>
                    </div>
                </div>
            </section>

            <section className="space-y-4 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Truncate</Heading>
                <div className="w-64 border p-2">
                    <Text truncate>
                        This is a very long text that should be truncated because it is too long for the container.
                    </Text>
                </div>
                <div className="w-64 border p-2">
                    <Text maxLines={2}>
                        This is a text that should be clamped to 2 lines. This is a text that should be clamped to 2 lines.
                        This is a text that should be clamped to 2 lines. This is a text that should be clamped to 2 lines.
                        This is a text that should be clamped to 2 lines.
                    </Text>
                </div>
            </section>
        </div>
    );
}
