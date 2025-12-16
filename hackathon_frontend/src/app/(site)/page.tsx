import { CategoryGrid, HeroBanner, ProductSection, SectionHeader } from '@/components/home';
import { Container } from '@/components/ui/Container';
import { Text } from '@/components/ui/typography/Text';
import { getLowestPriceProducts, getPopularProducts, getPriceDropProducts } from '@/data/products';

export default function HomePage() {
  const priceDropProducts = getPriceDropProducts();
  const popularProducts = getPopularProducts();
  const lowestPriceProducts = getLowestPriceProducts();

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
            viewAllHref="/categories"
            className="mb-6"
          />
          <CategoryGrid />
        </section>

        {/* Fiyatı Düşenler */}
        <section className="mb-12">
          <ProductSection
            title="🔥 Fiyatı Düşenler"
            products={priceDropProducts}
            viewAllHref="/fiyat-dusuler"
          />
        </section>

        {/* Popüler Ürünler (En çok satıcısı olan) */}
        <section className="mb-12">
          <ProductSection
            title="📊 En Çok Karşılaştırılanlar"
            products={popularProducts}
            viewAllHref="/populer"
          />
        </section>

        {/* Popüler Mağazalar */}
        <section className="mb-12">
          <SectionHeader title="Popüler Mağazalar" className="mb-6" />
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {['Trendyol', 'Hepsiburada', 'Amazon', 'N11', 'Decathlon', 'Intersport'].map((store) => (
              <div
                key={store}
                className="flex items-center justify-center p-6 bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer"
              >
                <Text size="base" weight="semibold" color="muted">
                  {store}
                </Text>
              </div>
            ))}
          </div>
        </section>

        {/* En Düşük Fiyatlılar */}
        <section className="mb-12">
          <ProductSection
            title="💰 En Uygun Fiyatlar"
            products={lowestPriceProducts}
            viewAllHref="/en-ucuz"
          />
        </section>

        {/* Info Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-primary-50 to-white rounded-2xl border border-primary/10">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">�</span>
              </div>
              <Text as="h3" size="lg" weight="semibold" className="mb-2">
                Anlık Fiyat Takibi
              </Text>
              <Text size="sm" color="muted">
                Binlerce satıcıdan fiyatları otomatik takip ediyoruz.
              </Text>
            </div>
            <div className="p-6 bg-gradient-to-br from-secondary-50 to-white rounded-2xl border border-secondary/10">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">�</span>
              </div>
              <Text as="h3" size="lg" weight="semibold" className="mb-2">
                Fiyat Geçmişi
              </Text>
              <Text size="sm" color="muted">
                Geçmiş fiyatları görün, en iyi zamanı yakalayın.
              </Text>
            </div>
            <div className="p-6 bg-gradient-to-br from-accent-50 to-white rounded-2xl border border-accent/10">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🔔</span>
              </div>
              <Text as="h3" size="lg" weight="semibold" className="mb-2">
                Fiyat Alarmı
              </Text>
              <Text size="sm" color="muted">
                Hedef fiyata ulaşınca anında bildirim alın.
              </Text>
            </div>
          </div>
        </section>
      </Container>
    </main>
  );
}
