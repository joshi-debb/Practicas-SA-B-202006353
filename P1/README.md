# Practica 1

Autor: Juan Josue Zuleta Beb - 202006353


## Principios SOLID

### 1. Principio de Responsabilidad Única
Una clase debe tener una única razón para cambiar, es decir, debe tener solo una responsabilidad.

**Aplicación en la practica:**
- **Clase `Producto`**: Se encarga únicamente de representar un producto con sus atributos.
- **Clase `ListaProducto`**: Gestiona la manipulación de la lista de productos (agregar, eliminar, buscar, ordenar).
- **Clase `Menu`**: Maneja la interacción con el usuario y la presentación de los datos.

---

### 2. Principio de Abierto/Cerrado
Una clase debe estar abierta para la extensión pero cerrada para la modificación.

**Aplicación en la practica:**
- La clase `ListaProducto` permite agregar nuevos métodos de ordenamiento sin modificar los existentes.
- Si se desea agregar ordenamiento por nombre, se puede hacer sin modificar `ListaProducto`, sino creando una estrategia externa.

---

### 3. Principio de Sustitución de Liskov
Una clase derivada debe poder sustituir a su clase base sin alterar el funcionamiento del programa.

**Aplicación en la practica:**
- No hay herencia directa en el diseño actual, por lo que no se violan las reglas de sustitución.

---

### 4. Principio de Segregación de Interfaces
Una clase no debe verse obligada a depender de métodos que no usa.

**Aplicación en la practica:**
- Actualmente, `ListaProducto` maneja todos los aspectos de la lista de productos, sin interfaces específicas.

**Propuesta de aplicacion:**
- Definir interfaces para manejar distintas responsabilidades de la lista de productos.

---

### 5. Principio de Inversión de Dependencias
Las clases deben depender de abstracciones y no de implementaciones concretas.

**Aplicación en la practica:**
- `Menu` depende directamente de `ListaProducto`, lo que acopla fuertemente las clases.

**Propuesta de aplicacion:**
- Inyectar dependencias en `Menu` en lugar de instanciar `ListaProducto` directamente.

---
