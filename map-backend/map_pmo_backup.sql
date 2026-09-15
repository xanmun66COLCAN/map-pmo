--
-- PostgreSQL database dump
--

\restrict 80JVzMjiKREd7BU9UnaDQ8t132o0cgem1ILPT4mv7gJo1CmSyrHlX7tgsfeMStp

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

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

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: xanmun66
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO xanmun66;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: xanmun66
--

COMMENT ON SCHEMA public IS '';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: estado_proyecto_enum; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public.estado_proyecto_enum AS ENUM (
    'Caso_de_Negocio',
    'Aprobado',
    'En_Proceso',
    'En_Pausa',
    'Completado',
    'Cancelado'
);


ALTER TYPE public.estado_proyecto_enum OWNER TO xanmun66;

--
-- Name: frecuencia_medicion; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public.frecuencia_medicion AS ENUM (
    'Semanal',
    'Mensual',
    'Trimestral'
);


ALTER TYPE public.frecuencia_medicion OWNER TO xanmun66;

--
-- Name: update_actualizado_en_column(); Type: FUNCTION; Schema: public; Owner: xanmun66
--

CREATE FUNCTION public.update_actualizado_en_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.actualizado_en = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_actualizado_en_column() OWNER TO xanmun66;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
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
-- Name: asignacion_recursos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.asignacion_recursos (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    porcentaje_asignacion integer DEFAULT 100,
    fecha_desde date,
    fecha_hasta date,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    rol text,
    proyecto_id uuid NOT NULL
);


ALTER TABLE public.asignacion_recursos OWNER TO xanmun66;

--
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
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.asignacion_recursos_id_seq OWNED BY public.asignacion_recursos.id;


--
-- Name: bitacora_seguimiento; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.bitacora_seguimiento (
    id integer NOT NULL,
    proyecto_id uuid NOT NULL,
    fecha_seguimiento date DEFAULT CURRENT_TIMESTAMP NOT NULL,
    detalle_seguimiento text NOT NULL,
    proximo_seguimiento text,
    temas_pendientes text,
    responsable_pendientes character varying(100),
    creado_por integer
);


ALTER TABLE public.bitacora_seguimiento OWNER TO xanmun66;

--
-- Name: bitacora_seguimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.bitacora_seguimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bitacora_seguimiento_id_seq OWNER TO xanmun66;

--
-- Name: bitacora_seguimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.bitacora_seguimiento_id_seq OWNED BY public.bitacora_seguimiento.id;


--
-- Name: comites; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.comites (
    id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    tipo character varying(50),
    fecha_hora timestamp(3) without time zone NOT NULL,
    id_proyecto uuid,
    descripcion text,
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.comites OWNER TO xanmun66;

--
-- Name: comites_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.comites_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.comites_id_seq OWNER TO xanmun66;

--
-- Name: comites_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.comites_id_seq OWNED BY public.comites.id;


--
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
-- Name: historial_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.historial_kpis_id_seq OWNED BY public.historial_kpis.id;


--
-- Name: kpis; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.kpis (
    id integer NOT NULL,
    nombre_kpi character varying(100) NOT NULL,
    descripcion text,
    meta_valor numeric(10,2),
    valor_actual numeric(10,2) DEFAULT 0.00,
    unidad_medida character varying(20),
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    frecuencia public.frecuencia_medicion DEFAULT 'Mensual'::public.frecuencia_medicion,
    proyecto_id uuid NOT NULL
);


ALTER TABLE public.kpis OWNER TO xanmun66;

--
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
-- Name: kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.kpis_id_seq OWNED BY public.kpis.id;


--
-- Name: logs_auditoria; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.logs_auditoria (
    id integer NOT NULL,
    id_usuario_accion integer,
    campo_modificado character varying(100) NOT NULL,
    valor_anterior character varying(255),
    valor_nuevo character varying(255),
    fecha_transaccion timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    id_proyecto uuid
);


ALTER TABLE public.logs_auditoria OWNER TO xanmun66;

--
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
-- Name: logs_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.logs_auditoria_id_seq OWNED BY public.logs_auditoria.id;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.notificaciones (
    id integer NOT NULL,
    id_usuario integer,
    titulo character varying(100) NOT NULL,
    mensaje text NOT NULL,
    leida boolean DEFAULT false,
    tipo character varying(50),
    creado_en timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notificaciones OWNER TO xanmun66;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.notificaciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificaciones_id_seq OWNER TO xanmun66;

--
-- Name: notificaciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.notificaciones_id_seq OWNED BY public.notificaciones.id;


--
-- Name: proyectos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.proyectos (
    nombre character varying(150) NOT NULL,
    descripcion text,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    presupuesto numeric(12,2) DEFAULT 0.00 NOT NULL,
    costo_real numeric(12,2) DEFAULT 0.00 NOT NULL,
    departamento character varying(100) NOT NULL,
    lider_proyecto character varying(100) NOT NULL,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    actualizado_en timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    alineacion integer DEFAULT 5 NOT NULL,
    beneficio integer DEFAULT 5 NOT NULL,
    codigo character varying(20) NOT NULL,
    costo integer DEFAULT 5 NOT NULL,
    creado_en timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP,
    project_manager character varying(100),
    puntaje_global numeric(5,2) DEFAULT 5.00 NOT NULL,
    riesgo integer DEFAULT 5 NOT NULL,
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    estado public.estado_proyecto_enum DEFAULT 'Caso_de_Negocio'::public.estado_proyecto_enum NOT NULL
);


ALTER TABLE public.proyectos OWNER TO xanmun66;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO xanmun66;

--
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
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
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
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: asignacion_recursos id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos ALTER COLUMN id SET DEFAULT nextval('public.asignacion_recursos_id_seq'::regclass);


--
-- Name: bitacora_seguimiento id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.bitacora_seguimiento ALTER COLUMN id SET DEFAULT nextval('public.bitacora_seguimiento_id_seq'::regclass);


--
-- Name: comites id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.comites ALTER COLUMN id SET DEFAULT nextval('public.comites_id_seq'::regclass);


--
-- Name: historial_kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis ALTER COLUMN id SET DEFAULT nextval('public.historial_kpis_id_seq'::regclass);


--
-- Name: kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis ALTER COLUMN id SET DEFAULT nextval('public.kpis_id_seq'::regclass);


--
-- Name: logs_auditoria id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria ALTER COLUMN id SET DEFAULT nextval('public.logs_auditoria_id_seq'::regclass);


--
-- Name: notificaciones id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN id SET DEFAULT nextval('public.notificaciones_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
0ec7d588-3ec3-44f1-9710-638aaa45478b	56b5fcf2e465c66c016542dfce0e869c9dd86f096cea2e4e19f79eaca17d6863	2026-09-04 06:53:55.3828-04	20260630013517_init_pmo_core	\N	\N	2026-09-04 06:53:55.342865-04	1
6b53c0d1-ef74-45c9-ae02-80c8b4ec9af3	f1fe5ed4ba75c711c78a139a4ccf7338c078549e8586386fa7522f6b831d071f	2026-09-04 06:53:55.402848-04	20260630225824_schema_optimizado_pmo	\N	\N	2026-09-04 06:53:55.38363-04	1
450d5d9d-29f3-4c41-a64d-1a0e83b2e5f7	49440f9258bc7f0ea90ed3d554c54c369f96355e08d2410af09977310f2e8a75	2026-09-04 06:53:55.509221-04	20260807012743_add_metrics_to_proyecto	\N	\N	2026-09-04 06:53:55.403825-04	1
6aba42b1-5681-441f-a037-2ccfcdd1b89d	d0ecac65943bfad2e180624b95bf30eba5325b068e6259839286edfeb5575b8c	2026-09-04 06:53:55.549182-04	20260807014428_init_map_pmo_complete	\N	\N	2026-09-04 06:53:55.510075-04	1
5ee0704c-e80c-4c7b-b582-ce9b43c0c82e	8eb691c667ca0987799e72c9326244a4292d1bb9c880d03ec34e690c8cd5d95a	\N	20260904105358_add_notificacion	A migration failed to apply. New migrations cannot be applied before the error is recovered from. Read more about how to resolve migration issues in a production database: https://pris.ly/d/migrate-resolve\n\nMigration name: 20260904105358_add_notificacion\n\nDatabase error code: 42883\n\nDatabase error:\nERROR: function uuid_generate_v4() does not exist\nHINT: No function matches the given name and argument types. You might need to add explicit type casts.\n\nDbError { severity: "ERROR", parsed_severity: Some(Error), code: SqlState(E42883), message: "function uuid_generate_v4() does not exist", detail: None, hint: Some("No function matches the given name and argument types. You might need to add explicit type casts."), position: None, where_: None, schema: None, table: None, column: None, datatype: None, constraint: None, file: Some("parse_func.c"), line: Some(636), routine: Some("ParseFuncOrColumn") }\n\n   0: sql_schema_connector::apply_migration::apply_script\n           with migration_name="20260904105358_add_notificacion"\n             at schema-engine/connectors/sql-schema-connector/src/apply_migration.rs:106\n   1: schema_core::commands::apply_migrations::Applying migration\n           with migration_name="20260904105358_add_notificacion"\n             at schema-engine/core/src/commands/apply_migrations.rs:91\n   2: schema_core::state::ApplyMigrations\n             at schema-engine/core/src/state.rs:201	\N	2026-09-04 06:53:58.28447-04	0
e792880f-abf7-409e-b1df-75cd60ab045a	56b5fcf2e465c66c016542dfce0e869c9dd86f096cea2e4e19f79eaca17d6863	2026-08-06 21:27:40.658156-04	20260630013517_init_pmo_core	\N	\N	2026-08-06 21:27:40.598154-04	1
aa4ef86d-d695-4359-96d3-bd778e059c5d	f1fe5ed4ba75c711c78a139a4ccf7338c078549e8586386fa7522f6b831d071f	2026-08-06 21:27:40.692443-04	20260630225824_schema_optimizado_pmo	\N	\N	2026-08-06 21:27:40.660462-04	1
a1f808b3-70c2-4253-af2b-e773f365424e	49440f9258bc7f0ea90ed3d554c54c369f96355e08d2410af09977310f2e8a75	2026-08-06 21:27:44.041648-04	20260807012743_add_metrics_to_proyecto	\N	\N	2026-08-06 21:27:43.942704-04	1
9769c60d-a611-497c-8191-067f53695c50	d0ecac65943bfad2e180624b95bf30eba5325b068e6259839286edfeb5575b8c	2026-08-06 21:44:28.665995-04	20260807014428_init_map_pmo_complete	\N	\N	2026-08-06 21:44:28.563239-04	1
\.


--
-- Data for Name: asignacion_recursos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.asignacion_recursos (id, usuario_id, porcentaje_asignacion, fecha_desde, fecha_hasta, created_at, rol, proyecto_id) FROM stdin;
\.


--
-- Data for Name: bitacora_seguimiento; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.bitacora_seguimiento (id, proyecto_id, fecha_seguimiento, detalle_seguimiento, proximo_seguimiento, temas_pendientes, responsable_pendientes, creado_por) FROM stdin;
1	e94b167d-07b2-418f-82a0-d7f7203e4dca	2026-09-05	Kickoff de proyecto	Seguimiento1	Presupuestos	Claudia	2
\.


--
-- Data for Name: comites; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.comites (id, titulo, tipo, fecha_hora, id_proyecto, descripcion, creado_en) FROM stdin;
\.


--
-- Data for Name: historial_kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.historial_kpis (id, kpi_id, valor_registrado, fecha_registro, usuario_id) FROM stdin;
\.


--
-- Data for Name: kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.kpis (id, nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, created_at, updated_at, frecuencia, proyecto_id) FROM stdin;
40	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	23.00	%	2026-09-05 11:43:16.307-04	2026-09-08 21:41:11.775-04	Mensual	d0053893-5bd7-416c-b272-88b1d8920a3c
39	Índice de Satisfacción (CSAT)	Grado / Nivel de satisfacción de clientes impactados por la iniciativa	100.00	45.00	%	2026-09-05 11:43:16.307-04	2026-09-08 22:04:37.071-04	Mensual	d0053893-5bd7-416c-b272-88b1d8920a3c
41	CPI		95.00	90.00	%	2026-09-08 23:25:11.772-04	2026-09-08 23:25:11.772-04	Mensual	d108f2dc-7507-4ba4-b985-c8adf9902987
42	OtroKPI	Prueba kpi	97.00	98.00	%	2026-09-08 23:40:02.16-04	2026-09-08 23:40:02.16-04	Mensual	d108f2dc-7507-4ba4-b985-c8adf9902987
43	Indice COP	Calculo de satisfaccion sponsor	97.00	65.00	%	2026-09-11 07:00:42.509-04	2026-09-11 07:00:42.509-04	Mensual	cba4697b-b423-4100-88f2-a91b175247a0
\.


--
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.logs_auditoria (id, id_usuario_accion, campo_modificado, valor_anterior, valor_nuevo, fecha_transaccion, id_proyecto) FROM stdin;
21	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 15:24:01.813	\N
22	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 15:25:55.842	\N
23	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 15:32:50.072	\N
24	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 15:34:28.53	\N
25	2	estado	Caso_de_Negocio	En_Proceso	2026-09-05 15:36:43.912	e94b167d-07b2-418f-82a0-d7f7203e4dca
26	2	nuevo_seguimiento_bitacora	Sin registro previo	Seguimiento añadido: Kickoff de proyecto	2026-09-05 15:38:13.146	e94b167d-07b2-418f-82a0-d7f7203e4dca
27	2	project_manager	Sin Asignar	PM1	2026-09-05 15:39:54.419	e94b167d-07b2-418f-82a0-d7f7203e4dca
28	2	costo_real	0	11000	2026-09-05 15:39:54.421	e94b167d-07b2-418f-82a0-d7f7203e4dca
29	2	estado	En_Proceso	Aprobado	2026-09-05 15:39:54.422	e94b167d-07b2-418f-82a0-d7f7203e4dca
30	2	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 5.25/10 (B:3, C:7, R:3, A:8)	2026-09-05 15:39:59.986	e94b167d-07b2-418f-82a0-d7f7203e4dca
31	2	creacion_proyecto	Nueva iniciativa	Creación de iniciativa: Desarrollo de un protptipo innovador (MAP-6248)	2026-09-05 15:43:16.355	d0053893-5bd7-416c-b272-88b1d8920a3c
32	2	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 8.45/10 (B:8, C:8, R:9, A:9)	2026-09-05 15:45:46.097	d0053893-5bd7-416c-b272-88b1d8920a3c
33	2	project_manager	Sin Asignar	PM9	2026-09-05 15:45:57.105	d0053893-5bd7-416c-b272-88b1d8920a3c
34	2	costo_real	0	5000	2026-09-05 15:45:57.109	d0053893-5bd7-416c-b272-88b1d8920a3c
35	2	costo_real	5000	55000	2026-09-05 15:46:26.736	d0053893-5bd7-416c-b272-88b1d8920a3c
36	2	costo_real	55000	5000	2026-09-05 15:46:46.311	d0053893-5bd7-416c-b272-88b1d8920a3c
37	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 16:12:23.541	\N
38	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-05 16:21:10.202	\N
39	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 01:27:29.09	\N
40	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 01:31:01.994	\N
41	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 01:39:52.129	\N
42	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 01:40:20.537	\N
43	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 3.4/10 (B:3, C:1, R:5, A:5)	2026-09-09 01:41:46.178	c0085472-3639-4bcf-aacc-84b53e643acc
44	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 4.5/10 (B:6, C:7, R:1, A:3)	2026-09-09 01:42:00.451	cba4697b-b423-4100-88f2-a91b175247a0
45	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 4.5/10 (B:2, C:5, R:7, A:5)	2026-09-09 01:42:14.149	d0053893-5bd7-416c-b272-88b1d8920a3c
46	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 4.4/10 (B:5, C:2, R:2, A:8)	2026-09-09 01:42:21.911	d108f2dc-7507-4ba4-b985-c8adf9902987
47	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 5.85/10 (B:7, C:5, R:5, A:6)	2026-09-09 01:42:44.724	46e4f7b1-0f6e-4fa0-9260-df35e3222bbf
48	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 6.85/10 (B:8, C:5, R:6, A:8)	2026-09-09 01:42:59.802	0b90b575-6dd2-4bfe-9d16-6f8e6d463f38
49	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 3.95/10 (B:2, C:3, R:8, A:4)	2026-09-09 01:43:10.141	abf4726a-8d2c-4a68-9715-fba6cdaff81c
50	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 4.6/10 (B:5, C:4, R:8, A:2)	2026-09-09 01:43:34.964	35cd7652-b570-4df4-bb5a-1f7150201579
51	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 3.6/10 (B:1, C:7, R:4, A:3)	2026-09-09 01:43:44.523	6ad4312a-766a-4622-a46b-778ef6143067
52	5	calificacion_multicriterio	Evaluación previa: 5	Puntaje: 5.5/10 (B:4, C:6, R:9, A:4)	2026-09-09 01:43:55.48	000aab11-b98f-498c-969c-cf3b8499f0b8
53	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 01:45:52.928	\N
54	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 02:05:35.995	\N
55	2	porcentaje_avance	0	100	2026-09-09 02:06:09.112	cba4697b-b423-4100-88f2-a91b175247a0
56	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 02:29:15.815	\N
57	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 02:30:55.513	\N
58	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 02:45:32.26	\N
59	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 02:58:42.042	\N
60	2	crear_kpi	No existía	KPI creado: CPI (Meta: 95 %)	2026-09-09 03:25:11.8	d108f2dc-7507-4ba4-b985-c8adf9902987
61	2	crear_kpi	No existía	KPI creado: OtroKPI (Meta: 97 %)	2026-09-09 03:40:02.174	d108f2dc-7507-4ba4-b985-c8adf9902987
62	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-09 11:05:56.599	\N
63	2	departamento	Inteligencia de Negocios	Desarrollo de Software	2026-09-09 11:07:04.835	e94b167d-07b2-418f-82a0-d7f7203e4dca
64	2	porcentaje_avance	58	60	2026-09-09 11:07:04.842	e94b167d-07b2-418f-82a0-d7f7203e4dca
65	2	calificacion_multicriterio	Evaluación previa: 5.25	Puntaje: 8.25/10 (B:9, C:7, R:9, A:8)	2026-09-09 11:07:28.742	e94b167d-07b2-418f-82a0-d7f7203e4dca
66	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-09-11 10:58:41.132	\N
67	2	crear_kpi	No existía	KPI creado: Indice COP (Meta: 97 %)	2026-09-11 11:00:42.645	cba4697b-b423-4100-88f2-a91b175247a0
\.


--
-- Data for Name: notificaciones; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.notificaciones (id, id_usuario, titulo, mensaje, leida, tipo, creado_en) FROM stdin;
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.proyectos (nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, costo_real, departamento, lider_proyecto, porcentaje_avance, actualizado_en, alineacion, beneficio, codigo, costo, creado_en, project_manager, puntaje_global, riesgo, id, estado) FROM stdin;
Despliegue de Data Warehouse y BI	Centralización de bases de datos operacionales y construcción de tableros ejecutivos en PowerBI para la alta gerencia.	2026-06-01	2026-11-15	33000.00	11000.00	Desarrollo de Software	Fredy Muñoz	60	2026-09-09 07:07:28.731652-04	8	9	PMO-2026-009	7	2026-09-05 11:32:24.744-04	PM1	8.25	9	e94b167d-07b2-418f-82a0-d7f7203e4dca	Aprobado
Desarrollo de un protptipo innovador	Proponer y elaborar un prototipo de un producto innovador.	2026-09-05	2027-03-31	50000.00	5000.00	RD	Por Asignar	0	2026-09-08 21:42:14.136121-04	5	2	MAP-6248	5	2026-09-05 11:43:16.307-04	PM4	4.50	7	d0053893-5bd7-416c-b272-88b1d8920a3c	Caso_de_Negocio
Modernización del ERP Financiero	Actualización y reestructuración del módulo contable y financiero para cumplir con normativas fiscales vigentes.	2026-02-01	2026-11-30	62000.00	50000.00	Finanzas	Fredy Muñoz	0	2026-09-08 21:42:21.903226-04	8	5	PMO-2026-003	2	2026-09-05 11:32:24.73-04	PM4	4.40	2	d108f2dc-7507-4ba4-b985-c8adf9902987	En_Proceso
Implementación de IA en Atención al Cliente	Desarrollo e integración de un chatbot inteligente basado en LLMs para soporte técnico automatizado 24/7.	2026-03-01	2026-09-15	28500.00	5000.00	Innovación y Desarrollo	Equipo PMO	0	2026-09-08 21:41:46.146104-04	5	3	PMO-2026-002	1	2026-09-05 11:32:24.727-04	PM3	3.40	5	c0085472-3639-4bcf-aacc-84b53e643acc	Caso_de_Negocio
Rediseño de Arquitectura de Microservicios	Desacoplamiento del monolito heredado actual hacia contenedores Docker y orquestación con Kubernetes.	2026-05-01	2026-12-15	54000.00	30000.00	Desarrollo de Software	Fredy Muñoz	0	2026-09-08 21:42:44.715994-04	6	7	PMO-2026-007	5	2026-09-05 11:32:24.739-04	PM2	5.85	5	46e4f7b1-0f6e-4fa0-9260-df35e3222bbf	Caso_de_Negocio
Automatización de Procesos Operativos (RPA)	Implementación de robots de software para automatizar la conciliación bancaria y la facturación electrónica.	2026-04-01	2026-10-15	21000.00	12000.00	Operaciones	Equipo PMO	0	2026-09-08 21:42:59.789159-04	8	8	PMO-2026-006	5	2026-09-05 11:32:24.736-04	PM1	6.85	6	0b90b575-6dd2-4bfe-9d16-6f8e6d463f38	En_Pausa
Transformación Digital de Canales de Ventas	Rediseño completo de la plataforma de e-commerce y pasarelas de pago para optimizar la experiencia de usuario.	2026-03-10	2026-08-30	39000.00	31000.00	Comercial y Ventas	Fredy Muñoz	0	2026-09-08 21:43:10.133692-04	4	2	PMO-2026-005	3	2026-09-05 11:32:24.734-04	PM2	3.95	8	abf4726a-8d2c-4a68-9715-fba6cdaff81c	En_Proceso
Migración de Infraestructura Cloud	Migración total de servidores locales físicos hacia la infraestructura en la nube de AWS con alta disponibilidad.	2026-01-15	2026-06-30	45000.00	23000.00	Infraestructura y Redes	Fredy Muñoz	0	2026-09-08 21:43:34.954615-04	2	5	PMO-2026-001	4	2026-09-05 11:32:24.701-04	PM2	4.60	8	35cd7652-b570-4df4-bb5a-1f7150201579	En_Proceso
Programa de Capacitación Ágil (Scrum/Kanban)	Ciclo de formación, talleres prácticos y certificación interna para alinear a los equipos de desarrollo bajo marcos ágiles.	2026-01-10	2026-02-20	12000.00	6000.00	Gestión de Talento y PMO	Equipo PMO	0	2026-09-08 21:43:44.510192-04	3	1	PMO-2026-010	7	2026-09-05 11:32:24.746-04	PM3	3.60	4	6ad4312a-766a-4622-a46b-778ef6143067	Completado
Auditoría y Hardening de Ciberseguridad	Evaluación exhaustiva de vulnerabilidades, pruebas de penetración (pentesting) y aplicación de parches de seguridad.	2026-01-05	2026-02-28	15000.00	7000.00	Seguridad de la Información	Equipo PMO	0	2026-09-08 21:43:55.469463-04	4	4	PMO-2026-004	6	2026-09-05 11:32:24.732-04	PM1	5.50	9	000aab11-b98f-498c-969c-cf3b8499f0b8	Completado
Portal de Autoservicio para Clientes	Creación de un panel web interactivo para que los clientes consulten contratos, facturas y estado de solicitudes.	2026-02-15	2026-07-15	19500.00	12300.00	Atención al Cliente	Equipo PMO	100	2026-09-08 22:06:09.086254-04	3	6	PMO-2026-008	7	2026-09-05 11:32:24.742-04	PM3	4.50	1	cba4697b-b423-4100-88f2-a91b175247a0	En_Proceso
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.roles (id, nombre_rol) FROM stdin;
1	Administrador
2	Líder de Proyecto
3	Analista PMO
4	Sponsor
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.usuarios (id, nombre, contrasena, correo, fecha_creacion, id_rol) FROM stdin;
3	Carlos Mendoza	$2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2	carlos.mendoza@map-pmo.com	2026-08-12 02:07:04.138	3
2	Administrador MAP-PMO	$2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2	admin@map-pmo.com	2026-08-07 08:38:01.989364	1
4	Ana María Gómez	$2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2	ana.gomez@map-pmo.com	2026-08-12 02:07:04.144	3
5	Roberto Silva	$2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2	roberto.silva@map-pmo.com	2026-08-12 02:07:04.146	4
24	Alexander Munoz	$2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2	alex2026@pmo.com	2026-08-12 02:18:18.82	2
\.


--
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.asignacion_recursos_id_seq', 1, false);


--
-- Name: bitacora_seguimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.bitacora_seguimiento_id_seq', 1, true);


--
-- Name: comites_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.comites_id_seq', 1, false);


--
-- Name: historial_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.historial_kpis_id_seq', 1, false);


--
-- Name: kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.kpis_id_seq', 43, true);


--
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 67, true);


--
-- Name: notificaciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.notificaciones_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 24, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: asignacion_recursos asignacion_recursos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_pkey PRIMARY KEY (id);


--
-- Name: bitacora_seguimiento bitacora_seguimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.bitacora_seguimiento
    ADD CONSTRAINT bitacora_seguimiento_pkey PRIMARY KEY (id);


--
-- Name: comites comites_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.comites
    ADD CONSTRAINT comites_pkey PRIMARY KEY (id);


--
-- Name: historial_kpis historial_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_pkey PRIMARY KEY (id);


--
-- Name: kpis kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_pkey PRIMARY KEY (id);


--
-- Name: logs_auditoria logs_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_pkey PRIMARY KEY (id);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);


--
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: idx_asignaciones_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_proyecto ON public.asignacion_recursos USING btree (proyecto_id);


--
-- Name: idx_asignaciones_usuario; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_usuario ON public.asignacion_recursos USING btree (usuario_id);


--
-- Name: idx_bitacora_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_bitacora_proyecto ON public.bitacora_seguimiento USING btree (proyecto_id);


--
-- Name: idx_historial_kpi; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_historial_kpi ON public.historial_kpis USING btree (kpi_id, fecha_registro);


--
-- Name: idx_kpis_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_kpis_proyecto ON public.kpis USING btree (proyecto_id);


--
-- Name: proyectos_codigo_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX proyectos_codigo_key ON public.proyectos USING btree (codigo);


--
-- Name: roles_nombre_rol_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX roles_nombre_rol_key ON public.roles USING btree (nombre_rol);


--
-- Name: usuarios_correo_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);


--
-- Name: proyectos update_proyectos_actualizado_en; Type: TRIGGER; Schema: public; Owner: xanmun66
--

CREATE TRIGGER update_proyectos_actualizado_en BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.update_actualizado_en_column();


--
-- Name: asignacion_recursos asignacion_recursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: bitacora_seguimiento bitacora_seguimiento_creado_por_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.bitacora_seguimiento
    ADD CONSTRAINT bitacora_seguimiento_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: bitacora_seguimiento bitacora_seguimiento_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.bitacora_seguimiento
    ADD CONSTRAINT bitacora_seguimiento_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: comites comites_id_proyecto_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.comites
    ADD CONSTRAINT comites_id_proyecto_fkey FOREIGN KEY (id_proyecto) REFERENCES public.proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: historial_kpis historial_kpis_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public.kpis(id) ON DELETE CASCADE;


--
-- Name: logs_auditoria logs_auditoria_id_usuario_accion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_id_usuario_accion_fkey FOREIGN KEY (id_usuario_accion) REFERENCES public.usuarios(id);


--
-- Name: notificaciones notificaciones_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: xanmun66
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict 80JVzMjiKREd7BU9UnaDQ8t132o0cgem1ILPT4mv7gJo1CmSyrHlX7tgsfeMStp

