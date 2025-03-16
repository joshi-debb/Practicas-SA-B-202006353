# Manual de GraphQL

## ¿Qué es GraphQL?

GraphQL es un lenguaje de consulta y manipulación de datos para APIs, desarrollado por Facebook en 2012 y lanzado como código abierto en 2015. GraphQL permite a los clientes solicitar solo los datos que necesitan, lo que lo hace más eficiente y flexible que las API REST tradicionales.

En lugar de tener múltiples puntos finales para diferentes recursos, GraphQL utiliza un único punto final y permite a los clientes especificar exactamente qué datos necesitan. Esto significa que los clientes pueden obtener todos los datos necesarios en una sola solicitud, evitando la sobrecarga de solicitudes adicionales.

GraphQL también proporciona una forma clara y estructurada de definir los tipos de datos y las operaciones que se pueden realizar en una API. Esto se hace a través de un esquema (schema) que define los tipos de datos, las consultas (queries) y las mutaciones que se pueden realizar.


## Características de GraphQL

- Los clientes pueden solicitar solo los datos que necesitan, evitando la sobrecarga de datos innecesarios.
- GraphQL utiliza un único punto final
- GraphQL permite definir tipos de datos personalizados y estructurados.
- GraphQL permite realizar operaciones de lectura (queries) y escritura (mutations) en la API.
- Los resolvers son funciones que se encargan de obtener los datos solicitados
- GraphQL proporciona una documentación automática de la API basada en el esquema definido.

## Conceptos Clave

1. **Schema (Esquema)**  
    Es la estructura de la API GraphQL. Define los **tipos**, **queries** y **mutations** que se pueden realizar. El esquema se define utilizando el lenguaje de definición de esquemas de GraphQL (SDL).

2. **Types (Tipos)**  
   Son los tipos de datos que utiliza GraphQL, por ejemplo `String`, `Int`, `Float`, `Boolean` y `ID`. A su vez, se pueden crear **tipos personalizados** (Object Types) para modelar la información.

3. **Query**  
    Una **query** define la operación para **leer** datos. Se utilizan para obtener información de la API.

4. **Mutation**  
    Una **mutation** define la operación para **escribir** datos. Se utilizan para crear, actualizar o eliminar información.

5. **Resolver**  
    Es una función que se encarga de **resolver** los campos de un tipo. Cada campo de un tipo puede tener un resolver asociado que se encarga de obtener los datos.

6. **Root Types**  
   Son los tipos de entrada que se utilizan para definir las operaciones principales de la API:
   - **Query**: Define las operaciones de lectura.
   - **Mutation**: Define las operaciones de escritura.
   - **Subscription** (opcional): Define las operaciones para recibir cambios en tiempo real.

7. **Directivas**  
    Son anotaciones que se pueden agregar a los campos de un tipo para modificar su comportamiento. Por ejemplo, la directiva `@deprecated` se utiliza para marcar un campo como obsoleto.

8. **Fragments**
    Los fragmentos son una forma de reutilizar campos y fragmentos de consulta en GraphQL. Permiten definir un conjunto de campos que se pueden reutilizar en múltiples consultas.

9. **Variables**
    Las variables se utilizan para pasar argumentos a las consultas y mutaciones en GraphQL. Permiten parametrizar las consultas y reutilizarlas con diferentes valores.

10. **Introspección**
    GraphQL proporciona una forma de **introspección** de la API, lo que significa que se puede consultar el esquema de la API para obtener información sobre los tipos, campos y operaciones disponibles.


## Ejemplo de Esquema en GraphQL

A continuación, se muestra un ejemplo simple de un archivo `schema.graphql` que define un esquema para gestionar usuarios:

```graphql
type User {
  id: ID!
  nombre: String!
  edad: Int
  correo: String!
}

type Query {
  # Retorna una lista de usuarios
  usuarios: [User]

  # Retorna un usuario con un id específico
  obtenerUsuario(id: ID!): User
}

type Mutation {
  # Crea un nuevo usuario
  crearUsuario(nombre: String!, edad: Int, correo: String!): User

  # Actualiza un usuario existente
  actualizarUsuario(id: ID!, nombre: String, edad: Int, correo: String): User

  # Elimina un usuario
  eliminarUsuario(id: ID!): Boolean
}

```

En este ejemplo, se definen los tipos `User`, `Query` y `Mutation`. El tipo `User` representa un usuario con los campos `id`, `nombre`, `edad` y `correo`. El tipo `Query` define las operaciones de lectura para obtener usuarios, y el tipo `Mutation` define las operaciones de escritura para crear, actualizar y eliminar usuarios.

## Recursos Adicionales

- [Documentación Oficial de GraphQL](https://graphql.org/)
- [GraphQL Playground](https://www.apollographql.com/docs/apollo-server/v2/testing/graphql-playground)

