#!/bin/bash
set -e

# Veritabanı oluşturma fonksiyonu
# Eğer veritabanı zaten varsa hata vermez, yoksa oluşturur.
function create_user_and_database() {
	local database=$1
	echo "  Creating database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	    SELECT 'CREATE DATABASE $database'
	    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$database')\gexec
EOSQL
}

# --- OLUŞTURULACAK VERİTABANLARI LİSTESİ ---
# Buraya eklediğin her isim için Postgres içinde bir DB açılır.
create_user_and_database "hackathon_app"   # Ana uygulama için
create_user_and_database "hackathon_test"  # Pytest için (Kritik!)
