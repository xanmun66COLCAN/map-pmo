--
-- PostgreSQL database dump
--

\restrict aHnFIa2EgNdnN580DBMUsnr0JRNv01ZXjswfQihmQo53qcwSOWtvdtR3ljvNMsv

-- Dumped from database version 18.4 (Postgres.app)
-- Dumped by pg_dump version 18.4 (Postgres.app)

-- Started on 2026-08-06 19:59:34 EDT

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
-- TOC entry 889 (class 1247 OID 18177)
-- Name: EstadoProyecto; Type: TYPE; Schema: public; Owner: xanmun66
--

CREATE TYPE public."EstadoProyecto" AS ENUM (
    'Idea',
    'Evaluacion',
    'Caso_de_Negocio',
    'Aprobado',
    'Rechazado'
);


ALTER TYPE public."EstadoProyecto" OWNER TO xanmun66;

--
-- TOC entry 874 (class 1247 OID 16478)
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
-- TOC entry 228 (class 1259 OID 16504)
-- Name: asignacion_recursos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.asignacion_recursos (
    id integer NOT NULL,
    proyecto_id integer NOT NULL,
    usuario_id integer NOT NULL,
    porcentaje_asignacion integer NOT NULL,
    fecha_desde date NOT NULL,
    fecha_hasta date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_fechas_asignacion CHECK (((fecha_hasta IS NULL) OR (fecha_hasta >= fecha_desde))),
    CONSTRAINT chk_porcentaje CHECK (((porcentaje_asignacion > 0) AND (porcentaje_asignacion <= 100)))
);


ALTER TABLE public.asignacion_recursos OWNER TO xanmun66;

--
-- TOC entry 227 (class 1259 OID 16503)
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
-- TOC entry 3817 (class 0 OID 0)
-- Dependencies: 227
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.asignacion_recursos_id_seq OWNED BY public.asignacion_recursos.id;


--
-- TOC entry 232 (class 1259 OID 16547)
-- Name: historial_kpis; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.historial_kpis (
    id integer NOT NULL,
    kpi_id integer NOT NULL,
    valor_registrado numeric(10,2) NOT NULL,
    fecha_registro timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_id integer
);


ALTER TABLE public.historial_kpis OWNER TO xanmun66;

--
-- TOC entry 231 (class 1259 OID 16546)
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
-- TOC entry 3818 (class 0 OID 0)
-- Dependencies: 231
-- Name: historial_kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.historial_kpis_id_seq OWNED BY public.historial_kpis.id;


--
-- TOC entry 230 (class 1259 OID 16524)
-- Name: kpis; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.kpis (
    id integer NOT NULL,
    proyecto_id integer NOT NULL,
    nombre_kpi character varying(100) NOT NULL,
    descripcion text,
    meta_valor numeric(10,2) NOT NULL,
    valor_actual numeric(10,2) DEFAULT 0.00,
    frecuencia public.frecuencia_medicion DEFAULT 'Mensual'::public.frecuencia_medicion,
    unidad_medida character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.kpis OWNER TO xanmun66;

--
-- TOC entry 229 (class 1259 OID 16523)
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
-- TOC entry 3819 (class 0 OID 0)
-- Dependencies: 229
-- Name: kpis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.kpis_id_seq OWNED BY public.kpis.id;


--
-- TOC entry 224 (class 1259 OID 16447)
-- Name: logs_auditoria; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.logs_auditoria (
    id integer NOT NULL,
    id_usuario_accion integer,
    campo_modificado character varying(100) NOT NULL,
    valor_anterior character varying(255),
    valor_nuevo character varying(255),
    fecha_transaccion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    id_proyecto integer
);


ALTER TABLE public.logs_auditoria OWNER TO xanmun66;

--
-- TOC entry 223 (class 1259 OID 16446)
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
-- TOC entry 3820 (class 0 OID 0)
-- Dependencies: 223
-- Name: logs_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.logs_auditoria_id_seq OWNED BY public.logs_auditoria.id;


--
-- TOC entry 226 (class 1259 OID 16486)
-- Name: proyectos; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.proyectos (
    id integer NOT NULL,
    nombre character varying(150) NOT NULL,
    descripcion text,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    presupuesto numeric(12,2) DEFAULT 0.00,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    estado public."EstadoProyecto" DEFAULT 'Idea'::public."EstadoProyecto",
    CONSTRAINT chk_fechas CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio))),
    CONSTRAINT chk_presupuesto CHECK ((presupuesto >= (0)::numeric))
);


ALTER TABLE public.proyectos OWNER TO xanmun66;

--
-- TOC entry 225 (class 1259 OID 16485)
-- Name: proyectos_id_seq; Type: SEQUENCE; Schema: public; Owner: xanmun66
--

CREATE SEQUENCE public.proyectos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.proyectos_id_seq OWNER TO xanmun66;

--
-- TOC entry 3821 (class 0 OID 0)
-- Dependencies: 225
-- Name: proyectos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.proyectos_id_seq OWNED BY public.proyectos.id;


--
-- TOC entry 220 (class 1259 OID 16392)
-- Name: roles; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    nombre_rol character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO xanmun66;

--
-- TOC entry 219 (class 1259 OID 16391)
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
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 222 (class 1259 OID 16403)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: xanmun66
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    correo character varying(100) NOT NULL,
    contrasena character varying(255) NOT NULL,
    id_rol integer,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO xanmun66;

--
-- TOC entry 221 (class 1259 OID 16402)
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
-- Dependencies: 221
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: xanmun66
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- TOC entry 3609 (class 2604 OID 16507)
-- Name: asignacion_recursos id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos ALTER COLUMN id SET DEFAULT nextval('public.asignacion_recursos_id_seq'::regclass);


--
-- TOC entry 3616 (class 2604 OID 16550)
-- Name: historial_kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis ALTER COLUMN id SET DEFAULT nextval('public.historial_kpis_id_seq'::regclass);


--
-- TOC entry 3611 (class 2604 OID 16527)
-- Name: kpis id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis ALTER COLUMN id SET DEFAULT nextval('public.kpis_id_seq'::regclass);


--
-- TOC entry 3602 (class 2604 OID 16450)
-- Name: logs_auditoria id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria ALTER COLUMN id SET DEFAULT nextval('public.logs_auditoria_id_seq'::regclass);


--
-- TOC entry 3604 (class 2604 OID 16489)
-- Name: proyectos id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos ALTER COLUMN id SET DEFAULT nextval('public.proyectos_id_seq'::regclass);


--
-- TOC entry 3599 (class 2604 OID 16395)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 3600 (class 2604 OID 16406)
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- TOC entry 3806 (class 0 OID 16504)
-- Dependencies: 228
-- Data for Name: asignacion_recursos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.asignacion_recursos (id, proyecto_id, usuario_id, porcentaje_asignacion, fecha_desde, fecha_hasta, created_at) FROM stdin;
\.


--
-- TOC entry 3810 (class 0 OID 16547)
-- Dependencies: 232
-- Data for Name: historial_kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.historial_kpis (id, kpi_id, valor_registrado, fecha_registro, usuario_id) FROM stdin;
\.


--
-- TOC entry 3808 (class 0 OID 16524)
-- Dependencies: 230
-- Data for Name: kpis; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.kpis (id, proyecto_id, nombre_kpi, descripcion, meta_valor, valor_actual, frecuencia, unidad_medida, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 3802 (class 0 OID 16447)
-- Dependencies: 224
-- Data for Name: logs_auditoria; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.logs_auditoria (id, id_usuario_accion, campo_modificado, valor_anterior, valor_nuevo, fecha_transaccion, id_proyecto) FROM stdin;
\.


--
-- TOC entry 3804 (class 0 OID 16486)
-- Dependencies: 226
-- Data for Name: proyectos; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.proyectos (id, nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, created_at, updated_at, estado) FROM stdin;
1	Migración de Infraestructura Core	Traslado de los servidores locales hacia arquitectura en la nube AWS para optimizar costos.	2026-07-14	2026-10-14	0.00	2026-07-14 22:14:53.443675-04	2026-07-14 22:14:53.443675-04	Idea
2	Implementación de Gobierno de Datos	Establecimiento de políticas, roles y estándares para asegurar la calidad de la información empresarial.	2026-07-14	2027-01-14	0.00	2026-07-14 22:14:53.443675-04	2026-07-14 22:14:53.443675-04	Idea
3	Módulo de Analítica Predictiva con IA	Desarrollo de un modelo NLP para la clasificación automática de tickets de soporte técnico.	2026-07-14	2026-11-14	0.00	2026-07-14 22:14:53.443675-04	2026-07-14 22:14:53.443675-04	Idea
4	Optimización de Pasarela de Pagos	Integración de nuevos métodos de pago y reducción del tiempo de respuesta en transacciones concurrentes.	2026-07-14	2026-09-14	0.00	2026-07-14 22:14:53.443675-04	2026-07-14 22:14:53.443675-04	Idea
5	Portal de Autogestión de Clientes	Diseño y despliegue de una plataforma web responsive para la consulta de estados de cuenta.	2026-07-14	2026-12-14	0.00	2026-07-14 22:14:53.443675-04	2026-07-14 22:14:53.443675-04	Idea
6	Sistema de Gestión de Alertas MAP	Módulo para enviar notificaciones en tiempo real sobre retrasos en las iniciativas.	2026-07-16	2026-07-16	0.00	2026-07-15 20:51:21.38-04	2026-07-15 20:51:21.38-04	Idea
7	Sistema de Priorización y Gobernanza MAP PMO	Herramienta interna para la radicación, análisis de viabilidad, arquitectura y priorización de iniciativas de software alineadas al valor de negocio.	2026-07-01	\N	25000.00	2026-07-15 21:18:08.230668-04	2026-07-15 21:18:08.230668-04	Caso_de_Negocio
8	Migración de Base de Datos Core a PostgreSQL	Estudio de viabilidad técnica e infraestructura para unificar los motores de datos relacionales del portafolio en una sola instancia centralizada.	2026-08-15	\N	12000.00	2026-07-15 21:18:08.230668-04	2026-07-15 21:18:08.230668-04	Evaluacion
9	Módulo de Analítica Predictiva para KPIs	Propuesta preliminar de IA para predecir desviaciones en las metas de los entregables antes de que impacten el presupuesto del negocio.	2026-09-01	\N	45000.00	2026-07-15 21:18:08.230668-04	2026-07-15 21:18:08.230668-04	Idea
10	Integración Segura de Autenticación con JWT	Estandarización del middleware de seguridad "verificarToken" para todas las APIs del ecosistema MAP, asegurando el control de acceso basado en roles.	2026-06-10	\N	8000.00	2026-07-15 21:18:08.230668-04	2026-07-15 21:18:08.230668-04	Aprobado
\.


--
-- TOC entry 3798 (class 0 OID 16392)
-- Dependencies: 220
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.roles (id, nombre_rol) FROM stdin;
1	Analista de Innovación
2	Gerente de PMO
3	Comité Evaluador
\.


--
-- TOC entry 3800 (class 0 OID 16403)
-- Dependencies: 222
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: xanmun66
--

COPY public.usuarios (id, nombre, correo, contrasena, id_rol, fecha_creacion) FROM stdin;
2	Director PMO	gerente@pmo.com	$2b$10$TBMa4/0nD1bpfZx0ogPv.uFZO/n30Z4K1Bg7RrRiBsc0Z0tACgxdK	3	2026-06-07 20:05:26.430137
3	Alexander Administrador	alexander@pmo.com	$2b$10$IJvoTg7Bwy3rNrH/CA4po.IiT/WbMPJdP1BXFmxStZ03LsNUFQJGm	1	2026-06-17 20:38:21.717134
1	Alexander Solano	alex@pmo.com	$2b$10$wE7YgM4snWb6Z7h8j9k1uO7mY2e4r5t6y7u8i9o0p1a2s3d4f5g6h	1	2026-05-24 21:16:47.87713
4	Alexander Muñoz	alex2026@pmo.com	$2b$10$fmrPHab3WzqLU2Qr27b4A.i/Kn6nThgQ5lf4teGA/ffr0CeXO3gsy	1	2026-06-17 20:48:11.503586
11	Alexander Admin	admin@pmo.com	$2b$10$X729Z7xGQXv.tP0YwWwOnuS5bZf9N7d3mYqQ1M2w3e4r5t6y7u8i9	1	2026-06-17 21:11:12.837868
12	Carlos Líder	lider@pmo.com	$2b$10$X729Z7xGQXv.tP0YwWwOnuS5bZf9N7d3mYqQ1M2w3e4r5t6y7u8i9	2	2026-06-17 21:11:12.837868
13	Lorena Gerencia	gerente2@pmo.com	$2b$10$X729Z7xGQXv.tP0YwWwOnuS5bZf9N7d3mYqQ1M2w3e4r5t6y7u8i9	2	2026-06-17 21:11:12.837868
14	Diana Consultor	consultor@pmo.com	$2b$10$X729Z7xGQXv.tP0YwWwOnuS5bZf9N7d3mYqQ1M2w3e4r5t6y7u8i9	3	2026-06-17 21:11:12.837868
16	Diana Comité	diana@pmo.com	$2b$10$umhBX5j/Y.KtRfIuCcs89e2jAUsqPl4WVgtFZ4RmQhVPfxAEX2h9G	3	2026-06-17 21:16:45.84464
15	Lorena PMO	lorena@pmo.com	$2b$10$OeFrau1cDva.wJ6b1o0u8uxQRtvJ6xJNQLimvk73p22IEHSfleDle	2	2026-06-17 21:16:36.983846
\.


--
-- TOC entry 3824 (class 0 OID 0)
-- Dependencies: 227
-- Name: asignacion_recursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.asignacion_recursos_id_seq', 1, false);


--
-- TOC entry 3825 (class 0 OID 0)
-- Dependencies: 231
-- Name: historial_kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.historial_kpis_id_seq', 1, false);


--
-- TOC entry 3826 (class 0 OID 0)
-- Dependencies: 229
-- Name: kpis_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.kpis_id_seq', 1, false);


--
-- TOC entry 3827 (class 0 OID 0)
-- Dependencies: 223
-- Name: logs_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.logs_auditoria_id_seq', 1, false);


--
-- TOC entry 3828 (class 0 OID 0)
-- Dependencies: 225
-- Name: proyectos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.proyectos_id_seq', 10, true);


--
-- TOC entry 3829 (class 0 OID 0)
-- Dependencies: 219
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.roles_id_seq', 3, true);


--
-- TOC entry 3830 (class 0 OID 0)
-- Dependencies: 221
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: xanmun66
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 16, true);


--
-- TOC entry 3635 (class 2606 OID 16517)
-- Name: asignacion_recursos asignacion_recursos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3642 (class 2606 OID 16556)
-- Name: historial_kpis historial_kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3640 (class 2606 OID 16540)
-- Name: kpis kpis_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_pkey PRIMARY KEY (id);


--
-- TOC entry 3631 (class 2606 OID 16457)
-- Name: logs_auditoria logs_auditoria_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3633 (class 2606 OID 16502)
-- Name: proyectos proyectos_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.proyectos
    ADD CONSTRAINT proyectos_pkey PRIMARY KEY (id);


--
-- TOC entry 3623 (class 2606 OID 16401)
-- Name: roles roles_nombre_rol_key; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_nombre_rol_key UNIQUE (nombre_rol);


--
-- TOC entry 3625 (class 2606 OID 16399)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- TOC entry 3627 (class 2606 OID 16415)
-- Name: usuarios usuarios_correo_key; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_correo_key UNIQUE (correo);


--
-- TOC entry 3629 (class 2606 OID 16413)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3636 (class 1259 OID 16563)
-- Name: idx_asignaciones_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_proyecto ON public.asignacion_recursos USING btree (proyecto_id);


--
-- TOC entry 3637 (class 1259 OID 16564)
-- Name: idx_asignaciones_usuario; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_asignaciones_usuario ON public.asignacion_recursos USING btree (usuario_id);


--
-- TOC entry 3643 (class 1259 OID 16565)
-- Name: idx_historial_kpi; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_historial_kpi ON public.historial_kpis USING btree (kpi_id, fecha_registro);


--
-- TOC entry 3638 (class 1259 OID 16562)
-- Name: idx_kpis_proyecto; Type: INDEX; Schema: public; Owner: xanmun66
--

CREATE INDEX idx_kpis_proyecto ON public.kpis USING btree (proyecto_id);


--
-- TOC entry 3646 (class 2606 OID 16518)
-- Name: asignacion_recursos asignacion_recursos_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 3647 (class 2606 OID 18171)
-- Name: asignacion_recursos asignacion_recursos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.asignacion_recursos
    ADD CONSTRAINT asignacion_recursos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- TOC entry 3649 (class 2606 OID 16557)
-- Name: historial_kpis historial_kpis_kpi_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.historial_kpis
    ADD CONSTRAINT historial_kpis_kpi_id_fkey FOREIGN KEY (kpi_id) REFERENCES public.kpis(id) ON DELETE CASCADE;


--
-- TOC entry 3648 (class 2606 OID 16541)
-- Name: kpis kpis_proyecto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.kpis
    ADD CONSTRAINT kpis_proyecto_id_fkey FOREIGN KEY (proyecto_id) REFERENCES public.proyectos(id) ON DELETE CASCADE;


--
-- TOC entry 3645 (class 2606 OID 16463)
-- Name: logs_auditoria logs_auditoria_id_usuario_accion_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.logs_auditoria
    ADD CONSTRAINT logs_auditoria_id_usuario_accion_fkey FOREIGN KEY (id_usuario_accion) REFERENCES public.usuarios(id);


--
-- TOC entry 3644 (class 2606 OID 16416)
-- Name: usuarios usuarios_id_rol_fkey; Type: FK CONSTRAINT; Schema: public; Owner: xanmun66
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_id_rol_fkey FOREIGN KEY (id_rol) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- TOC entry 3816 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO xanmun66;


-- Completed on 2026-08-06 19:59:35 EDT

--
-- PostgreSQL database dump complete
--

\unrestrict aHnFIa2EgNdnN580DBMUsnr0JRNv01ZXjswfQihmQo53qcwSOWtvdtR3ljvNMsv

