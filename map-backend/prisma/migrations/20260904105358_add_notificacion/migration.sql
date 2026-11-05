/*
  Warnings:

  - The `id_proyecto` column on the `logs_auditoria` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `proyectos` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `created_at` on the `proyectos` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `proyectos` table. All the data in the column will be lost.
  - The `id` column on the `proyectos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `nombre` on the `proyectos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - The `estado` column on the `proyectos` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `departamento` on the `proyectos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lider_proyecto` on the `proyectos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `porcentaje_avance` on the `proyectos` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - A unique constraint covering the columns `[codigo]` on the table `proyectos` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `proyecto_id` on the `asignacion_recursos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `proyecto_id` on the `kpis` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `codigo` to the `proyectos` table without a default value. This is not possible if the table is not empty.
  - Made the column `fecha_fin` on table `proyectos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `presupuesto` on table `proyectos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `costo_real` on table `proyectos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `departamento` on table `proyectos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lider_proyecto` on table `proyectos` required. This step will fail if there are existing NULL values in that column.
  - Made the column `porcentaje_avance` on table `proyectos` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "estado_proyecto_enum" AS ENUM ('Caso_de_Negocio', 'Aprobado', 'En_Proceso', 'En_Pausa', 'Completado', 'Cancelado');

-- DropForeignKey
ALTER TABLE "asignacion_recursos" DROP CONSTRAINT "asignacion_recursos_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "kpis" DROP CONSTRAINT "kpis_proyecto_id_fkey";

-- AlterTable
ALTER TABLE "asignacion_recursos" DROP COLUMN "proyecto_id",
ADD COLUMN     "proyecto_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "kpis" DROP COLUMN "proyecto_id",
ADD COLUMN     "proyecto_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "logs_auditoria" DROP COLUMN "id_proyecto",
ADD COLUMN     "id_proyecto" UUID;

-- AlterTable
ALTER TABLE "proyectos" DROP CONSTRAINT "proyectos_pkey",
DROP COLUMN "created_at",
DROP COLUMN "updated_at",
ADD COLUMN     "actualizado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "alineacion" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "beneficio" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "codigo" VARCHAR(20) NOT NULL,
ADD COLUMN     "costo" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "creado_en" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "project_manager" VARCHAR(100),
ADD COLUMN     "puntaje_global" DECIMAL(5,2) NOT NULL DEFAULT 5.00,
ADD COLUMN     "riesgo" INTEGER NOT NULL DEFAULT 5,
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ALTER COLUMN "nombre" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "fecha_inicio" SET DATA TYPE DATE,
ALTER COLUMN "fecha_fin" SET NOT NULL,
ALTER COLUMN "fecha_fin" SET DATA TYPE DATE,
DROP COLUMN "estado",
ADD COLUMN     "estado" "estado_proyecto_enum" NOT NULL DEFAULT 'Caso_de_Negocio',
ALTER COLUMN "presupuesto" SET NOT NULL,
ALTER COLUMN "presupuesto" SET DEFAULT 0.00,
ALTER COLUMN "costo_real" SET NOT NULL,
ALTER COLUMN "costo_real" SET DEFAULT 0.00,
ALTER COLUMN "departamento" SET NOT NULL,
ALTER COLUMN "departamento" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lider_proyecto" SET NOT NULL,
ALTER COLUMN "lider_proyecto" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "porcentaje_avance" SET NOT NULL,
ALTER COLUMN "porcentaje_avance" SET DEFAULT 0,
ALTER COLUMN "porcentaje_avance" SET DATA TYPE INTEGER,
ADD CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "EstadoProyecto";

-- CreateTable
CREATE TABLE "bitacora_seguimiento" (
    "id" SERIAL NOT NULL,
    "proyecto_id" UUID NOT NULL,
    "fecha_seguimiento" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detalle_seguimiento" TEXT NOT NULL,
    "proximo_seguimiento" TEXT,
    "temas_pendientes" TEXT,
    "responsable_pendientes" VARCHAR(100),
    "creado_por" INTEGER,

    CONSTRAINT "bitacora_seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comites" (
    "id" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "tipo" VARCHAR(50),
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "id_proyecto" UUID,
    "descripcion" TEXT,
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notificaciones" (
    "id" SERIAL NOT NULL,
    "id_usuario" INTEGER,
    "titulo" VARCHAR(100) NOT NULL,
    "mensaje" TEXT NOT NULL,
    "leida" BOOLEAN DEFAULT false,
    "tipo" VARCHAR(50),
    "creado_en" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_bitacora_proyecto" ON "bitacora_seguimiento"("proyecto_id");

-- CreateIndex
CREATE INDEX "idx_asignaciones_proyecto" ON "asignacion_recursos"("proyecto_id");

-- CreateIndex
CREATE INDEX "idx_kpis_proyecto" ON "kpis"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "proyectos_codigo_key" ON "proyectos"("codigo");

-- AddForeignKey
ALTER TABLE "bitacora_seguimiento" ADD CONSTRAINT "bitacora_seguimiento_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "bitacora_seguimiento" ADD CONSTRAINT "bitacora_seguimiento_creado_por_fkey" FOREIGN KEY ("creado_por") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "comites" ADD CONSTRAINT "comites_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notificaciones" ADD CONSTRAINT "notificaciones_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
