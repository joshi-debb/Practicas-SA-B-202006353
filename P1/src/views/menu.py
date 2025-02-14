
from models.listaProducto import ListaProducto

class Menu:
    def __init__(self):
        self.listaProductos = ListaProducto()

    def mostrar(self):
        print("Bienvenido a la tienda")
        print("1. Agregar un nuevo producto al inventario")
        print("2. Eliminar un producto del inventario")
        print("3. Mostrar la lista de productos con sus detalles.")
        print("4. Mostrar la lista de productos ordenados por precio y/o cantidad")
        print("5. Buscar un producto por su nombre y mostrar su información")
        print("6. Salir")

        opcion = input("Elija una opción: ")
        
        if opcion == "1":
            print("Agregar producto")
        elif opcion == "2":
            print("Mostrar productos")
        elif opcion == "3":
            self.buscarProducto()
        elif opcion == "4":
            self.eliminarProducto()
        elif opcion == "5":
            print("Gracias por usar")
            exit()
        else:
            print("Opción no válida")
            self.mostrar()

    