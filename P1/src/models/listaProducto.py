
from .producto import Producto

class ListaProducto:
    def __init__(self):
        self.primero = None
        self.ultimo = None
        self.tamano:int  = 0

    def agregarProducto(self, nombre: str, cantidad: int, precio: float):
        
        producto = Producto(nombre, cantidad, precio)

        if self.primero is None:
            self.primero = producto
            self.ultimo = producto
        else:
            self.ultimo.siguiente = producto
            producto.anterior = self.ultimo
            self.ultimo = producto
        self.tamano += 1

    def eliminarProducto(self, nombre):
        actual = self.primero
        anterior = None
        encontrado = False

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

    def mostrarProductos(self):
        actual = self.primero
        while actual:
            print(actual)
            actual = actual.siguiente

    #Ordenar por precio
    def ordenarPorPrecio(self):
        actual = self.primero
        siguiente = actual.siguiente
        while actual:
            while siguiente:
                if actual.precio > siguiente.precio:
                    temp = actual.precio
                    actual.precio = siguiente.precio
                    siguiente.precio = temp
                siguiente = siguiente.siguiente
            actual = actual.siguiente
            siguiente = actual.siguiente
    
    #Ordenar por cantidad
    def ordenarPorCantidad(self):
        actual = self.primero
        siguiente = actual.siguiente
        while actual:
            while siguiente:
                if actual.cantidad > siguiente.cantidad:
                    temp = actual.cantidad
                    actual.cantidad = siguiente.cantidad
                    siguiente.cantidad = temp
                siguiente = siguiente.siguiente
            actual = actual.siguiente
            siguiente = actual.siguiente


    #buscar producto por nombre
    def buscarProducto(self, nombre):
        actual = self.primero
        encontrado = False
        while actual and not encontrado:
            if actual.nombre == nombre:
                return actual
            else:
                actual = actual.siguiente

    

