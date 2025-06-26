-- Drop tables and sequences if exists
DROP TABLE IF EXISTS discount_products, discounts, point_transactions, print_logs, printers, product_categories, products, promotion_items, promotion_rewards, promotions, sale_items, sale_promotions, sales, settings, stock_movements, users, customers CASCADE;
DROP SEQUENCE IF EXISTS customers_id_seq, discount_products_id_seq, discounts_id_seq, point_transactions_id_seq, print_logs_id_seq, printers_id_seq, product_categories_id_seq, products_id_seq, promotion_items_id_seq, promotion_rewards_id_seq, promotions_id_seq, sale_items_id_seq, sale_promotions_id_seq, sales_id_seq, stock_movements_id_seq, users_id_seq CASCADE;

--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

-- Started on 2025-06-27 01:59:02

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 224 (class 1259 OID 59792)
-- Name: customers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.customers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    phone character varying(20),
    email character varying(100),
    point integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.customers OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 59791)
-- Name: customers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.customers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.customers_id_seq OWNER TO postgres;

--
-- TOC entry 5066 (class 0 OID 0)
-- Dependencies: 223
-- Name: customers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.customers_id_seq OWNED BY public.customers.id;


--
-- TOC entry 228 (class 1259 OID 59811)
-- Name: discount_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discount_products (
    id integer NOT NULL,
    discount_id integer,
    product_id integer,
    category_id integer
);


ALTER TABLE public.discount_products OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 59810)
-- Name: discount_products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discount_products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discount_products_id_seq OWNER TO postgres;

--
-- TOC entry 5067 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discount_products_id_seq OWNED BY public.discount_products.id;


--
-- TOC entry 226 (class 1259 OID 59801)
-- Name: discounts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.discounts (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    discount_type character varying(20) NOT NULL,
    amount numeric(10,2) NOT NULL,
    detail character varying(255),
    start_date date,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.discounts OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 59800)
-- Name: discounts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.discounts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.discounts_id_seq OWNER TO postgres;

--
-- TOC entry 5068 (class 0 OID 0)
-- Dependencies: 225
-- Name: discounts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.discounts_id_seq OWNED BY public.discounts.id;


--
-- TOC entry 249 (class 1259 OID 59998)
-- Name: point_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.point_transactions (
    id integer NOT NULL,
    customer_id integer,
    type character varying(16) NOT NULL,
    points integer NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.point_transactions OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 59997)
-- Name: point_transactions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.point_transactions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.point_transactions_id_seq OWNER TO postgres;

--
-- TOC entry 5069 (class 0 OID 0)
-- Dependencies: 248
-- Name: point_transactions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.point_transactions_id_seq OWNED BY public.point_transactions.id;


--
-- TOC entry 236 (class 1259 OID 59903)
-- Name: print_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.print_logs (
    id integer NOT NULL,
    sale_id integer,
    print_type character varying(20) NOT NULL,
    printer_name character varying(100),
    user_id integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.print_logs OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 59902)
-- Name: print_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.print_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.print_logs_id_seq OWNER TO postgres;

--
-- TOC entry 5070 (class 0 OID 0)
-- Dependencies: 235
-- Name: print_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.print_logs_id_seq OWNED BY public.print_logs.id;


--
-- TOC entry 238 (class 1259 OID 59921)
-- Name: printers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.printers (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    connection character varying(50),
    is_active boolean DEFAULT true
);


ALTER TABLE public.printers OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 59920)
-- Name: printers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.printers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.printers_id_seq OWNER TO postgres;

--
-- TOC entry 5071 (class 0 OID 0)
-- Dependencies: 237
-- Name: printers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.printers_id_seq OWNED BY public.printers.id;


--
-- TOC entry 218 (class 1259 OID 59746)
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 59745)
-- Name: product_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_categories_id_seq OWNER TO postgres;

--
-- TOC entry 5072 (class 0 OID 0)
-- Dependencies: 217
-- Name: product_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_categories_id_seq OWNED BY public.product_categories.id;


--
-- TOC entry 220 (class 1259 OID 59756)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    barcode character varying(100),
    name character varying(255) NOT NULL,
    category_id integer,
    unit character varying(50),
    cost_price numeric(10,2) DEFAULT 0.00,
    sell_price numeric(10,2) DEFAULT 0.00,
    stock_qty integer DEFAULT 0,
    image_url character varying(255),
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 59755)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO postgres;

--
-- TOC entry 5073 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 243 (class 1259 OID 59945)
-- Name: promotion_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_items (
    id integer NOT NULL,
    promotion_id integer,
    product_id integer,
    quantity integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.promotion_items OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 59944)
-- Name: promotion_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_items_id_seq OWNER TO postgres;

--
-- TOC entry 5074 (class 0 OID 0)
-- Dependencies: 242
-- Name: promotion_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_items_id_seq OWNED BY public.promotion_items.id;


--
-- TOC entry 245 (class 1259 OID 59963)
-- Name: promotion_rewards; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotion_rewards (
    id integer NOT NULL,
    promotion_id integer,
    reward_type character varying(20) NOT NULL,
    amount numeric(10,2),
    product_id integer,
    quantity integer
);


ALTER TABLE public.promotion_rewards OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 59962)
-- Name: promotion_rewards_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotion_rewards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotion_rewards_id_seq OWNER TO postgres;

--
-- TOC entry 5075 (class 0 OID 0)
-- Dependencies: 244
-- Name: promotion_rewards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotion_rewards_id_seq OWNED BY public.promotion_rewards.id;


--
-- TOC entry 241 (class 1259 OID 59936)
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    detail character varying(255),
    start_date date,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 59935)
-- Name: promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.promotions_id_seq OWNER TO postgres;

--
-- TOC entry 5076 (class 0 OID 0)
-- Dependencies: 240
-- Name: promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotions_id_seq OWNED BY public.promotions.id;


--
-- TOC entry 232 (class 1259 OID 59861)
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    id integer NOT NULL,
    sale_id integer,
    product_id integer,
    quantity integer NOT NULL,
    unit_price numeric(10,2) NOT NULL,
    cost_price numeric(10,2) DEFAULT 0,
    discount_id integer,
    discount_amount numeric(10,2) DEFAULT 0,
    discount_name character varying(100),
    total_price numeric(10,2) NOT NULL,
    remark character varying(255)
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 59860)
-- Name: sale_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_items_id_seq OWNER TO postgres;

--
-- TOC entry 5077 (class 0 OID 0)
-- Dependencies: 231
-- Name: sale_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_items_id_seq OWNED BY public.sale_items.id;


--
-- TOC entry 247 (class 1259 OID 59980)
-- Name: sale_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_promotions (
    id integer NOT NULL,
    sale_id integer,
    promotion_id integer,
    promotion_name character varying(100),
    amount numeric(10,2)
);


ALTER TABLE public.sale_promotions OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 59979)
-- Name: sale_promotions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_promotions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sale_promotions_id_seq OWNER TO postgres;

--
-- TOC entry 5078 (class 0 OID 0)
-- Dependencies: 246
-- Name: sale_promotions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_promotions_id_seq OWNED BY public.sale_promotions.id;


--
-- TOC entry 230 (class 1259 OID 59833)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    receipt_no character varying(30) NOT NULL,
    sale_datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id integer,
    customer_id integer,
    total_amount numeric(10,2) NOT NULL,
    payment_method character varying(30) NOT NULL,
    received_amount numeric(10,2),
    change_amount numeric(10,2),
    remark character varying(255),
    status character varying(30) DEFAULT 'normal'::character varying,
    discount_id integer,
    discount_amount numeric(10,2) DEFAULT 0,
    discount_name character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    redeem_point integer DEFAULT 0,
    redeem_discount numeric(10,2) DEFAULT 0
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 59832)
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- TOC entry 5079 (class 0 OID 0)
-- Dependencies: 229
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- TOC entry 239 (class 1259 OID 59928)
-- Name: settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.settings (
    key character varying(100) NOT NULL,
    value text
);


ALTER TABLE public.settings OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 59885)
-- Name: stock_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock_movements (
    id integer NOT NULL,
    product_id integer,
    change_type character varying(30) NOT NULL,
    quantity integer NOT NULL,
    user_id integer,
    ref_id integer,
    note character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.stock_movements OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 59884)
-- Name: stock_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.stock_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.stock_movements_id_seq OWNER TO postgres;

--
-- TOC entry 5080 (class 0 OID 0)
-- Dependencies: 233
-- Name: stock_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.stock_movements_id_seq OWNED BY public.stock_movements.id;


--
-- TOC entry 222 (class 1259 OID 59778)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    role character varying(50) DEFAULT 'staff'::character varying,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 59777)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5081 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4789 (class 2604 OID 59795)
-- Name: customers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers ALTER COLUMN id SET DEFAULT nextval('public.customers_id_seq'::regclass);


--
-- TOC entry 4796 (class 2604 OID 59814)
-- Name: discount_products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_products ALTER COLUMN id SET DEFAULT nextval('public.discount_products_id_seq'::regclass);


--
-- TOC entry 4792 (class 2604 OID 59804)
-- Name: discounts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts ALTER COLUMN id SET DEFAULT nextval('public.discounts_id_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 60001)
-- Name: point_transactions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transactions ALTER COLUMN id SET DEFAULT nextval('public.point_transactions_id_seq'::regclass);


--
-- TOC entry 4809 (class 2604 OID 59906)
-- Name: print_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.print_logs ALTER COLUMN id SET DEFAULT nextval('public.print_logs_id_seq'::regclass);


--
-- TOC entry 4811 (class 2604 OID 59924)
-- Name: printers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printers ALTER COLUMN id SET DEFAULT nextval('public.printers_id_seq'::regclass);


--
-- TOC entry 4774 (class 2604 OID 59749)
-- Name: product_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN id SET DEFAULT nextval('public.product_categories_id_seq'::regclass);


--
-- TOC entry 4778 (class 2604 OID 59759)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 4816 (class 2604 OID 59948)
-- Name: promotion_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_items ALTER COLUMN id SET DEFAULT nextval('public.promotion_items_id_seq'::regclass);


--
-- TOC entry 4818 (class 2604 OID 59966)
-- Name: promotion_rewards id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rewards ALTER COLUMN id SET DEFAULT nextval('public.promotion_rewards_id_seq'::regclass);


--
-- TOC entry 4813 (class 2604 OID 59939)
-- Name: promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions ALTER COLUMN id SET DEFAULT nextval('public.promotions_id_seq'::regclass);


--
-- TOC entry 4804 (class 2604 OID 59864)
-- Name: sale_items id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items ALTER COLUMN id SET DEFAULT nextval('public.sale_items_id_seq'::regclass);


--
-- TOC entry 4819 (class 2604 OID 59983)
-- Name: sale_promotions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_promotions ALTER COLUMN id SET DEFAULT nextval('public.sale_promotions_id_seq'::regclass);


--
-- TOC entry 4797 (class 2604 OID 59836)
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- TOC entry 4807 (class 2604 OID 59888)
-- Name: stock_movements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements ALTER COLUMN id SET DEFAULT nextval('public.stock_movements_id_seq'::regclass);


--
-- TOC entry 4785 (class 2604 OID 59781)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5035 (class 0 OID 59792)
-- Dependencies: 224
-- Data for Name: customers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.customers (id, name, phone, email, point, created_at) FROM stdin;
2	ฟ้าใส ใจดี	0987654321		0	2025-06-25 22:27:34.650547
1	คมเข้ม คำเกษ	0621914252		65	2025-06-24 20:45:09.082851
\.


--
-- TOC entry 5039 (class 0 OID 59811)
-- Dependencies: 228
-- Data for Name: discount_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discount_products (id, discount_id, product_id, category_id) FROM stdin;
\.


--
-- TOC entry 5037 (class 0 OID 59801)
-- Dependencies: 226
-- Data for Name: discounts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.discounts (id, name, discount_type, amount, detail, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5060 (class 0 OID 59998)
-- Dependencies: 249
-- Data for Name: point_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.point_transactions (id, customer_id, type, points, description, created_at) FROM stdin;
1	1	earn	10	ได้รับจากการซื้อขาย #28	2025-06-26 22:41:26.853286
2	1	earn	25	ได้รับจากการซื้อขาย #29	2025-06-26 22:51:52.784335
3	1	earn	25	ได้รับจากการซื้อขาย #31	2025-06-26 22:57:08.453305
4	1	earn	18	ได้รับจากการซื้อขาย #32	2025-06-26 22:57:40.533604
5	1	earn	9	ได้รับจากการซื้อขาย #39	2025-06-26 23:18:25.105279
6	1	redeem	-180	ใช้พ้อยท์แลกส่วนลด #40	2025-06-26 23:28:13.726144
7	1	earn	9	ได้รับจากการซื้อขาย #40	2025-06-26 23:28:13.726144
8	1	earn	49	ได้รับจากการซื้อขาย #42	2025-06-27 01:11:52.369455
\.


--
-- TOC entry 5047 (class 0 OID 59903)
-- Dependencies: 236
-- Data for Name: print_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.print_logs (id, sale_id, print_type, printer_name, user_id, created_at) FROM stdin;
\.


--
-- TOC entry 5049 (class 0 OID 59921)
-- Dependencies: 238
-- Data for Name: printers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.printers (id, name, type, connection, is_active) FROM stdin;
1	test	usb	P1	t
\.


--
-- TOC entry 5029 (class 0 OID 59746)
-- Dependencies: 218
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (id, name, is_active, created_at, updated_at) FROM stdin;
1	ผัก	t	2025-06-24 17:41:37.944939	2025-06-24 17:41:37.944939
2	เนื้อหมู	t	2025-06-24 17:42:25.937301	2025-06-24 17:42:25.937301
3	เนื้อวัว	t	2025-06-24 17:42:36.823817	2025-06-24 17:42:36.823817
4	ข้าว	t	2025-06-24 17:42:43.176731	2025-06-24 17:42:43.176731
5	เครื่องดื่ม	t	2025-06-24 17:42:53.948331	2025-06-24 17:42:53.948331
8	ttt	f	2025-06-24 18:55:17.303106	2025-06-24 18:55:23.989246
6	ของใช้	t	2025-06-24 17:43:05.740485	2025-06-24 19:13:07.85618
\.


--
-- TOC entry 5031 (class 0 OID 59756)
-- Dependencies: 220
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, barcode, name, category_id, unit, cost_price, sell_price, stock_qty, image_url, is_active, created_at, updated_at) FROM stdin;
20	8899001122334	เครื่องปรุงรส	5	1	13.00	22.00	149	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
48	3924718265143	ซี่โครงหมู	2	1	120.00	170.00	32	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
2	4240555281141	เบค่อน	2	1	120.00	250.00	78		t	2025-06-24 19:36:02.529955	2025-06-24 19:36:02.529955
1	0364613549517	ผักสลัด	1	1	12.35	35.00	15		t	2025-06-24 18:17:35.93042	2025-06-24 19:36:31.08388
3	6680196928803	เบียร์ช้าง	5	1	50.00	60.00	15		t	2025-06-25 19:39:54.503602	2025-06-25 19:39:54.503602
4	1234567890123	หมูบด	2	1	85.00	120.00	50	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
5	2345678901234	เนื้อวัวสไลด์	3	1	150.00	210.00	30	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
6	3456789012345	ข้าวหอมมะลิ	4	1	30.00	45.00	100	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
7	4567890123456	ไข่ไก่ เบอร์ 1	1	1	70.00	95.00	200	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
8	5678901234567	เครื่องดื่มชูกำลัง	5	1	9.00	15.00	75	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
9	6789012345678	ต้มยำกุ้งสำเร็จรูป	6	1	40.00	65.00	40	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
10	7890123456789	เนื้อไก่สไลด์	3	1	65.00	98.00	60	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
11	8901234567890	ปลากระป๋อง	1	1	18.00	28.00	120	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
12	9012345678901	ซอสหอยนางรม	1	1	23.00	37.00	55	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
13	1122334455667	กระเทียมสด	1	1	35.00	55.00	80	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
14	2233445566778	หมูสามชั้น	2	1	105.00	155.00	40	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
15	3344556677889	ซอสพริก	1	1	18.00	29.00	90	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
16	4455667788990	เนื้อปลา	3	1	110.00	160.00	35	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
17	5566778899001	ปลาหมึกแช่แข็ง	3	1	120.00	175.00	25	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
18	6677889900112	ซอสถั่วเหลือง	1	1	22.00	36.00	70	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
19	7788990011223	ข้าวเหนียว	4	1	28.00	39.00	95	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
21	9900112233445	ไข่เป็ด	1	1	78.00	108.00	60	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
22	1002003004005	โจ๊กสำเร็จรูป	6	1	18.00	25.00	140	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
23	2003004005006	น้ำปลา	1	1	15.00	26.00	100	\N	t	2025-06-27 00:58:33.24556	2025-06-27 00:58:33.24556
24	1357924681023	หมูแดดเดียว	2	1	98.00	140.00	30	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
25	2468135790246	หมูยอ	2	1	55.00	80.00	47	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
26	3579246813069	หมูหวาน	2	1	120.00	185.00	22	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
27	4681357924082	เนื้อโคขุน	3	1	220.00	295.00	18	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
28	5792468135025	ไก่บ้าน	3	1	78.00	120.00	33	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
29	6803579246048	ปลาช่อนแช่แข็ง	3	1	130.00	198.00	16	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
30	7914681357081	ข้าวกล้องหอม	4	1	34.00	49.00	66	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
31	8025792468104	ข้าวโพดเม็ด	1	1	22.00	34.00	48	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
32	9136803579127	ผักคะน้า	1	1	15.00	22.00	93	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
33	1247914681140	ผักบุ้งไทย	1	1	13.00	19.00	81	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
34	2358025792163	น้ำพริกปลาร้า	1	1	29.00	47.00	57	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
35	3469136803186	น้ำจิ้มซีฟู้ด	1	1	20.00	35.00	51	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
36	4571247914209	ฟักทอง	1	1	16.00	27.00	68	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
37	5682358025232	ข้าวเหนียวดำ	4	1	39.00	54.00	56	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
38	6793469136255	ซุปกุ้ง	6	1	22.00	36.00	43	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
39	7804571247288	ปลากราย	3	1	115.00	168.00	19	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
40	8915682358311	ซอสพริกเผ็ด	1	1	18.00	31.00	73	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
41	9026793469334	ซุปผักรวม	6	1	24.00	38.00	35	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
42	10378045714057	น้ำเต้าหู้	5	1	12.00	22.00	120	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
43	1148915682470	เครื่องดื่มรังนก	5	1	58.00	95.00	24	\N	t	2025-06-27 01:00:57.584111	2025-06-27 01:00:57.584111
44	5913847261928	หมูเด้ง	2	1	85.00	130.00	50	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
45	7824519362741	หมูกรอบ	2	1	140.00	195.00	25	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
46	6135829471623	เนื้อไก่บด	3	1	60.00	95.00	70	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
47	4519278364851	ตับหมู	2	1	55.00	89.00	40	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
49	2641857938245	เนื้อเป็ด	3	1	105.00	155.00	27	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
50	3845296173842	ข้าวไรซ์เบอร์รี่	4	1	44.00	62.00	60	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
51	9162738451923	ไข่นกกระทา	1	1	48.00	75.00	80	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
52	5138472956182	น้ำแข็งยูนิต	1	1	7.00	15.00	120	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
53	7182946371524	ซอสกระเทียม	1	1	21.00	33.00	50	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
54	8125479326148	น้ำจิ้มไก่	1	1	18.00	29.00	75	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
55	4261938571425	เนื้อหมูบด	2	1	92.00	138.00	41	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
56	3529168472314	หน่อไม้ฝรั่ง	1	1	30.00	48.00	39	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
57	2748391658241	เครื่องแกงเผ็ด	6	1	16.00	27.00	66	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
58	7819265431827	น้ำจิ้มสุกี้	1	1	19.00	30.00	59	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
59	1839426158274	ข้าวสวยสำเร็จรูป	6	1	13.00	22.00	150	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
60	9182736458192	เครื่องดื่มน้ำอัดลม	5	1	12.00	20.00	200	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
61	6542837194621	ข้าวโพดต้ม	1	1	19.00	31.00	100	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
62	7812635942186	ซุปข้น	6	1	23.00	36.00	44	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
66	5492364812756	น่องไก่	3	1	50.00	78.00	70	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
67	6524731894263	อกไก่	3	1	60.00	95.00	80	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
68	7932154873264	ข้าวกล้อง	4	1	32.00	46.00	85	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
69	8241563248753	ไข่เค็ม	1	1	35.00	52.00	45	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
70	9375241863542	น้ำตาลทราย	1	1	22.00	32.00	100	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
71	1487265938476	ซอสปรุงรส	1	1	17.00	29.00	55	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
73	3647291538462	น้ำพริกเผา	1	1	19.00	34.00	65	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
74	4872591346795	ผักกาดขาว	1	1	18.00	29.00	70	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
75	5291378462953	ข้าวโพดหวาน	1	1	15.00	23.00	100	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
76	6384729513851	น้ำมันพืช	1	1	32.00	48.00	80	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
78	8941375264831	เครื่องดื่มเกลือแร่	5	1	13.00	22.00	110	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
79	9138457261934	เต้าหู้ไข่	1	1	10.00	18.00	60	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
80	1274936581238	ซุปก้อน	6	1	12.00	20.00	90	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
81	2385716493842	เส้นหมี่	1	1	20.00	35.00	75	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
82	3491827364951	ข้าวมันไก่สำเร็จรูป	6	1	42.00	69.00	38	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
83	4593812764823	ปลาหมึกสด	3	1	115.00	180.00	22	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
85	2341987652034	ไส้กรอกหมูพริกไทยดำ	2	1	75.00	110.00	60	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
88	5674321985067	อกไก่อบพริกไทย	3	1	78.00	120.00	55	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
89	6785432196078	น่องไก่หมักซอส	3	1	66.00	102.00	35	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
91	8907654328090	ไข่เยี่ยวม้า	1	1	38.00	55.00	40	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
92	9018765439101	ข้าวกล้องหอมมะลิ	4	1	36.00	56.00	50	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
94	2837465911234	ผักชีฝรั่ง	1	1	18.00	27.00	81	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
95	3748591022345	น้ำจิ้มแจ่ว	1	1	14.00	22.00	62	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
96	4659102833456	ขิงสด	1	1	20.00	32.00	54	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
97	5567891204567	ถั่วฝักยาว	1	1	15.00	25.00	90	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
98	6478912035678	เครื่องดื่มวิตามินซี	5	1	15.00	28.00	100	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
99	7389120346789	โจ๊กหมูสำเร็จรูป	6	1	13.00	22.00	50	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
100	8291234567890	น้ำซุปต้มยำ	6	1	22.00	36.00	41	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
101	9302345678901	ซอสพล่า	1	1	20.00	32.00	70	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
103	1134567890123	น้ำปลาร้า	1	1	12.00	19.00	58	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
104	2193847561122	หมูกรอบพริกเกลือ	2	1	145.00	205.00	28	https://images.unsplash.com/photo-1504674900247-0877df9cc836	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
109	7248392016677	ปลาสวายแช่แข็ง	3	1	79.00	124.00	24	https://images.unsplash.com/photo-1514512364185-4c1ee8e13b6a	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
111	9260514238899	ไข่ลวก	1	1	12.00	20.00	68	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
113	1138276460111	ข้าวเหนียวกข6	4	1	35.00	54.00	57	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
115	1360498682333	ผักโขม	1	1	19.00	31.00	62	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
116	1471509793444	ผักคื่นฉ่าย	1	1	13.00	24.00	90	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
119	1704832026777	น้ำพริกหนุ่ม	1	1	29.00	46.00	65	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
122	2037165359000	ซุปข้าวโพด	6	1	23.00	36.00	45	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
123	2148276460111	ซุปไข่ไก่	6	1	25.00	40.00	33	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
121	1926054248999	น้ำผลไม้รวม	5	1	28.00	48.00	79	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
63	3124985618273	น้ำดื่ม	5	1	5.00	10.00	179	\N	t	2025-06-27 01:01:16.599577	2025-06-27 01:01:16.599577
114	1249387571222	ข้าวไรซ์เบอร์รี่อินทรีย์	4	1	60.00	85.00	21	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
112	1027165349900	ข้าวสังข์หยด	4	1	48.00	72.00	39	https://images.unsplash.com/photo-1502741338009-cac2772e18bc	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
93	1928374650123	ข้าวเหนียวแดง	4	1	44.00	65.00	43	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
108	6237281905566	ปลาทูเค็ม	3	1	87.00	130.00	15	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
107	5226170894455	ไก่ต้มสมุนไพร	3	1	95.00	140.00	20	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
106	4215069783344	ไก่ทอดกระเทียม	3	1	72.00	110.00	36	https://images.unsplash.com/photo-1464306076886-debca5e8a6b0	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
72	2516382947513	ปลาทูแช่แข็ง	3	1	80.00	120.00	27	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
77	7419362584729	ปลากะพง	3	1	155.00	220.00	14	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
90	7896543217089	ปลาซาบะย่าง	3	1	89.00	138.00	23	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
105	3204958672233	หมูปิ้งนมสด	2	1	95.00	140.00	40	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
84	1239874561023	หมูแดดเดียวกรอบ	2	1	102.00	155.00	31	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
65	4264873125874	เนื้อหมูสไลด์	2	1	120.00	175.00	29	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
87	4563219874056	สเต็กหมู	2	1	135.00	190.00	21	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
86	3452198763045	เนื้อหมูย่างน้ำผึ้ง	2	1	120.00	179.00	25	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
64	3135796548921	หมูสับ	2	1	90.00	135.00	59	\N	t	2025-06-27 01:01:19.659184	2025-06-27 01:01:19.659184
117	1582610804555	น้ำจิ้มหมูกระทะ	1	1	17.00	28.00	78	https://images.unsplash.com/photo-1502741338009-cac2772e18bc	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
110	8259403127788	ไข่เค็มไชยา	1	1	48.00	68.00	30	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
102	1023456789012	ผักกาดหอม	1	1	17.00	26.00	109	\N	t	2025-06-27 01:09:27.854743	2025-06-27 01:09:27.854743
118	1693721915666	น้ำพริกปลาร้าทรงเครื่อง	1	1	33.00	55.00	37	\N	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
120	1815943137888	น้ำอัดลมกลิ่นองุ่น	5	1	14.00	24.00	95	https://images.unsplash.com/photo-1464306076886-debca5e8a6b0	t	2025-06-27 01:10:08.812573	2025-06-27 01:10:08.812573
\.


--
-- TOC entry 5054 (class 0 OID 59945)
-- Dependencies: 243
-- Data for Name: promotion_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_items (id, promotion_id, product_id, quantity) FROM stdin;
4	1	2	1
\.


--
-- TOC entry 5056 (class 0 OID 59963)
-- Dependencies: 245
-- Data for Name: promotion_rewards; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotion_rewards (id, promotion_id, reward_type, amount, product_id, quantity) FROM stdin;
4	1	discount	20.00	\N	\N
\.


--
-- TOC entry 5052 (class 0 OID 59936)
-- Dependencies: 241
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, name, detail, start_date, end_date, is_active, created_at, updated_at) FROM stdin;
1	วันปีใหม่	เนื่องจากวันขึ้นปีใหม่เลยจัดโปร	2025-06-21	2025-06-26	t	2025-06-25 00:13:59.620334	2025-06-26 22:58:31.716849
\.


--
-- TOC entry 5043 (class 0 OID 59861)
-- Dependencies: 232
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (id, sale_id, product_id, quantity, unit_price, cost_price, discount_id, discount_amount, discount_name, total_price, remark) FROM stdin;
1	1	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
2	1	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
3	1	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
4	2	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
5	3	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
6	3	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
7	3	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
8	4	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
9	4	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
10	4	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
11	5	3	2	60.00	50.00	\N	0.00	\N	120.00	\N
12	5	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
13	5	1	2	35.00	12.35	\N	0.00	\N	70.00	\N
14	6	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
15	6	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
16	6	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
17	7	2	5	250.00	120.00	\N	0.00	\N	1250.00	\N
18	8	2	5	250.00	120.00	\N	0.00	\N	1250.00	\N
19	9	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
20	10	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
21	11	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
22	12	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
23	13	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
24	14	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
25	14	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
26	14	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
27	15	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
28	15	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
29	16	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
30	16	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
31	17	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
32	17	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
33	17	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
34	20	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
35	20	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
36	20	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
37	21	1	1	35.00	12.35	\N	0.00	\N	35.00	ขอฟรี
38	21	2	1	250.00	120.00	\N	0.00	\N	250.00	\N
39	21	3	1	60.00	50.00	\N	0.00	\N	60.00	\N
40	22	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
41	23	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
42	24	3	3	60.00	50.00	\N	0.00	\N	180.00	\N
48	28	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
49	29	2	5	250.00	120.00	\N	0.00	\N	1250.00	\N
50	30	2	5	250.00	120.00	\N	0.00	\N	1250.00	\N
51	31	2	5	250.00	120.00	\N	0.00	\N	1250.00	\N
52	32	3	2	60.00	50.00	\N	0.00	\N	120.00	\N
53	32	2	3	250.00	120.00	\N	0.00	\N	750.00	แถมให้1
54	32	1	2	35.00	12.35	\N	0.00	\N	70.00	\N
55	38	1	1	35.00	12.35	\N	0.00	\N	35.00	\N
56	39	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
57	40	2	2	250.00	120.00	\N	0.00	\N	500.00	\N
58	41	1	4	35.00	12.35	\N	0.00	\N	140.00	\N
59	42	121	1	48.00	28.00	\N	0.00	\N	48.00	\N
60	42	63	1	10.00	5.00	\N	0.00	\N	10.00	\N
61	42	20	1	22.00	13.00	\N	0.00	\N	22.00	\N
62	42	114	1	85.00	60.00	\N	0.00	\N	85.00	\N
63	42	112	1	72.00	48.00	\N	0.00	\N	72.00	\N
64	42	93	1	65.00	44.00	\N	0.00	\N	65.00	\N
65	42	108	1	130.00	87.00	\N	0.00	\N	130.00	\N
66	42	107	1	140.00	95.00	\N	0.00	\N	140.00	\N
67	42	106	1	110.00	72.00	\N	0.00	\N	110.00	\N
68	42	72	1	120.00	80.00	\N	0.00	\N	120.00	\N
69	42	77	1	220.00	155.00	\N	0.00	\N	220.00	\N
70	42	90	1	138.00	89.00	\N	0.00	\N	138.00	\N
71	42	105	1	140.00	95.00	\N	0.00	\N	140.00	\N
72	42	84	1	155.00	102.00	\N	0.00	\N	155.00	\N
73	42	48	1	170.00	120.00	\N	0.00	\N	170.00	\N
74	42	65	1	175.00	120.00	\N	0.00	\N	175.00	\N
75	42	87	1	190.00	135.00	\N	0.00	\N	190.00	\N
76	42	86	1	179.00	120.00	\N	0.00	\N	179.00	\N
77	42	64	1	135.00	90.00	\N	0.00	\N	135.00	\N
78	42	117	1	28.00	17.00	\N	0.00	\N	28.00	\N
79	42	110	1	68.00	48.00	\N	0.00	\N	68.00	\N
80	42	102	1	26.00	17.00	\N	0.00	\N	26.00	\N
81	42	118	1	55.00	33.00	\N	0.00	\N	55.00	\N
82	43	120	1	24.00	14.00	\N	0.00	\N	24.00	5
\.


--
-- TOC entry 5058 (class 0 OID 59980)
-- Dependencies: 247
-- Data for Name: sale_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_promotions (id, sale_id, promotion_id, promotion_name, amount) FROM stdin;
\.


--
-- TOC entry 5041 (class 0 OID 59833)
-- Dependencies: 230
-- Data for Name: sales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales (id, receipt_no, sale_datetime, user_id, customer_id, total_amount, payment_method, received_amount, change_amount, remark, status, discount_id, discount_amount, discount_name, created_at, redeem_point, redeem_discount) FROM stdin;
1	R1750860193	2025-06-25 21:03:13.201256	1	\N	345.00	cash	400.00	55.00	\N	\N	\N	0.00		2025-06-25 21:03:13.201256	0	0.00
2	R1750865075	2025-06-25 22:24:35.850266	1	1	35.00	cash	50.00	15.00	\N	\N	\N	0.00		2025-06-25 22:24:35.850266	0	0.00
3	R1750865308	2025-06-25 22:28:28.360143	1	2	345.00	cash	1000.00	655.00	\N	\N	\N	0.00		2025-06-25 22:28:28.360143	0	0.00
4	R1750868419	2025-06-25 23:20:19.295276	1	2	345.00	cash	500.00	155.00	\N	\N	\N	0.00		2025-06-25 23:20:19.295276	0	0.00
5	R1750869191	2025-06-25 23:33:11.727275	1	\N	690.00	qr	690.00	0.00	\N	\N	\N	0.00		2025-06-25 23:33:11.727275	0	0.00
6	R1750869251	2025-06-25 23:34:11.206883	1	\N	345.00	cash	450.00	105.00	\N	\N	\N	0.00		2025-06-25 23:34:11.206883	0	0.00
7	R1750870347	2025-06-25 23:52:27.74151	1	\N	1250.00	cash	2000.00	750.00	\N	normal	\N	0.00	\N	2025-06-25 23:52:27.74151	0	0.00
8	R1750870380	2025-06-25 23:53:00.62905	1	\N	1250.00	cash	2000.00	750.00	\N	normal	\N	0.00	\N	2025-06-25 23:53:00.62905	0	0.00
9	R1750871318	2025-06-26 00:08:38.957153	1	\N	35.00	cash	35.00	0.00	\N	normal	\N	0.00	\N	2025-06-26 00:08:38.957153	0	0.00
10	R1750871390	2025-06-26 00:09:50.860357	1	2	35.00	cash	40.00	5.00	\N	normal	\N	0.00	\N	2025-06-26 00:09:50.860357	0	0.00
11	R1750871656	2025-06-26 00:14:16.681093	1	\N	35.00	cash	35.00	0.00	\N	normal	\N	0.00	\N	2025-06-26 00:14:16.681093	0	0.00
12	R1750872160	2025-06-26 00:22:40.73756	1	2	35.00	cash	400.00	365.00	\N	normal	\N	0.00	\N	2025-06-26 00:22:40.73756	0	0.00
13	R1750872336	2025-06-26 00:25:36.927664	1	\N	35.00	cash	100.00	65.00	\N	normal	\N	0.00	\N	2025-06-26 00:25:36.927664	0	0.00
14	R1750872657	2025-06-26 00:30:57.579032	1	\N	345.00	cash	400.00	55.00	\N	normal	\N	0.00	\N	2025-06-26 00:30:57.579032	0	0.00
15	R1750873175	2025-06-26 00:39:35.933064	1	\N	535.00	cash	600.00	65.00	\N	normal	\N	0.00	\N	2025-06-26 00:39:35.933064	0	0.00
16	R1750873976	2025-06-26 00:52:56.86499	1	\N	285.00	cash	300.00	15.00	\N	normal	\N	0.00	\N	2025-06-26 00:52:56.86499	0	0.00
17	R1750874174	2025-06-26 00:56:14.156029	1	\N	595.00	cash	3000.00	2405.00	\N	normal	\N	0.00	\N	2025-06-26 00:56:14.156029	0	0.00
20	R1750950832	2025-06-26 22:13:52.059514	1	1	345.00	cash	400.00	55.00	\N	normal	\N	0.00	\N	2025-06-26 22:13:52.059514	0	0.00
21	R1750951163	2025-06-26 22:19:24.00001	1	1	345.00	cash	500.00	155.00	\N	normal	\N	0.00	\N	2025-06-26 22:19:24.00001	0	0.00
22	R1750951189	2025-06-26 22:19:49.055352	1	1	500.00	cash	1000.00	500.00	\N	normal	\N	0.00	\N	2025-06-26 22:19:49.055352	0	0.00
23	R1750951346	2025-06-26 22:22:26.623672	1	1	500.00	cash	500.00	0.00	\N	normal	\N	0.00	\N	2025-06-26 22:22:26.623672	0	0.00
24	R1750951498	2025-06-26 22:24:58.385124	1	1	180.00	cash	200.00	20.00	\N	normal	\N	0.00	\N	2025-06-26 22:24:58.385124	0	0.00
28	R1750952486	2025-06-26 22:41:26.853286	1	1	500.00	cash	500.00	0.00	\N	normal	\N	0.00	\N	2025-06-26 22:41:26.853286	0	0.00
29	R1750953112	2025-06-26 22:51:52.784335	1	1	1250.00	cash	2000.00	750.00	\N	normal	\N	0.00	\N	2025-06-26 22:51:52.784335	0	0.00
30	R1750953346	2025-06-26 22:55:46.2172	1	\N	1250.00	cash	2000.00	750.00	\N	normal	\N	0.00	\N	2025-06-26 22:55:46.2172	0	0.00
31	R1750953428	2025-06-26 22:57:08.453305	1	1	1250.00	cash	5000.00	3750.00	\N	normal	\N	0.00	\N	2025-06-26 22:57:08.453305	0	0.00
32	R1750953460	2025-06-26 22:57:40.533604	1	1	940.00	cash	1000.00	60.00	\N	normal	\N	0.00	\N	2025-06-26 22:57:40.533604	0	0.00
38	R1750954202	2025-06-26 23:10:02.950963	1	2	35.00	cash	40.00	5.00	\N	normal	\N	0.00	\N	2025-06-26 23:10:02.950963	0	0.00
39	R1750954705	2025-06-26 23:18:25.105279	1	1	483.00	cash	500.00	17.00	\N	normal	\N	0.00	\N	2025-06-26 23:18:25.105279	0	0.00
40	R1750955293	2025-06-26 23:28:13.726144	1	1	482.00	cash	500.00	18.00	\N	normal	\N	0.00	\N	2025-06-26 23:28:13.726144	180	18.00
41	R1750955380	2025-06-26 23:29:40.78886	1	\N	140.00	cash	140.00	0.00	\N	normal	\N	0.00	\N	2025-06-26 23:29:40.78886	0	0.00
42	R1750961512	2025-06-27 01:11:52.369455	1	1	2481.00	cash	3000.00	519.00	\N	normal	\N	0.00	\N	2025-06-27 01:11:52.369455	0	0.00
43	R1750962032	2025-06-27 01:20:32.443259	1	2	24.00	cash	30.00	6.00	\N	normal	\N	0.00	\N	2025-06-27 01:20:32.443259	0	0.00
\.


--
-- TOC entry 5050 (class 0 OID 59928)
-- Dependencies: 239
-- Data for Name: settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.settings (key, value) FROM stdin;
shop_name	Dev Journey
shop_address	76 หมู่ 4 บ้านหนองผือ ต.สามัคคีพัฒนา อ.อากาศอำนวย จ.สกลนคร
shop_phone	0815214997
shop_tax_id	1478800008172
shop_logo	
bill_header	สวัสดี ยินดีต้อนรับครับ
bill_footer	ขอบคุณมาที่ใช้บริการครับ
bill_number_prefix	DEV
tax_rate	7
point_rate	50
point_expire_months	12
currency	THB
theme_color	#fd0d0d
\.


--
-- TOC entry 5045 (class 0 OID 59885)
-- Dependencies: 234
-- Data for Name: stock_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock_movements (id, product_id, change_type, quantity, user_id, ref_id, note, created_at) FROM stdin;
1	2	adjust	20	1	\N		2025-06-25 18:21:19.418346
2	3	receive	10	1	\N		2025-06-25 22:14:26.191539
3	2	sell	-1	1	20	ขายสินค้า	2025-06-26 22:13:52.059514
4	1	sell	-1	1	20	ขายสินค้า	2025-06-26 22:13:52.059514
5	3	sell	-1	1	20	ขายสินค้า	2025-06-26 22:13:52.059514
6	1	sell	-1	1	21	ขายสินค้า	2025-06-26 22:19:24.00001
7	2	sell	-1	1	21	ขายสินค้า	2025-06-26 22:19:24.00001
8	3	sell	-1	1	21	ขายสินค้า	2025-06-26 22:19:24.00001
9	2	sell	-2	1	22	ขายสินค้า	2025-06-26 22:19:49.055352
10	2	sell	-2	1	23	ขายสินค้า	2025-06-26 22:22:26.623672
11	3	sell	-3	1	24	ขายสินค้า	2025-06-26 22:24:58.385124
17	2	sell	-2	1	28	ขายสินค้า	2025-06-26 22:41:26.853286
18	2	sell	-5	1	29	ขายสินค้า	2025-06-26 22:51:52.784335
19	2	receive	100	1	\N		2025-06-26 22:55:33.355734
20	2	sell	-5	1	30	ขายสินค้า	2025-06-26 22:55:46.2172
21	2	sell	-5	1	31	ขายสินค้า	2025-06-26 22:57:08.453305
22	3	sell	-2	1	32	ขายสินค้า	2025-06-26 22:57:40.533604
23	2	sell	-3	1	32	ขายสินค้า	2025-06-26 22:57:40.533604
24	1	sell	-2	1	32	ขายสินค้า	2025-06-26 22:57:40.533604
25	1	sell	-1	1	38	ขายสินค้า	2025-06-26 23:10:02.950963
26	2	sell	-2	1	39	ขายสินค้า	2025-06-26 23:18:25.105279
27	2	sell	-2	1	40	ขายสินค้า	2025-06-26 23:28:13.726144
28	1	sell	-4	1	41	ขายสินค้า	2025-06-26 23:29:40.78886
29	1	receive	20	1	\N		2025-06-27 00:00:02.587308
30	3	receive	10	1	\N		2025-06-27 00:00:12.311034
31	121	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
32	63	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
33	20	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
34	114	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
35	112	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
36	93	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
37	108	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
38	107	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
39	106	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
40	72	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
41	77	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
42	90	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
43	105	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
44	84	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
45	48	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
46	65	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
47	87	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
48	86	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
49	64	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
50	117	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
51	110	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
52	102	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
53	118	sell	-1	1	42	ขายสินค้า	2025-06-27 01:11:52.369455
54	120	sell	-1	1	43	ขายสินค้า	2025-06-27 01:20:32.443259
\.


--
-- TOC entry 5033 (class 0 OID 59778)
-- Dependencies: 222
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password_hash, name, role, is_active, created_at) FROM stdin;
1	admin	$2a$10$kI5WpFDCpJ6vua0sGDtZNOmayb9SR9pshz13G1iXhTKGNICN/FBce	komkem	admin	t	2025-06-24 02:22:22.675872
2	aem	$2b$10$fsoqMYZ7kxycZfFYE18JxeN.hFVUSha00mreVpnFaXUfqbsxcyZBK	aem aem	manager	t	2025-06-26 20:12:51.900252
3	k	$2b$10$xAF7VMG1EWzcs5i5O4eBBOPlBjrGEFVAiH3Iy.1xrnoGKRIEgjv4K	k k	cashier	t	2025-06-26 20:13:22.664841
\.


--
-- TOC entry 5082 (class 0 OID 0)
-- Dependencies: 223
-- Name: customers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.customers_id_seq', 2, true);


--
-- TOC entry 5083 (class 0 OID 0)
-- Dependencies: 227
-- Name: discount_products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discount_products_id_seq', 1, false);


--
-- TOC entry 5084 (class 0 OID 0)
-- Dependencies: 225
-- Name: discounts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.discounts_id_seq', 1, false);


--
-- TOC entry 5085 (class 0 OID 0)
-- Dependencies: 248
-- Name: point_transactions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.point_transactions_id_seq', 8, true);


--
-- TOC entry 5086 (class 0 OID 0)
-- Dependencies: 235
-- Name: print_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.print_logs_id_seq', 1, false);


--
-- TOC entry 5087 (class 0 OID 0)
-- Dependencies: 237
-- Name: printers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.printers_id_seq', 7, true);


--
-- TOC entry 5088 (class 0 OID 0)
-- Dependencies: 217
-- Name: product_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_categories_id_seq', 8, true);


--
-- TOC entry 5089 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 123, true);


--
-- TOC entry 5090 (class 0 OID 0)
-- Dependencies: 242
-- Name: promotion_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_items_id_seq', 4, true);


--
-- TOC entry 5091 (class 0 OID 0)
-- Dependencies: 244
-- Name: promotion_rewards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotion_rewards_id_seq', 4, true);


--
-- TOC entry 5092 (class 0 OID 0)
-- Dependencies: 240
-- Name: promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotions_id_seq', 38, true);


--
-- TOC entry 5093 (class 0 OID 0)
-- Dependencies: 231
-- Name: sale_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_items_id_seq', 82, true);


--
-- TOC entry 5094 (class 0 OID 0)
-- Dependencies: 246
-- Name: sale_promotions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_promotions_id_seq', 1, false);


--
-- TOC entry 5095 (class 0 OID 0)
-- Dependencies: 229
-- Name: sales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_id_seq', 43, true);


--
-- TOC entry 5096 (class 0 OID 0)
-- Dependencies: 233
-- Name: stock_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.stock_movements_id_seq', 54, true);


--
-- TOC entry 5097 (class 0 OID 0)
-- Dependencies: 221
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 3, true);


--
-- TOC entry 4833 (class 2606 OID 59799)
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 59816)
-- Name: discount_products discount_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_products
    ADD CONSTRAINT discount_products_pkey PRIMARY KEY (id);


--
-- TOC entry 4835 (class 2606 OID 59809)
-- Name: discounts discounts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discounts
    ADD CONSTRAINT discounts_pkey PRIMARY KEY (id);


--
-- TOC entry 4861 (class 2606 OID 60006)
-- Name: point_transactions point_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT point_transactions_pkey PRIMARY KEY (id);


--
-- TOC entry 4847 (class 2606 OID 59909)
-- Name: print_logs print_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.print_logs
    ADD CONSTRAINT print_logs_pkey PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 59927)
-- Name: printers printers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.printers
    ADD CONSTRAINT printers_pkey PRIMARY KEY (id);


--
-- TOC entry 4823 (class 2606 OID 59754)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 59771)
-- Name: products products_barcode_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_barcode_key UNIQUE (barcode);


--
-- TOC entry 4827 (class 2606 OID 59769)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 4855 (class 2606 OID 59951)
-- Name: promotion_items promotion_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_items
    ADD CONSTRAINT promotion_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4857 (class 2606 OID 59968)
-- Name: promotion_rewards promotion_rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rewards
    ADD CONSTRAINT promotion_rewards_pkey PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 59943)
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 59868)
-- Name: sale_items sale_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pkey PRIMARY KEY (id);


--
-- TOC entry 4859 (class 2606 OID 59985)
-- Name: sale_promotions sale_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_promotions
    ADD CONSTRAINT sale_promotions_pkey PRIMARY KEY (id);


--
-- TOC entry 4839 (class 2606 OID 59842)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 4841 (class 2606 OID 59844)
-- Name: sales sales_receipt_no_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_receipt_no_key UNIQUE (receipt_no);


--
-- TOC entry 4851 (class 2606 OID 59934)
-- Name: settings settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.settings
    ADD CONSTRAINT settings_pkey PRIMARY KEY (key);


--
-- TOC entry 4845 (class 2606 OID 59891)
-- Name: stock_movements stock_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_pkey PRIMARY KEY (id);


--
-- TOC entry 4829 (class 2606 OID 59788)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 59790)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4863 (class 2606 OID 59827)
-- Name: discount_products discount_products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_products
    ADD CONSTRAINT discount_products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id) ON DELETE CASCADE;


--
-- TOC entry 4864 (class 2606 OID 59817)
-- Name: discount_products discount_products_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_products
    ADD CONSTRAINT discount_products_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id) ON DELETE CASCADE;


--
-- TOC entry 4865 (class 2606 OID 59822)
-- Name: discount_products discount_products_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.discount_products
    ADD CONSTRAINT discount_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4882 (class 2606 OID 60007)
-- Name: point_transactions point_transactions_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.point_transactions
    ADD CONSTRAINT point_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- TOC entry 4874 (class 2606 OID 59910)
-- Name: print_logs print_logs_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.print_logs
    ADD CONSTRAINT print_logs_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 4875 (class 2606 OID 59915)
-- Name: print_logs print_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.print_logs
    ADD CONSTRAINT print_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4862 (class 2606 OID 59772)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(id);


--
-- TOC entry 4876 (class 2606 OID 59957)
-- Name: promotion_items promotion_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_items
    ADD CONSTRAINT promotion_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4877 (class 2606 OID 59952)
-- Name: promotion_items promotion_items_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_items
    ADD CONSTRAINT promotion_items_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- TOC entry 4878 (class 2606 OID 59974)
-- Name: promotion_rewards promotion_rewards_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rewards
    ADD CONSTRAINT promotion_rewards_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- TOC entry 4879 (class 2606 OID 59969)
-- Name: promotion_rewards promotion_rewards_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotion_rewards
    ADD CONSTRAINT promotion_rewards_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- TOC entry 4869 (class 2606 OID 59879)
-- Name: sale_items sale_items_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id);


--
-- TOC entry 4870 (class 2606 OID 59874)
-- Name: sale_items sale_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;


--
-- TOC entry 4871 (class 2606 OID 59869)
-- Name: sale_items sale_items_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 4880 (class 2606 OID 59991)
-- Name: sale_promotions sale_promotions_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_promotions
    ADD CONSTRAINT sale_promotions_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id);


--
-- TOC entry 4881 (class 2606 OID 59986)
-- Name: sale_promotions sale_promotions_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_promotions
    ADD CONSTRAINT sale_promotions_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 4866 (class 2606 OID 59850)
-- Name: sales sales_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- TOC entry 4867 (class 2606 OID 59855)
-- Name: sales sales_discount_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_discount_id_fkey FOREIGN KEY (discount_id) REFERENCES public.discounts(id);


--
-- TOC entry 4868 (class 2606 OID 59845)
-- Name: sales sales_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- TOC entry 4872 (class 2606 OID 59892)
-- Name: stock_movements stock_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 4873 (class 2606 OID 59897)
-- Name: stock_movements stock_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock_movements
    ADD CONSTRAINT stock_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


-- Completed on 2025-06-27 01:59:02

--
-- PostgreSQL database dump complete
--

