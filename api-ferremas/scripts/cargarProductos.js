const { db } = require('../services/firebase');

const productos = [
    {
        "nombre": "Lijadora orbital eléctrica 200W",
        "marca": "BLACK+DECKER",
        "precio": 28990,
        "stock": 10,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205744/productos/lijadora_orbital_el_ctrica_200w.jpg"
    },
    {
        "nombre": "Taladro inalámbrico percutor + sierra circular + sierra caladora 18V",
        "marca": "BAUKER",
        "precio": 139990,
        "stock": 15,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205755/productos/tss.jpg"
    },
    {
        "nombre": "Motosierra eléctrica 1850W",
        "marca": "BLACK+DECKER",
        "precio": 104990,
        "stock": 7,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205747/productos/motosierra_el_ctrica_1850w.jpg"
    },
    {
        "nombre": "Máquina Cosedora De Sacos Inalambrica Bateria",
        "marca": "Generica",
        "precio": 158490,
        "stock": 9,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205748/productos/m_quina_cosedora_de_sacos.jpg"
    },
    {
        "nombre": "Kit Taladros Inalámbricos Percutor/Atornillador 13 mm 20V/2 Baterías",
        "marca": "UBERMANN",
        "precio": 199990,
        "stock": 21,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205743/productos/kit_taladros_inal_mbricos_percutor.jpg"
    },
    {
        "nombre": "Esmeril angular eléctrico 4,5\" 710 W",
        "marca": "BOSCH",
        "precio": 36990,
        "stock": 13,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205738/productos/esmeril_angular_el_ctrico_4.png"
    },
    {
        "nombre": "Rotomartillo eléctricto 820W 2.7",
        "marca": "BOSCH",
        "precio": 153690,
        "stock": 16,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205748/productos/rotomartillo_el_ctricto_820w.jpg"
    },
    {
        "nombre": "Atornillador 4V 29 accesorios USB",
        "marca": "BAUKER",
        "precio": 17990,
        "stock": 54,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205737/productos/atornillador_4v_29.jpg"
    },
    {
        "nombre": "Lijadora roto orbital eléctrica 275W",
        "marca": "DEWALT",
        "precio": 140990,
        "stock": 26,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205745/productos/lijadora_roto_orbital.jpg"
    },
    {
        "nombre": "Sierra circular eléctrica 7 1/4\" 1800W",
        "marca": "BAUKER",
        "precio": 49990,
        "stock": 17,
        "categoria": "Herramientas Electricas",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205754/productos/sierra_circular_el_ctrica_7.jpg"
    },
    {
        "nombre": "Juego Herramientas Llave Dado Universal 45 Piezas",
        "marca": "Brooklyn",
        "precio": 4990,
        "stock": 48,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205740/productos/juego_herramientas_llave_dado_universa.png"
    },
    {
        "nombre": "Set de herramientas manuales acero 7 piezas",
        "marca": "REDLINE",
        "precio": 8690,
        "stock": 47,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205753/productos/set_de_herramientas_manuales_acero_7_piezas.png"
    },
    {
        "nombre": "Martillo carpintero 13 Oz acero",
        "marca": "BAUKER",
        "precio": 2890,
        "stock": 100,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205745/productos/martillo_carpintero_13_oz_acero.png"
    },
    {
        "nombre": "Set 47 Pcs Atornillar De Alto Rendimiento",
        "marca": "AIZO",
        "precio": 3990,
        "stock": 76,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205749/productos/set_47_pcs_atornillar.png"
    },
    {
        "nombre": "Set De Destornilladores Toughseries 8 Pc Dwht65102",
        "marca": "DEWALT",
        "precio": 34990,
        "stock": 71,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205751/productos/set_de_destornilladores_toughseries_8.png"
    },
    {
        "nombre": "Kit Set Juego Destornilladores 18 Piezas Ingco Hksd1828",
        "marca": "INGCO",
        "precio": 29990,
        "stock": 45,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205741/productos/kit_set_juego_destornilladores_18.png"
    },
    {
        "nombre": "Set 6 Broca Piloto Avellanador 5 /6 /8 /10 /12mm +llave Allen",
        "marca": "AIZO",
        "precio": 10990,
        "stock": 16,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205735/productos/6_broca_piloto_avellanador.png"
    },
    {
        "nombre": "Taladro Inalámbrico Percutor 10 mm 12 V/1 Batería",
        "marca": "BAUKER",
        "precio": 42990,
        "stock": 49,
        "categoria": "Herramientas Manuales",
        "imagen": "https://res.cloudinary.com/ferrremas/image/upload/v1743205755/productos/taladro_inal_mbrico_percutor_10_mm.jpg"
    }
];

const generarID = (categoria, contador) => {
  const prefijos = {
    "Herramientas Electricas": "HE",
    "Herramientas Manuales": "HM"
  };
  const prefix = prefijos[categoria] || "XX";
  return `${prefix}${String(contador).padStart(4, '0')}`;
};

const cargarProductos = async () => {
  let contadorHE = 1;
  let contadorHM = 1;

  for (const prod of productos) {
    let id;
    if (prod.categoria === "Herramientas Electricas") {
      id = generarID(prod.categoria, contadorHE++);
    } else if (prod.categoria === "Herramientas Manuales") {
      id = generarID(prod.categoria, contadorHM++);
    }

    try {
      await db.collection('productos').doc(id).set(prod);
      console.log(`✅ Producto agregado: ${id} - ${prod.nombre}`);
    } catch (err) {
      console.error(`❌ Error al agregar ${prod.nombre}:`, err.message);
    }
  }
};

cargarProductos();