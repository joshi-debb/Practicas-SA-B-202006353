
from .producto import Producto

class ListaProducto:
    def __init__(self):
        self.primero = None
        self.ultimo = None
        self.tamano:int  = 0

    # Agregar producto a la lista
    def agregarProducto(self, nombre: str, cantidad: int, precio: float):
        
        producto = Producto(nombre, cantidad, precio)

        # Si la lista esta vacia
        if self.primero is None:
            self.primero = producto
            self.ultimo = producto
        
        # Si la lista no esta vacia
        else:
            self.ultimo.siguiente = producto
            producto.anterior = self.ultimo
            self.ultimo = producto
        self.tamano += 1
    
    # Eliminar producto por nombre
    def eliminarProducto(self, nombre):
        actual = self.primero
        anterior = None
        encontrado = False

        # Recorrer la lista y buscar el producto
        while actual and not encontrado:
            if actual.nombre == nombre:
                encontrado = True
                if anterior:
                    anterior.siguiente = actual.siguiente
                else:
                    self.primero = actual.siguiente
                self.tamano -= 1
            anterior = actual
            actual = actual.siguiente

        if not encontrado:
            print("Producto no encontrado")

    # Mostrar productos en la lista
    def mostrarProductos(self):
        actual = self.primero

        # Recorrer la lista y mostrar los productos
        while actual:
            print(actual)
            actual = actual.siguiente

    # Ordenar por precio
    def ordenarPorPrecio(self):
        # Validar si la lista esta vacia o solo tiene un elemento
        if not self.primero or not self.primero.siguiente:
            print("No hay suficientes productos en la lista para ordenar")
            return
        
        # Ordenamiento burbuja
        cambiado = True
        while cambiado:
            cambiado = False
            actual = self.primero
            while actual.siguiente:
                if actual.precio > actual.siguiente.precio:
                    # Intercambiar los valores de los nodos
                    actual.precio, actual.siguiente.precio = actual.siguiente.precio, actual.precio
                    cambiado = True
                actual = actual.siguiente

    # Ordenar por cantidad
    def ordenarPorCantidad(self):
        # Validar si la lista esta vacia o solo tiene un elemento
        if not self.primero or not self.primero.siguiente:
            print("No hay suficientes productos en la lista para ordenar")
            return

        # Ordenamiento burbuja
        cambiado = True
        while cambiado:
            cambiado = False
            actual = self.primero
            while actual.siguiente:
                if actual.cantidad > actual.siguiente.cantidad:
                    # Intercambiar los valores de los nodos
                    actual.cantidad, actual.siguiente.cantidad = actual.siguiente.cantidad, actual.cantidad
                    cambiado = True
                actual = actual.siguiente


    # Buscar producto por nombre
    def buscarProducto(self, nombre):
        actual = self.primero
        encontrado = False

        # Recorrer la lista y buscar el producto
        while actual and not encontrado:
            if actual.nombre == nombre:
                return actual
            else:
                actual = actual.siguiente

    

