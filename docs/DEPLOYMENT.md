# 🚀 GKE Deployment Rehberi

Bu dokümantasyon, Hackathon projesinin Google Kubernetes Engine (GKE) üzerine GitLab CI/CD ile deployment sürecini adım adım açıklar.

---

## 📋 İçindekiler

1. [Ön Gereksinimler](#1-ön-gereksinimler)
2. [GCP Service Account Oluşturma](#2-gcp-service-account-oluşturma)
3. [GitLab CI/CD Variables Ayarlama](#3-gitlab-cicd-variables-ayarlama)
4. [Deployment Tetikleme](#4-deployment-tetikleme)
5. [Hata Çözümleri](#5-hata-çözümleri)

---

## 1. Ön Gereksinimler

### Gerekli Araçlar
- [x] GCP hesabı ve aktif proje (`kobi-42`)
- [x] GKE cluster (`hackathon-cluster`)
- [x] GitLab hesabı ve Container Registry erişimi
- [x] `gcloud` CLI (opsiyonel, sadece local test için)

### Proje Bilgileri
| Parametre | Değer |
|-----------|-------|
| GCP Project ID | `kobi-42` |
| GKE Cluster | `hackathon-cluster` |
| Region | `us-central1` |
| Namespace | `hackathon` |

---

## 2. GCP Service Account Oluşturma

### Adım 2.1: Google Cloud Console'a Git
1. https://console.cloud.google.com adresini aç
2. Proje olarak `kobi-42` seçili olduğundan emin ol

### Adım 2.2: Service Account Oluştur
1. Sol menüden **IAM & Admin → Service Accounts** tıkla
2. **"+ CREATE SERVICE ACCOUNT"** butonuna tıkla
3. Bilgileri doldur:
   - **Service account name:** `gitlab-deployer`
   - **Service account ID:** `gitlab-deployer` (otomatik dolar)
   - **Description:** `GitLab CI/CD için deployment service account`
4. **"CREATE AND CONTINUE"** tıkla

### Adım 2.3: Rolleri Ekle
Aşağıdaki rolü ekle:
- `Kubernetes Engine Developer` - K8s kaynaklarını yönetmek için

> **💡 NOT:** `Storage Object Viewer` rolü sadece **Google Container Registry (gcr.io)** kullanılacaksa gerekli. Biz **GitLab Container Registry** kullandığımız için bu role ihtiyaç yok. GitLab registry erişimi için K8s'te `docker-registry` secret oluşturuyoruz (pipeline otomatik yapar).

**"CONTINUE"** tıkla, sonra **"DONE"** tıkla.

### Adım 2.4: JSON Key İndir
1. Oluşturulan `gitlab-deployer@kobi-42.iam.gserviceaccount.com` hesabına tıkla
2. **"KEYS"** sekmesine git
3. **"ADD KEY" → "Create new key"** tıkla
4. **JSON** seç ve **"CREATE"** tıkla
5. JSON dosyası otomatik indirilecek (örn: `kobi-42-xxxx.json`)

> ⚠️ **ÖNEMLİ:** Bu JSON dosyasını güvenli bir yerde sakla ve kimseyle paylaşma!

---

## 3. GitLab CI/CD Variables Ayarlama

### Adım 3.1: GitLab Projesine Git
1. GitLab'da projenize gidin
2. Sol menüden **Settings → CI/CD** tıkla
3. **Variables** bölümünü genişlet

### Adım 3.2: GCP Service Account Key Ekle
1. **"Add variable"** tıkla
2. Ayarları gir:

| Alan | Değer |
|------|-------|
| **Key** | `GCP_SERVICE_ACCOUNT_KEY` |
| **Type** | **File** ⚠️ (önemli!) |
| **Value** | JSON dosyasının **tüm içeriğini** yapıştır |
| **Protect variable** | ✅ (sadece protected branch'lerde) |
| **Mask variable** | ❌ (file type mask edilemez) |

3. **"Add variable"** tıkla

### Adım 3.3: (Opsiyonel) Diğer Variables
Gerekirse ekstra değişkenler ekleyebilirsin:

| Key | Value | Açıklama |
|-----|-------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://YOUR-IP/api` | Backend API URL |

---

## 4. Deployment Tetikleme

### Staging Deployment (Otomatik)
```bash
# develop branch'e push yap
git checkout develop
git push origin develop
```
Pipeline otomatik başlar ve staging'e deploy eder.

### Production Deployment (Manuel)
```bash
# main branch'e push yap
git checkout main
git merge develop
git push origin main
```
Pipeline başlar ama **deploy-production** job'u manuel onay bekler.
GitLab'da pipeline'a git ve **"Play"** butonuna tıkla.

---

## 4.5. External IP Alma (LoadBalancer)

Deploy tamamlandıktan sonra GKE otomatik olarak external IP atar.

### IP'leri Görüntüleme
```bash
kubectl get svc -n hackathon
```

### Örnek Çıktı
```
NAME           TYPE           CLUSTER-IP     EXTERNAL-IP      PORT(S)        AGE
frontend-lb    LoadBalancer   10.0.10.5      35.225.136.228   80:31234/TCP   5m
backend-lb     LoadBalancer   10.0.10.6      34.9.11.2        80:31235/TCP   5m
```

### Erişim URL'leri
| Servis | URL | Açıklama |
|--------|-----|----------|
| **Frontend** | `http://<FRONTEND_EXTERNAL_IP>` | Ana uygulama |
| **Backend API** | `http://<BACKEND_EXTERNAL_IP>/api/v1/` | API endpoint'leri |
| **Swagger Docs** | `http://<BACKEND_EXTERNAL_IP>/docs` | API dokümantasyonu |

### Static IP Kullanmak (Opsiyonel)
IP'nin değişmemesini istiyorsan:

```bash
# 1. GCP'de static IP reserve et
gcloud compute addresses create hackathon-frontend-ip --region=us-central1
gcloud compute addresses create hackathon-backend-ip --region=us-central1

# 2. IP'leri görüntüle
gcloud compute addresses list

# 3. ingress.yaml'da annotation ekle
# cloud.google.com/load-balancer-ip: "YOUR_STATIC_IP"
```

> **💡 NOT:** `EXTERNAL-IP` sütunu `<pending>` gösteriyorsa, birkaç dakika bekle. GKE IP atama işlemi 1-3 dakika sürebilir.

---

## 5. Hata Çözümleri

### 🔴 Hata: "permission denied" veya "Forbidden"
**Sebep:** Service account'un yeterli yetkisi yok.

**Çözüm:**
```bash
gcloud projects add-iam-policy-binding kobi-42 \
  --member="serviceAccount:gitlab-deployer@kobi-42.iam.gserviceaccount.com" \
  --role="roles/container.developer"
```

---

### 🔴 Hata: "ImagePullBackOff" veya "ErrImagePull"
**Sebep:** K8s, GitLab Container Registry'den image çekemiyor.

**Çözüm:**
Registry secret otomatik oluşturulmalı ama manuel kontrol et:
```bash
kubectl get secrets -n hackathon
# gitlab-registry secret'ı olmalı
```

---

### 🔴 Hata: "CrashLoopBackOff"
**Sebep:** Pod başlıyor ama hemen kapanıyor.

**Çözüm:**
```bash
# Pod loglarına bak
kubectl logs -n hackathon <pod-name>

# Pod detaylarına bak
kubectl describe pod -n hackathon <pod-name>
```

---

### 🔴 Hata: "PersistentVolumeClaim pending"
**Sebep:** Storage class uyumsuzluğu.

**Çözüm:**
```bash
# Mevcut storage class'ları kontrol et
kubectl get storageclass

# PVC durumunu kontrol et
kubectl get pvc -n hackathon
```

---

## 📊 Faydalı Komutlar

```bash
# Tüm pod'ları listele
kubectl get pods -n hackathon

# Tüm servisleri listele
kubectl get svc -n hackathon

# Pod loglarını izle
kubectl logs -f -n hackathon deployment/backend

# Pod'a bağlan
kubectl exec -it -n hackathon <pod-name> -- /bin/sh

# Deployment'ı yeniden başlat
kubectl rollout restart deployment/backend -n hackathon
```

---

## 📝 Notlar

- Deployment sürecinde çıkan hatalar bu dokümana eklenecektir.
- Son güncelleme: 2025-12-17

---

## ❓ FAQ - Sık Sorulan Sorular

### S: Storage Object Viewer rolü nerede eklenir?
**C:** Bu rol **GCP IAM** üzerinde eklenir, GKE veya GitLab'da değil. Ama bizim projemizde **gerekli değil** çünkü:
- `Storage Object Viewer` → Google Container Registry (gcr.io) için
- Biz → **GitLab Container Registry** kullanıyoruz
- GitLab registry erişimi → K8s'te `gitlab-registry` secret ile sağlanıyor (pipeline otomatik oluşturur)

### S: GitLab registry secret'ı nasıl oluşturuluyor?
**C:** Pipeline otomatik oluşturur. `.gitlab-ci.yml` içinde şu komut var:
```bash
kubectl create secret docker-registry gitlab-registry \
  --namespace=hackathon \
  --docker-server=$CI_REGISTRY \
  --docker-username=$CI_REGISTRY_USER \
  --docker-password=$CI_REGISTRY_PASSWORD \
  --dry-run=client -o yaml | kubectl apply -f -
```

### S: GCP_SERVICE_ACCOUNT_KEY neden "File" type olmalı?
**C:** `gcloud auth activate-service-account --key-file=` komutu bir **dosya yolu** bekler, string değil. GitLab "File" type seçince, içeriği geçici bir dosyaya yazıp o dosyanın yolunu `$GCP_SERVICE_ACCOUNT_KEY` değişkenine atar.

### S: Hangi branch'e push yapmalıyım?
**C:**
| Branch | Hedef | Trigger |
|--------|-------|---------|
| `develop` | Staging | Otomatik |
| `main` | Production | Manuel onay gerekli |

---

## 🐛 Karşılaşılan Hatalar ve Çözümleri

> Bu bölüm deployment sırasında karşılaşılan gerçek hatalarla güncellenecektir.

<!-- HATA ŞABLONU:
### 🔴 Hata: [Hata mesajı]
**Tarih:** YYYY-MM-DD
**Sebep:** [Neden oldu]
**Çözüm:** [Nasıl çözüldü]
-->
