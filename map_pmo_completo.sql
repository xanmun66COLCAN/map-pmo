--
-- PostgreSQL database dump
--

\restrict zPlBWsWuxnbLcAER7TRnh9we1ae7q9X7udknTW5sUS7C8BL377UEuNN9DhpWmAL

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

-- Started on 2026-09-04 15:09:50 EDT

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_id_rol_fkey;
ALTER TABLE IF EXISTS ONLY public.logs_auditoria DROP CONSTRAINT IF EXISTS logs_auditoria_id_usuario_accion_fkey;
ALTER TABLE IF EXISTS ONLY public.kpis DROP CONSTRAINT IF EXISTS kpis_proyecto_id_fkey;
ALTER TABLE IF EXISTS ONLY public.historial_kpis DROP CONSTRAINT IF EXISTS historial_kpis_kpi_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_recursos DROP CONSTRAINT IF EXISTS asignacion_recursos_usuario_id_fkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_recursos DROP CONSTRAINT IF EXISTS asignacion_recursos_proyecto_id_fkey;
DROP INDEX IF EXISTS public.usuarios_correo_key;
DROP INDEX IF EXISTS public.roles_nombre_rol_key;
DROP INDEX IF EXISTS public.idx_kpis_proyecto;
DROP INDEX IF EXISTS public.idx_historial_kpi;
DROP INDEX IF EXISTS public.idx_asignaciones_usuario;
DROP INDEX IF EXISTS public.idx_asignaciones_proyecto;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.roles DROP CONSTRAINT IF EXISTS roles_pkey;
ALTER TABLE IF EXISTS ONLY public.proyectos DROP CONSTRAINT IF EXISTS proyectos_pkey;
ALTER TABLE IF EXISTS ONLY public.logs_auditoria DROP CONSTRAINT IF EXISTS logs_auditoria_pkey;
ALTER TABLE IF EXISTS ONLY public.kpis DROP CONSTRAINT IF EXISTS kpis_pkey;
ALTER TABLE IF EXISTS ONLY public.historial_kpis DROP CONSTRAINT IF EXISTS historial_kpis_pkey;
ALTER TABLE IF EXISTS ONLY public.asignacion_recursos DROP CONSTRAINT IF EXISTS asignacion_recursos_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.roles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.logs_auditoria ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.kpis ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.historial_kpis ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.asignacion_recursos ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.usuarios_id_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.roles_id_seq;
DROP TABLE IF EXISTS public.roles;
DROP TABLE IF EXISTS public.proyectos;
DROP SEQUENCE IF EXISTS public.logs_auditoria_id_seq;
DROP TABLE IF EXISTS public.logs_auditoria;
DROP SEQUENCE IF EXISTS public.kpis_id_seq;
DROP TABLE IF EXISTS public.kpis;
DROP SEQUENCE IF EXISTS public.historial_kpis_id_seq;
DROP TABLE IF EXISTS public.historial_kpis;
DROP SEQUENCE IF EXISTS public.asignacion_recursos_id_seq;
DROP TABLE IF EXISTS public.asignacion_recursos;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TYPE IF EXISTS public.frecuencia_medicion;
DROP TYPE IF EXISTS public."EstadoProyecto";
-- *not* dropping schema, since initdb creates it
--
-- TOC entry 5 (class 2615 OID 21895)
-- Name: public; Type: SCHEMA; Schema: -; Owner: xanmun66
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO xanmun66;

--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: xanmun66
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 886 (class 1247 OID 22064)
-- Name: EstadoProyecto; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public."EstadoProyecto" AS ENUM (
    'Idea',
    'Evaluacion',
    'Caso_de_Negocio',
    'Aprobado',
    'Rechazado',
    'En_Ejecucion',
    'En_Pausa',
    'Completado',
    'Cancelado'
);


ALTER TYPE public."EstadoProyecto" OWNER TO xanmun66;

--
-- TOC entry 883 (class 1247 OID 22056)
-- Name: frecuencia_medicion; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public.frecuencia_medicion AS ENUM (
    'Semanal',
    'Mensual',
    'Trimestral'
);


ALTER TYPE public.frecuencia_medicion OWNER TO xanmun66;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 219 (class 1259 OID 21896)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO xanmun66;

--
-- TOC entry 222 (class 1259 OID 21961)
-- Name: asignacion_recursos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.asignacion_recursos (
    id integer NOT NULL,
    proyecto_id text NOT NULL,
    usuario_id integer NOT NULL,
    porcentaje_asignacion integer DEFAULT 100,
    fecha_desde date,
    fecha_hasta date,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    rol text
);


ALTER TABLE public.asignacion_recursos OWNER TO xanmun66;

--
-- TOC entry 221 (class 1259 OID 21960)
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.asignacion_recursos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asignacion_recursos_id_seq OWNER TO xanmun66;

--
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 221
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.asignacion_recursos_id_seq OWNED BY public.asignacion_recursos.id;


--
-- TOC entry 226 (class 1259 OID 21996)
-- Name: historial_kpis; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.historial_kpis (
    id integer NOT NULL,
    kpi_id integer NOT NULL,
    valor_registrado numeric(10,2) NOT NULL,
    fecha_registro timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_id integer
);


ALTER TABLE public.historial_kpis OWNER TO xanmun66;

--
-- TOC entry 225 (class 1259 OID 21995)
-- Name: historial_kpis_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.historial_kpis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historial_kpis_id_seq OWNER TO xanmun66;

--
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.historial_kpis_id_seq OWNED BY public.historial_kpis.id;


--
-- TOC entry 224 (class 1259 OID 21975)
-- Name: kpis; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.kpis (
    id integer NOT NULL,
    proyecto_id text NOT NULL,
    nombre_kpi character varying(100) NOT NULL,
    descripcion text,
    meta_valor numeric(10,2),
    valor_actual numeric(10,2) DEFAULT 0.00,
    unidad_medida character varying(20),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    frecuencia public.frecuencia_medicion DEFAULT 'Mensual'::public.frecuencia_medicion
);


ALTER TABLE public.kpis OWNER TO xanmun66;

--
-- TOC entry 223 (class 1259 OID 21974)
-- Name: kpis_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.kpis_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kpis_id_seq OWNER TO xanmun66;

--
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 223
-- Name: kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.kpis_id_seq OWNED BY public.kpis.id;


--
-- TOC entry 230 (class 1259 OID 22115)
-- Name: logs_auditoria; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.logs_auditoria (
    id integer NOT NULL,
    id_proyecto text,
    id_usuario_accion integer,
    campo_modificado character varying(100) NOT NULL,
    valor_anterior character varying(255),
    valor_nuevo character varying(255),
    fecha_transaccion timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_auditoria OWNER TO xanmun66;

--
-- TOC entry 229 (class 1259 OID 22114)
-- Name: logs_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.logs_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_auditoria_id_seq OWNER TO xanmun66;

--
-- TOC entry 3821 (class 0 OID 0)
-- Dependencies: 229
-- Name: logs_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.logs_auditoria_id_seq OWNED BY public.logs_auditoria.id;


--
-- TOC entry 220 (class 1259 OID 21942)
-- Name: proyectos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.proyectos (
    id text NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    fecha_inicio timestamp(3) without time zone NOT NULL,
    fecha_fin timestamp(3) without time zone,
    estado public."EstadoProyecto" DEFAULT 'Caso_de_Negocio'::public."EstadoProyecto" NOT NULL,
    presupuesto numeric(12,2),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone,
    costo_real numeric(12,2),
    departamento text,
    lider_proyecto text,
    porcentaje_avance double precision DEFAULT 0
);


ALTER TABLE public.proyectos OWNER TO xanmun66;

--
-- TOC entry 232 (class 1259 OID 22127)
-- Name: roles; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO xanmun66;

--
-- TOC entry 231 (class 1259 OID 22126)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO xanmun66;

--
-- TOC entry 3822 (class 0 OID 0)
-- Dependencies: 231
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 228 (class 1259 OID 22029)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    correo character varying(100) NOT NULL,
    fecha_creacion timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    id_rol integer
);


ALTER TABLE public.usuarios OWNER TO xanmun66;

--
-- TOC entry 227 (class 1259 OID 22028)
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO xanmun66;

--
-- TOC entry 3823 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 3607 (class 2604 OID 21964)
-- Name: asignacion_recursos id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos ALTER COLUMN id SET DEFAULT nextval('public.asignacion_recursos_id_seq'::regclass);


--
-- TOC entry 3615 (class 2604 OID 21999)
-- Name: historial_kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis ALTER COLUMN id SET DEFAULT nextval('public.historial_kpis_id_seq'::regclass);


--
-- TOC entry 3610 (class 2604 OID 21978)
-- Name: kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis ALTER COLUMN id SET DEFAULT nextval('public.kpis_id_seq'::regclass);


--
-- TOC entry 3619 (class 2604 OID 22118)
-- Name: logs_auditoria id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria ALTER COLUMN id SET DEFAULT nextval('public.logs_auditoria_id_seq'::regclass);


--
-- TOC entry 3621 (class 2604 OID 22130)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3617 (class 2604 OID 22032)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3797 (class 0 OID 21896)
-- Dependencies: 219
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0ec7d588-3ec3-44f1-9710-638aaa45478b	56b5fcf2e465c66c016542dfce0e869c9dd86f096cea2e4e19f79eaca17d6863	2026-09-04 06:53:55.3828-04	20260630013517_init_pmo_core	\N	\N	2026-09-04 06:53:55.342865-04	1
6b53c0d1-ef74-45c9-ae02-80c8b4ec9af3	f1fe5ed4ba75c711c78a139a4ccf7338c078549e8586386fa7522f6b831d071f	2026-09-04 06:53:55.402848-04	20260630225824_schema_optimizado_pmo	\N	\N	2026-09-04 06:53:55.38363-04	1
450d5d9d-29f3-4c41-a64d-1a0e83b2e5f7	49440f9258bc7f0ea90ed3d554c54c369f96355e08d2410af09977310f2e8a75	2026-09-04 06:53:55.509221-04	20260807012743_add_metrics_to_proyecto	\N	\N	2026-09-04 06:53:55.403825-04	1
6aba42b1-5681-441f-a037-2ccfcdd1b89d	d0ecac65943bfad2e180624b95bf30eba5325b068e6259839286edfeb5575b8c	2026-09-04 06:53:55.549182-04	20260807014428_init_map_pmo_complete	\N	\N	2026-09-04 06:53:55.510075-04	1
5ee0704c-e80c-4c7b-b582-ce9b43c0c82e	8eb691c667ca0987799e72c9326244a4292d1bb9c880d03ec34e690c8cd5d95a	\N	20260904105358_add_notificacion	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260904105358_add_notificacion\n\nDatabase error code: 42883\n\nDatabase error:\nERROR: function uuid_generate_v4() does not exist\nHINT: No function matches the given name and argument types. You might need to add explicit type casts.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42883), message: "function uuid_generate_v4() does not exist", detail: None, hint: Some("No function matches the given name and argument types. You might need to add explicit type casts."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("parse_func.c"), line: Some(636), routine: Some("ParseFuncOrColumn") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260904105358_add_notificacion"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260904105358_add_notificacion"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:201	\N	2026-09-04 06:53:58.28447-04	0
\.


--
-- TOC entry 3800 (class 0 OID 21961)
-- Dependencies: 222
-- Data for Name: asignacion_recursos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.asignacion_recursos (id, proyecto_id, usuario_id, porcentaje_asignacion, fecha_desde, fecha_hasta, created_at, rol) FROM stdin;
\.


--
-- TOC entry 3804 (class 0 OID 21996)
-- Dependencies: 226
-- Data for Name: historial_kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.historial_kpis (id, kpi_id, valor_registrado, fecha_registro, usuario_id) FROM stdin;
\.


--
-- TOC entry 3802 (class 0 OID 21975)
-- Dependencies: 224
-- Data for Name: kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.kpis (id, proyecto_id, nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, created_at, updated_at, frecuencia) FROM stdin;
\.


--
-- TOC entry 3808 (class 0 OID 22115)
-- Dependencies: 230
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.logs_auditoria (id, id_proyecto, id_usuario_accion, campo_modificado, valor_anterior, valor_nuevo, fecha_transaccion) FROM stdin;
\.


--
-- TOC entry 3798 (class 0 OID 21942)
-- Dependencies: 220
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.proyectos (id, nombre, descripcion, fecha_inicio, fecha_fin, estado, presupuesto, created_at, updated_at, costo_real, departamento, lider_proyecto, porcentaje_avance) FROM stdin;
\.


--
-- TOC entry 3810 (class 0 OID 22127)
-- Dependencies: 232
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.roles (id, nombre_rol) FROM stdin;
\.


--
-- TOC entry 3806 (class 0 OID 22029)
-- Dependencies: 228
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.usuarios (id, nombre, contrasena, correo, fecha_creacion, id_rol) FROM stdin;
\.


--
-- TOC entry 3824 (class 0 OID 0)
-- Dependencies: 221
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.asignacion_recursos_id_seq', 1, false);


--
-- TOC entry 3825 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.historial_kpis_id_seq', 1, false);


--
-- TOC entry 3826 (class 0 OID 0)
-- Dependencies: 223
-- Name: kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.kpis_id_seq', 1, false);


--
-- TOC entry 3827 (class 0 OID 0)
-- Dependencies: 229
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 1, false);


--
-- TOC entry 3828 (class 0 OID 0)
-- Dependencies: 231
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- TOC entry 3829 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- TOC entry 3623 (class 2606 OID 21909)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3627 (class 2606 OID 21973)
-- Name: asignacion_recursos asignacion_recursos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3634 (class 2606 OID 22006)
-- Name: historial_kpis historial_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3632 (class 2606 OID 21994)
-- Name: kpis kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 22125)
-- Name: logs_auditoria logs_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3625 (class 2606 OID 22213)
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- TOC entry 3643 (class 2606 OID 22134)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3638 (class 2606 OID 22043)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3628 (class 1259 OID 22179)
-- Name: idx_asignaciones_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_proyecto ON public.asignacion_recursos USING btree (proyecto_id);


--
-- TOC entry 3629 (class 1259 OID 22137)
-- Name: idx_asignaciones_usuario; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_usuario ON public.asignacion_recursos USING btree (usuario_id);


--
-- TOC entry 3635 (class 1259 OID 22138)
-- Name: idx_historial_kpi; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_historial_kpi ON public.historial_kpis USING btree (kpi_id, fecha_registro);


--
-- TOC entry 3630 (class 1259 OID 22192)
-- Name: idx_kpis_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_kpis_proyecto ON public.kpis USING btree (proyecto_id);


--
-- TOC entry 3641 (class 1259 OID 22135)
-- Name: roles_nombre_rol_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX roles_nombre_rol_key ON public.roles USING btree (nombre_rol);


--
-- TOC entry 3636 (class 1259 OID 22140)
-- Name: usuarios_correo_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);


--
-- TOC entry 3644 (class 2606 OID 22221)
-- Name: asignacion_recursos asignacion_recursos_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 3645 (class 2606 OID 22151)
-- Name: asignacion_recursos asignacion_recursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 3647 (class 2606 OID 22161)
-- Name: historial_kpis historial_kpis_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public.kpis(id) ON DELETE CASCADE;


--
-- TOC entry 3646 (class 2606 OID 22226)
-- Name: kpis kpis_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 3649 (class 2606 OID 22166)
-- Name: logs_auditoria logs_auditoria_id_usuario_accion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_id_usuario_accion_fkey FOREIGN KEY (id_usuario_accion) REFERENCES public.usuarios(id);


--
-- TOC entry 3648 (class 2606 OID 22141)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: xanmun66
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-09-04 15:09:50 EDT

--
-- PostgreSQL database dump complete
--

\unrestrict zPlBWsWuxnbLcAER7TRnh9we1ae7q9X7udknTW5sUS7C8BL377UEuNN9DhpWmAL

