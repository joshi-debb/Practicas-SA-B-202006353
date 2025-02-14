class Producto:
    def __init__(self, nombre, cantidad, precio): 
        self.nombre = nombre
        self.cantidad = cantidad
        self.precio = precio
        self.siguiente = None
        self.anterior = None

    def __str__(self):
        return f"Nombre: {self.nombre} Cantidad: {self.cantidad} Precio: {self.precio}"