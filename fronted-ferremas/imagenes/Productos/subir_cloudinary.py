import os
import cloudinary
import cloudinary.uploader
import re
import csv

# 📌 CONFIGURACIÓN DE CLOUDINARY
cloudinary.config(
    cloud_name = "ferrremas",
    api_key = "978988183493342",
    api_secret = "qv0WzN87wLX9LmCiRuwaLIpa3Ps",
    secure = True
)

# 📁 Ruta local con tus imágenes
IMAGENES_DIR = r"C:\Users\raote\Documents\Duoc\Quinto Semestre\Integracion de Plataformas\Pagina\imagenes\Productos"

# 📄 Archivo CSV de salida con nombres y URLs
CSV_SALIDA = os.path.join(IMAGENES_DIR, "imagenes_urls.csv")

# 🧼 Función para limpiar nombres de archivo (sin tildes, espacios, etc.)
def limpiar_nombre(nombre):
    nombre = nombre.lower()
    nombre = re.sub(r"[^a-z0-9_-]", "_", nombre)
    return nombre

# 📝 Abrir archivo CSV para guardar resultados
with open(CSV_SALIDA, mode='w', newline='', encoding='utf-8') as archivo_csv:
    writer = csv.writer(archivo_csv)
    writer.writerow(['archivo_original', 'nombre_cloudinary', 'url'])

    # 🔁 Subir cada imagen
    for file_name in os.listdir(IMAGENES_DIR):
        file_path = os.path.join(IMAGENES_DIR, file_name)

        if os.path.isfile(file_path) and not file_name.endswith(".py"):
            nombre_sin_extension = os.path.splitext(file_name)[0]
            nombre_limpio = limpiar_nombre(nombre_sin_extension)

            try:
                result = cloudinary.uploader.upload(
                    file_path,
                    public_id=f"productos/{nombre_limpio}",
                    overwrite=True
                )
                url = result['secure_url']
                print(f"✅ Subido: {file_name} → {url}")
                writer.writerow([file_name, nombre_limpio, url])
            except Exception as e:
                print(f"❌ Error al subir {file_name}: {e}")
