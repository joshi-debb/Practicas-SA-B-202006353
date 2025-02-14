class Producto:
    def __init__(self, nombre: str, cantidad: int, precio: float): 
        self.nombre: str = nombre
        self.cantidad: int = cantidad
        self.precio: float = precio
        self.siguiente = None
        self.anterior = None

    def __str__(self):
        return f"\tNombre: {self.nombre} \tCantidad: {self.cantidad} \tPrecio: {self.precio}"