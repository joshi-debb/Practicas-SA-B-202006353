from .producto import Producto

class ListaProducto:
    def __init__(self):
        self.primero = None
        self.ultimo = None
        self.tamano = 0

    def agregarProducto(self, nombre, cantidad, precio):
        
        producto = Producto(nombre, cantidad, precio)

        if self.primero is None:
            self.primero = producto
            self.ultimo = producto
        else:
            self.ultimo.siguiente = producto
            producto.anterior = self.ultimo
            self.ultimo = producto
        self.tamano += 1

    def mostrarProducto(self):
        actual = self.primero
        while actual:
            print(actual)
            actual = actual.siguiente

