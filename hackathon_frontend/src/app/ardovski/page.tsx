import { Text, Heading, Label, Caption } from '../../components/ui/typography/Text';
import { Button } from '../../components/ui/buttons/Button';


export default function ArdovskiPage() {
    return (
        <div className="space-y-8">
            <Heading level={1} className="mb-8">UI Component Test</Heading>

            {/* BUTTONS SECTION */}
            <section className="space-y-6 p-6 border rounded-lg">
                <Heading level={2} className="border-b pb-2">Buttons</Heading>

                <div className="space-y-4">
                    <Heading level={3}>Variants</Heading>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="solid" txt="Solid" />
                        <Button variant="gradient" txt="Gradient" />
                        <Button variant="secondary" txt="Secondary" />
                        <Button variant="outline" txt="Outline" />
                        <Button variant="ghost" txt="Ghost" />
                        <Button variant="white" txt="White" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Heading level={3}>Sizes</Heading>
                    <div className="flex flex-wrap items-center gap-3">
                        <Button size="xs" txt="Extra Small" />
                        <Button size="sm" txt="Small" />
                        <Button size="md" txt="Medium" />
                        <Button size="lg" txt="Large" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Heading level={3}>States</Heading>
                    <div className="flex flex-wrap gap-3">
                        <Button txt="Normal" />
                        <Button loading txt="Loading" />
                        <Button disabled txt="Disabled" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Heading level={3}>Full Width</Heading>
                    <Button fullWidth txt="Full Width Button" variant="gradient" />
                </div>

                <div className="space-y-4">
                    <Heading level={3}>With Icon</Heading>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>}
                            txt="Continue"
                        />
                        <Button
                            variant="outline"
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>}
                            txt="Upload"
                        />
                    </div>
                </div>

                <div className="space-y-4">
                    <Heading level={3}>As Link</Heading>
                    <Button as="a" href="#" txt="Link Button" variant="secondary" />
                </div>
            </section>

            {/* TYPOGRAPHY SECTION */}

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
