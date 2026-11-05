--
-- PostgreSQL database dump
--

\restrict alrnu4PLMhh61IluPnS1rTDrLoXc5IqZKBcZod9vUkubu5ROQq0hV8D06Iaf8B7

-- Dumped from database version 18.4 (Postgres.app)
-- Dumped by pg_dump version 18.4 (Postgres.app)

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
    id_proyecto text,
    id_usuario_accion integer,
    campo_modificado character varying(100) NOT NULL,
    valor_anterior character varying(255),
    valor_nuevo character varying(255),
    fecha_transaccion timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
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
e792880f-abf7-409e-b1df-75cd60ab045a    56b5fcf2e465c66c016542dfce0e869c9dd86f096cea2e4e19f79eaca17d6863    2026-08-06 21:27:40.658156-04   20260630013517_init_pmo_core    \N  \N  2026-08-06 21:27:40.598154-04   1
aa4ef86d-d695-4359-96d3-bd778e059c5d    f1fe5ed4ba75c711c78a139a4ccf7338c078549e8586386fa7522f6b831d071f    2026-08-06 21:27:40.692443-04   20260630225824_schema_optimizado_pmo    \N  \N  2026-08-06 21:27:40.660462-04   1
a1f808b3-70c2-4253-af2b-e773f365424e    49440f9258bc7f0ea90ed3d554c54c369f96355e08d2410af09977310f2e8a75    2026-08-06 21:27:44.041648-04   20260807012743_add_metrics_to_proyecto  \N  \N  2026-08-06 21:27:43.942704-04   1
9769c60d-a611-497c-8191-067f53695c50    d0ecac65943bfad2e180624b95bf30eba5325b068e6259839286edfeb5575b8c    2026-08-06 21:44:28.665995-04   20260807014428_init_map_pmo_complete    \N  \N  2026-08-06 21:44:28.563239-04   1
\.


--
-- Data for Name: asignacion_recursos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.asignacion_recursos (id, proyecto_id, usuario_id, porcentaje_asignacion, fecha_desde, fecha_hasta, created_at, rol) FROM stdin;
\.


--
-- Data for Name: historial_kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.historial_kpis (id, kpi_id, valor_registrado, fecha_registro, usuario_id) FROM stdin;
\.


--
-- Data for Name: kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.kpis (id, proyecto_id, nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, created_at, updated_at, frecuencia) FROM stdin;
\.


--
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.logs_auditoria (id, id_proyecto, id_usuario_accion, campo_modificado, valor_anterior, valor_nuevo, fecha_transaccion) FROM stdin;
\.


--
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.proyectos (id, nombre, descripcion, fecha_inicio, fecha_fin, estado, presupuesto, created_at, updated_at, costo_real, departamento, lider_proyecto, porcentaje_avance) FROM stdin;
643154f9-da5b-4870-814a-63ee9520e6f5    Modernización Infraestructura Cloud Migración de servidores legacy a arquitectura serverless en AWS.    2026-01-15 00:00:00 2026-11-30 00:00:00 Aprobado    120000.00   2026-08-06 21:44:43.288-04  2026-08-06 21:44:43.288-04  \N  \N  \N  0
249ed57c-9748-4e1e-82e1-293affdfa524    Implementación Módulo CRM   Automatización del pipeline de ventas e integración con correo. 2026-03-01 00:00:00 2026-09-15 00:00:00 Caso_de_Negocio 45000.00    2026-08-06 21:44:43.32-04   2026-08-06 21:44:43.32-04   \N  \N  \N  0
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.roles (id, nombre_rol) FROM stdin;
1   Administrador
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.usuarios (id, nombre, contrasena, correo, fecha_creacion, id_rol) FROM stdin;
2   Administrador MAP-PMO   $2b$10$3Gflogw95ni6jkDs4WCjpeZKYqHVuAMPH1wohb93rEVgM7yiEF7k2    admin@map-pmo.com   2026-08-07 08:38:01.989364  1
\.


--
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.asignacion_recursos_id_seq', 1, false);


--
-- Name: historial_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.historial_kpis_id_seq', 1, false);


--
-- Name: kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.kpis_id_seq', 1, false);


--
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 2, true);


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
-- Name: idx_historial_kpi; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_historial_kpi ON public.historial_kpis USING btree (kpi_id, fecha_registro);


--
-- Name: idx_kpis_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_kpis_proyecto ON public.kpis USING btree (proyecto_id);


--
-- Name: roles_nombre_rol_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX roles_nombre_rol_key ON public.roles USING btree (nombre_rol);


--
-- Name: usuarios_correo_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);


--
-- Name: asignacion_recursos asignacion_recursos_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: asignacion_recursos asignacion_recursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: historial_kpis historial_kpis_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public.kpis(id) ON DELETE CASCADE;


--
-- Name: kpis kpis_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- Name: logs_auditoria logs_auditoria_id_usuario_accion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_id_usuario_accion_fkey FOREIGN KEY (id_usuario_accion) REFERENCES public.usuarios(id);


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

\unrestrict alrnu4PLMhh61IluPnS1rTDrLoXc5IqZKBcZod9vUkubu5ROQq0hV8D06Iaf8B7