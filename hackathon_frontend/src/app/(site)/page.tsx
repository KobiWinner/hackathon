import { CategoryGrid, HeroBanner, RealProductsSection, SectionHeader } from '@/components/home';
import { Container } from '@/components/ui/Container';

export default function HomePage() {
  return (
    <main className="min-h-screen py-8">
      <Container>
        {/* Hero Banner */}
        <section className="mb-12">
          <HeroBanner />
        </section>

        {/* Categories */}
        <section className="mb-12">
          <SectionHeader
            title="Kategoriler"
            className="mb-6"
          />
          <CategoryGrid />
        </section>

        <hr />
        <br />
        {/* Popüler Ürünler (En trend olan) - Real API Data */}
        <section className="mb-12">
          <RealProductsSection
            title="En Trend Ürünler"
            sortBy="popular"
            limit={20}
          />
        </section>

        <hr />
        <br />
        {/* Tüm Ürünler - Real API Data with Filter */}
        <section className="mb-12">
          <RealProductsSection
            title="Tüm Ürünler"
            sortBy="default"
            showFilter={true}
            limit={50}
          />
        </section>
      </Container>
    </main>
  );
}
