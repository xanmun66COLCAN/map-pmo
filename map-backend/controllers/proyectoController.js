// controllers/proyectoController.js
const pool = require('../config/db'); // Importa tu db.js actualizado

// Controlador para registrar un nuevo proyecto
const crearProyecto = async (req, res) => {
    try {
        const { nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, estado } = req.body;

        // Validación técnica obligatoria en el backend
        if (!nombre || !fecha_inicio) {
            return res.status(400).json({ 
                error: "Campos requeridos faltantes. El 'nombre' y la 'fecha_inicio' son obligatorios." 
            });
        }

        // Operación de inserción con Prisma
        const nuevoProyecto = await pool.proyecto.create({
            data: {
                nombre,
                descripcion,
                fecha_inicio: new Date(fecha_inicio), // Convierte strings "YYYY-MM-DD" a Date de JS
                fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
                presupuesto: presupuesto ? parseFloat(presupuesto) : 0.00,
                estado: estado || 'Planificacion' // Usa el Enum mapeado por defecto
            }
        });

        res.status(201).json({
            mensaje: "Proyecto creado exitosamente en MAP-PMO",
            proyecto: nuevoProyecto
        });

    } catch (error) {
        console.error("❌ Error en crearProyecto:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al procesar el registro del proyecto." 
        });
    }
};

module.exports = {
    crearProyecto
};

// 🔍 GET: Obtener el detalle completo de un proyecto por ID
export const getProyectoById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const proyecto = await prisma.proyecto.findUnique({
      where: { id: Number(id) },
      include: {
        kpis: {
          include: {
            historial: true
          }
        },
        asignaciones: {
          include: {
            usuario: {
              select: {
                id: true,
                nombre: true,
                correo: true
              }
            }
          }
        },
        logs_auditoria: {
          take: 5,
          orderBy: { fecha_transaccion: 'desc' }
        }
      }
    });

    if (!proyecto) {
      res.status(404).json({
        success: false,
        message: 'La iniciativa solicitada no existe.'
      });
      return;
    }

    res.json({
      success: true,
      data: proyecto
    });

  } catch (error: any) {
    console.error("❌ Error al obtener el detalle del proyecto:", error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al consultar la iniciativa.',
      error: error.message
    });
  }
};