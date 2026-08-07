/*
  Warnings:

  - The values [Planificación,En Ejecución,Pausado,Completado] on the enum `EstadoProyecto` will be removed. If these variants are still used in the database, this will fail.
  - The `frecuencia` column on the `kpis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `apellido` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[correo]` on the table `usuarios` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contrasena` to the `usuarios` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `usuarios` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "frecuencia_medicion" AS ENUM ('Semanal', 'Mensual', 'Trimestral');

-- AlterEnum
BEGIN;
CREATE TYPE "EstadoProyecto_new" AS ENUM ('Idea', 'Evaluacion', 'Caso_de_Negocio', 'Aprobado', 'Rechazado');
ALTER TABLE "proyectos" ALTER COLUMN "estado" DROP DEFAULT;
ALTER TABLE "proyectos" ALTER COLUMN "estado" TYPE "EstadoProyecto_new" USING ("estado"::text::"EstadoProyecto_new");
ALTER TYPE "EstadoProyecto" RENAME TO "EstadoProyecto_old";
ALTER TYPE "EstadoProyecto_new" RENAME TO "EstadoProyecto";
DROP TYPE "EstadoProyecto_old";
ALTER TABLE "proyectos" ALTER COLUMN "estado" SET DEFAULT 'Idea';
COMMIT;

-- DropForeignKey
ALTER TABLE "asignacion_recursos" DROP CONSTRAINT "asignacion_recursos_proyecto_id_fkey";

-- DropForeignKey
ALTER TABLE "asignacion_recursos" DROP CONSTRAINT "asignacion_recursos_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "historial_kpis" DROP CONSTRAINT "historial_kpis_kpi_id_fkey";

-- DropForeignKey
ALTER TABLE "historial_kpis" DROP CONSTRAINT "historial_kpis_usuario_id_fkey";

-- DropForeignKey
ALTER TABLE "kpis" DROP CONSTRAINT "kpis_proyecto_id_fkey";

-- DropIndex
DROP INDEX "usuarios_email_key";

-- AlterTable
ALTER TABLE "asignacion_recursos" ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "historial_kpis" ALTER COLUMN "fecha_registro" DROP NOT NULL,
ALTER COLUMN "fecha_registro" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "kpis" ALTER COLUMN "valor_actual" DROP NOT NULL,
DROP COLUMN "frecuencia",
ADD COLUMN     "frecuencia" "frecuencia_medicion" DEFAULT 'Mensual',
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "proyectos" ALTER COLUMN "estado" DROP NOT NULL,
ALTER COLUMN "estado" SET DEFAULT 'Idea',
ALTER COLUMN "presupuesto" DROP NOT NULL,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMPTZ(6),
ALTER COLUMN "updated_at" DROP NOT NULL,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "apellido",
DROP COLUMN "created_at",
DROP COLUMN "email",
DROP COLUMN "password",
ADD COLUMN     "contrasena" VARCHAR(255) NOT NULL,
ADD COLUMN     "correo" VARCHAR(100) NOT NULL,
ADD COLUMN     "fecha_creacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_rol" INTEGER;

-- DropEnum
DROP TYPE "FrecuenciaMedicion";

-- CreateTable
CREATE TABLE "logs_auditoria" (
    "id" SERIAL NOT NULL,
    "id_proyecto" INTEGER,
    "id_usuario_accion" INTEGER,
    "campo_modificado" VARCHAR(100) NOT NULL,
    "valor_anterior" VARCHAR(255),
    "valor_nuevo" VARCHAR(255),
    "fecha_transaccion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "logs_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre_rol" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_rol_key" ON "roles"("nombre_rol");

-- CreateIndex
CREATE INDEX "idx_asignaciones_proyecto" ON "asignacion_recursos"("proyecto_id");

-- CreateIndex
CREATE INDEX "idx_asignaciones_usuario" ON "asignacion_recursos"("usuario_id");

-- CreateIndex
CREATE INDEX "idx_historial_kpi" ON "historial_kpis"("kpi_id", "fecha_registro");

-- CreateIndex
CREATE INDEX "idx_kpis_proyecto" ON "kpis"("proyecto_id");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asignacion_recursos" ADD CONSTRAINT "asignacion_recursos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "asignacion_recursos" ADD CONSTRAINT "asignacion_recursos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "historial_kpis" ADD CONSTRAINT "historial_kpis_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpis"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "logs_auditoria" ADD CONSTRAINT "logs_auditoria_id_usuario_accion_fkey" FOREIGN KEY ("id_usuario_accion") REFERENCES "usuarios"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
