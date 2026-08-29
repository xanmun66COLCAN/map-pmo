--
-- PostgreSQL database dump
--

\restrict Vfcng7fjU1bruBcPFgK6nL2ZCOTXDsBcvdmBcOWgKDgB81vXZJoEdqA3mG6mXQA

-- Dumped from database version 18.6 (Postgres.app)
-- Dumped by pg_dump version 18.6 (Postgres.app)

-- Started on 2026-08-28 21:13:35 EDT

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
-- TOC entry 6 (class 2615 OID 18335)
-- Name: public; Type: SCHEMA; Schema: -; Owner: xanmun66
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO xanmun66;

--
-- TOC entry 3849 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: xanmun66
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 2 (class 3079 OID 21061)
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- TOC entry 3851 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- TOC entry 903 (class 1247 OID 21073)
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
-- TOC entry 894 (class 1247 OID 18788)
-- Name: frecuencia_medicion; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public.frecuencia_medicion AS ENUM (
    'Semanal',
    'Mensual',
    'Trimestral'
);


ALTER TYPE public.frecuencia_medicion OWNER TO xanmun66;

--
-- TOC entry 246 (class 1255 OID 21116)
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
-- TOC entry 220 (class 1259 OID 18336)
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
-- TOC entry 222 (class 1259 OID 18401)
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
-- TOC entry 221 (class 1259 OID 18400)
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
-- TOC entry 3852 (class 0 OID 0)
-- Dependencies: 221
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.asignacion_recursos_id_seq OWNED BY public.asignacion_recursos.id;


--
-- TOC entry 235 (class 1259 OID 21119)
-- Name: auditoria; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.auditoria (
    id integer NOT NULL,
    id_usuario integer,
    accion character varying(100) NOT NULL,
    detalles text,
    fecha_transaccion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.auditoria OWNER TO xanmun66;

--
-- TOC entry 234 (class 1259 OID 21118)
-- Name: auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.auditoria_id_seq OWNER TO xanmun66;

--
-- TOC entry 3853 (class 0 OID 0)
-- Dependencies: 234
-- Name: auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.auditoria_id_seq OWNED BY public.auditoria.id;


--
-- TOC entry 226 (class 1259 OID 18436)
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
-- TOC entry 225 (class 1259 OID 18435)
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
-- TOC entry 3854 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.historial_kpis_id_seq OWNED BY public.historial_kpis.id;


--
-- TOC entry 224 (class 1259 OID 18415)
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
-- TOC entry 223 (class 1259 OID 18414)
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
-- TOC entry 3855 (class 0 OID 0)
-- Dependencies: 223
-- Name: kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.kpis_id_seq OWNED BY public.kpis.id;


--
-- TOC entry 230 (class 1259 OID 18847)
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
-- TOC entry 229 (class 1259 OID 18846)
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
-- TOC entry 3856 (class 0 OID 0)
-- Dependencies: 229
-- Name: logs_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.logs_auditoria_id_seq OWNED BY public.logs_auditoria.id;


--
-- TOC entry 233 (class 1259 OID 21085)
-- Name: proyectos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.proyectos (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    codigo character varying(20) NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    estado public.estado_proyecto_enum DEFAULT 'Caso_de_Negocio'::public.estado_proyecto_enum NOT NULL,
    departamento character varying(100) NOT NULL,
    lider_proyecto character varying(100) NOT NULL,
    presupuesto numeric(12,2) DEFAULT 0.00 NOT NULL,
    costo_real numeric(12,2) DEFAULT 0.00 NOT NULL,
    porcentaje_avance integer DEFAULT 0 NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    creado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    actualizado_en timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas CHECK ((fecha_fin >= fecha_inicio)),
    CONSTRAINT proyectos_costo_real_check CHECK ((costo_real >= (0)::numeric)),
    CONSTRAINT proyectos_porcentaje_avance_check CHECK (((porcentaje_avance >= 0) AND (porcentaje_avance <= 100))),
    CONSTRAINT proyectos_presupuesto_check CHECK ((presupuesto >= (0)::numeric))
);


ALTER TABLE public.proyectos OWNER TO xanmun66;

--
-- TOC entry 232 (class 1259 OID 18859)
-- Name: roles; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO xanmun66;

--
-- TOC entry 231 (class 1259 OID 18858)
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
-- TOC entry 3857 (class 0 OID 0)
-- Dependencies: 231
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 228 (class 1259 OID 18469)
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
-- TOC entry 227 (class 1259 OID 18468)
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
-- TOC entry 3858 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 3621 (class 2604 OID 18404)
-- Name: asignacion_recursos id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos ALTER COLUMN id SET DEFAULT nextval('public.asignacion_recursos_id_seq'::regclass);


--
-- TOC entry 3643 (class 2604 OID 21122)
-- Name: auditoria id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.auditoria ALTER COLUMN id SET DEFAULT nextval('public.auditoria_id_seq'::regclass);


--
-- TOC entry 3629 (class 2604 OID 18439)
-- Name: historial_kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis ALTER COLUMN id SET DEFAULT nextval('public.historial_kpis_id_seq'::regclass);


--
-- TOC entry 3624 (class 2604 OID 18418)
-- Name: kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis ALTER COLUMN id SET DEFAULT nextval('public.kpis_id_seq'::regclass);


--
-- TOC entry 3633 (class 2604 OID 18850)
-- Name: logs_auditoria id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria ALTER COLUMN id SET DEFAULT nextval('public.logs_auditoria_id_seq'::regclass);


--
-- TOC entry 3635 (class 2604 OID 18862)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3631 (class 2604 OID 18472)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3828 (class 0 OID 18336)
-- Dependencies: 220
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
e792880f-abf7-409e-b1df-75cd60ab045a	56b5fcf2e465c66c016542dfce0e869c9dd86f096cea2e4e19f79eaca17d6863	2026-08-06 21:27:40.658156-04	20260630013517_init_pmo_core	\N	\N	2026-08-06 21:27:40.598154-04	1
aa4ef86d-d695-4359-96d3-bd778e059c5d	f1fe5ed4ba75c711c78a139a4ccf7338c078549e8586386fa7522f6b831d071f	2026-08-06 21:27:40.692443-04	20260630225824_schema_optimizado_pmo	\N	\N	2026-08-06 21:27:40.660462-04	1
a1f808b3-70c2-4253-af2b-e773f365424e	49440f9258bc7f0ea90ed3d554c54c369f96355e08d2410af09977310f2e8a75	2026-08-06 21:27:44.041648-04	20260807012743_add_metrics_to_proyecto	\N	\N	2026-08-06 21:27:43.942704-04	1
9769c60d-a611-497c-8191-067f53695c50	d0ecac65943bfad2e180624b95bf30eba5325b068e6259839286edfeb5575b8c	2026-08-06 21:44:28.665995-04	20260807014428_init_map_pmo_complete	\N	\N	2026-08-06 21:44:28.563239-04	1
\.


--
-- TOC entry 3830 (class 0 OID 18401)
-- Dependencies: 222
-- Data for Name: asignacion_recursos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.asignacion_recursos (id, proyecto_id, usuario_id, porcentaje_asignacion, fecha_desde, fecha_hasta, created_at, rol) FROM stdin;
\.


--
-- TOC entry 3843 (class 0 OID 21119)
-- Dependencies: 235
-- Data for Name: auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.auditoria (id, id_usuario, accion, detalles, fecha_transaccion) FROM stdin;
1	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 20:31:06.719193
2	2	CAMBIO_ROL	Se modificó el rol del usuario carlos.mendoza@map-pmo.com al rol ID 2 (Líder de Proyecto).	2026-08-25 20:31:19.401725
3	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 20:45:40.797136
4	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 20:46:54.578723
5	5	LOGIN_EXITOSO	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 20:54:43.362825
6	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 20:55:46.597317
7	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 21:40:00.774516
8	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 21:45:21.731925
9	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-25 22:00:12.195244
10	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-26 06:58:09.386982
11	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-27 06:36:06.882095
12	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-27 06:58:58.587805
13	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-27 20:46:46.253738
14	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-27 21:24:48.334485
15	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-27 21:40:06.9297
16	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 19:23:02.422834
17	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 20:06:43.837382
18	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 20:22:36.552864
19	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 20:32:31.845018
20	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 20:34:59.405135
21	2	LOGIN_EXITOSO	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-28 20:48:35.306526
\.


--
-- TOC entry 3834 (class 0 OID 18436)
-- Dependencies: 226
-- Data for Name: historial_kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.historial_kpis (id, kpi_id, valor_registrado, fecha_registro, usuario_id) FROM stdin;
\.


--
-- TOC entry 3832 (class 0 OID 18415)
-- Dependencies: 224
-- Data for Name: kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.kpis (id, proyecto_id, nombre_kpi, descripcion, meta_valor, valor_actual, unidad_medida, created_at, updated_at, frecuencia) FROM stdin;
1	45de0a0d-ebbf-4c69-b0de-3d0835a2b6ef	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
2	91fe8b49-14a7-4138-93b0-fcdcefe7c4fb	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
3	b07febd0-572a-46f4-a88d-3f152a703c5e	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
4	054f4cf7-d464-4173-9e93-c61f8c0618d1	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
5	62c6f680-0027-47c3-8cd7-fe88e0fc3251	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
6	36ab0d59-03be-4d18-a4ec-6366a5fdd852	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
8	126ed089-7419-460b-821c-06254722b75b	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
9	38078b43-8d66-4965-a561-8a55e0771b24	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
10	bb50a8ba-b69d-415b-986d-71505c27ad9f	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
11	6c81e86c-ee39-4e90-9086-a8482810b876	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
12	54e52317-2c89-46a7-9312-1a536e74c513	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
13	bf3b2477-0911-4c4d-99a3-fc5ef5935223	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
14	6739101b-a6ef-493f-aefe-ab2099a26c0a	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
15	2d164869-a3cb-4166-8f56-e7865504875a	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
16	ba2c936e-4b61-4b92-9058-67a0f3992b5c	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
17	ca6a2271-e5f4-4dcf-a010-675299b5173d	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
18	751ce108-4863-4fa7-bc7b-908eecf0e78b	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
19	45de0a0d-ebbf-4c69-b0de-3d0835a2b6ef	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
20	91fe8b49-14a7-4138-93b0-fcdcefe7c4fb	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
21	b07febd0-572a-46f4-a88d-3f152a703c5e	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
22	054f4cf7-d464-4173-9e93-c61f8c0618d1	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
23	62c6f680-0027-47c3-8cd7-fe88e0fc3251	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
24	36ab0d59-03be-4d18-a4ec-6366a5fdd852	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
26	126ed089-7419-460b-821c-06254722b75b	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
27	38078b43-8d66-4965-a561-8a55e0771b24	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
28	bb50a8ba-b69d-415b-986d-71505c27ad9f	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
29	6c81e86c-ee39-4e90-9086-a8482810b876	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
30	54e52317-2c89-46a7-9312-1a536e74c513	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
31	bf3b2477-0911-4c4d-99a3-fc5ef5935223	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
32	6739101b-a6ef-493f-aefe-ab2099a26c0a	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
33	2d164869-a3cb-4166-8f56-e7865504875a	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
34	ba2c936e-4b61-4b92-9058-67a0f3992b5c	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
35	ca6a2271-e5f4-4dcf-a010-675299b5173d	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
36	751ce108-4863-4fa7-bc7b-908eecf0e78b	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
37	054f4cf7-d464-4173-9e93-c61f8c0618d1	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	0.00	%	2026-08-25 21:47:37.505046-04	2026-08-25 21:47:37.505046-04	Mensual
38	054f4cf7-d464-4173-9e93-c61f8c0618d1	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	0.00	%	2026-08-25 21:47:37.505046-04	2026-08-25 21:47:37.505046-04	Mensual
25	a28da88a-45ee-46ce-9191-356d2b555404	Cumplimiento de Entregables	Porcentaje de productos o fases completadas según el cronograma.	100.00	50.00	%	2026-08-25 21:44:37.127643-04	2026-08-25 21:44:37.127643-04	Mensual
7	a28da88a-45ee-46ce-9191-356d2b555404	Ejecución de Presupuesto	Control del presupuesto asignado frente al ejecutado en la iniciativa.	100.00	30.00	%	2026-08-25 21:43:57.320045-04	2026-08-25 21:43:57.320045-04	Mensual
\.


--
-- TOC entry 3838 (class 0 OID 18847)
-- Dependencies: 230
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.logs_auditoria (id, id_proyecto, id_usuario_accion, campo_modificado, valor_anterior, valor_nuevo, fecha_transaccion) FROM stdin;
1	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	En_Pausa	En_Proceso	2026-08-28 01:03:55.008
2	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	En_Proceso	Aprobado	2026-08-28 01:04:42.429
3	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	Aprobado	En_Proceso	2026-08-28 01:05:03.527
4	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	En_Proceso	En_Pausa	2026-08-28 01:14:36.908
5	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	En_Pausa	En_Proceso	2026-08-28 01:25:05.983
6	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	En_Proceso	En_Pausa	2026-08-28 01:30:14.734
7	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	Aprobado	Caso_de_Negocio	2026-08-28 01:59:47.3
8	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Caso_de_Negocio	Aprobado	2026-08-28 02:00:20.365
9	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Aprobado	Caso_de_Negocio	2026-08-28 23:24:16.849
10	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Caso_de_Negocio	Caso_de_Negocio	2026-08-28 23:43:28.047
11	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Caso_de_Negocio	Aprobado	2026-08-28 23:46:30.008
12	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Aprobado	Caso_de_Negocio	2026-08-28 23:49:46.357
13	a28da88a-45ee-46ce-9191-356d2b555404	2	estado	Caso_de_Negocio	Aprobado	2026-08-28 23:58:59.982
14	\N	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-29 00:51:32.29
15	\N	2	CAMBIO_ROL	Sistema	Se modificó el rol del usuario carlos.mendoza@map-pmo.com al rol ID 3 (Analista PMO).	2026-08-29 00:52:43.8
16	054f4cf7-d464-4173-9e93-c61f8c0618d1	2	estado	Caso_de_Negocio	Aprobado	2026-08-29 00:57:43.391
17	\N	24	LOGIN_EXITOSO	Sistema	El usuario alex2026@pmo.com inició sesión exitosamente en el sistema.	2026-08-29 00:57:58.351
18	\N	5	LOGIN_EXITOSO	Sistema	El usuario roberto.silva@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-29 00:58:05.261
19	\N	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-29 00:58:10.65
20	\N	2	LOGIN_EXITOSO	Sistema	El usuario admin@map-pmo.com inició sesión exitosamente en el sistema.	2026-08-29 01:01:46.649
\.


--
-- TOC entry 3841 (class 0 OID 21085)
-- Dependencies: 233
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.proyectos (id, codigo, nombre, descripcion, estado, departamento, lider_proyecto, presupuesto, costo_real, porcentaje_avance, fecha_inicio, fecha_fin, creado_en, actualizado_en) FROM stdin;
91fe8b49-14a7-4138-93b0-fcdcefe7c4fb	PRJ-001	Migración a Infraestructura Cloud	Migración de servidores locales a AWS con Docker y Kubernetes.	En_Proceso	Tecnología	Carlos Mendoza	120000.00	45000.00	40	2026-01-15	2026-11-30	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
6c81e86c-ee39-4e90-9086-a8482810b876	PRJ-002	Implementación Módulo CRM	Desarrollo e integración de módulo CRM para gestión de clientes.	Caso_de_Negocio	Ventas	Ana María Torres	45000.00	0.00	0	2026-03-01	2026-09-15	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
ca6a2271-e5f4-4dcf-a010-675299b5173d	PRJ-003	Rediseño Portal Transaccional	Actualización de interfaz React y optimización del frontend.	En_Proceso	Diseño & UX	Laura Restrepo	35000.00	18000.00	55	2026-02-10	2026-07-20	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
36ab0d59-03be-4d18-a4ec-6366a5fdd852	PRJ-004	Auditoría de Ciberseguridad ISO 27001	Evaluación de vulnerabilidades y cumplimiento normativo en infraestructura.	Aprobado	Seguridad	Felipe Gómez	28000.00	2000.00	10	2026-05-01	2026-08-31	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
2d164869-a3cb-4166-8f56-e7865504875a	PRJ-005	Automatización de Facturación Electrónica	Integración API con proveedor tributario y motor de pagos.	Completado	Finanzas	Sonia Morales	50000.00	48500.00	100	2025-09-01	2026-01-30	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
751ce108-4863-4fa7-bc7b-908eecf0e78b	PRJ-006	Sistema de Gestión Documental (SGD)	Plataforma web para control de versiones y firmas digitales.	En_Proceso	Operaciones	Javier Ortiz	62000.00	31000.00	50	2026-01-05	2026-10-15	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
45de0a0d-ebbf-4c69-b0de-3d0835a2b6ef	PRJ-007	Plataforma de Business Intelligence	Construcción de ETLs en PostgreSQL y dashboards en Metabase.	En_Proceso	Analítica	Fredy Muñoz	80000.00	52000.00	65	2026-02-01	2026-09-30	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
54e52317-2c89-46a7-9312-1a536e74c513	PRJ-008	App Móvil de Gestión de Viáticos	Desarrollo en React Native con módulo de captura de recibos.	En_Pausa	Tecnología	Diego Salazar	30000.00	12000.00	30	2025-11-15	2026-06-30	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
62c6f680-0027-47c3-8cd7-fe88e0fc3251	PRJ-010	Capacitación en Metodologías Ágiles	Programa de formación Scrum y Kanban para la PMO.	Completado	Recursos Humanos	Beatriz Silva	15000.00	14200.00	100	2026-01-10	2026-03-31	2026-08-11 20:50:41.224688-04	2026-08-11 20:50:41.224688-04
bb50a8ba-b69d-415b-986d-71505c27ad9f	MAP-3489	Automatización de PQRS	Soporte usuario final	Caso_de_Negocio	TI	Por Asignar	5000.00	0.00	0	2026-03-15	2027-03-15	2026-08-11 21:57:13.584-04	2026-08-11 21:57:13.584-04
bf3b2477-0911-4c4d-99a3-fc5ef5935223	MAP-2026-001	Migración Infraestructura On-Premise a AWS Cloud	Migración de servidores legacy y bases de datos relacionales a la nube de AWS para mejorar alta disponibilidad.	En_Proceso	Tecnología	Carlos Mendoza	45000000.00	18500000.00	42	2026-01-15	2026-11-30	2026-08-12 19:44:01.183-04	2026-08-12 19:44:01.183-04
b07febd0-572a-46f4-a88d-3f152a703c5e	MAP-2026-002	Implementación Sistema CRM de Ventas	Adopción e integración de plataforma CRM para automatizar la gestión de prospectos y fuerza de ventas.	Aprobado	Comercial	Alexander Munoz	28000000.00	2500000.00	10	2026-05-01	2026-12-15	2026-08-12 19:44:01.364-04	2026-08-12 19:44:01.364-04
ba2c936e-4b61-4b92-9058-67a0f3992b5c	MAP-2026-004	Certificación ISO 27001 Seguridad de la Información	Auditoría interna, adecuación de políticas e implementación de controles SGSI para la certificación corporativa.	En_Proceso	Riesgo y Cumplimiento	Roberto Silva	32000000.00	21000000.00	65	2026-02-01	2026-10-15	2026-08-12 19:44:01.369-04	2026-08-12 19:44:01.369-04
6739101b-a6ef-493f-aefe-ab2099a26c0a	MAP-2026-005	Renovación Portafolio Web & App Móvil	Rediseño de la experiencia del usuario (UI/UX) e integración de nueva pasarela de pagos en la App.	Completado	Marketing y Digital	Alexander Munoz	22000000.00	21800000.00	100	2025-10-01	2026-04-30	2026-08-12 19:44:01.371-04	2026-08-12 19:44:01.371-04
38078b43-8d66-4965-a561-8a55e0771b24	MAP-2026-006	Actualización Core Financiero y ERP	Upgrade de versión del ERP central para soportar nuevas regulaciones tributarias y facturación electrónica.	En_Pausa	Finanzas	Carlos Mendoza	60000000.00	15000000.00	25	2026-03-01	2027-01-15	2026-08-12 19:44:01.376-04	2026-08-12 19:44:01.376-04
126ed089-7419-460b-821c-06254722b75b	PRJ-009	Actualización de ERP Corporativo	Migración de versión base de datos y parches de seguridad.	En_Proceso	TI	Elena Ruiz	95000.00	5000.00	5	2026-06-01	2026-12-15	2026-08-11 20:50:41.224688-04	2026-08-16 11:25:00.248218-04
a28da88a-45ee-46ce-9191-356d2b555404	MAP-2026-003	Automatización de Procesos Operativos (RPA)	Implementación de bots RPA para optimizar la conciliación de facturas y reportes contables mensuales.	Completado	Operaciones	Ana María Gómez	15010000.00	450000.00	34	2026-09-01	2027-02-28	2026-08-12 19:44:01.367-04	2026-08-28 20:53:17.120888-04
054f4cf7-d464-4173-9e93-c61f8c0618d1	MAP-0195	Pruebas funcionales de SW MAP-PMO	Pruebas proyecto SENA	Aprobado	TI	Alexander Munoz	2000.00	0.00	0	2026-07-24	2027-07-24	2026-08-16 11:26:50.243-04	2026-08-28 20:57:43.372944-04
\.


--
-- TOC entry 3840 (class 0 OID 18859)
-- Dependencies: 232
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.roles (id, nombre_rol) FROM stdin;
1	Administrador
2	Líder de Proyecto
3	Analista PMO
4	Sponsor
\.


--
-- TOC entry 3836 (class 0 OID 18469)
-- Dependencies: 228
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
-- TOC entry 3859 (class 0 OID 0)
-- Dependencies: 221
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.asignacion_recursos_id_seq', 1, false);


--
-- TOC entry 3860 (class 0 OID 0)
-- Dependencies: 234
-- Name: auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.auditoria_id_seq', 21, true);


--
-- TOC entry 3861 (class 0 OID 0)
-- Dependencies: 225
-- Name: historial_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.historial_kpis_id_seq', 1, false);


--
-- TOC entry 3862 (class 0 OID 0)
-- Dependencies: 223
-- Name: kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.kpis_id_seq', 38, true);


--
-- TOC entry 3863 (class 0 OID 0)
-- Dependencies: 229
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 20, true);


--
-- TOC entry 3864 (class 0 OID 0)
-- Dependencies: 231
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.roles_id_seq', 4, true);


--
-- TOC entry 3865 (class 0 OID 0)
-- Dependencies: 227
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 24, true);


--
-- TOC entry 3650 (class 2606 OID 18349)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3652 (class 2606 OID 18413)
-- Name: asignacion_recursos asignacion_recursos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3674 (class 2606 OID 21129)
-- Name: auditoria auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3659 (class 2606 OID 18446)
-- Name: historial_kpis historial_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3657 (class 2606 OID 18434)
-- Name: kpis kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3665 (class 2606 OID 18857)
-- Name: logs_auditoria logs_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3670 (class 2606 OID 21115)
-- Name: proyectos proyectos_codigo_key; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_codigo_key UNIQUE (codigo);


--
-- TOC entry 3672 (class 2606 OID 21113)
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- TOC entry 3668 (class 2606 OID 18866)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3663 (class 2606 OID 18483)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3653 (class 1259 OID 21009)
-- Name: idx_asignaciones_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_proyecto ON public.asignacion_recursos USING btree (proyecto_id);


--
-- TOC entry 3654 (class 1259 OID 18869)
-- Name: idx_asignaciones_usuario; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_usuario ON public.asignacion_recursos USING btree (usuario_id);


--
-- TOC entry 3660 (class 1259 OID 18870)
-- Name: idx_historial_kpi; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_historial_kpi ON public.historial_kpis USING btree (kpi_id, fecha_registro);


--
-- TOC entry 3655 (class 1259 OID 21022)
-- Name: idx_kpis_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_kpis_proyecto ON public.kpis USING btree (proyecto_id);


--
-- TOC entry 3666 (class 1259 OID 18867)
-- Name: roles_nombre_rol_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX roles_nombre_rol_key ON public.roles USING btree (nombre_rol);


--
-- TOC entry 3661 (class 1259 OID 18872)
-- Name: usuarios_correo_key; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE UNIQUE INDEX usuarios_correo_key ON public.usuarios USING btree (correo);


--
-- TOC entry 3680 (class 2620 OID 21117)
-- Name: proyectos update_proyectos_actualizado_en; Type: TRIGGER; Schema: public; Owner: xanmun66
--

CREATE TRIGGER update_proyectos_actualizado_en BEFORE UPDATE ON public.proyectos FOR EACH ROW EXECUTE FUNCTION public.update_actualizado_en_column();


--
-- TOC entry 3675 (class 2606 OID 18883)
-- Name: asignacion_recursos asignacion_recursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 3679 (class 2606 OID 21130)
-- Name: auditoria auditoria_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.auditoria
    ADD CONSTRAINT auditoria_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- TOC entry 3676 (class 2606 OID 18893)
-- Name: historial_kpis historial_kpis_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public.kpis(id) ON DELETE CASCADE;


--
-- TOC entry 3678 (class 2606 OID 18898)
-- Name: logs_auditoria logs_auditoria_id_usuario_accion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_id_usuario_accion_fkey FOREIGN KEY (id_usuario_accion) REFERENCES public.usuarios(id);


--
-- TOC entry 3677 (class 2606 OID 18873)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- TOC entry 3850 (class 0 OID 0)
-- Dependencies: 6
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: xanmun66
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-08-28 21:13:36 EDT

--
-- PostgreSQL database dump complete
--

\unrestrict Vfcng7fjU1bruBcPFgK6nL2ZCOTXDsBcvdmBcOWgKDgB81vXZJoEdqA3mG6mXQA

