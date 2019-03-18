-- Database creation must be done outside an multicommand file.
-- These commands were put in this file only for convenience.
-- -- object: postgres | type: DATABASE --
-- -- DROP DATABASE IF EXISTS postgres;
-- CREATE DATABASE postgres
-- 	ENCODING = 'UTF8'
-- 	LC_COLLATE = 'en_US.UTF8'
-- 	LC_CTYPE = 'en_US.UTF8'
-- 	TABLESPACE = pg_default
-- 	OWNER = cloudsqlsuperuser
-- ;
-- -- ddl-end --
-- COMMENT ON DATABASE postgres IS 'default administrative connection database';
-- -- ddl-end --
--

-- object: public.hub_issue_log_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.hub_issue_log_id_seq CASCADE;
CREATE SEQUENCE public.hub_issue_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.hub_issue_log_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.hub_issue_log | type: TABLE --
-- DROP TABLE IF EXISTS public.hub_issue_log CASCADE;
CREATE TABLE public.hub_issue_log(
	id integer NOT NULL DEFAULT nextval('public.hub_issue_log_id_seq'::regclass),
	event_date timestamp,
	insert_date timestamp,
	reported_by character varying(255),
	issue_note character varying(255),
	issue_type character varying(255),
	issue_image character varying(255),
	hub_id integer,
	CONSTRAINT hub_issue_log_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.hub_issue_log OWNER TO postgres;
-- ddl-end --

-- object: public.hub_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.hub_id_seq CASCADE;
CREATE SEQUENCE public.hub_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.hub_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.hub | type: TABLE --
-- DROP TABLE IF EXISTS public.hub CASCADE;
CREATE TABLE public.hub(
	id integer NOT NULL DEFAULT nextval('public.hub_id_seq'::regclass),
	date_created timestamp NOT NULL,
	last_checkup timestamp,
	next_checkup timestamp,
	static_ip character varying(255),
	code character varying(255) NOT NULL,
	name character varying(255) NOT NULL,
	bom character varying(255),
    customer_id integer NOT NULL,
	pass character varying(255),
	image character varying(255),
	comm_protocols character varying(255),
	zone_id integer,
	serial character varying(200),
	part_number character varying (200),
	certificate character varying(200),
	CONSTRAINT hub_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.hub OWNER TO postgres;
-- ddl-end --

-- object: public.customer_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.customer_id_seq CASCADE;
CREATE SEQUENCE public.customer_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.customer_id_seq OWNER TO postgres;

CREATE TABLE public.country(
    id smallint PRIMARY KEY,
    name character varying(255) NOT NULL
);
-- ddl-end --

-- object: public.customer | type: TABLE --
-- DROP TABLE IF EXISTS public.customer CASCADE;

CREATE TABLE public.customer_status(
    id smallint PRIMARY KEY,
    name character varying(255) NOT NULL,
    description character varying(500)
);

CREATE TABLE public.customer(
	id integer NOT NULL DEFAULT nextval('public.customer_id_seq'::regclass),
	name character varying(255) NOT NULL,
	date_created timestamp NOT NULL,
	status smallint NOT NULL,
	email character varying(255) NOT NULL,
	phone character varying(255),
	address character varying(255),
	city character varying(255),
	country integer REFERENCES country(id),
	type character varying(255),
	unique_name character varying(255),
	CONSTRAINT customer_pkey PRIMARY KEY (id)
);


-- ddl-end --
ALTER TABLE public.customer OWNER TO postgres;
-- ddl-end --

-- object: public.customer_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.customer_id_seq CASCADE;
CREATE SEQUENCE public.hub_customer_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.hub_customer_id_seq OWNER TO postgres;
-- ddl-end --

CREATE TABLE public.hub_customer_log(
    id integer NOT NULL DEFAULT nextval('public.hub_customer_id_seq'::regclass),
    hub_id integer NOT NULL,
    customer_id integer NOT NULL,
    hub_json json NOT NULL,
    customer_json json NOT NULL,
    created_at timestamp NOT NULL,
    deleted_at timestamp NOT NULL,
    CONSTRAINT hub_customer_log_pkey PRIMARY KEY (id)
);

ALTER TABLE public.hub_customer_log OWNER TO postgres;

CREATE TABLE node_type(
    id integer,
    type_name character varying (255),
    type_description character varying (255),
    logo character varying (255),
    CONSTRAINT node_type_pkey PRIMARY KEY (id)
);
-- object: public.node_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.node_id_seq CASCADE;
CREATE SEQUENCE public.node_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.node_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.node | type: TABLE --
-- DROP TABLE IF EXISTS public.node CASCADE;
CREATE TABLE public.node(
	id integer NOT NULL DEFAULT nextval('public.node_id_seq'::regclass),
	date_created timestamp NOT NULL,
	last_checkup timestamp,
	next_checkup timestamp,
	bom character varying(255),
	notes character varying(255),
	name character varying(255) NOT NULL,
	description character varying(255),
	type integer,
	active boolean DEFAULT true,
	hub_id integer,
	part_number character varying(200),
	serial_number character varying(200),
    certificate character varying(200),
	CONSTRAINT node_pkey PRIMARY KEY (id),
	CONSTRAINT node_node_type_fkey FOREIGN KEY (type)
	REFERENCES node_type(id)
);


-- ddl-end --
ALTER TABLE public.node OWNER TO postgres;
-- ddl-end --

-- object: public.customer_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.customer_id_seq CASCADE;
CREATE SEQUENCE public.node_access_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.node_access_id_seq OWNER TO postgres;
-- ddl-end --

CREATE TABLE public.node_access(
    id integer NOT NULL DEFAULT nextval('public.node_access_id_seq'::regclass),
    user_id integer NOT NULL,
    node_id integer NOT NULL,
    CONSTRAINT node_access_pkey PRIMARY KEY (id)
);

ALTER TABLE public.node_access OWNER TO postgres;

-- object: public.sensor_set_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.sensor_set_id_seq CASCADE;
CREATE SEQUENCE public.sensor_set_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.sensor_set_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.sensor_set | type: TABLE --
-- DROP TABLE IF EXISTS public.sensor_set CASCADE;
CREATE TABLE public.sensor_set(
	id integer NOT NULL DEFAULT nextval('public.sensor_set_id_seq'::regclass),
	name character varying(255),
	date_created timestamp,
	description character varying(255),
	CONSTRAINT sensor_set_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.sensor_set OWNER TO postgres;
-- ddl-end --

-- object: public.coordinates_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.coordinates_id_seq CASCADE;
CREATE SEQUENCE public.coordinates_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.coordinates_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.coordinates | type: TABLE --
-- DROP TABLE IF EXISTS public.coordinates CASCADE;
CREATE TABLE public.coordinates(
	id integer NOT NULL DEFAULT nextval('public.coordinates_id_seq'::regclass),
	latitude decimal(8, 6),
	longitude decimal(9, 6),
	notes character varying(255),
	CONSTRAINT coordinates_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.coordinates OWNER TO postgres;
-- ddl-end --

CREATE SEQUENCE public.node_coordinates_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

ALTER SEQUENCE public.node_coordinates_id_seq OWNER TO postgres;

CREATE TABLE public.node_coordinates(
	id integer NOT NULL DEFAULT nextval('public.node_coordinates_id_seq'::regclass),
	node_id integer,
    coordinates_id integer,
	CONSTRAINT node_coordinates_pkey PRIMARY KEY (id),
	CONSTRAINT nodes_uq UNIQUE (node_id),
	CONSTRAINT coordinates_uq UNIQUE (coordinates_id)
);

ALTER TABLE public.node_coordinates OWNER TO postgres;


CREATE SEQUENCE public.hub_coordinates_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

ALTER SEQUENCE public.hub_coordinates_id_seq OWNER TO postgres;

CREATE TABLE public.hub_coordinates(
	id integer NOT NULL DEFAULT nextval('public.hub_coordinates_id_seq'::regclass),
	hub_id integer,
    coordinates_id integer,
	CONSTRAINT hub_coordinates_pkey PRIMARY KEY (id),
	CONSTRAINT hub_uq UNIQUE (hub_id),
	CONSTRAINT coordinates_ucq UNIQUE (coordinates_id)
);

ALTER TABLE public.hub_coordinates OWNER TO postgres;

-- Zone coordinates
CREATE SEQUENCE public.zone_coordinates_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;

ALTER SEQUENCE public.zone_coordinates_id_seq OWNER TO postgres;

CREATE TABLE public.zone_coordinates(
	id integer NOT NULL DEFAULT nextval('public.zone_coordinates_id_seq'::regclass),
	zone_id integer,
    coordinates_id integer,
	CONSTRAINT zone_coordinates_pkey PRIMARY KEY (id),
	CONSTRAINT zone_uq UNIQUE (zone_id),
	CONSTRAINT zone_coordinates_ucq UNIQUE (coordinates_id)
);

ALTER TABLE public.zone_coordinates OWNER TO postgres;
--


-- object: public.node_issue_log_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.node_issue_log_id_seq CASCADE;
CREATE SEQUENCE public.node_issue_log_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.node_issue_log_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.node_issue_log | type: TABLE --
-- DROP TABLE IF EXISTS public.node_issue_log CASCADE;
CREATE TABLE public.node_issue_log(
	id integer NOT NULL DEFAULT nextval('public.node_issue_log_id_seq'::regclass),
	type character varying(255),
	date timestamp,
	issue_create timestamp,
	image character varying(255),
	note character varying(255),
	sensor_id integer,
	node_id integer,
	CONSTRAINT node_issue_log_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.node_issue_log OWNER TO postgres;
-- ddl-end --

-- object: public.zone_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.zone_id_seq CASCADE;
CREATE SEQUENCE public.zone_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.zone_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.zone | type: TABLE --
-- DROP TABLE IF EXISTS public.zone CASCADE;
CREATE TABLE public.zone(
	id integer NOT NULL DEFAULT nextval('public.zone_id_seq'::regclass),
	name character varying(255),
	date_created timestamp,
	description character varying(255),
	type character varying(255),
	details character varying(255),
	CONSTRAINT zone_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.zone OWNER TO postgres;
-- ddl-end --

-- object: public.sensor_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.sensor_id_seq CASCADE;
CREATE SEQUENCE public.sensor_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.sensor_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.sensor | type: TABLE --
-- DROP TABLE IF EXISTS public.sensor CASCADE;
CREATE TABLE public.sensor(
	id integer NOT NULL DEFAULT nextval('public.sensor_id_seq'::regclass),
	variable character varying(255),
	offset_value double precision,
	calibration_date timestamp,
	metric character varying(255),
	status character varying(255),
	name character varying(255),
	type character varying(255),
	node_id integer,
	serial_number character varying(200),
	calibration_file character varying(200),
--	sensor_set_id integer,
	CONSTRAINT sensor_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.sensor OWNER TO postgres;
-- ddl-end --

-- object: public.users_details_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.users_details_id_seq CASCADE;
CREATE SEQUENCE public.users_details_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.users_details_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.users_details | type: TABLE --
-- DROP TABLE IF EXISTS public.users_details CASCADE;
CREATE TABLE public.users_details(
	id integer NOT NULL DEFAULT nextval('public.users_details_id_seq'::regclass),
	fname character varying(255),
	lname character varying(255),
	phone character varying(20),
	title character varying(255),
	birthday timestamp,
	date_created timestamp,
	status character varying(255),
	roles_id integer,
	CONSTRAINT users_details_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.users_details OWNER TO postgres;
-- ddl-end --

-- object: public.users_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.users_id_seq CASCADE;
CREATE SEQUENCE public.users_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.users_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.users | type: TABLE --
-- DROP TABLE IF EXISTS public.users CASCADE;
CREATE TABLE public.users(
	id integer NOT NULL DEFAULT nextval('public.users_id_seq'::regclass),
	email character varying(255) UNIQUE,
	password character varying(255),
	access boolean,
	date_deleted timestamp,
	users_details_id integer,
	last_login TIMESTAMP,
	customer_id integer,
	CONSTRAINT customer_user_fk FOREIGN KEY (customer_id)
	REFERENCES customer(id)
	ON UPDATE CASCADE
	ON DELETE NO ACTION,
	CONSTRAINT users_pkey PRIMARY KEY (id),
	CONSTRAINT users_uq UNIQUE (users_details_id)

);
-- ddl-end --
ALTER TABLE public.users OWNER TO postgres;
-- ddl-end --

-- ddl-end --

-- object: public.user_group_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.user_group_id_seq CASCADE;
CREATE SEQUENCE public.password_reset_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.password_reset_seq OWNER TO postgres;
-- ddl-end --

CREATE TABLE public.password_reset(
	id integer NOT NULL DEFAULT nextval('public.password_reset_seq'::regclass),
	code character varying(255) NOT NULL,
	created_at timestamp NOT NULL,
	valid_until timestamp NOT NULL,
	user_id integer NOT NULL,
	CONSTRAINT password_reset_pkey PRIMARY KEY (id)
);

ALTER TABLE public.password_reset OWNER TO postgres;

-- object: public.user_group_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.user_group_id_seq CASCADE;
CREATE SEQUENCE public.member_invitations_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.member_invitations_seq OWNER TO postgres;
-- ddl-end --

CREATE TABLE public.member_invitations(
	id integer NOT NULL DEFAULT nextval('public.member_invitations_seq'::regclass),
	primary_user_id integer NOT NULL REFERENCES users(id),
    customer_id integer NOT NULL,
	code character varying(255) NOT NULL,
	email character varying(255) NOT NULL,
	created_at timestamp NOT NULL,
	valid_until timestamp NOT NULL,
	CONSTRAINT member_invitations_pkey PRIMARY KEY (id)
);

ALTER TABLE public.member_invitations OWNER TO postgres;

-- object: public.roles_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.roles_id_seq CASCADE;
CREATE SEQUENCE public.roles_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.roles | type: TABLE --
-- DROP TABLE IF EXISTS public.roles CASCADE;
CREATE TABLE public.roles(
	id integer NOT NULL DEFAULT nextval('public.roles_id_seq'::regclass),
	name character varying(255),
	description character varying(255),
	date_created timestamp,
	CONSTRAINT roles_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.roles OWNER TO postgres;
-- ddl-end --

-- object: public.permissions_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.permissions_id_seq CASCADE;
CREATE SEQUENCE public.permissions_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.permissions_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.permissions | type: TABLE --
-- DROP TABLE IF EXISTS public.permissions CASCADE;
CREATE TABLE public.permissions(
	id integer NOT NULL DEFAULT nextval('public.permissions_id_seq'::regclass),
	name varchar(255),
	description varchar(255),
	endpoint varchar(50),
	method varchar(6),
	CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.permissions OWNER TO postgres;
-- ddl-end --

-- object: public.notification_logs_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.notification_logs_id_seq CASCADE;
CREATE SEQUENCE public.notification_logs_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.notification_logs_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.notification_logs | type: TABLE --
-- DROP TABLE IF EXISTS public.notification_logs CASCADE;
CREATE TABLE public.notification_logs(
	id integer NOT NULL DEFAULT nextval('public.notification_logs_id_seq'::regclass),
	date_created timestamp,
	subject character varying(255),
	message character varying(255),
	variables character varying(255),
	status_ack character varying(255),
	feedback character varying(255),
	date_inserted character varying(255),
	alert_notification_id integer,
	CONSTRAINT notification_logs_pkey PRIMARY KEY (id),
	CONSTRAINT notification_logs_uq UNIQUE (alert_notification_id)

);
-- ddl-end --
ALTER TABLE public.notification_logs OWNER TO postgres;
-- ddl-end --

-- object: public.alert_notification_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.alert_notification_id_seq CASCADE;
CREATE SEQUENCE public.alert_notification_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.alert_notification_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.alert_notification | type: TABLE --
-- DROP TABLE IF EXISTS public.alert_notification CASCADE;
CREATE TABLE public.alert_notification(
	id integer NOT NULL DEFAULT nextval('public.alert_notification_id_seq'::regclass),
	date_created timestamp,
	subject character varying(255),
	message character varying(255),
	variables character varying(255),
	status_req boolean,
	feedback_req boolean,
	alert_settings_id integer,
	CONSTRAINT alert_notification_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.alert_notification OWNER TO postgres;
-- ddl-end --

-- object: public.alert_protocol_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.alert_protocol_id_seq CASCADE;
CREATE SEQUENCE public.alert_protocol_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.alert_protocol_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.alert_settings_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.alert_settings_id_seq CASCADE;
CREATE SEQUENCE public.alert_settings_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.alert_settings_id_seq OWNER TO postgres;
-- ddl-end --




CREATE TABLE alert_type (
    id integer,
    name CHARACTER VARYING(100),
    description CHARACTER VARYING(255),
    date_created timestamp DEFAULT now(),
    CONSTRAINT alert_type_pkey PRIMARY KEY(id)
);

CREATE TABLE alert_priority_type (
    id integer,
    name CHARACTER VARYING(100),
    description CHARACTER VARYING(255),
    date_created timestamp DEFAULT now(),
    CONSTRAINT alert_priority_type_pkey PRIMARY KEY(id)
);



-- object: public.alert_settings | type: TABLE --
-- DROP TABLE IF EXISTS public.alert_settings CASCADE;
CREATE TABLE public.alert_settings(
	id integer NOT NULL DEFAULT nextval('public.alert_settings_id_seq'::regclass),
	name character varying(255) NOT NULL,
	enabled boolean,
	last_date_enabled timestamp NOT NULL,
	priority int,
	timestamp_source timestamp,
	display_path character varying(255),
	ack_mode character varying(255),
	ack_notes character varying(255),
	archiving_allowed boolean,
	type int,
	variable character varying(255),
	limits json array,
	rate_limit numeric(10,0),
	date_created timestamp,
	start_date character varying(255),
	end_date character varying(255),
	relationship_made boolean,
	alert_protocol_id integer,
	CONSTRAINT alert_settings_pkey PRIMARY KEY (id),
	CONSTRAINT alert_settings_alert_type_fkey FOREIGN KEY (type)
	REFERENCES alert_type(id),
	CONSTRAINT alert_settings_alert_priority_type_fkey FOREIGN KEY (priority)
	REFERENCES alert_priority_type(id)
    ON UPDATE CASCADE


);




CREATE TABLE alert_settings_zone (
  id integer NOT NULL,
  id_zone integer NOT NULL,
  CONSTRAINT alert_settings_zone_alert_settings_pk PRIMARY KEY (id),
  CONSTRAINT unique_alert_settings_zone UNIQUE(id),
  CONSTRAINT zone_alert_fk FOREIGN KEY (id_zone)
    REFERENCES public.zone(id)
    ON UPDATE CASCADE
);

CREATE TABLE alert_settings_node (
  id integer NOT NULL,
  id_node integer NOT NULL,
  CONSTRAINT alert_settings_node_alert_settings_pk PRIMARY KEY (id),
  CONSTRAINT unique_alert_settings_node UNIQUE(id),
  CONSTRAINT node_alert_fk FOREIGN KEY (id_node)
    REFERENCES node(id)
    ON UPDATE CASCADE
);

CREATE TABLE alert_settings_hub(
  id integer NOT NULL,
  id_hub integer NOT NULL,
  CONSTRAINT alert_settings_hub_alert_settings_pk PRIMARY KEY (id),
  CONSTRAINT unique_alert_settings_hub UNIQUE (id),
  CONSTRAINT hub_alert_fk FOREIGN KEY (id_hub)
    REFERENCES hub (id)
    ON UPDATE CASCADE
);

CREATE TABLE alert_settings_sensor(
  id integer NOT NULL,
  id_sensor integer NOT NULL,
  CONSTRAINT alert_settings_sensor_alert_settings_pk PRIMARY KEY (id),
  CONSTRAINT unique_alert_settings_sensor UNIQUE (id),
  CONSTRAINT sensor_alert_fk FOREIGN KEY (id_sensor)
    REFERENCES sensor(id)
    ON UPDATE CASCADE
);

-- ddl-end --
ALTER TABLE public.alert_settings OWNER TO postgres;
-- ddl-end --

-- object: public.transmission_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.transmission_id_seq CASCADE;
CREATE SEQUENCE public.transmission_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.transmission_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.transmission | type: TABLE --
-- DROP TABLE IF EXISTS public.transmission CASCADE;
CREATE TABLE public.transmission(
	id integer NOT NULL DEFAULT nextval('public.transmission_id_seq'::regclass),
	transmit_date timestamp,
	insert_date timestamp,
	timezone character varying(255),
	variable character varying(255),
	value double precision,
	status character varying(255),
--	node_id integer,
	sensor_id integer,
	CONSTRAINT transmission_pkey PRIMARY KEY (id)
);
-- ddl-end --
ALTER TABLE public.transmission OWNER TO postgres;
-- ddl-end --

-- object: public.bill_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.bill_id_seq CASCADE;
CREATE SEQUENCE public.bill_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.bill_id_seq OWNER TO postgres;
-- ddl-end --

CREATE TABLE public.transmission_type(
  id SERIAL NOT NULL,
  created_by integer,
  name varchar(255),
  details varchar(255),
  date_created timestamp DEFAULT now()
);


-- object: public.bill | type: TABLE --
-- DROP TABLE IF EXISTS public.bill CASCADE;
CREATE TABLE public.bill(
	id integer NOT NULL DEFAULT nextval('public.bill_id_seq'::regclass),
	rate character varying(255),
	notes character varying(255),
	date_created timestamp,
	bill_date timestamp,
	due_date timestamp,
	payment_terms character varying(255),
	utilization numeric(10,0),
	amount_due numeric(10,0),
	status boolean,
	currency character varying(255),
	customer_id integer,
	CONSTRAINT bill_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.bill OWNER TO postgres;
-- ddl-end --

-- object: public.payments_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.payments_id_seq CASCADE;
CREATE SEQUENCE public.payments_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.payments_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.payments | type: TABLE --
-- DROP TABLE IF EXISTS public.payments CASCADE;
CREATE TABLE public.payments(
	id integer NOT NULL DEFAULT nextval('public.payments_id_seq'::regclass),
	method character varying(255),
	amount numeric(10,0),
	date_created timestamp,
	payment_date timestamp,
	status character varying(255),
	currency character varying(255),
	bill_id integer,
	CONSTRAINT payments_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.payments OWNER TO postgres;
-- ddl-end --

-- object: public.maintain_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.maintain_id_seq CASCADE;
CREATE SEQUENCE public.maintain_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.maintain_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.maintain | type: TABLE --
-- DROP TABLE IF EXISTS public.maintain CASCADE;
CREATE TABLE public.maintain(
	id integer NOT NULL DEFAULT nextval('public.maintain_id_seq'::regclass),
	assigned_user character varying(255),
	issue character varying(255),
	notes character varying(255),
	due_date timestamp,
	service_date timestamp,
	status character varying(255),
	created_by character varying(255),
	CONSTRAINT maintain_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.maintain OWNER TO postgres;
-- ddl-end --

-- object: public.alarm_groups_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.alarm_groups_id_seq CASCADE;
CREATE SEQUENCE public.alarm_groups_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.alarm_groups_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.alarm_groups | type: TABLE --
-- DROP TABLE IF EXISTS public.alarm_groups CASCADE;
CREATE TABLE public.alarm_groups(
	id integer NOT NULL DEFAULT nextval('public.alarm_groups_id_seq'::regclass),
	name character varying(255) NOT NULL,
	description character varying(255),
	tier numeric(2,0),
	alert_settings_id integer,
	CONSTRAINT alarm_groups_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.alarm_groups OWNER TO postgres;
-- ddl-end --

-- object: public.email_notification_id_seq | type: SEQUENCE --
-- DROP SEQUENCE IF EXISTS public.email_notification_id_seq CASCADE;
CREATE SEQUENCE public.email_notification_id_seq
	INCREMENT BY 1
	MINVALUE 1
	MAXVALUE 2147483647
	START WITH 1
	CACHE 1
	NO CYCLE
	OWNED BY NONE;
-- ddl-end --
ALTER SEQUENCE public.email_notification_id_seq OWNER TO postgres;
-- ddl-end --

-- object: public.email_notification | type: TABLE --
-- DROP TABLE IF EXISTS public.email_notification CASCADE;
CREATE TABLE public.email_notification(
	id integer NOT NULL DEFAULT nextval('public.email_notification_id_seq'::regclass),
	name character varying(255),
	lastname character varying(255),
	email character varying(255),
	telephone character varying(255),
	alarm_groups_id integer,
	CONSTRAINT email_notification_pkey PRIMARY KEY (id)

);
-- ddl-end --
ALTER TABLE public.email_notification OWNER TO postgres;
-- ddl-end --

-- object: public.roles_permissions | type: TABLE --
-- DROP TABLE IF EXISTS public.roles_permissions CASCADE;
CREATE TABLE public.roles_permissions(
	id_roles integer NOT NULL,
	id_permissions integer NOT NULL,
	CONSTRAINT many_roles_has_many_permissions_pk PRIMARY KEY (id_roles,id_permissions)

);
-- ddl-end --
ALTER TABLE public.roles_permissions OWNER TO postgres;
-- ddl-end --

-- object: public.alert_protocol | type: TABLE --
-- DROP TABLE IF EXISTS public.alert_protocol CASCADE;
CREATE TABLE public.alert_protocol(
	id integer NOT NULL DEFAULT nextval('public.alert_protocol_id_seq'::regclass),
	date_created timestamp,
	email boolean NOT NULL,
	sms boolean NOT NULL,
	push boolean NOT NULL,
	call boolean NOT NULL,
	inapp_notification boolean NOT NULL,
	target_user int,
	target_usergroup int,
	primary_email CHARACTER VARYING(100),
	CONSTRAINT alert_protocol_pkey PRIMARY KEY (id),
	CONSTRAINT alert_protocol_users_fkey FOREIGN KEY (target_user)
	REFERENCES users(id)
--	CONSTRAINT alert_protocol_user_group_fkey FOREIGN KEY (target_usergroup)
--	REFERENCES user_group(id)
--	ON UPDATE CASCADE
);
-- ddl-end --
ALTER TABLE public.alert_protocol OWNER TO postgres;
-- ddl-end --

CREATE TABLE communication_type (
    id integer,
    name CHARACTER VARYING(100),
    description CHARACTER VARYING(255),
    date_created timestamp DEFAULT now(),
    CONSTRAINT communication_type_pkey PRIMARY KEY(id)
);


CREATE TABLE communication_log(
    id 				serial,
    comm_id         text,
    type 			int,
    _to 			text[],
    _from 			text,
    message 		text,
    subject 		text,
    date_created	timestamp DEFAULT NOW(),
    CONSTRAINT communication_log_pkey PRIMARY KEY (id),
    CONSTRAINT communication_log_communication_type_fkey FOREIGN KEY (type)
    REFERENCES communication_type(id)
    ON UPDATE CASCADE
);
-- object: hub_fk | type: CONSTRAINT --
-- ALTER TABLE public.hub_issue_log DROP CONSTRAINT IF EXISTS hub_fk CASCADE;
ALTER TABLE public.hub_issue_log ADD CONSTRAINT hub_fk FOREIGN KEY (hub_id)
REFERENCES public.hub (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: zone_fk | type: CONSTRAINT --
-- ALTER TABLE public.hub DROP CONSTRAINT IF EXISTS zone_fk CASCADE;
ALTER TABLE public.hub ADD CONSTRAINT zone_fk FOREIGN KEY (zone_id)
REFERENCES public.zone (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

ALTER TABLE public.hub ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customer (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.hub_customer_log ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customer (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.hub_customer_log ADD CONSTRAINT hub_fk FOREIGN KEY (hub_id)
REFERENCES public.hub (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- object: hub_fk | type: CONSTRAINT --
-- ALTER TABLE public.node DROP CONSTRAINT IF EXISTS hub_fk CASCADE;
ALTER TABLE public.node ADD CONSTRAINT hub_fk FOREIGN KEY (hub_id)
REFERENCES public.hub (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

ALTER TABLE public.node_access ADD CONSTRAINT node_fk FOREIGN KEY (node_id)
REFERENCES public.node (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public.node_access ADD CONSTRAINT user_fk FOREIGN KEY (user_id)
REFERENCES public.users (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- object: node_fk | type: CONSTRAINT --
-- ALTER TABLE public.coordinates DROP CONSTRAINT IF EXISTS node_fk CASCADE;
ALTER TABLE public.node_coordinates ADD CONSTRAINT node_fk FOREIGN KEY (node_id)
REFERENCES public.node (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

ALTER TABLE public.hub_coordinates ADD CONSTRAINT hub_fk FOREIGN KEY (hub_id)
REFERENCES public.hub (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- object: node_fk | type: CONSTRAINT --
-- ALTER TABLE public.node_issue_log DROP CONSTRAINT IF EXISTS node_fk CASCADE;
ALTER TABLE public.node_issue_log ADD CONSTRAINT node_fk FOREIGN KEY (node_id)
REFERENCES public.node (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sensor_fk | type: CONSTRAINT --
-- ALTER TABLE public.node_issue_log DROP CONSTRAINT IF EXISTS sensor_fk CASCADE;
ALTER TABLE public.node_issue_log ADD CONSTRAINT sensor_fk FOREIGN KEY (sensor_id)
REFERENCES public.sensor (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sensor_set_fk | type: CONSTRAINT --
-- ALTER TABLE public.sensor DROP CONSTRAINT IF EXISTS sensor_set_fk CASCADE;
--ALTER TABLE public.sensor ADD CONSTRAINT sensor_set_fk FOREIGN KEY (sensor_set_id)
--REFERENCES public.sensor_set (id) MATCH FULL
--ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --
ALTER TABLE public.sensor ADD CONSTRAINT sensor_node_fk FOREIGN KEY (node_id)
REFERENCES public.node(id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

-- object: user_group_fk | type: CONSTRAINT --
-- ALTER TABLE public.users_details DROP CONSTRAINT IF EXISTS user_group_fk CASCADE;
--ALTER TABLE public.users_details ADD CONSTRAINT user_group_fk FOREIGN KEY (user_group_id)
--REFERENCES public.user_group (id) MATCH FULL
--ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: roles_fk | type: CONSTRAINT --
-- ALTER TABLE public.users_details DROP CONSTRAINT IF EXISTS roles_fk CASCADE;
ALTER TABLE public.users_details ADD CONSTRAINT roles_fk FOREIGN KEY (roles_id)
REFERENCES public.roles (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: users_details_fk | type: CONSTRAINT --
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_details_fk CASCADE;
ALTER TABLE public.users ADD CONSTRAINT users_details_fk FOREIGN KEY (users_details_id)
REFERENCES public.users_details (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

ALTER TABLE public.password_reset ADD CONSTRAINT user_fk FOREIGN KEY (user_id)
REFERENCES public.users (id) MATCH FULL
ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE public.member_invitations ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customer (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;

--ALTER TABLE public.member_invitations ADD CONSTRAINT user_group_fk FOREIGN KEY (user_group_id)
--REFERENCES public.user_group (id) MATCH FULL
--ON DELETE SET NULL ON UPDATE CASCADE;

-- object: alert_notification_fk | type: CONSTRAINT --
-- ALTER TABLE public.notification_logs DROP CONSTRAINT IF EXISTS alert_notification_fk CASCADE;
ALTER TABLE public.notification_logs ADD CONSTRAINT alert_notification_fk FOREIGN KEY (alert_notification_id)
REFERENCES public.alert_notification (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: alert_settings_fk | type: CONSTRAINT --
-- ALTER TABLE public.alert_tnotification DROP CONSTRAINT IF EXISTS alert_settings_fk CASCADE;
ALTER TABLE public.alert_notification ADD CONSTRAINT alert_settings_fk FOREIGN KEY (alert_settings_id)
REFERENCES public.alert_settings (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: hub_fk | type: CONSTRAINT --
-- ALTER TABLE public.alert_settings DROP CONSTRAINT IF EXISTS hub_fk CASCADE;
-- ALTER TABLE public.alert_settings ADD CONSTRAINT hub_fk FOREIGN KEY (hub_id)
-- REFERENCES public.hub (id) MATCH FULL
-- ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: node_fk | type: CONSTRAINT --
-- ALTER TABLE public.alert_settings DROP CONSTRAINT IF EXISTS node_fk CASCADE;
-- ALTER TABLE public.alert_settings ADD CONSTRAINT node_fk FOREIGN KEY (node_id)
-- REFERENCES public.node (id) MATCH FULL
-- ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: alert_protocol_fk | type: CONSTRAINT --
-- ALTER TABLE public.alert_settings DROP CONSTRAINT IF EXISTS alert_protocol_fk CASCADE;
ALTER TABLE public.alert_settings ADD CONSTRAINT alert_protocol_fk FOREIGN KEY (alert_protocol_id)
REFERENCES public.alert_protocol (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: node_fk | type: CONSTRAINT --
-- ALTER TABLE public.transmission DROP CONSTRAINT IF EXISTS node_fk CASCADE;
--ALTER TABLE public.transmission ADD CONSTRAINT node_fk FOREIGN KEY (node_id)
--REFERENCES public.node (id) MATCH FULL
--ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: sensor_fk | type: CONSTRAINT --
-- ALTER TABLE public.transmission DROP CONSTRAINT IF EXISTS sensor_fk CASCADE;
ALTER TABLE public.transmission ADD CONSTRAINT sensor_fk FOREIGN KEY (sensor_id)
REFERENCES public.sensor (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: customer_fk | type: CONSTRAINT --
-- ALTER TABLE public.bill DROP CONSTRAINT IF EXISTS customer_fk CASCADE;
ALTER TABLE public.bill ADD CONSTRAINT customer_fk FOREIGN KEY (customer_id)
REFERENCES public.customer (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: bill_fk | type: CONSTRAINT --
-- ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS bill_fk CASCADE;
ALTER TABLE public.payments ADD CONSTRAINT bill_fk FOREIGN KEY (bill_id)
REFERENCES public.bill (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: alert_settings_fk | type: CONSTRAINT --
-- ALTER TABLE public.alarm_groups DROP CONSTRAINT IF EXISTS alert_settings_fk CASCADE;
ALTER TABLE public.alarm_groups ADD CONSTRAINT alert_settings_fk FOREIGN KEY (alert_settings_id)
REFERENCES public.alert_settings (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: alarm_groups_fk | type: CONSTRAINT --
-- ALTER TABLE public.email_notification DROP CONSTRAINT IF EXISTS alarm_groups_fk CASCADE;
ALTER TABLE public.email_notification ADD CONSTRAINT alarm_groups_fk FOREIGN KEY (alarm_groups_id)
REFERENCES public.alarm_groups (id) MATCH FULL
ON DELETE SET NULL ON UPDATE CASCADE;
-- ddl-end --

-- object: roles_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_permissions DROP CONSTRAINT IF EXISTS roles_fk CASCADE;
ALTER TABLE public.roles_permissions ADD CONSTRAINT roles_fk FOREIGN KEY (id_roles)
REFERENCES public.roles (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

-- object: permissions_fk | type: CONSTRAINT --
-- ALTER TABLE public.roles_permissions DROP CONSTRAINT IF EXISTS permissions_fk CASCADE;
ALTER TABLE public.roles_permissions ADD CONSTRAINT permissions_fk FOREIGN KEY (id_permissions)
REFERENCES public.permissions (id) MATCH FULL
ON DELETE RESTRICT ON UPDATE CASCADE;
-- ddl-end --

CREATE OR REPLACE FUNCTION public.get_distance_in_km(
latitude1 decimal(8, 6),
longitude1 decimal(9, 6),
latitude2 decimal(8, 6),
longitude2 decimal(9, 6),
OUT distance double precision
) RETURNS double precision LANGUAGE 'plpgsql'
AS $BODY$
DECLARE
  earth_radius double precision := 6371;
  dlat double precision;
  dlon double precision;
  a double precision;
  c double precision;
  d double precision;
BEGIN
earth_radius := 6371;

dlat := radians(latitude2 - latitude1);
dlon := radians(longitude2 - longitude1);

a := sin(dlat/2) * sin(dlat/2) + cos(radians(latitude1)) * cos(radians(latitude2)) * sin(dlon/2) * sin(dlon/2);
c := 2 * asin(sqrt(a));
d := earth_radius * c;

distance := d;
END $BODY$

