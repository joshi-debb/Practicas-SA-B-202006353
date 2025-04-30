// utils/kvParser.js
/**
 * Convierte una cadena como
 *   'nombre Laptop tipo Desktop estado activo ubicacion Oficina'
 *   'nombre=Laptop tipo=Desktop estado=activo'
 *   'nombre:"Laptop Pro" tipo:Desktop'
 * en { nombre:'Laptop', tipo:'Desktop', estado:'activo', ubicacion:'Oficina' }
 */
module.exports = str => {
    // primero detecta pares con = o :
    const map = {};
    const kvRegex = /(\w+)\s*[=:]\s*(?:"([^"]+)"|([^\s]+))/g;
    let m;
    let consumed = 0;
    while ((m = kvRegex.exec(str)) !== null) {
      map[m[1].toLowerCase()] = (m[2] ?? m[3]).trim();
      consumed += m[0].length;
    }
  
    // si nada coincidió usa pares “key value key value …”
    if (Object.keys(map).length === 0) {
      const toks = str.trim().split(/\s+/);
      for (let i = 0; i < toks.length - 1; i += 2) {
        map[toks[i].toLowerCase()] = toks[i + 1];
      }
    }
    return map;
  };
  