import os
import requests
import re

# Configuración de Supabase
SUPABASE_URL = "https://aubmkukslovtdrjejnpw.supabase.co"
SUPABASE_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
BUCKET_NAME = "productos"
IMAGENES_DIR = r"C:\Users\raote\Documents\Duoc\Quinto Semestre\Integracion de Plataformas\Pagina\imagenes\Productos"

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/octet-stream"
}

def limpiar_nombre(nombre):
    nombre = nombre.lower()
    nombre = re.sub(r"[^a-z0-9._-]", "_", nombre)  # reemplaza tildes, espacios, etc.
    return nombre

# Subida de imágenes
for file_name in os.listdir(IMAGENES_DIR):
    file_path = os.path.join(IMAGENES_DIR, file_name)
    if os.path.isfile(file_path):
        clean_name = limpiar_nombre(file_name)
        with open(file_path, "rb") as f:
            file_data = f.read()
        url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET_NAME}/{clean_name}"
        res = requests.put(url, headers=headers, data=file_data)
        if res.status_code in [200, 201]:
            public_url = f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET_NAME}/{clean_name}"
            print(f"✅ Subido: {file_name} → {public_url}")
        else:
            print(f"❌ Error al subir {file_name}: {res.status_code} - {res.text}")
