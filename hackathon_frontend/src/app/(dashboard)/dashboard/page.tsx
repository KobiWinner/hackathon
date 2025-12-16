export default function DashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Hoş geldiniz! Bu sizin dashboard sayfanız.</p>

            {/* Dashboard kartları örneği */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Toplam Kullanıcı</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">1,234</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Aktif Oturumlar</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">567</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Dönüşüm Oranı</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">12.5%</p>
                </div>
                <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-500">Gelir</h3>
                    <p className="mt-2 text-3xl font-bold text-gray-900">₺45,678</p>
                </div>
            </div>
        </div>
    );
}

