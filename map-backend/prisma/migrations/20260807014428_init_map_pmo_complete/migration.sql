/*
  Warnings:

  - The primary key for the `proyectos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `estado` on table `proyectos` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EstadoProyecto" ADD VALUE 'En_Ejecucion';
ALTER TYPE "EstadoProyecto" ADD VALUE 'En_Pausa';
ALTER TYPE "EstadoProyecto" ADD VALUE 'Completado';
ALTER TYPE "EstadoProyecto" ADD VALUE 'Cancelado';

-- DropForeignKey
ALTER TABLE "asignacion_recursos" DROP CONSTRAINT "asignacion_recursos_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "kpis" DROP CONSTRAINT "kpis_proyecto_id_fkey";

-- AlterTable
ALTER TABLE "asignacion_recursos" ADD COLUMN     "rol" TEXT,
ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ALTER COLUMN "porcentaje_asignacion" DROP NOT NULL,
ALTER COLUMN "porcentaje_asignacion" SET DEFAULT 100,
ALTER COLUMN "fecha_desde" DROP NOT NULL;

-- AlterTable
ALTER TABLE "kpis" ALTER COLUMN "proyecto_id" SET DATA TYPE TEXT,
ALTER COLUMN "meta_valor" DROP NOT NULL,
ALTER COLUMN "unidad_medida" DROP NOT NULL;

-- AlterTable
ALTER TABLE "logs_auditoria" ALTER COLUMN "id_proyecto" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "proyectos" DROP CONSTRAINT "proyectos_pkey",
ADD COLUMN     "costo_real" DECIMAL(12,2),
ADD COLUMN     "departamento" TEXT,
ADD COLUMN     "lider_proyecto" TEXT,
ADD COLUMN     "porcentaje_avance" DOUBLE PRECISION DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "nombre" SET DATA TYPE TEXT,
ALTER COLUMN "fecha_inicio" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "fecha_fin" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "estado" SET NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'Caso_de_Negocio',
ALTER COLUMN "presupuesto" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT,
ADD CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "proyectos_id_seq";

-- AddForeignKey
ALTER TABLE "asignacion_recursos" ADD CONSTRAINT "asignacion_recursos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
