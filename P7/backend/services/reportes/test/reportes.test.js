// Test para el servicio de reportes

jest.mock("mysql2/promise", () => {
    const queryMock = jest.fn();
    return {
      // La función createPool devuelve un objeto con una función query (mockeada)
      createPool: jest.fn(() => ({
        query: queryMock,
      })),
      __queryMock: queryMock,
    };
  });
  
  const request = require("supertest");

  const app = require("../src/server");
  
  const { __queryMock } = require("mysql2/promise");
  
  describe("GraphQL API - Reportes Service", () => {
  
    afterEach(() => {
      __queryMock.mockReset();
    });
  
    test("Query obtenerReportes", async () => {
      const sampleRows = [
        { id: "1", tipo: "error", descripcion: "Reporte 1", fecha: "2025-04-09" },
        { id: "2", tipo: "info", descripcion: "Reporte 2", fecha: "2025-04-08" },
      ];
      __queryMock.mockResolvedValue([sampleRows]);
  
      const query = `
        {
          obtenerReportes {
            id
            tipo
            descripcion
            fecha
          }
        }
      `;
  
      const res = await request(app)
        .post("/reportes/")
        .send({ query });
  
      expect(res.status).toBe(200);
      expect(res.body.data.obtenerReportes).toEqual(sampleRows);
    });
  
    test("Query obtenerReportePorTipo", async () => {
      const sampleRows = [
        { id: "3", tipo: "error", descripcion: "Reporte de error", fecha: "2025-04-07" },
      ];
      __queryMock.mockResolvedValue([sampleRows]);
  
      const query = `
        {
          obtenerReportePorTipo(tipo: "error") {
            id
            tipo
            descripcion
            fecha
          }
        }
      `;
  
      const res = await request(app)
        .post("/reportes/")
        .send({ query });
  
      expect(res.status).toBe(200);
      expect(res.body.data.obtenerReportePorTipo).toEqual(sampleRows);
    });
  
    test("Mutation generarReporte", async () => {
      const insertResult = { insertId: "100" };
      __queryMock
        .mockResolvedValueOnce([insertResult])
        .mockResolvedValueOnce([[{
          id: "100",
          tipo: "warning",
          descripcion: "Reporte generado",
          fecha: "2025-04-10"
        }]]);
        
      const mutation = `
        mutation {
          generarReporte(tipo: "warning", descripcion: "Reporte generado") {
            id
            tipo
            descripcion
            fecha
          }
        }
      `;
  
      const res = await request(app)
        .post("/reportes/")
        .send({ query: mutation });
        
      expect(res.status).toBe(200);
      expect(res.body.data.generarReporte).toEqual({
        id: "100",
        tipo: "warning",
        descripcion: "Reporte generado",
        fecha: "2025-04-10"
      });
    });
  
    test("Mutation eliminarReporte - Reporte eliminado", async () => {
      __queryMock.mockResolvedValueOnce([{ affectedRows: 1 }]);
  
      const mutation = `
        mutation {
          eliminarReporte(id: "50")
        }
      `;
  
      const res = await request(app)
        .post("/reportes/")
        .send({ query: mutation });
        
      expect(res.status).toBe(200);
      expect(res.body.data.eliminarReporte).toBe("Reporte eliminado");
    });
  
    test("Mutation eliminarReporte - Reporte no encontrado", async () => {
      __queryMock.mockResolvedValueOnce([{ affectedRows: 0 }]);
  
      const mutation = `
        mutation {
          eliminarReporte(id: "999")
        }
      `;
  
      const res = await request(app)
        .post("/reportes/")
        .send({ query: mutation });
        
      expect(res.status).toBe(200);
      expect(res.body.data.eliminarReporte).toBe("Reporte no encontrado");
    });
  });
  
  // npm test