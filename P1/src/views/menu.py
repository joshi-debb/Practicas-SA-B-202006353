import os
from colorama import init, Fore, Back, Style
from models.listaProducto import ListaProducto
from models.gestorInventario import GestorInventario

init(autoreset=True)

import os

from models.listaProducto import ListaProducto

class Menu:
    def __init__(self):
        self.listaProductos = ListaProducto()
        self.gestorInventario = GestorInventario(self.listaProductos)

    def mostrar(self):

        while True:

            os.system('cls')

            print(Back.GREEN + "\n============= Manejo de Inventario ============= ")
            print("  1. Agregar un producto al inventario")
            print("  2. Eliminar un producto del inventario")
            print("  3. Mostrar la lista de productos")
            print("  4. Mostrar productos ordenados por precio")
            print("  5. Mostrar productos ordenados por cantidad")
            print("  6. Buscar un producto por su nombre")
            print("  7. Salir")
            print("------------------------------------------------")

            opcion = input(Fore.GREEN + "\n Elija una opción: ")

            if opcion == "1":

                os.system('cls')

                print("\nAgregar un nuevo producto al inventario")
                print(Style.RESET_ALL)

                # Validar los valores ingresados
                try:
                    nombre = input("Ingrese el nombre del producto: ")
                    cantidad = int(input("Ingrese la cantidad: "))
                    precio = float(input("Ingrese el precio unitario: "))
                except ValueError:
                    print(Fore.RED + "Error: Ingrese un valor numérico")
                    input("\nPresione una tecla para continuar...")
                    continue

                self.listaProductos.agregarProducto(nombre, cantidad, precio)

            elif opcion == "2":

                os.system('cls')

                print("\nEliminar un producto del inventario")

                nombre = input(Fore.RED + "  Ingrese el nombre del producto a eliminar: ")

                self.listaProductos.eliminarProducto(nombre)

                input("\nPresione una tecla para continuar...")

            elif opcion == "3":

                os.system('cls')

                print("\nMostrar la lista de productos")
                print(Style.RESET_ALL)

                for producto in self.listaProductos.obtenerProductos():
                    print(producto)

                input("\nPresione una tecla para continuar...")

            elif opcion == "4":

                os.system('cls')

                print("\nProductos ordenados por precio")
                print(Style.RESET_ALL)

                productos = self.gestorInventario.ordenarProductos(lambda producto: producto.precio)

                for producto in productos:
                    print(producto)

                input("\nPresione una tecla para continuar...")

            elif opcion == "5":

                os.system('cls')

                print("\nProductos ordenados por cantidad")
                print(Style.RESET_ALL)

                productos = self.gestorInventario.ordenarProductos(lambda producto: producto.cantidad)

                for producto in productos:
                    print(producto)

                input("\nPresione una tecla para continuar...")

            elif opcion == "6":

                os.system('cls')

                print("\nBuscar producto")
                print(Style.RESET_ALL)

                nombre = input("Ingrese el nombre del producto: ")

                producto = self.gestorInventario.buscarProducto(nombre)

                if producto is not None:
                    print(producto)
                else:
                    print(Fore.RED + "Producto no encontrado")

                input("\nPresione una tecla para continuar...")

            elif opcion == "7":

                os.system('cls')

                print(Fore.RED + "Aplicación cerrada")
                break;

            else:
                input(Fore.RED + "\n\tOpción no válida... Presione una tecla para continuar...")

    
    