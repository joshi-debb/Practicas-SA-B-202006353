
from models.listaProducto import ListaProducto

class GestorInventario:
    def __init__(self, listaProductos: ListaProducto):
        self.listaProductos = listaProductos

    def ordenarProductos(self, criterio):
        productos = self.listaProductos.obtenerProductos()
        return sorted(productos, key=criterio)

    def buscarProducto(self, nombre):
        for producto in self.listaProductos.obtenerProductos():
            if producto.nombre == nombre:
                return producto
        return None