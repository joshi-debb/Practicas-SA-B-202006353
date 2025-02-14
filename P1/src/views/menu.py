
from colorama import init, Fore, Back, Style # Libreía para colores en la consola
init(autoreset=True)  # Resetea los colores automáticamente

import os

from models.listaProducto import ListaProducto

class Menu:
    def __init__(self):
        self.listaProductos = ListaProducto()

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
                print("\nMostrar la lista de productos")
                print(Style.RESET_ALL)
                self.listaProductos.mostrarProductos()
                input("\nPresione una tecla para continuar...")

            elif opcion == "4":
                print("\nProductos ordenados por precio")
                print(Style.RESET_ALL)
                self.listaProductos.ordenarPorPrecio()
                self.listaProductos.mostrarProductos()
                input("\nPresione una tecla para continuar...")

            elif opcion == "5":
                print("\nProductos ordenados por cantidad")
                print(Style.RESET_ALL)
                self.listaProductos.ordenarPorCantidad()
                self.listaProductos.mostrarProductos()
                input("\nPresione una tecla para continuar...")
            
            elif opcion == "6":
                print("Buscar producto")

            elif opcion == "7":
                print(Fore.RED + "Aplicación cerrada")
                break;
            else:
                print(Fore.RED + "Opción no válida")
    
    