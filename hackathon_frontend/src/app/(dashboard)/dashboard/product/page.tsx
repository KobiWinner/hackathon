'use client';

import { useCallback, useState } from 'react';

import Image from 'next/image';

import { Button } from '@/components/ui/buttons/Button';
import { type Column, DataTable } from '@/components/ui/DataTable';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Heading, Text } from '@/components/ui/typography/Text';

// ==========================================
// TİP TANIMLARI (Type Definitions)
// ==========================================

/**
 * Ürün tipi - Database'deki products tablosuna karşılık gelir
 * Bu tip, ürün verilerinin şeklini tanımlar
 */
interface Product {
    id: number;
    category_id: number | null;
    name: string;
    slug: string;
    brand: string | null;
    gender: string | null;
    description: string | null;
    image_url: string | null;
    created_at: string;
}

/**
 * Kategori tipi - Dropdown'da gösterilecek kategoriler
 */
interface Category {
    id: number;
    name: string;
    parent_id: number | null;
}

/**
 * Form verisi - Ürün ekleme/düzenleme formu için
 */
interface ProductFormData {
    name: string;
    slug: string;
    brand: string;
    gender: string;
    description: string;
    image_url: string;
    category_id: string;
}

// ==========================================
// ÖRNEK VERİLER (Mock Data)
// ==========================================
// Not: Gerçek projede bu veriler API'den gelecek

const MOCK_CATEGORIES: Category[] = [
    { id: 1, name: 'Elektronik', parent_id: null },
    { id: 2, name: 'Giyim', parent_id: null },
    { id: 3, name: 'Telefon', parent_id: 1 },
    { id: 4, name: 'Bilgisayar', parent_id: 1 },
    { id: 5, name: 'Kadın Giyim', parent_id: 2 },
    { id: 6, name: 'Erkek Giyim', parent_id: 2 },
];

const MOCK_PRODUCTS: Product[] = [
    {
        id: 1,
        category_id: 3,
        name: 'iPhone 15 Pro',
        slug: 'iphone-15-pro',
        brand: 'Apple',
        gender: null,
        description: 'En yeni iPhone modeli',
        image_url: 'https://via.placeholder.com/100',
        created_at: '2024-01-15',
    },
    {
        id: 2,
        category_id: 4,
        name: 'MacBook Pro 16"',
        slug: 'macbook-pro-16',
        brand: 'Apple',
        gender: null,
        description: 'M3 Pro çipli profesyonel laptop',
        image_url: 'https://via.placeholder.com/100',
        created_at: '2024-02-20',
    },
    {
        id: 3,
        category_id: 5,
        name: 'Kadın Kaban',
        slug: 'kadin-kaban',
        brand: 'Zara',
        gender: 'Kadın',
        description: 'Kış sezonu için şık kaban',
        image_url: 'https://via.placeholder.com/100',
        created_at: '2024-03-10',
    },
];

// Cinsiyet seçenekleri
const GENDER_OPTIONS = [
    { value: '', label: 'Belirtilmemiş' },
    { value: 'Erkek', label: 'Erkek' },
    { value: 'Kadın', label: 'Kadın' },
    { value: 'Unisex', label: 'Unisex' },
];

// ==========================================
// ANA SAYFA BİLEŞENİ
// ==========================================

export default function ProductPage() {
    // -----------------------------------------
    // STATE YÖNETİMİ
    // -----------------------------------------

    // Ürün listesi (gerçek projede API'den gelir)
    const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);

    // Modal durumları
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Düzenleme modunda mı? (null = yeni ürün ekleme)
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Silinecek ürün
    const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

    // Form verileri
    const [formData, setFormData] = useState<ProductFormData>({
        name: '',
        slug: '',
        brand: '',
        gender: '',
        description: '',
        image_url: '',
        category_id: '',
    });

    // Form hataları
    const [errors, setErrors] = useState<Partial<ProductFormData>>({});

    // -----------------------------------------
    // YARDIMCI FONKSİYONLAR
    // -----------------------------------------

    /**
     * Kategori ID'sinden kategori adını bulur
     */
    const getCategoryName = (categoryId: number | null): string => {
        if (!categoryId) { return '-'; }
        const category = MOCK_CATEGORIES.find((c) => c.id === categoryId);
        return category?.name ?? '-';
    };

    /**
     * Ürün adından slug (URL-friendly metin) oluşturur
     * Örnek: "iPhone 15 Pro" -> "iphone-15-pro"
     */
    const generateSlug = (name: string): string => {
        return name
            .toLowerCase()
            .replace(/ş/g, 's')
            .replace(/ğ/g, 'g')
            .replace(/ü/g, 'u')
            .replace(/ı/g, 'i')
            .replace(/ö/g, 'o')
            .replace(/ç/g, 'c')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    // -----------------------------------------
    // MODAL İŞLEMLERİ
    // -----------------------------------------

    /**
     * Yeni ürün ekleme modalını açar
     */
    const openAddModal = useCallback(() => {
        setEditingProduct(null);
        setFormData({
            name: '',
            slug: '',
            brand: '',
            gender: '',
            description: '',
            image_url: '',
            category_id: '',
        });
        setErrors({});
        setIsModalOpen(true);
    }, []);

    /**
     * Ürün düzenleme modalını açar
     */
    const openEditModal = useCallback((product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            slug: product.slug,
            brand: product.brand ?? '',
            gender: product.gender ?? '',
            description: product.description ?? '',
            image_url: product.image_url ?? '',
            category_id: product.category_id?.toString() ?? '',
        });
        setErrors({});
        setIsModalOpen(true);
    }, []);

    /**
     * Silme onay modalını açar
     */
    const openDeleteModal = useCallback((product: Product) => {
        setDeletingProduct(product);
        setIsDeleteModalOpen(true);
    }, []);

    /**
     * Modalları kapatır
     */
    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingProduct(null);
    }, []);

    const closeDeleteModal = useCallback(() => {
        setIsDeleteModalOpen(false);
        setDeletingProduct(null);
    }, []);

    // -----------------------------------------
    // FORM İŞLEMLERİ
    // -----------------------------------------

    /**
     * Form alanı değiştiğinde çalışır
     */
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const newData = { ...prev, [name]: value };
            // İsim değiştiğinde otomatik slug oluştur
            if (name === 'name') {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
        // Hata varsa temizle
        if (errors[name as keyof ProductFormData]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    /**
     * Form validasyonu yapar
     */
    const validateForm = (): boolean => {
        const newErrors: Partial<ProductFormData> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Ürün adı zorunludur';
        }
        if (!formData.slug.trim()) {
            newErrors.slug = 'Slug zorunludur';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Form gönderildiğinde çalışır (Kaydet butonu)
     */
    const handleSubmit = () => {
        if (!validateForm()) { return; }

        if (editingProduct) {
            // DÜZENLEME: Mevcut ürünü güncelle
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === editingProduct.id
                        ? {
                            ...p,
                            name: formData.name,
                            slug: formData.slug,
                            brand: formData.brand || null,
                            gender: formData.gender || null,
                            description: formData.description || null,
                            image_url: formData.image_url || null,
                            category_id: formData.category_id
                                ? parseInt(formData.category_id)
                                : null,
                        }
                        : p
                )
            );
        } else {
            // EKLEME: Yeni ürün oluştur
            const newProduct: Product = {
                id: Math.max(...products.map((p) => p.id), 0) + 1,
                name: formData.name,
                slug: formData.slug,
                brand: formData.brand || null,
                gender: formData.gender || null,
                description: formData.description || null,
                image_url: formData.image_url || null,
                category_id: formData.category_id
                    ? parseInt(formData.category_id)
                    : null,
                created_at: new Date().toISOString().split('T')[0],
            };
            setProducts((prev) => [newProduct, ...prev]);
        }

        closeModal();
    };

    /**
     * Ürün silme işlemi
     */
    const handleDelete = () => {
        if (!deletingProduct) { return; }
        setProducts((prev) => prev.filter((p) => p.id !== deletingProduct.id));
        closeDeleteModal();
    };

    // -----------------------------------------
    // TABLO SÜTUN TANIMLARI
    // -----------------------------------------

    const columns: Column<Product>[] = [
        {
            key: 'id',
            header: 'ID',
            accessor: 'id',
            sortable: true,
            width: '60px',
        },
        {
            key: 'image',
            header: 'Görsel',
            accessor: 'image_url',
            width: '80px',
            render: (value) =>
                value ? (
                    <Image
                        src={value as string}
                        alt="Ürün"
                        className="h-10 w-10 rounded-lg object-cover"
                    />
                ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        <svg
                            className="h-5 w-5 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                        </svg>
                    </div>
                ),
        },
        {
            key: 'name',
            header: 'Ürün Adı',
            accessor: 'name',
            sortable: true,
            render: (value, row) => (
                <div>
                    <Text weight="medium" size="sm">
                        {value as string}
                    </Text>
                    <Text size="xs" color="muted">
                        {row.slug}
                    </Text>
                </div>
            ),
        },
        {
            key: 'brand',
            header: 'Marka',
            accessor: 'brand',
            sortable: true,
            render: (value) => (value as string) || '-',
        },
        {
            key: 'category',
            header: 'Kategori',
            accessor: (row) => getCategoryName(row.category_id),
            sortable: true,
        },
        {
            key: 'gender',
            header: 'Cinsiyet',
            accessor: 'gender',
            render: (value) => (value as string) || '-',
        },
        {
            key: 'created_at',
            header: 'Eklenme Tarihi',
            accessor: 'created_at',
            sortable: true,
            render: (value) => {
                const date = new Date(value as string);
                return date.toLocaleDateString('tr-TR');
            },
        },
        {
            key: 'actions',
            header: 'İşlemler',
            accessor: 'id',
            width: '120px',
            render: (_, row) => (
                <div className="flex gap-2">
                    {/* Düzenle butonu */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // Satır tıklamasını engelle
                            openEditModal(row);
                        }}
                        className="rounded-lg p-2 text-primary hover:bg-primary/10 transition-colors"
                        title="Düzenle"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                    </button>

                    {/* Sil butonu */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openDeleteModal(row);
                        }}
                        className="rounded-lg p-2 text-danger hover:bg-danger/10 transition-colors"
                        title="Sil"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            ),
        },
    ];

    // -----------------------------------------
    // RENDER
    // -----------------------------------------

    return (
        <div className="space-y-6">
            {/* Sayfa Başlığı */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Heading level={1} size="2xl">
                        Ürün Yönetimi
                    </Heading>
                    <Text color="muted" className="mt-1">
                        Ürünlerinizi ekleyin, düzenleyin veya silin.
                    </Text>
                </div>

                {/* Yeni Ürün Ekle Butonu */}
                <Button
                    variant="solid"
                    icon={
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    }
                    txt="Yeni Ürün Ekle"
                    onClick={openAddModal}
                />
            </div>

            {/* Ürün Tablosu */}
            <DataTable
                data={products}
                columns={columns}
                keyField="id"
                searchable
                searchPlaceholder="Ürün ara..."
                emptyMessage="Henüz ürün eklenmemiş."
            />

            {/* Ürün Ekleme/Düzenleme Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduct ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
                size="lg"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" txt="İptal" onClick={closeModal} />
                        <Button
                            variant="solid"
                            txt={editingProduct ? 'Güncelle' : 'Kaydet'}
                            onClick={handleSubmit}
                        />
                    </div>
                }
            >
                <div className="space-y-4">
                    {/* İki sütunlu grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Ürün Adı"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Örn: iPhone 15 Pro"
                            required
                            error={errors.name}
                        />
                        <Input
                            label="Slug (URL)"
                            name="slug"
                            value={formData.slug}
                            onChange={handleInputChange}
                            placeholder="iphone-15-pro"
                            description="Otomatik oluşturulur"
                            error={errors.slug}
                        />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Input
                            label="Marka"
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            placeholder="Örn: Apple"
                        />
                        <Select
                            label="Cinsiyet"
                            name="gender"
                            value={formData.gender}
                            onChange={handleInputChange}
                            options={GENDER_OPTIONS}
                            placeholder="Seçiniz"
                        />
                    </div>

                    <Select
                        label="Kategori"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                        options={MOCK_CATEGORIES.map((c) => ({
                            value: c.id.toString(),
                            label: c.name,
                        }))}
                        placeholder="Kategori seçin"
                    />

                    <Textarea
                        label="Açıklama"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Ürün hakkında detaylı bilgi..."
                        rows={3}
                    />

                    <Input
                        label="Görsel URL"
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        description="Ürün görselinin URL adresi"
                    />
                </div>
            </Modal>

            {/* Silme Onay Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                title="Ürünü Sil"
                size="sm"
                footer={
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" txt="İptal" onClick={closeDeleteModal} />
                        <Button
                            variant="solid"
                            txt="Sil"
                            onClick={handleDelete}
                            className="!bg-danger hover:!bg-danger-dark"
                        />
                    </div>
                }
            >
                <div className="text-center">
                    {/* Uyarı ikonu */}
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-danger/10">
                        <svg
                            className="h-8 w-8 text-danger"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <Text size="lg" weight="medium">
                        Bu ürünü silmek istediğinizden emin misiniz?
                    </Text>
                    <Text color="muted" className="mt-2">
                        <strong>&quot;{deletingProduct?.name}&quot;</strong> ürünü kalıcı olarak
                        silinecektir. Bu işlem geri alınamaz.
                    </Text>
                </div>
            </Modal>
        </div>
    );
}
