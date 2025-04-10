// Test para el servicio de mantenimiento

jest.mock("mysql2/promise", () => {
  const queryMock = jest.fn();
  return {
    // La función createPool devuelve un objeto con la función query.
    createPool: jest.fn(() => ({
      query: queryMock,
    })),
    __queryMock: queryMock,
  };
});

const request = require("supertest");

const app = require("../src/server");

const { __queryMock } = require("mysql2/promise");

describe("GraphQL API - Mantenimiento Service", () => {
    afterEach(() => {
    __queryMock.mockReset();
  });
  
  test("Query obtenerMantenimientos", async () => {
    const sampleRows = [
      { id: "1", equipo_id: 123, descripcion: "Mantenimiento 1", estado: "Pendiente", fecha: "2025-04-09" },
      { id: "2", equipo_id: 456, descripcion: "Mantenimiento 2", estado: "Completado", fecha: "2025-04-08" },
    ];
    __queryMock.mockResolvedValue([sampleRows]);
    
    // Definimos la query GraphQL.
    const query = `{ 
      obtenerMantenimientos { 
        id 
        equipo_id 
        descripcion 
        estado 
        fecha 
      } 
    }`;

    const res = await request(app)
      .post("/mantenimiento/")
      .send({ query });

    expect(res.status).toBe(200);
    expect(res.body.data.obtenerMantenimientos).toEqual(sampleRows);
  });

  test("Mutation agregarMantenimiento", async () => {
    const insertResult = { insertId: "10" };
    __queryMock.mockResolvedValueOnce([insertResult]);
    
    const mutation = `
      mutation {
        agregarMantenimiento(equipo_id: 123, descripcion: "Nuevo mantenimiento", estado: "Pendiente") {
          id
          equipo_id
          descripcion
          estado
        }
      }
    `;
    
    const res = await request(app)
      .post("/mantenimiento/")
      .send({ query: mutation });
      
    expect(res.status).toBe(200);
    expect(res.body.data.agregarMantenimiento).toEqual({
      id: "10",
      equipo_id: 123,
      descripcion: "Nuevo mantenimiento",
      estado: "Pendiente"
    });
  });

  test("Mutation actualizarEstado", async () => {
    __queryMock.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const mutation = `
      mutation {
        actualizarEstado(id: 5, estado: "Completado")
      }
    `;
    
    const res = await request(app)
      .post("/mantenimiento/")
      .send({ query: mutation });
      
    expect(res.status).toBe(200);
    expect(res.body.data.actualizarEstado).toBe("Estado actualizado con éxito");
  });

  test("Mutation eliminarMantenimiento", async () => {
    __queryMock.mockResolvedValueOnce([{ affectedRows: 1 }]);
    
    const mutation = `
      mutation {
        eliminarMantenimiento(id: 5)
      }
    `;
    
    const res = await request(app)
      .post("/mantenimiento/")
      .send({ query: mutation });
      
    expect(res.status).toBe(200);
    expect(res.body.data.eliminarMantenimiento).toBe("Mantenimiento eliminado");
  });
});

// npm test