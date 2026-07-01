-- CreateEnum
CREATE TYPE "EstadoProyecto" AS ENUM ('Planificación', 'En Ejecución', 'Pausado', 'Completado');

-- CreateEnum
CREATE TYPE "FrecuenciaMedicion" AS ENUM ('Semanal', 'Mensual', 'Trimestral');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proyectos" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "estado" "EstadoProyecto" NOT NULL DEFAULT 'Planificación',
    "presupuesto" DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proyectos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignacion_recursos" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "porcentaje_asignacion" INTEGER NOT NULL,
    "fecha_desde" DATE NOT NULL,
    "fecha_hasta" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asignacion_recursos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpis" (
    "id" SERIAL NOT NULL,
    "proyecto_id" INTEGER NOT NULL,
    "nombre_kpi" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "meta_valor" DECIMAL(10,2) NOT NULL,
    "valor_actual" DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    "frecuencia" "FrecuenciaMedicion" NOT NULL DEFAULT 'Mensual',
    "unidad_medida" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historial_kpis" (
    "id" SERIAL NOT NULL,
    "kpi_id" INTEGER NOT NULL,
    "valor_registrado" DECIMAL(10,2) NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario_id" INTEGER,

    CONSTRAINT "historial_kpis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- AddForeignKey
ALTER TABLE "asignacion_recursos" ADD CONSTRAINT "asignacion_recursos_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignacion_recursos" ADD CONSTRAINT "asignacion_recursos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpis" ADD CONSTRAINT "kpis_proyecto_id_fkey" FOREIGN KEY ("proyecto_id") REFERENCES "proyectos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historial_kpis" ADD CONSTRAINT "historial_kpis_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpis"("id") ON DELETE CASCADE ON UPDATE CASCADE;
