export const getLogsAuditoria = async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.logs_auditoria.findMany({
      orderBy: { fecha_transaccion: 'desc' },
      include: {
        usuarios: {
          select: { nombre: true, correo: true }
        }
      },
      take: 50 // Últimos 50 movimientos
    });

    res.status(200).json({ success: true, data: logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Error al obtener auditoría', error: error.message });
  }
};