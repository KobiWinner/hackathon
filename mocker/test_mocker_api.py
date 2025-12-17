"""
Mocker API Test Script
Tüm provider endpoint'lerini test eder ve verileri görüntüler.
"""
import asyncio
import httpx
from datetime import datetime
import json

BASE_URL = "http://localhost:8002/api/v1/providers"

async def test_provider(client: httpx.AsyncClient, name: str, endpoint: str):
    """Tek bir provider'ı test et."""
    print(f"\n{'='*60}")
    print(f"🔍 Testing: {name}")
    print(f"{'='*60}")
    
    url = f"{BASE_URL}{endpoint}"
    
    try:
        response = await client.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Özet bilgiler
        print(f"✅ Status: {response.status_code}")
        print(f"📦 Response Keys: {list(data.keys())}")
        
        # Provider'a göre ürün sayısı
        if "products" in data:
            products = data["products"]
            print(f"📊 Product Count: {len(products)}")
        elif "items" in data:
            products = data["items"]
            print(f"📊 Item Count: {len(products)}")
        elif "urunler" in data:
            products = data["urunler"]
            print(f"📊 Ürün Sayısı: {len(products)}")
        elif "catalog" in data:
            products = data["catalog"]
            print(f"📊 Catalog Count: {len(products)}")
        else:
            products = []
            print("⚠️ No products found in response")
        
        # İlk 3 ürünü göster
        if products:
            print(f"\n📋 First 3 Products:")
            for i, p in enumerate(products[:3], 1):
                print(f"  {i}. {json.dumps(p, ensure_ascii=False, indent=4)[:300]}...")
        
        # Kategori dağılımı
        categories = {}
        for p in products:
            cat = p.get("category") or p.get("kategori") or "Unknown"
            categories[cat] = categories.get(cat, 0) + 1
        
        if categories:
            print(f"\n📁 Category Distribution:")
            for cat, count in sorted(categories.items(), key=lambda x: -x[1]):
                print(f"  - {cat}: {count} products")
        
        return {"status": "success", "count": len(products), "data": data}
        
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP Error: {e.response.status_code}")
        print(f"   Detail: {e.response.text[:200]}")
        return {"status": "error", "error": str(e)}
    except httpx.RequestError as e:
        print(f"❌ Connection Error: {e}")
        return {"status": "error", "error": str(e)}


async def main():
    print("=" * 60)
    print("🚀 MOCKER API TEST")
    print(f"📅 {datetime.now().isoformat()}")
    print("=" * 60)
    
    providers = [
        ("SportDirect (UK/GBP - 1% error)", "/sport-direct/products"),
        ("OutdoorPro (US/USD - 5% error)", "/outdoor-pro/products"),
        ("DagSpor (TR/TRY - 15% error)", "/dag-spor/products"),
        ("AlpineGear (EU/EUR - 30% error)", "/alpine-gear/products"),
    ]
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        results = {}
        
        for name, endpoint in providers:
            result = await test_provider(client, name, endpoint)
            results[name] = result
        
        # Özet
        print("\n" + "=" * 60)
        print("📊 SUMMARY")
        print("=" * 60)
        
        total_products = 0
        for name, result in results.items():
            status = "✅" if result["status"] == "success" else "❌"
            count = result.get("count", 0)
            total_products += count
            print(f"{status} {name}: {count} products")
        
        print(f"\n🎯 Total Products: {total_products}")
        print(f"🏷️ Expected: ~50 products (if mocker updated)")


if __name__ == "__main__":
    asyncio.run(main())
