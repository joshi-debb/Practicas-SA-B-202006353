
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

    # Obtener lista de productos
    def obtenerProductos(self):
        #lista auxiliar guardar los productos
        productos = []
        actual = self.primero
        # Recorrer la lista y guardar los productos
        while actual:
            productos.append(actual)
            actual = actual.siguiente
        return productos

    

