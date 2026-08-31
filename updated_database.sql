--
-- PostgreSQL database dump
--

\restrict N3ipNrDOdqk24FcbF0votRqUlsWEXjJaa4iKdz7sNwfrvkl9iMQrgDRT0mnYMs7

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.0

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
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: pg_cron; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION pg_cron; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_cron IS 'Job scheduler for PostgreSQL';


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_authorization_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_authorization_status AS ENUM (
    'pending',
    'approved',
    'denied',
    'expired'
);


ALTER TYPE auth.oauth_authorization_status OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_client_type AS ENUM (
    'public',
    'confidential'
);


ALTER TYPE auth.oauth_client_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


ALTER TYPE auth.oauth_registration_type OWNER TO supabase_auth_admin;

--
-- Name: oauth_response_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.oauth_response_type AS ENUM (
    'code'
);


ALTER TYPE auth.oauth_response_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_realtime_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in',
    'like',
    'ilike',
    'is',
    'match',
    'imatch',
    'isdistinct'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_realtime_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text,
	negate boolean
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_realtime_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_realtime_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_realtime_admin;

--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS',
    'VECTOR'
);


ALTER TYPE storage.buckettype OWNER TO supabase_storage_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
    revoke trigger on cron.job_run_details from postgres;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
begin
    if not exists (
        select 1
        from pg_catalog.pg_event_trigger_ddl_commands() ev
        join pg_catalog.pg_extension e on ev.objid = e.oid
        where e.extname = 'pg_graphql'
    ) then
        return;
    end if;

    drop function if exists graphql_public.graphql;
    create or replace function graphql_public.graphql(
        "operationName" text default null,
        query text default null,
        variables jsonb default null,
        extensions jsonb default null
    )
        returns jsonb
        language sql
        set search_path to ''
    as $$
        select graphql.resolve(
            query := query,
            variables := coalesce(variables, '{}'),
            "operationName" := "operationName",
            extensions := extensions
        );
    $$;

    -- Attach the wrapper to the extension so DROP EXTENSION cascades to it,
    -- which in turn triggers set_graphql_placeholder to reinstall the "not enabled" stub.
    alter extension pg_graphql add function graphql_public.graphql(text, text, jsonb, jsonb);

    grant usage on schema graphql to postgres, anon, authenticated, service_role;
    grant execute on function graphql.resolve to postgres, anon, authenticated, service_role;
    grant usage on schema graphql to postgres with grant option;
    grant usage on schema graphql_public to postgres with grant option;
end;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8.0', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO ''
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
            set search_path to ''
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: graphql(text, text, jsonb, jsonb); Type: FUNCTION; Schema: graphql_public; Owner: supabase_admin
--

CREATE FUNCTION graphql_public.graphql("operationName" text DEFAULT NULL::text, query text DEFAULT NULL::text, variables jsonb DEFAULT NULL::jsonb, extensions jsonb DEFAULT NULL::jsonb) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;


ALTER FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) OWNER TO supabase_admin;

--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: supabase_admin
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $_$
  BEGIN
      RAISE DEBUG 'PgBouncer auth request: %', p_usename;

      RETURN QUERY
      SELECT
          rolname::text,
          CASE WHEN rolvaliduntil < now()
              THEN null
              ELSE rolpassword::text
          END
      FROM pg_authid
      WHERE rolname=$1 and rolcanlogin;
  END;
  $_$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO supabase_admin;

--
-- Name: extract_nic_details(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.extract_nic_details() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    nic_text text;
    year_val int;
    days_val int;
    is_female boolean := false;
    is_leap boolean := false;
    months int[];
    m_idx int;
    m int := 1;
    d int;
begin
    nic_text := trim(new.nic);
    
    -- නව NIC (අංක 12) හෝ පැරණි NIC (අංක 10) පරීක්ෂා කිරීම
    if length(nic_text) = 12 then
        year_val := substring(nic_text from 1 for 4)::int;
        days_val := substring(nic_text from 5 for 3)::int;
    elsif length(nic_text) = 10 then
        year_val := ('19' || substring(nic_text from 1 for 2))::int;
        days_val := substring(nic_text from 3 for 3)::int;
    else
        return new;
    end if;

    -- කාන්තා නම් දින ගණනින් 500ක් අඩු කිරීම
    if days_val > 500 then
        is_female := true;
        days_val := days_val - 500;
        new.gender := 'Female';
    else
        new.gender := 'Male';
    end if;

    -- ලීප් අවුරුද්දක්ද යන්න පරීක්ෂා කිරීම
    is_leap := (year_val % 4 = 0 and year_val % 100 <> 0) or (year_val % 400 = 0);
    
    if is_leap then
        months := ARRAY[31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    else
        months := ARRAY[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    end if;

    d := days_val;

    if d > 0 and d < 366 then
        for m_idx in 1..12 loop
            if d <= months[m_idx] then
                m := m_idx;
                exit;
            end if;
            d := d - months[m_idx];
        end loop;

        -- නිවැරදි දිනය date format එකට සකස් කිරීම
        new.birthday := make_date(year_val, m, d);
    end if;

    return new;
end;
$$;


ALTER FUNCTION public.extract_nic_details() OWNER TO postgres;

--
-- Name: notify_coverage_officer(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_coverage_officer() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare requester_name text;
begin
  if new.coverage_officer_id is null then return new; end if;

  select coalesce(full_name_si, full_name, 'නිලධාරියෙකු')
    into requester_name
  from public.users where id = new.user_id;

  insert into public.notifications (
    user_id,title,message,is_read,is_auto_generated,created_by,created_at,
    notification_type,related_entity,related_id,
    title_en,title_si,title_ta,message_en,message_si,message_ta
  ) values (
    new.coverage_officer_id,
    'Duty Coverage Request',
    requester_name || ' selected you for duty coverage on ' || new.start_date || '.',
    false,true,new.user_id,now(),
    'duty_coverage','leave_requests',new.id,
    'Duty Coverage Request','රාජකාරි ආවරණ ඉල්ලීමක්','பணி பொறுப்பு கோரிக்கை',
    requester_name || ' selected you for duty coverage on ' || new.start_date || '.',
    requester_name || ' විසින් ' || new.start_date || ' දින රාජකාරි ආවරණය සඳහා ඔබව තෝරා ඇත.',
    requester_name || ' உங்களை ' || new.start_date || ' அன்று பணி பொறுப்பிற்காக தேர்ந்தெடுத்துள்ளார்.'
  );
  return new;
end;
$$;


ALTER FUNCTION public.notify_coverage_officer() OWNER TO postgres;

--
-- Name: notify_leave_final_status(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_leave_final_status() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
declare requester_name text;
begin
  if old.status is not distinct from new.status then return new; end if;
  if lower(coalesce(new.status,'')) not in ('approved','rejected','cancelled') then return new; end if;

  insert into public.notifications (
    user_id,title,message,is_read,is_auto_generated,created_by,created_at,
    notification_type,related_entity,related_id
  ) values (
    new.user_id,
    case when lower(new.status)='approved' then 'Leave Approved' else 'Leave Request Updated' end,
    case when lower(new.status)='approved'
      then 'Your leave request for ' || new.start_date || ' has been approved.'
      else 'Your leave request for ' || new.start_date || ' was ' || new.status || '.' end,
    false,true,new.final_approved_by,now(),
    'leave','leave_requests',new.id
  );

  if new.coverage_officer_id is not null then
    select coalesce(full_name_si,full_name,'The officer') into requester_name
    from public.users where id=new.user_id;

    insert into public.notifications (
      user_id,title,message,is_read,is_auto_generated,created_by,created_at,
      notification_type,related_entity,related_id
    ) values (
      new.coverage_officer_id,
      case when lower(new.status)='approved' then 'Duty Coverage Confirmed' else 'Duty Coverage Update' end,
      case when lower(new.status)='approved'
        then requester_name || ' leave for ' || new.start_date || ' has been approved. Duty coverage is confirmed.'
        else requester_name || ' leave request for ' || new.start_date || ' was ' || new.status || '.' end,
      false,true,new.final_approved_by,now(),
      'duty_coverage','leave_requests',new.id
    );
  end if;

  return new;
end;
$$;


ALTER FUNCTION public.notify_leave_final_status() OWNER TO postgres;

--
-- Name: notify_subject_officer_on_leave(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.notify_subject_officer_on_leave() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  subject_officer_id UUID;
  emp_name TEXT;
  
  -- භාෂා 3ට අදාළ මාතෘකා සහ පණිවිඩ
  t_en TEXT := 'Leave Approval Required';
  t_si TEXT := 'නිවාඩු අනුමැතිය අවශ්‍ය වේ';
  t_ta TEXT := 'விடுப்பு ஒப்புதல் தேவை';
  
  m_en TEXT;
  m_si TEXT;
  m_ta TEXT;
BEGIN
  -- Subject Officer ගේ ID එක සොයා ගැනීම (role_id = 4)
  SELECT id INTO subject_officer_id FROM users WHERE role_id = 4 AND is_active = true LIMIT 1;

  -- ලීව් එක දැමූ සේවකයාගේ නම සොයා ගැනීම
  SELECT full_name INTO emp_name FROM users WHERE id = NEW.user_id;

  -- පණිවිඩ සකස් කිරීම
  m_en := 'New leave request from ' || COALESCE(emp_name, 'Employee') || ' requires your review.';
  m_si := COALESCE(emp_name, 'සේවකයා') || ' වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.';
  m_ta := COALESCE(emp_name, 'ஊழியர்') || ' இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.';

  -- Subject Officer කෙනෙක් සිටී නම් Notification එක සෑදීම
  IF subject_officer_id IS NOT NULL THEN
    INSERT INTO notifications (
      user_id,
      title,
      message,
      title_en,
      title_si,
      title_ta,
      message_en,
      message_si,
      message_ta,
      notification_key,
      payload,
      notification_type,
      related_entity,
      related_id,
      is_auto_generated,
      is_for_mobile,
      is_read,
      created_by,
      created_at
    ) VALUES (
      subject_officer_id,
      t_en,
      m_en,
      t_en,
      t_si,
      t_ta,
      m_en,
      m_si,
      m_ta,
      'leave_requires_approval',
      jsonb_build_object('employee_name', COALESCE(emp_name, 'Employee')),
      'Leave',
      'leave_requests',
      NEW.id,
      true,
      false, -- Web පැනල් එකේ පෙන්වීමට false ලෙස
      false,
      NEW.user_id,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION public.notify_subject_officer_on_leave() OWNER TO postgres;

--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.rls_auto_enable() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION public.rls_auto_enable() OWNER TO postgres;

--
-- Name: validate_new_leave_request(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_new_leave_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  if exists (
    select 1 from public.leave_requests lr
    where lr.user_id = new.user_id
      and lower(replace(coalesce(lr.status,''), '_', ' ')) in
      ('pending','admin review','under review','admin approved','praja reviewed','supervisor review')
  ) then
    raise exception 'A previous leave request is still being processed.';
  end if;

  if exists (
    select 1 from public.leave_requests lr
    where lr.user_id = new.user_id
      and lower(coalesce(lr.status,'')) = 'approved'
      and current_date between lr.start_date and lr.end_date
  ) then
    raise exception 'The user already has approved leave for today.';
  end if;

  return new;
end;
$$;


ALTER FUNCTION public.validate_new_leave_request() OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
    -- Regclass of the table e.g. public.notes
    entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

    -- I, U, D, T: insert, update ...
    action realtime.action = (
        case wal ->> 'action'
            when 'I' then 'INSERT'
            when 'U' then 'UPDATE'
            when 'D' then 'DELETE'
            else 'ERROR'
        end
    );

    -- Is row level security enabled for the table
    is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

    subscriptions realtime.subscription[] = array_agg(subs)
        from
            realtime.subscription subs
        where
            subs.entity = entity_
            -- Filter by action early - only get subscriptions interested in this action
            -- action_filter column can be: '*' (all), 'INSERT', 'UPDATE', or 'DELETE'
            and (subs.action_filter = '*' or subs.action_filter = action::text);

    -- Subscription vars
    working_role regrole;
    working_selected_columns text[];
    claimed_role regrole;
    claims jsonb;

    subscription_id uuid;
    subscription_has_access bool;
    visible_to_subscription_ids uuid[] = '{}';

    -- structured info for wal's columns
    columns realtime.wal_column[];
    -- previous identity values for update/delete
    old_columns realtime.wal_column[];

    error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

    -- Primary jsonb output for record
    output jsonb;

    -- Loop record for iterating unique roles (outer loop)
    role_record record;
    -- Loop record for iterating unique selected_columns within a role (inner loop)
    cols_record record;
    -- Subscription ids visible at the role level (before fanning out by selected_columns)
    visible_role_sub_ids uuid[] = '{}';

begin
    perform set_config('role', null, true);

    columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'columns') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    old_columns =
        array_agg(
            (
                x->>'name',
                x->>'type',
                x->>'typeoid',
                realtime.cast(
                    (x->'value') #>> '{}',
                    coalesce(
                        (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                        (x->>'type')::regtype
                    )
                ),
                (pks ->> 'name') is not null,
                true
            )::realtime.wal_column
        )
        from
            jsonb_array_elements(wal -> 'identity') x
            left join jsonb_array_elements(wal -> 'pk') pks
                on (x ->> 'name') = (pks ->> 'name');

    for role_record in
        select claims_role
        from (select distinct claims_role from unnest(subscriptions)) t
        order by claims_role::text
    loop
        working_role := role_record.claims_role;

        -- Update `is_selectable` for columns and old_columns (once per role)
        columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(columns) c;

        old_columns =
                array_agg(
                    (
                        c.name,
                        c.type_name,
                        c.type_oid,
                        c.value,
                        c.is_pkey,
                        pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                    )::realtime.wal_column
                )
                from
                    unnest(old_columns) c;

        if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
            -- Fan out 400 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 400: Bad Request, no primary key']
                )::realtime.wal_rls;
            end loop;

        -- The claims role does not have SELECT permission to the primary key of entity
        elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
            -- Fan out 401 error per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;
                return next (
                    jsonb_build_object(
                        'schema', wal ->> 'schema',
                        'table', wal ->> 'table',
                        'type', action
                    ),
                    is_rls_enabled,
                    (select array_agg(s.subscription_id) from unnest(subscriptions) as s where s.claims_role = working_role and (s.selected_columns is not distinct from working_selected_columns)),
                    array['Error 401: Unauthorized']
                )::realtime.wal_rls;
            end loop;

        else
            -- Create the prepared statement (once per role)
            if is_rls_enabled and action <> 'DELETE' then
                if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                    deallocate walrus_rls_stmt;
                end if;
                execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
            end if;

            -- Collect all visible subscription IDs for this role (filter check + RLS check)
            visible_role_sub_ids = '{}';

            for subscription_id, claims in (
                    select
                        subs.subscription_id,
                        subs.claims
                    from
                        unnest(subscriptions) subs
                    where
                        subs.entity = entity_
                        and subs.claims_role = working_role
                        and (
                            realtime.is_visible_through_filters(columns, subs.filters)
                            or (
                              action = 'DELETE'
                              and realtime.is_visible_through_filters(old_columns, subs.filters)
                            )
                        )
            ) loop

                if not is_rls_enabled or action = 'DELETE' then
                    visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                else
                    -- Check if RLS allows the role to see the record
                    perform
                        -- Trim leading and trailing quotes from working_role because set_config
                        -- doesn't recognize the role as valid if they are included
                        set_config('role', trim(both '"' from working_role::text), true),
                        set_config('request.jwt.claims', claims::text, true);

                    execute 'execute walrus_rls_stmt' into subscription_has_access;

                    -- Reset the role on every FOR..LOOP batch execution.
                    -- The first batch of 10 rows is pre-fetched using the current connection role (PG internal behaviour)
                    -- then we have to reset it again otherwise it would use the role defined in the `set_config` above
                    -- to fetch the remaining rows when rows>10, which could be a user-defined role that lacks execution grants.
                    -- The flow is:
                    --   1. run batch with conn role
                    --   2. set_config working_role
                    --   3. execute walrus
                    --   4. reset role (revert)
                    --   5. repeat
                    perform set_config('role', null, true);

                    if subscription_has_access then
                        visible_role_sub_ids = visible_role_sub_ids || subscription_id;
                    end if;
                end if;
            end loop;

            perform set_config('role', null, true);

            -- Inner loop: per distinct selected_columns for this role
            for cols_record in
                select selected_columns
                from (select distinct selected_columns from unnest(subscriptions) s where s.claims_role = working_role) t
                order by coalesce(array_to_string(selected_columns, ','), '')
            loop
                working_selected_columns := cols_record.selected_columns;

                output = jsonb_build_object(
                    'schema', wal ->> 'schema',
                    'table', wal ->> 'table',
                    'type', action,
                    'commit_timestamp', to_char(
                        ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                        'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
                    ),
                    'columns', (
                        select
                            jsonb_agg(
                                jsonb_build_object(
                                    'name', pa.attname,
                                    'type', pt.typname
                                )
                                order by pa.attnum asc
                            )
                        from
                            pg_attribute pa
                            join pg_type pt
                                on pa.atttypid = pt.oid
                            left join (
                                select unnest(conkey) as pkey_attnum
                                from pg_constraint
                                where conrelid = entity_ and contype = 'p'
                            ) pk on pk.pkey_attnum = pa.attnum
                        where
                            attrelid = entity_
                            and attnum > 0
                            and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
                            and (working_selected_columns is null or pa.attname = any(working_selected_columns) or pk.pkey_attnum is not null)
                    )
                )
                -- Add "record" key for insert and update
                || case
                    when action in ('INSERT', 'UPDATE') then
                        jsonb_build_object(
                            'record',
                            (
                                select
                                    jsonb_object_agg(
                                        -- if unchanged toast, get column name and value from old record
                                        coalesce((c).name, (oc).name),
                                        case
                                            when (c).name is null then (oc).value
                                            else (c).value
                                        end
                                    )
                                from
                                    unnest(columns) c
                                    full outer join unnest(old_columns) oc
                                        on (c).name = (oc).name
                                where
                                    coalesce((c).is_selectable, (oc).is_selectable)
                                    and (working_selected_columns is null or coalesce((c).name, (oc).name) = any(working_selected_columns) or coalesce((c).is_pkey, (oc).is_pkey))
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            )
                        )
                    else '{}'::jsonb
                end
                -- Add "old_record" key for update and delete
                || case
                    when action = 'UPDATE' then
                        jsonb_build_object(
                                'old_record',
                                (
                                    select jsonb_object_agg((c).name, (c).value)
                                    from unnest(old_columns) c
                                    where
                                        (c).is_selectable
                                        and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                        and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                )
                            )
                    when action = 'DELETE' then
                        jsonb_build_object(
                            'old_record',
                            (
                                select jsonb_object_agg((c).name, (c).value)
                                from unnest(old_columns) c
                                where
                                    (c).is_selectable
                                    and (working_selected_columns is null or (c).name = any(working_selected_columns) or (c).is_pkey)
                                    and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                                    and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                            )
                        )
                    else '{}'::jsonb
                end;

                -- Filter visible_role_sub_ids to those matching the current selected_columns group
                visible_to_subscription_ids = coalesce(
                    (
                        select array_agg(s.subscription_id)
                        from unnest(subscriptions) s
                        where s.claims_role = working_role
                          and (s.selected_columns is not distinct from working_selected_columns)
                          and s.subscription_id = any(visible_role_sub_ids)
                    ),
                    '{}'::uuid[]
                );

                return next (
                    output,
                    is_rls_enabled,
                    visible_to_subscription_ids,
                    case
                        when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                        else '{}'
                    end
                )::realtime.wal_rls;
            end loop;

        end if;
    end loop;

    perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_realtime_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_realtime_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
declare
  res jsonb;
begin
  if type_::text = 'bytea' then
    return to_jsonb(val);
  end if;
  execute format('select to_jsonb(%L::'|| type_::text || ')', val) into res;
  return res;
end
$$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
/*
Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
*/
declare
    op_symbol text = (
        case
            when op = 'eq' then '='
            when op = 'neq' then '!='
            when op = 'lt' then '<'
            when op = 'lte' then '<='
            when op = 'gt' then '>'
            when op = 'gte' then '>='
            when op = 'in' then '= any'
            else 'UNKNOWN OP'
        end
    );
    res boolean;
begin
    execute format(
        'select %L::'|| type_::text || ' ' || op_symbol
        || ' ( %L::'
        || (
            case
                when op = 'in' then type_::text || '[]'
                else type_::text end
        )
        || ')', val_1, val_2) into res;
    return res;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_realtime_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
declare
    op_symbol text;
    res boolean;
begin
    -- IS DISTINCT FROM / IS NOT DISTINCT FROM: infix, both sides typed literals
    if op = 'isdistinct' then
        execute format(
            'select %L::%s %s %L::%s',
            val_1,
            type_::text,
            case when negate then 'IS NOT DISTINCT FROM' else 'IS DISTINCT FROM' end,
            val_2,
            type_::text
        ) into res;
        return res;
    end if;

    -- IS requires a keyword RHS (NULL, TRUE, FALSE, UNKNOWN), not a typed literal
    if op = 'is' then
        if val_2 not in ('null', 'true', 'false', 'unknown') then
            raise exception 'invalid value for is filter: must be null, true, false, or unknown';
        end if;
        execute format(
            'select %L::%s %s %s',
            val_1,
            type_::text,
            case when negate then 'IS NOT' else 'IS' end,
            upper(val_2)
        ) into res;
        return res;
    end if;

    op_symbol = case
        when op = 'eq'    then '='
        when op = 'neq'   then '!='
        when op = 'lt'    then '<'
        when op = 'lte'   then '<='
        when op = 'gt'    then '>'
        when op = 'gte'   then '>='
        when op = 'in'    then '= any'
        when op = 'like'   then 'LIKE'
        when op = 'ilike'  then 'ILIKE'
        when op = 'match'  then '~'
        when op = 'imatch' then '~*'
        else null
    end;

    if op_symbol is null then
        raise exception 'unsupported equality operator: %', op::text;
    end if;

    execute format(
        'select %L::%s %s (%L::%s)',
        val_1,
        type_::text,
        op_symbol,
        val_2,
        case when op = 'in' then type_::text || '[]' else type_::text end
    ) into res;

    return case when negate then not res else res end;
end;
$$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) OWNER TO supabase_realtime_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    select
        filters is null
        or array_length(filters, 1) is null
        or coalesce(
            count(col.name) = count(1)
            and sum(
                realtime.check_equality_op(
                    op:=f.op,
                    type_:=coalesce(col.type_oid::regtype, col.type_name::regtype),
                    val_1:=col.value #>> '{}',
                    val_2:=f.value,
                    negate:=coalesce(f.negate, false)
                )::int
            ) filter (where col.name is not null) = count(col.name),
            false
        )
    from
        unnest(filters) f
        left join unnest(columns) col
            on f.column_name = col.name;
$$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_realtime_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS TABLE(wal jsonb, is_rls_enabled boolean, subscription_ids uuid[], errors text[], slot_changes_count bigint)
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
  WITH pub AS (
    SELECT
      concat_ws(
        ',',
        CASE WHEN bool_or(pubinsert) THEN 'insert' ELSE NULL END,
        CASE WHEN bool_or(pubupdate) THEN 'update' ELSE NULL END,
        CASE WHEN bool_or(pubdelete) THEN 'delete' ELSE NULL END
      ) AS w2j_actions,
      coalesce(
        string_agg(
          realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
          ','
        ) filter (WHERE ppt.tablename IS NOT NULL),
        ''
      ) AS w2j_add_tables
    FROM pg_publication pp
    LEFT JOIN pg_publication_tables ppt ON pp.pubname = ppt.pubname
    WHERE pp.pubname = publication
    GROUP BY pp.pubname
    LIMIT 1
  ),
  -- MATERIALIZED ensures pg_logical_slot_get_changes is called exactly once
  w2j AS MATERIALIZED (
    SELECT x.*, pub.w2j_add_tables
    FROM pub,
         pg_logical_slot_get_changes(
           slot_name, null, max_changes,
           'include-pk', 'true',
           'include-transaction', 'false',
           'include-timestamp', 'true',
           'include-type-oids', 'true',
           'format-version', '2',
           'actions', pub.w2j_actions,
           'add-tables', pub.w2j_add_tables
         ) x
  ),
  slot_count AS (
    SELECT count(*)::bigint AS cnt
    FROM w2j
    WHERE w2j.w2j_add_tables <> ''
  ),
  rls_filtered AS (
    SELECT xyz.wal, xyz.is_rls_enabled, xyz.subscription_ids, xyz.errors
    FROM w2j,
         realtime.apply_rls(
           wal := w2j.data::jsonb,
           max_record_bytes := max_record_bytes
         ) xyz(wal, is_rls_enabled, subscription_ids, errors)
    WHERE w2j.w2j_add_tables <> ''
      AND xyz.subscription_ids[1] IS NOT NULL
  )
  SELECT rf.wal, rf.is_rls_enabled, rf.subscription_ids, rf.errors, sc.cnt
  FROM rls_filtered rf, slot_count sc

  UNION ALL

  SELECT null, null, null, null, sc.cnt
  FROM slot_count sc
  WHERE NOT EXISTS (SELECT 1 FROM rls_filtered)
$$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_realtime_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  SELECT
    realtime.wal2json_escape_identifier(nsp.nspname::text)
    || '.'
    || realtime.wal2json_escape_identifier(pc.relname::text)
  FROM pg_class pc
  JOIN pg_namespace nsp ON pc.relnamespace = nsp.oid
  WHERE pc.oid = entity
$$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_realtime_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
  final_payload jsonb;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    -- Check if payload has an 'id' key, if not, add the generated UUID
    IF payload ? 'id' THEN
      final_payload := payload;
    ELSE
      final_payload := jsonb_set(payload, '{id}', to_jsonb(generated_id));
    END IF;

    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, payload, event, topic, private, extension)
    VALUES (generated_id, final_payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: send_binary(bytea, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  generated_id uuid;
BEGIN
  BEGIN
    generated_id := gen_random_uuid();

    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    INSERT INTO realtime.messages (id, binary_payload, event, topic, private, extension)
    VALUES (generated_id, payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'WarnSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) OWNER TO supabase_realtime_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
    col_names text[] = coalesce(
            array_agg(a.attname order by a.attnum),
            '{}'::text[]
        )
        from
            pg_catalog.pg_attribute a
        where
            a.attrelid = new.entity
            and a.attnum > 0
            and not a.attisdropped
            and pg_catalog.has_column_privilege(
                (new.claims ->> 'role'),
                a.attrelid,
                a.attnum,
                'SELECT'
            );
    filter realtime.user_defined_filter;
    col_type regtype;
    in_val jsonb;
    selected_col text;
begin
    for filter in select * from unnest(new.filters) loop
        if not filter.column_name = any(col_names) then
            raise exception 'invalid column for filter %', filter.column_name;
        end if;

        col_type = (
            select atttypid::regtype
            from pg_catalog.pg_attribute
            where attrelid = new.entity
                  and attname = filter.column_name
        );
        if col_type is null then
            raise exception 'failed to lookup type for column %', filter.column_name;
        end if;

        if filter.op = 'in'::realtime.equality_op then
            in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
            if coalesce(jsonb_array_length(in_val), 0) > 100 then
                raise exception 'too many values for `in` filter. Maximum 100';
            end if;
        elsif filter.op = 'is'::realtime.equality_op then
            -- `is` requires a keyword RHS rather than a typed literal
            if filter.value not in ('null', 'true', 'false', 'unknown') then
                raise exception 'invalid value for is filter: must be null, true, false, or unknown';
            end if;
            -- IS NULL works for any type, but IS TRUE/FALSE/UNKNOWN require a boolean
            -- operand. Reject the non-null keywords on non-boolean columns here so they
            -- don't abort apply_rls at WAL time.
            if filter.value <> 'null' and col_type <> 'boolean'::regtype then
                raise exception 'is % filter requires a boolean column, got %', filter.value, col_type::text;
            end if;
        elsif filter.op in ('like'::realtime.equality_op, 'ilike'::realtime.equality_op) then
            -- like/ilike apply the text pattern operator (~~); reject column types that
            -- have no such operator instead of failing at WAL time
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = '~~' and oprleft = col_type
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
        elsif filter.op in ('match'::realtime.equality_op, 'imatch'::realtime.equality_op) then
            -- match/imatch apply the regex operators ~ / ~*; reject column types that have
            -- no such operator (e.g. integer) instead of failing at WAL time, mirroring the
            -- like/ilike guard above.
            if not exists (
                select 1 from pg_catalog.pg_operator
                where oprname = case when filter.op = 'imatch'::realtime.equality_op then '~*' else '~' end
                  and oprleft = col_type
                  and oprright = col_type
                  and oprresult = 'boolean'::regtype
            ) then
                raise exception 'operator % requires a text-compatible column type, got %', filter.op::text, col_type::text;
            end if;
            -- validate the regex eagerly so a bad pattern is rejected here, not inside
            -- apply_rls where it would abort the WAL stream for the entity
            begin
                perform '' ~ filter.value;
            exception when others then
                raise exception 'invalid regular expression for % filter: %', filter.op::text, sqlerrm;
            end;
        else
            -- eq/neq/lt/lte/gt/gte: value must be coercable to the type
            perform realtime.cast(filter.value, col_type);
        end if;
    end loop;

    if new.selected_columns is not null then
        for selected_col in select * from unnest(new.selected_columns) loop
            if not selected_col = any(col_names) then
                raise exception 'invalid column for select %', selected_col;
            end if;
        end loop;
    end if;

    -- Apply consistent order to filters so the unique constraint can't be tricked by a
    -- different filter order. negate is part of the sort key.
    new.filters = coalesce(
        array_agg(f order by f.column_name, f.op, f.value, f.negate),
        '{}'
    ) from unnest(new.filters) f;

    new.selected_columns = (
        select array_agg(c order by c)
        from unnest(new.selected_columns) c
    );

    return new;
end;
$$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_realtime_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_realtime_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: wal2json_escape_identifier(text); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.wal2json_escape_identifier(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
  -- Prefix `\`, `,`, `.`, and any whitespace with `\`
  SELECT regexp_replace(name, '([\\,.[:space:]])', '\\\1', 'g')
$$;


ALTER FUNCTION realtime.wal2json_escape_identifier(name text) OWNER TO supabase_realtime_admin;

--
-- Name: allow_any_operation(text[]); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_any_operation(expected_operations text[]) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT CASE
      WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
      ELSE raw_operation
    END AS current_operation
    FROM current_operation
  )
  SELECT EXISTS (
    SELECT 1
    FROM normalized n
    CROSS JOIN LATERAL unnest(expected_operations) AS expected_operation
    WHERE expected_operation IS NOT NULL
      AND expected_operation <> ''
      AND n.current_operation = CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END
  );
$$;


ALTER FUNCTION storage.allow_any_operation(expected_operations text[]) OWNER TO supabase_storage_admin;

--
-- Name: allow_only_operation(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.allow_only_operation(expected_operation text) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  WITH current_operation AS (
    SELECT storage.operation() AS raw_operation
  ),
  normalized AS (
    SELECT
      CASE
        WHEN raw_operation LIKE 'storage.%' THEN substr(raw_operation, 9)
        ELSE raw_operation
      END AS current_operation,
      CASE
        WHEN expected_operation LIKE 'storage.%' THEN substr(expected_operation, 9)
        ELSE expected_operation
      END AS requested_operation
    FROM current_operation
  )
  SELECT CASE
    WHEN requested_operation IS NULL OR requested_operation = '' THEN FALSE
    ELSE COALESCE(current_operation = requested_operation, FALSE)
  END
  FROM normalized;
$$;


ALTER FUNCTION storage.allow_only_operation(expected_operation text) OWNER TO supabase_storage_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


ALTER FUNCTION storage.enforce_bucket_name_length() OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Get the last path segment (the actual filename)
    SELECT _parts[array_length(_parts, 1)] INTO _filename;
    -- Extract extension: reverse, split on '.', then reverse again
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    RETURN _parts[array_length(_parts, 1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_common_prefix(text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) RETURNS text
    LANGUAGE sql IMMUTABLE
    AS $$
SELECT CASE
    WHEN position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)) > 0
    THEN left(p_key, length(p_prefix) + position(p_delimiter IN substring(p_key FROM length(p_prefix) + 1)))
    ELSE NULL
END;
$$;


ALTER FUNCTION storage.get_common_prefix(p_key text, p_prefix text, p_delimiter text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint)::bigint as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;

    -- Configuration
    v_is_asc BOOLEAN;
    v_prefix TEXT;
    v_start TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_is_asc := lower(coalesce(sort_order, 'asc')) = 'asc';
    v_prefix := coalesce(prefix_param, '');
    v_start := CASE WHEN coalesce(next_token, '') <> '' THEN next_token ELSE coalesce(start_after, '') END;
    v_file_batch_size := LEAST(GREATEST(max_keys * 2, 100), 1000);

    -- Calculate upper bound for prefix filtering (bytewise, using COLLATE "C")
    IF v_prefix = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix, 1) = delimiter_param THEN
        v_upper_bound := left(v_prefix, -1) || chr(ascii(delimiter_param) + 1);
    ELSE
        v_upper_bound := left(v_prefix, -1) || chr(ascii(right(v_prefix, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'AND o.name COLLATE "C" < $3 ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" >= $2 ' ||
                'ORDER BY o.name COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'AND o.name COLLATE "C" >= $3 ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND o.name COLLATE "C" < $2 ' ||
                'ORDER BY o.name COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- ========================================================================
    -- SEEK INITIALIZATION: Determine starting position
    -- ========================================================================
    IF v_start = '' THEN
        IF v_is_asc THEN
            v_next_seek := v_prefix;
        ELSE
            -- DESC without cursor: find the last item in range
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_next_seek FROM storage.objects o
                WHERE o.bucket_id = _bucket_id
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;

            IF v_next_seek IS NOT NULL THEN
                v_next_seek := v_next_seek || delimiter_param;
            ELSE
                RETURN;
            END IF;
        END IF;
    ELSE
        -- Cursor provided: determine if it refers to a folder or leaf
        IF EXISTS (
            SELECT 1 FROM storage.objects o
            WHERE o.bucket_id = _bucket_id
              AND o.name COLLATE "C" LIKE v_start || delimiter_param || '%'
            LIMIT 1
        ) THEN
            -- Cursor refers to a folder
            IF v_is_asc THEN
                v_next_seek := v_start || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_start || delimiter_param;
            END IF;
        ELSE
            -- Cursor refers to a leaf object
            IF v_is_asc THEN
                v_next_seek := v_start || delimiter_param;
            ELSE
                v_next_seek := v_start;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= max_keys;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek AND o.name COLLATE "C" < v_upper_bound
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" >= v_next_seek
                ORDER BY o.name COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek AND o.name COLLATE "C" >= v_prefix
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = _bucket_id AND o.name COLLATE "C" < v_next_seek
                ORDER BY o.name COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(v_peek_name, v_prefix, delimiter_param);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Emit and skip to next folder (no heap access needed)
            name := rtrim(v_common_prefix, delimiter_param);
            id := NULL;
            updated_at := NULL;
            created_at := NULL;
            last_accessed_at := NULL;
            metadata := NULL;
            RETURN NEXT;
            v_count := v_count + 1;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := left(v_common_prefix, -1) || chr(ascii(delimiter_param) + 1);
            ELSE
                v_next_seek := v_common_prefix;
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query USING _bucket_id, v_next_seek,
                CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix) ELSE v_prefix END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(v_current.name, v_prefix, delimiter_param);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := v_current.name;
                    EXIT;
                END IF;

                -- Emit file
                name := v_current.name;
                id := v_current.id;
                updated_at := v_current.updated_at;
                created_at := v_current.created_at;
                last_accessed_at := v_current.last_accessed_at;
                metadata := v_current.metadata;
                RETURN NEXT;
                v_count := v_count + 1;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := v_current.name || delimiter_param;
                ELSE
                    v_next_seek := v_current.name;
                END IF;

                EXIT WHEN v_count >= max_keys;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(_bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text, sort_order text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: protect_delete(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.protect_delete() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Check if storage.allow_delete_query is set to 'true'
    IF COALESCE(current_setting('storage.allow_delete_query', true), 'false') != 'true' THEN
        RAISE EXCEPTION 'Direct deletion from storage tables is not allowed. Use the Storage API instead.'
            USING HINT = 'This prevents accidental data loss from orphaned objects.',
                  ERRCODE = '42501';
    END IF;
    RETURN NULL;
END;
$$;


ALTER FUNCTION storage.protect_delete() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_peek_name TEXT;
    v_current RECORD;
    v_common_prefix TEXT;
    v_delimiter CONSTANT TEXT := '/';

    -- Configuration
    v_limit INT;
    v_prefix TEXT;
    v_prefix_lower TEXT;
    v_prefix_len INT;
    v_prefix_start INT;
    v_combined_levels INT;
    v_is_asc BOOLEAN;
    v_order_by TEXT;
    v_sort_order TEXT;
    v_upper_bound TEXT;
    v_file_batch_size INT;

    -- Dynamic SQL for batch query only
    v_batch_query TEXT;

    -- Seek state
    v_next_seek TEXT;
    v_count INT := 0;
    v_skipped INT := 0;
BEGIN
    -- ========================================================================
    -- INITIALIZATION
    -- ========================================================================
    v_limit := LEAST(coalesce(limits, 100), 1500);
    v_prefix := coalesce(prefix, '') || coalesce(search, '');
    v_prefix_lower := lower(v_prefix);
    v_prefix_len := length(coalesce(prefix, ''));
    v_prefix_start := coalesce(array_length(string_to_array(coalesce(prefix, ''), v_delimiter), 1), 1);
    v_combined_levels := coalesce(array_length(string_to_array(v_prefix, v_delimiter), 1), 1);
    v_is_asc := lower(coalesce(sortorder, 'asc')) = 'asc';
    v_file_batch_size := LEAST(GREATEST(v_limit * 2, 100), 1000);

    -- Validate sort column
    CASE lower(coalesce(sortcolumn, 'name'))
        WHEN 'name' THEN v_order_by := 'name';
        WHEN 'updated_at' THEN v_order_by := 'updated_at';
        WHEN 'created_at' THEN v_order_by := 'created_at';
        WHEN 'last_accessed_at' THEN v_order_by := 'last_accessed_at';
        ELSE v_order_by := 'name';
    END CASE;

    v_sort_order := CASE WHEN v_is_asc THEN 'asc' ELSE 'desc' END;

    -- ========================================================================
    -- NON-NAME SORTING: Use path_tokens approach
    -- ========================================================================
    IF v_order_by != 'name' THEN
        RETURN QUERY EXECUTE format(
            $sql$
            WITH folders AS (
                SELECT array_to_string(path_tokens[$1:$2], '/') AS folder
                FROM storage.objects
                WHERE objects.name ILIKE $3 || '%%'
                  AND bucket_id = $4
                  AND array_length(objects.path_tokens, 1) <> $2
                GROUP BY folder
                ORDER BY folder %s
            )
            (SELECT folder AS "name",
                   NULL::uuid AS id,
                   NULL::timestamptz AS updated_at,
                   NULL::timestamptz AS created_at,
                   NULL::timestamptz AS last_accessed_at,
                   NULL::jsonb AS metadata FROM folders)
            UNION ALL
            (SELECT array_to_string(path_tokens[$1:$2], '/') AS "name",
                   id, updated_at, created_at, last_accessed_at, metadata
             FROM storage.objects
             WHERE objects.name ILIKE $3 || '%%'
               AND bucket_id = $4
               AND array_length(objects.path_tokens, 1) = $2
             ORDER BY %I %s)
            LIMIT $5 OFFSET $6
            $sql$, v_sort_order, v_order_by, v_sort_order
        ) USING v_prefix_start, v_combined_levels, v_prefix, bucketname, v_limit, offsets;
        RETURN;
    END IF;

    -- ========================================================================
    -- NAME SORTING: Hybrid skip-scan with batch optimization
    -- ========================================================================

    -- Calculate upper bound for prefix filtering
    IF v_prefix_lower = '' THEN
        v_upper_bound := NULL;
    ELSIF right(v_prefix_lower, 1) = v_delimiter THEN
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(v_delimiter) + 1);
    ELSE
        v_upper_bound := left(v_prefix_lower, -1) || chr(ascii(right(v_prefix_lower, 1)) + 1);
    END IF;

    -- Build batch query (dynamic SQL - called infrequently, amortized over many rows)
    IF v_is_asc THEN
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'AND lower(o.name) COLLATE "C" < $3 ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" >= $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" ASC LIMIT $4';
        END IF;
    ELSE
        IF v_upper_bound IS NOT NULL THEN
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'AND lower(o.name) COLLATE "C" >= $3 ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        ELSE
            v_batch_query := 'SELECT o.name, o.id, o.updated_at, o.created_at, o.last_accessed_at, o.metadata ' ||
                'FROM storage.objects o WHERE o.bucket_id = $1 AND lower(o.name) COLLATE "C" < $2 ' ||
                'ORDER BY lower(o.name) COLLATE "C" DESC LIMIT $4';
        END IF;
    END IF;

    -- Initialize seek position
    IF v_is_asc THEN
        v_next_seek := v_prefix_lower;
    ELSE
        -- DESC: find the last item in range first (static SQL)
        IF v_upper_bound IS NOT NULL THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower AND lower(o.name) COLLATE "C" < v_upper_bound
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSIF v_prefix_lower <> '' THEN
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_prefix_lower
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        ELSE
            SELECT o.name INTO v_peek_name FROM storage.objects o
            WHERE o.bucket_id = bucketname
            ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
        END IF;

        IF v_peek_name IS NOT NULL THEN
            v_next_seek := lower(v_peek_name) || v_delimiter;
        ELSE
            RETURN;
        END IF;
    END IF;

    -- ========================================================================
    -- MAIN LOOP: Hybrid peek-then-batch algorithm
    -- Uses STATIC SQL for peek (hot path) and DYNAMIC SQL for batch
    -- ========================================================================
    LOOP
        EXIT WHEN v_count >= v_limit;

        -- STEP 1: PEEK using STATIC SQL (plan cached, very fast)
        IF v_is_asc THEN
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek AND lower(o.name) COLLATE "C" < v_upper_bound
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" >= v_next_seek
                ORDER BY lower(o.name) COLLATE "C" ASC LIMIT 1;
            END IF;
        ELSE
            IF v_upper_bound IS NOT NULL THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSIF v_prefix_lower <> '' THEN
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek AND lower(o.name) COLLATE "C" >= v_prefix_lower
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            ELSE
                SELECT o.name INTO v_peek_name FROM storage.objects o
                WHERE o.bucket_id = bucketname AND lower(o.name) COLLATE "C" < v_next_seek
                ORDER BY lower(o.name) COLLATE "C" DESC LIMIT 1;
            END IF;
        END IF;

        EXIT WHEN v_peek_name IS NULL;

        -- STEP 2: Check if this is a FOLDER or FILE
        v_common_prefix := storage.get_common_prefix(lower(v_peek_name), v_prefix_lower, v_delimiter);

        IF v_common_prefix IS NOT NULL THEN
            -- FOLDER: Handle offset, emit if needed, skip to next folder
            IF v_skipped < offsets THEN
                v_skipped := v_skipped + 1;
            ELSE
                name := substring(rtrim(storage.get_common_prefix(v_peek_name, v_prefix, v_delimiter), v_delimiter) from v_prefix_len + 1);
                id := NULL;
                updated_at := NULL;
                created_at := NULL;
                last_accessed_at := NULL;
                metadata := NULL;
                RETURN NEXT;
                v_count := v_count + 1;
            END IF;

            -- Advance seek past the folder range
            IF v_is_asc THEN
                v_next_seek := lower(left(v_common_prefix, -1)) || chr(ascii(v_delimiter) + 1);
            ELSE
                v_next_seek := lower(v_common_prefix);
            END IF;
        ELSE
            -- FILE: Batch fetch using DYNAMIC SQL (overhead amortized over many rows)
            -- For ASC: upper_bound is the exclusive upper limit (< condition)
            -- For DESC: prefix_lower is the inclusive lower limit (>= condition)
            FOR v_current IN EXECUTE v_batch_query
                USING bucketname, v_next_seek,
                    CASE WHEN v_is_asc THEN COALESCE(v_upper_bound, v_prefix_lower) ELSE v_prefix_lower END, v_file_batch_size
            LOOP
                v_common_prefix := storage.get_common_prefix(lower(v_current.name), v_prefix_lower, v_delimiter);

                IF v_common_prefix IS NOT NULL THEN
                    -- Hit a folder: exit batch, let peek handle it
                    v_next_seek := lower(v_current.name);
                    EXIT;
                END IF;

                -- Handle offset skipping
                IF v_skipped < offsets THEN
                    v_skipped := v_skipped + 1;
                ELSE
                    -- Emit file
                    name := substring(v_current.name from v_prefix_len + 1);
                    id := v_current.id;
                    updated_at := v_current.updated_at;
                    created_at := v_current.created_at;
                    last_accessed_at := v_current.last_accessed_at;
                    metadata := v_current.metadata;
                    RETURN NEXT;
                    v_count := v_count + 1;
                END IF;

                -- Advance seek past this file
                IF v_is_asc THEN
                    v_next_seek := lower(v_current.name) || v_delimiter;
                ELSE
                    v_next_seek := lower(v_current.name);
                END IF;

                EXIT WHEN v_count >= v_limit;
            END LOOP;
        END IF;
    END LOOP;
END;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: search_by_timestamp(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    v_cursor_op text;
    v_query text;
    v_prefix text;
    v_sort_order text;
    v_sort_column text;
BEGIN
    v_prefix := coalesce(p_prefix, '');

    -- Defense-in-depth: this function is independently reachable and must
    -- not trust p_sort_order/p_sort_column to already be validated by a
    -- caller. Normalize to the same strict allow-list storage.search_v2
    -- uses before interpolating anything into dynamic SQL below.
    v_sort_order := lower(coalesce(p_sort_order, 'asc'));
    IF v_sort_order NOT IN ('asc', 'desc') THEN
        v_sort_order := 'asc';
    END IF;

    v_sort_column := lower(coalesce(p_sort_column, 'updated_at'));
    IF v_sort_column NOT IN ('updated_at', 'created_at') THEN
        v_sort_column := 'updated_at';
    END IF;

    IF v_sort_order = 'asc' THEN
        v_cursor_op := '>';
    ELSE
        v_cursor_op := '<';
    END IF;

    v_query := format($sql$
        WITH raw_objects AS (
            SELECT
                o.name AS obj_name,
                o.id AS obj_id,
                o.updated_at AS obj_updated_at,
                o.created_at AS obj_created_at,
                o.last_accessed_at AS obj_last_accessed_at,
                o.metadata AS obj_metadata,
                storage.get_common_prefix(o.name, $1, '/') AS common_prefix
            FROM storage.objects o
            WHERE o.bucket_id = $2
              AND o.name COLLATE "C" LIKE $1 || '%%'
        ),
        -- Aggregate common prefixes (folders)
        -- Both created_at and updated_at use MIN(obj_created_at) to match the old prefixes table behavior
        aggregated_prefixes AS (
            SELECT
                rtrim(common_prefix, '/') AS name,
                NULL::uuid AS id,
                MIN(obj_created_at) AS updated_at,
                MIN(obj_created_at) AS created_at,
                NULL::timestamptz AS last_accessed_at,
                NULL::jsonb AS metadata,
                TRUE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NOT NULL
            GROUP BY common_prefix
        ),
        leaf_objects AS (
            SELECT
                obj_name AS name,
                obj_id AS id,
                obj_updated_at AS updated_at,
                obj_created_at AS created_at,
                obj_last_accessed_at AS last_accessed_at,
                obj_metadata AS metadata,
                FALSE AS is_prefix
            FROM raw_objects
            WHERE common_prefix IS NULL
        ),
        combined AS (
            SELECT * FROM aggregated_prefixes
            UNION ALL
            SELECT * FROM leaf_objects
        ),
        filtered AS (
            SELECT *
            FROM combined
            WHERE (
                $5 = ''
                OR ROW(
                    date_trunc('milliseconds', %I),
                    name COLLATE "C"
                ) %s ROW(
                    COALESCE(NULLIF($6, '')::timestamptz, 'epoch'::timestamptz),
                    $5
                )
            )
        )
        SELECT
            split_part(name, '/', $3) AS key,
            name,
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
        FROM filtered
        ORDER BY
            COALESCE(date_trunc('milliseconds', %I), 'epoch'::timestamptz) %s,
            name COLLATE "C" %s
        LIMIT $4
    $sql$,
        v_sort_column,
        v_cursor_op,
        v_sort_column,
        v_sort_order,
        v_sort_order
    );

    RETURN QUERY EXECUTE v_query
    USING v_prefix, p_bucket_id, p_level, p_limit, p_start_after, p_sort_column_after;
END;
$_$;


ALTER FUNCTION storage.search_by_timestamp(p_prefix text, p_bucket_id text, p_limit integer, p_level integer, p_start_after text, p_sort_order text, p_sort_column text, p_sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: search_v2(text, text, integer, integer, text, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text, sort_order text DEFAULT 'asc'::text, sort_column text DEFAULT 'name'::text, sort_column_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    v_sort_col text;
    v_sort_ord text;
    v_limit int;
BEGIN
    -- Cap limit to maximum of 1500 records
    v_limit := LEAST(coalesce(limits, 100), 1500);

    -- Validate and normalize sort_order
    v_sort_ord := lower(coalesce(sort_order, 'asc'));
    IF v_sort_ord NOT IN ('asc', 'desc') THEN
        v_sort_ord := 'asc';
    END IF;

    -- Validate and normalize sort_column
    v_sort_col := lower(coalesce(sort_column, 'name'));
    IF v_sort_col NOT IN ('name', 'updated_at', 'created_at') THEN
        v_sort_col := 'name';
    END IF;

    -- Route to appropriate implementation
    IF v_sort_col = 'name' THEN
        -- Use list_objects_with_delimiter for name sorting (most efficient: O(k * log n))
        RETURN QUERY
        SELECT
            split_part(l.name, '/', levels) AS key,
            l.name AS name,
            l.id,
            l.updated_at,
            l.created_at,
            l.last_accessed_at,
            l.metadata
        FROM storage.list_objects_with_delimiter(
            bucket_name,
            coalesce(prefix, ''),
            '/',
            v_limit,
            start_after,
            '',
            v_sort_ord
        ) l;
    ELSE
        -- Use aggregation approach for timestamp sorting
        -- Not efficient for large datasets but supports correct pagination
        RETURN QUERY SELECT * FROM storage.search_by_timestamp(
            prefix, bucket_name, v_limit, levels, start_after,
            v_sort_ord, v_sort_col, sort_column_after
        );
    END IF;
END;
$$;


ALTER FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text, sort_order text, sort_column text, sort_column_after text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: custom_oauth_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.custom_oauth_providers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    provider_type text NOT NULL,
    identifier text NOT NULL,
    name text NOT NULL,
    client_id text NOT NULL,
    client_secret text NOT NULL,
    acceptable_client_ids text[] DEFAULT '{}'::text[] NOT NULL,
    scopes text[] DEFAULT '{}'::text[] NOT NULL,
    pkce_enabled boolean DEFAULT true NOT NULL,
    attribute_mapping jsonb DEFAULT '{}'::jsonb NOT NULL,
    authorization_params jsonb DEFAULT '{}'::jsonb NOT NULL,
    enabled boolean DEFAULT true NOT NULL,
    email_optional boolean DEFAULT false NOT NULL,
    issuer text,
    discovery_url text,
    skip_nonce_check boolean DEFAULT false NOT NULL,
    cached_discovery jsonb,
    discovery_cached_at timestamp with time zone,
    authorization_url text,
    token_url text,
    userinfo_url text,
    jwks_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    custom_claims_allowlist text[] DEFAULT '{}'::text[] NOT NULL,
    CONSTRAINT custom_oauth_providers_authorization_url_https CHECK (((authorization_url IS NULL) OR (authorization_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_authorization_url_length CHECK (((authorization_url IS NULL) OR (char_length(authorization_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_client_id_length CHECK (((char_length(client_id) >= 1) AND (char_length(client_id) <= 512))),
    CONSTRAINT custom_oauth_providers_discovery_url_length CHECK (((discovery_url IS NULL) OR (char_length(discovery_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_identifier_format CHECK ((identifier ~ '^[a-z0-9][a-z0-9:-]{0,48}[a-z0-9]$'::text)),
    CONSTRAINT custom_oauth_providers_issuer_length CHECK (((issuer IS NULL) OR ((char_length(issuer) >= 1) AND (char_length(issuer) <= 2048)))),
    CONSTRAINT custom_oauth_providers_jwks_uri_https CHECK (((jwks_uri IS NULL) OR (jwks_uri ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_jwks_uri_length CHECK (((jwks_uri IS NULL) OR (char_length(jwks_uri) <= 2048))),
    CONSTRAINT custom_oauth_providers_name_length CHECK (((char_length(name) >= 1) AND (char_length(name) <= 100))),
    CONSTRAINT custom_oauth_providers_oauth2_requires_endpoints CHECK (((provider_type <> 'oauth2'::text) OR ((authorization_url IS NOT NULL) AND (token_url IS NOT NULL) AND (userinfo_url IS NOT NULL)))),
    CONSTRAINT custom_oauth_providers_oidc_discovery_url_https CHECK (((provider_type <> 'oidc'::text) OR (discovery_url IS NULL) OR (discovery_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_issuer_https CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NULL) OR (issuer ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_oidc_requires_issuer CHECK (((provider_type <> 'oidc'::text) OR (issuer IS NOT NULL))),
    CONSTRAINT custom_oauth_providers_provider_type_check CHECK ((provider_type = ANY (ARRAY['oauth2'::text, 'oidc'::text]))),
    CONSTRAINT custom_oauth_providers_token_url_https CHECK (((token_url IS NULL) OR (token_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_token_url_length CHECK (((token_url IS NULL) OR (char_length(token_url) <= 2048))),
    CONSTRAINT custom_oauth_providers_userinfo_url_https CHECK (((userinfo_url IS NULL) OR (userinfo_url ~~ 'https://%'::text))),
    CONSTRAINT custom_oauth_providers_userinfo_url_length CHECK (((userinfo_url IS NULL) OR (char_length(userinfo_url) <= 2048)))
);


ALTER TABLE auth.custom_oauth_providers OWNER TO supabase_auth_admin;

--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text,
    code_challenge_method auth.code_challenge_method,
    code_challenge text,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone,
    invite_token text,
    referrer text,
    oauth_client_state_id uuid,
    linking_target_id uuid,
    email_optional boolean DEFAULT false NOT NULL
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'Stores metadata for all OAuth/SSO login flows';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid,
    last_webauthn_challenge_data jsonb
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: COLUMN mfa_factors.last_webauthn_challenge_data; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.mfa_factors.last_webauthn_challenge_data IS 'Stores the latest WebAuthn challenge data including attestation/assertion for customer verification';


--
-- Name: oauth_authorizations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_authorizations (
    id uuid NOT NULL,
    authorization_id text NOT NULL,
    client_id uuid NOT NULL,
    user_id uuid,
    redirect_uri text NOT NULL,
    scope text NOT NULL,
    state text,
    resource text,
    code_challenge text,
    code_challenge_method auth.code_challenge_method,
    response_type auth.oauth_response_type DEFAULT 'code'::auth.oauth_response_type NOT NULL,
    status auth.oauth_authorization_status DEFAULT 'pending'::auth.oauth_authorization_status NOT NULL,
    authorization_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '00:03:00'::interval) NOT NULL,
    approved_at timestamp with time zone,
    nonce text,
    CONSTRAINT oauth_authorizations_authorization_code_length CHECK ((char_length(authorization_code) <= 255)),
    CONSTRAINT oauth_authorizations_code_challenge_length CHECK ((char_length(code_challenge) <= 128)),
    CONSTRAINT oauth_authorizations_expires_at_future CHECK ((expires_at > created_at)),
    CONSTRAINT oauth_authorizations_nonce_length CHECK ((char_length(nonce) <= 255)),
    CONSTRAINT oauth_authorizations_redirect_uri_length CHECK ((char_length(redirect_uri) <= 2048)),
    CONSTRAINT oauth_authorizations_resource_length CHECK ((char_length(resource) <= 2048)),
    CONSTRAINT oauth_authorizations_scope_length CHECK ((char_length(scope) <= 4096)),
    CONSTRAINT oauth_authorizations_state_length CHECK ((char_length(state) <= 4096))
);


ALTER TABLE auth.oauth_authorizations OWNER TO supabase_auth_admin;

--
-- Name: oauth_client_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_client_states (
    id uuid NOT NULL,
    provider_type text NOT NULL,
    code_verifier text,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE auth.oauth_client_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE oauth_client_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.oauth_client_states IS 'Stores OAuth states for third-party provider authentication flows where Supabase acts as the OAuth client.';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_secret_hash text,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    client_type auth.oauth_client_type DEFAULT 'confidential'::auth.oauth_client_type NOT NULL,
    token_endpoint_auth_method text NOT NULL,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048)),
    CONSTRAINT oauth_clients_token_endpoint_auth_method_check CHECK ((token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text])))
);


ALTER TABLE auth.oauth_clients OWNER TO supabase_auth_admin;

--
-- Name: oauth_consents; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.oauth_consents (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    client_id uuid NOT NULL,
    scopes text NOT NULL,
    granted_at timestamp with time zone DEFAULT now() NOT NULL,
    revoked_at timestamp with time zone,
    CONSTRAINT oauth_consents_revoked_after_granted CHECK (((revoked_at IS NULL) OR (revoked_at >= granted_at))),
    CONSTRAINT oauth_consents_scopes_length CHECK ((char_length(scopes) <= 2048)),
    CONSTRAINT oauth_consents_scopes_not_empty CHECK ((char_length(TRIM(BOTH FROM scopes)) > 0))
);


ALTER TABLE auth.oauth_consents OWNER TO supabase_auth_admin;

--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text,
    oauth_client_id uuid,
    refresh_token_hmac_key text,
    refresh_token_counter bigint,
    scopes text,
    CONSTRAINT sessions_scopes_length CHECK ((char_length(scopes) <= 4096))
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: COLUMN sessions.refresh_token_hmac_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_hmac_key IS 'Holds a HMAC-SHA256 key used to sign refresh tokens for this session.';


--
-- Name: COLUMN sessions.refresh_token_counter; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.refresh_token_counter IS 'Holds the ID (counter) of the last issued refresh token.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: webauthn_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    challenge_type text NOT NULL,
    session_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT webauthn_challenges_challenge_type_check CHECK ((challenge_type = ANY (ARRAY['signup'::text, 'registration'::text, 'authentication'::text])))
);


ALTER TABLE auth.webauthn_challenges OWNER TO supabase_auth_admin;

--
-- Name: webauthn_credentials; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.webauthn_credentials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    credential_id bytea NOT NULL,
    public_key bytea NOT NULL,
    attestation_type text DEFAULT ''::text NOT NULL,
    aaguid uuid,
    sign_count bigint DEFAULT 0 NOT NULL,
    transports jsonb DEFAULT '[]'::jsonb NOT NULL,
    backup_eligible boolean DEFAULT false NOT NULL,
    backed_up boolean DEFAULT false NOT NULL,
    friendly_name text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    last_used_at timestamp with time zone
);


ALTER TABLE auth.webauthn_credentials OWNER TO supabase_auth_admin;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.announcements (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    department_id integer,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    scheduled_at timestamp with time zone DEFAULT now(),
    expires_at timestamp with time zone,
    is_archived boolean DEFAULT false,
    priority text DEFAULT 'Medium'::text,
    title_en text,
    title_si text,
    title_ta text,
    message_en text,
    message_si text,
    message_ta text,
    updated_at timestamp with time zone,
    CONSTRAINT announcements_priority_check CHECK ((priority = ANY (ARRAY['Low'::text, 'Medium'::text, 'High'::text, 'Urgent'::text])))
);


ALTER TABLE public.announcements OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.announcements_id_seq OWNER TO postgres;

--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.app_settings (
    id bigint NOT NULL,
    maintenance_mode boolean DEFAULT false NOT NULL,
    latest_version text DEFAULT '1.0.0'::text
);


ALTER TABLE public.app_settings OWNER TO postgres;

--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.app_settings ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.app_settings_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id uuid,
    action character varying(255) NOT NULL,
    entity_type character varying(50),
    entity_id text,
    old_value text,
    new_value text,
    ip_address character varying(45),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: complaint_attachments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaint_attachments (
    id bigint NOT NULL,
    complaint_id integer NOT NULL,
    uploaded_by uuid,
    file_name text NOT NULL,
    file_type text NOT NULL,
    mime_type text,
    storage_path text NOT NULL,
    public_url text NOT NULL,
    file_size bigint,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT complaint_attachments_file_type_check CHECK ((file_type = ANY (ARRAY['photo'::text, 'document'::text, 'signature'::text])))
);


ALTER TABLE public.complaint_attachments OWNER TO postgres;

--
-- Name: complaint_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.complaint_attachments ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.complaint_attachments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: complaint_recipients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaint_recipients (
    id bigint NOT NULL,
    complaint_id integer NOT NULL,
    recipient_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.complaint_recipients OWNER TO postgres;

--
-- Name: complaint_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.complaint_recipients ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.complaint_recipients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: complaint_replies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaint_replies (
    id integer NOT NULL,
    complaint_id integer,
    replied_by uuid,
    reply_message text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    reply_message_en text,
    reply_message_si text,
    reply_message_ta text
);


ALTER TABLE public.complaint_replies OWNER TO postgres;

--
-- Name: complaint_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaint_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaint_replies_id_seq OWNER TO postgres;

--
-- Name: complaint_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaint_replies_id_seq OWNED BY public.complaint_replies.id;


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    user_id uuid,
    department_id integer,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    status character varying(50) DEFAULT 'Open'::character varying,
    assigned_supervisor_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    category text,
    attachment_url text,
    signature_url text,
    title_en text,
    title_si text,
    title_ta text,
    description_en text,
    description_si text,
    description_ta text,
    current_stage character varying(50) DEFAULT 'department_head'::character varying,
    CONSTRAINT complaints_status_check CHECK (((status)::text = ANY ((ARRAY['Open'::character varying, 'In Progress'::character varying, 'Resolved'::character varying, 'Closed'::character varying, 'Pending Department Head'::character varying, 'Pending CC Officer Review'::character varying, 'Pending Secretary Review'::character varying, 'Pending Chairman Review'::character varying])::text[])))
);


ALTER TABLE public.complaints OWNER TO postgres;

--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.complaints_id_seq OWNER TO postgres;

--
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    department_name character varying(100) NOT NULL,
    department_type character varying(20) DEFAULT 'Regular'::character varying,
    description text,
    created_at timestamp without time zone DEFAULT now(),
    image_url text,
    department_name_si character varying,
    department_name_ta character varying,
    CONSTRAINT departments_department_type_check CHECK (((department_type)::text = ANY ((ARRAY['Regular'::character varying, 'Library'::character varying, 'Preschool'::character varying])::text[])))
);


ALTER TABLE public.departments OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO postgres;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    department_id integer NOT NULL,
    designation_en character varying(100) NOT NULL,
    designation_si character varying(100) NOT NULL,
    designation_ta character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.designations OWNER TO postgres;

--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designations_id_seq OWNER TO postgres;

--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: leave_forms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_forms (
    id integer NOT NULL,
    leave_request_id integer,
    form_details text,
    digital_signature text,
    submitted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.leave_forms OWNER TO postgres;

--
-- Name: leave_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_forms_id_seq OWNER TO postgres;

--
-- Name: leave_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_forms_id_seq OWNED BY public.leave_forms.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_requests (
    id integer NOT NULL,
    user_id uuid,
    leave_type_id integer,
    start_date date NOT NULL,
    end_date date NOT NULL,
    no_of_days real NOT NULL,
    reason text,
    status character varying(20) DEFAULT 'Pending'::character varying,
    supervisor_id uuid,
    supervisor_remark text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    admin_approved_at timestamp with time zone,
    admin_approved_by uuid,
    final_approved_at timestamp with time zone,
    final_approved_by uuid,
    approval_stage text DEFAULT 'admin_review'::text,
    attachment_url text,
    reason_en text,
    reason_si text,
    reason_ta text,
    supervisor_remark_en text,
    supervisor_remark_si text,
    supervisor_remark_ta text,
    coverage_officer_id uuid,
    cc_approved_at timestamp with time zone,
    cc_approved_by uuid,
    subject_signature text,
    cc_signature text,
    secretary_signature text,
    chairman_signature text,
    CONSTRAINT leave_requests_status_check CHECK (((status)::text = ANY ((ARRAY['Pending'::character varying, 'Subject Approved'::character varying, 'CC Approved'::character varying, 'Approved'::character varying, 'Rejected'::character varying])::text[])))
);


ALTER TABLE public.leave_requests OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_requests_id_seq OWNER TO postgres;

--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    name_en character varying(50) NOT NULL,
    max_days integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    name_si character varying,
    name_ta character varying
);


ALTER TABLE public.leave_types OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_types_id_seq OWNER TO postgres;

--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id uuid,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    is_auto_generated boolean DEFAULT false,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    read_at timestamp with time zone,
    notification_type character varying(30) DEFAULT 'General'::character varying,
    related_entity character varying(50),
    related_id integer,
    title_en text,
    title_si text,
    title_ta text,
    message_en text,
    message_si text,
    message_ta text,
    is_for_mobile boolean DEFAULT true,
    notification_key text,
    payload jsonb
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: profile_change_requests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.profile_change_requests (
    id integer NOT NULL,
    user_id uuid,
    old_value text,
    new_value text,
    status text DEFAULT 'pending'::text,
    approved_by uuid,
    approved_at timestamp with time zone,
    requested_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.profile_change_requests OWNER TO postgres;

--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.profile_change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.profile_change_requests_id_seq OWNER TO postgres;

--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.profile_change_requests_id_seq OWNED BY public.profile_change_requests.id;


--
-- Name: role_privileges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.role_privileges (
    id integer NOT NULL,
    role_id integer,
    privilege_id integer,
    is_enabled boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.role_privileges OWNER TO postgres;

--
-- Name: role_privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.role_privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.role_privileges_id_seq OWNER TO postgres;

--
-- Name: role_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.role_privileges_id_seq OWNED BY public.role_privileges.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    role_name_si character varying(255),
    role_name_ta character varying(255)
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: system_privilege_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_privilege_categories (
    id integer NOT NULL,
    category_key character varying(100) NOT NULL,
    category_name_en character varying(255) NOT NULL,
    category_name_si character varying(255),
    category_name_ta character varying(255),
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.system_privilege_categories OWNER TO postgres;

--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_privilege_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_privilege_categories_id_seq OWNER TO postgres;

--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_privilege_categories_id_seq OWNED BY public.system_privilege_categories.id;


--
-- Name: system_privileges; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_privileges (
    id integer NOT NULL,
    category_id integer,
    privilege_key character varying(100) NOT NULL,
    privilege_name_en character varying(255) NOT NULL,
    privilege_name_si character varying(255),
    privilege_name_ta character varying(255),
    display_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.system_privileges OWNER TO postgres;

--
-- Name: system_privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_privileges_id_seq OWNER TO postgres;

--
-- Name: system_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_privileges_id_seq OWNED BY public.system_privileges.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    assigned_to uuid,
    assigned_by uuid,
    department_id integer,
    due_date timestamp without time zone NOT NULL,
    status character varying(20) DEFAULT 'Pending'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    title_en text,
    title_si text,
    title_ta text,
    description_en text,
    description_si text,
    description_ta text,
    CONSTRAINT tasks_status_check CHECK (((status)::text = ANY ((ARRAY['pending'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'Pending'::character varying, 'In Progress'::character varying, 'Completed'::character varying])::text[])))
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tasks_id_seq OWNER TO postgres;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_leave_balances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_leave_balances (
    id integer NOT NULL,
    user_id uuid,
    leave_type_id integer,
    year integer NOT NULL,
    remaining_days numeric(5,1) DEFAULT 0,
    allocated_days real,
    used_days real
);


ALTER TABLE public.user_leave_balances OWNER TO postgres;

--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_leave_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_leave_balances_id_seq OWNER TO postgres;

--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_leave_balances_id_seq OWNED BY public.user_leave_balances.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_id uuid,
    full_name character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    phone character varying(15),
    avatar_url text,
    is_active boolean DEFAULT true,
    role_id integer,
    department_id integer,
    created_at timestamp without time zone DEFAULT now(),
    nic character varying,
    full_name_si character varying,
    full_name_ta character varying,
    updated_at timestamp with time zone,
    staff_category character varying(20) DEFAULT 'Staff'::character varying,
    signature_url text,
    birthday date,
    gender character varying(20),
    is_first_login boolean DEFAULT true,
    designation_id bigint,
    title character varying(10),
    joined_date date,
    CONSTRAINT users_staff_category_check CHECK (((staff_category)::text = ANY ((ARRAY['Staff'::character varying, 'Field Officer'::character varying, 'Labour'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: COLUMN users.nic; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.users.nic IS '[SENSITIVE]';


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_13; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_13 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_13 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_14; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_14 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_14 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_15; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_15 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_15 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_16; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_16 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_16 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_17; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_17 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_18; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_18 OWNER TO supabase_realtime_admin;

--
-- Name: messages_2026_08_19; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages_2026_08_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    binary_payload bytea,
    CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL)))
);


ALTER TABLE realtime.messages_2026_08_19 OWNER TO supabase_realtime_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    action_filter text DEFAULT '*'::text,
    selected_columns text[],
    CONSTRAINT subscription_action_filter_check CHECK ((action_filter = ANY (ARRAY['*'::text, 'INSERT'::text, 'UPDATE'::text, 'DELETE'::text])))
);


ALTER TABLE realtime.subscription OWNER TO supabase_realtime_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL,
    versioning_status text DEFAULT 'DISABLED'::text NOT NULL,
    CONSTRAINT buckets_versioning_dark_check CHECK ((versioning_status = 'DISABLED'::text)),
    CONSTRAINT buckets_versioning_standard_only_check CHECK (((type = 'STANDARD'::storage.buckettype) OR (versioning_status = 'DISABLED'::text))),
    CONSTRAINT buckets_versioning_status_check CHECK ((versioning_status = ANY (ARRAY['DISABLED'::text, 'ENABLED'::text, 'SUSPENDED'::text])))
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_analytics (
    name text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE storage.buckets_analytics OWNER TO supabase_storage_admin;

--
-- Name: buckets_vectors; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets_vectors (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'VECTOR'::storage.buckettype NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.buckets_vectors OWNER TO supabase_storage_admin;

--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    archived_at timestamp with time zone,
    is_delete_marker boolean DEFAULT false NOT NULL,
    is_versioned boolean DEFAULT false NOT NULL
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb,
    metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: vector_indexes; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.vector_indexes (
    id text DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    bucket_id text NOT NULL,
    data_type text NOT NULL,
    dimension integer NOT NULL,
    distance_metric text NOT NULL,
    metadata_configuration jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.vector_indexes OWNER TO supabase_storage_admin;

--
-- Name: messages_2026_08_13; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_13 FOR VALUES FROM ('2026-08-13 00:00:00') TO ('2026-08-14 00:00:00');


--
-- Name: messages_2026_08_14; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_14 FOR VALUES FROM ('2026-08-14 00:00:00') TO ('2026-08-15 00:00:00');


--
-- Name: messages_2026_08_15; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_15 FOR VALUES FROM ('2026-08-15 00:00:00') TO ('2026-08-16 00:00:00');


--
-- Name: messages_2026_08_16; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_16 FOR VALUES FROM ('2026-08-16 00:00:00') TO ('2026-08-17 00:00:00');


--
-- Name: messages_2026_08_17; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_17 FOR VALUES FROM ('2026-08-17 00:00:00') TO ('2026-08-18 00:00:00');


--
-- Name: messages_2026_08_18; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_18 FOR VALUES FROM ('2026-08-18 00:00:00') TO ('2026-08-19 00:00:00');


--
-- Name: messages_2026_08_19; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2026_08_19 FOR VALUES FROM ('2026-08-19 00:00:00') TO ('2026-08-20 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: complaint_replies id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_replies ALTER COLUMN id SET DEFAULT nextval('public.complaint_replies_id_seq'::regclass);


--
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: leave_forms id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_forms ALTER COLUMN id SET DEFAULT nextval('public.leave_forms_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: profile_change_requests id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_change_requests ALTER COLUMN id SET DEFAULT nextval('public.profile_change_requests_id_seq'::regclass);


--
-- Name: role_privileges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_privileges ALTER COLUMN id SET DEFAULT nextval('public.role_privileges_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: system_privilege_categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privilege_categories ALTER COLUMN id SET DEFAULT nextval('public.system_privilege_categories_id_seq'::regclass);


--
-- Name: system_privileges id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privileges ALTER COLUMN id SET DEFAULT nextval('public.system_privileges_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_leave_balances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_leave_balances ALTER COLUMN id SET DEFAULT nextval('public.user_leave_balances_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.custom_oauth_providers (id, provider_type, identifier, name, client_id, client_secret, acceptable_client_ids, scopes, pkce_enabled, attribute_mapping, authorization_params, enabled, email_optional, issuer, discovery_url, skip_nonce_check, cached_discovery, discovery_cached_at, authorization_url, token_url, userinfo_url, jwks_uri, created_at, updated_at, custom_claims_allowlist) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at, invite_token, referrer, oauth_client_state_id, linking_target_id, email_optional) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
cd536781-f062-41e0-a30f-e043665970a3	cd536781-f062-41e0-a30f-e043665970a3	{"sub": "cd536781-f062-41e0-a30f-e043665970a3", "email": "admin@pradeshiya.gov.lk", "email_verified": false, "phone_verified": false}	email	2026-05-25 03:22:51.624524+00	2026-05-25 03:22:51.624621+00	2026-05-25 03:22:51.624621+00	58186550-6e6a-4273-86dd-4762abede704
04391a6a-549b-409b-929b-860f9b0ba271	04391a6a-549b-409b-929b-860f9b0ba271	{"sub": "04391a6a-549b-409b-929b-860f9b0ba271", "email": "chairman@pradeshiya.gov.lk", "email_verified": false, "phone_verified": false}	email	2026-05-30 02:37:12.067229+00	2026-05-30 02:37:12.067278+00	2026-05-30 02:37:12.067278+00	e6a0d41d-b970-4fbf-8664-0e241e4c568d
9315fb98-1ca2-452d-abe0-082cb16a64fb	9315fb98-1ca2-452d-abe0-082cb16a64fb	{"sub": "9315fb98-1ca2-452d-abe0-082cb16a64fb", "email": "ccofficer@pradeshiya.gov.lk", "email_verified": false, "phone_verified": false}	email	2026-07-18 17:52:29.907378+00	2026-07-18 17:52:29.907431+00	2026-07-18 17:52:29.907431+00	e4c98bde-dd3f-48dc-a81d-e852efdfd5f3
ff539ee4-f139-44c1-9d00-3714f2c30bec	ff539ee4-f139-44c1-9d00-3714f2c30bec	{"sub": "ff539ee4-f139-44c1-9d00-3714f2c30bec", "email": "secretary@pradeshiya.gov.lk", "email_verified": false, "phone_verified": false}	email	2026-07-25 12:25:20.412076+00	2026-07-25 12:25:20.41214+00	2026-07-25 12:25:20.41214+00	951ae691-61a9-4a0a-ad1b-d3dd4ebb5218
e6eea446-2800-4328-9f59-a662a16abf41	e6eea446-2800-4328-9f59-a662a16abf41	{"sub": "e6eea446-2800-4328-9f59-a662a16abf41", "email": "subjectofficer@pradeshiya.gov.lk", "email_verified": false, "phone_verified": false}	email	2026-07-25 12:26:22.163006+00	2026-07-25 12:26:22.163072+00	2026-07-25 12:26:22.163072+00	84c872f7-cfea-42de-9abd-425b899ab8a8
ddea66f5-de28-469c-be1b-122b570703dd	ddea66f5-de28-469c-be1b-122b570703dd	{"sub": "ddea66f5-de28-469c-be1b-122b570703dd", "email": "dewrangashamindu17@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-09 13:02:36.626017+00	2026-08-09 13:02:36.626069+00	2026-08-09 13:02:36.626069+00	232412cd-7e79-4f12-9545-9becb54f44bd
a6148a55-6a57-4213-92c0-e52b6f87f01f	a6148a55-6a57-4213-92c0-e52b6f87f01f	{"sub": "a6148a55-6a57-4213-92c0-e52b6f87f01f", "email": "dulminikumari2002@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-09 13:05:04.247737+00	2026-08-09 13:05:04.24778+00	2026-08-09 13:05:04.24778+00	3a790133-37a9-428e-a76a-4fe0d63fc4c5
a50cdb87-15b2-488b-bc34-f3b178e9a040	a50cdb87-15b2-488b-bc34-f3b178e9a040	{"sub": "a50cdb87-15b2-488b-bc34-f3b178e9a040", "email": "bbcnew16@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-09 18:51:35.605843+00	2026-08-09 18:51:35.605918+00	2026-08-09 18:51:35.605918+00	b2f0d5a1-f472-4162-88b6-719df13825e7
43a3dd17-e195-4d97-9c10-781eea40f7e6	43a3dd17-e195-4d97-9c10-781eea40f7e6	{"sub": "43a3dd17-e195-4d97-9c10-781eea40f7e6", "email": "anshya2003@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-11 19:09:29.814589+00	2026-08-11 19:09:29.814656+00	2026-08-11 19:09:29.814656+00	be881734-83e7-4c92-a412-2ccaa3dea653
6615ed1c-eba0-4654-98f3-bb24159b5444	6615ed1c-eba0-4654-98f3-bb24159b5444	{"sub": "6615ed1c-eba0-4654-98f3-bb24159b5444", "email": "isurulanka2007@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-12 13:49:53.426807+00	2026-08-12 13:49:53.426898+00	2026-08-12 13:49:53.426898+00	8789f068-49c0-4545-bda1-7698a36ec88f
bc92f315-c11b-43ff-a8f6-bdef28797582	bc92f315-c11b-43ff-a8f6-bdef28797582	{"sub": "bc92f315-c11b-43ff-a8f6-bdef28797582", "email": "anshyajayarathna2003@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-13 03:53:11.192911+00	2026-08-13 03:53:11.192961+00	2026-08-13 03:53:11.192961+00	49bf2ad3-6559-4899-8a1e-84ec6042b600
c17d2b20-b7c0-4cfc-84cc-182e003e07ff	c17d2b20-b7c0-4cfc-84cc-182e003e07ff	{"sub": "c17d2b20-b7c0-4cfc-84cc-182e003e07ff", "email": "lakshidharmarathna@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-13 05:02:25.130757+00	2026-08-13 05:02:25.130839+00	2026-08-13 05:02:25.130839+00	ebc3c3ac-37e3-4025-98f1-a02d107ec361
3e8e373c-9978-47fd-ab39-009f0f8898c1	3e8e373c-9978-47fd-ab39-009f0f8898c1	{"sub": "3e8e373c-9978-47fd-ab39-009f0f8898c1", "email": "dewrangashamindu45@gmail.com", "email_verified": false, "phone_verified": false}	email	2026-08-13 06:09:45.530791+00	2026-08-13 06:09:45.532077+00	2026-08-13 06:09:45.532077+00	d924a3a1-2b95-4016-bfae-6c4cd18ff692
a0c32bbf-deee-4036-845d-8dbbb8ae92e7	a0c32bbf-deee-4036-845d-8dbbb8ae92e7	{"sub": "a0c32bbf-deee-4036-845d-8dbbb8ae92e7", "email": "admin.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:18:19.85507+00	2026-08-31 09:18:19.855125+00	2026-08-31 09:18:19.855125+00	1a48f57d-6358-472c-95e9-7bb7d9f80def
5f91dc11-66f4-4c17-9267-029afe94a681	5f91dc11-66f4-4c17-9267-029afe94a681	{"sub": "5f91dc11-66f4-4c17-9267-029afe94a681", "email": "health.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:23:31.712091+00	2026-08-31 09:23:31.712156+00	2026-08-31 09:23:31.712156+00	6dc516aa-8695-4cf1-aefe-2117e3cdb14d
1cb438d9-4387-4159-990c-29761709a9bf	1cb438d9-4387-4159-990c-29761709a9bf	{"sub": "1cb438d9-4387-4159-990c-29761709a9bf", "email": "planning.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:26:07.086888+00	2026-08-31 09:26:07.086978+00	2026-08-31 09:26:07.086978+00	4c512fdb-6472-4adf-9f98-3becbbc9bba6
aab36179-33a3-4b24-80f8-b732a2968c6b	aab36179-33a3-4b24-80f8-b732a2968c6b	{"sub": "aab36179-33a3-4b24-80f8-b732a2968c6b", "email": "library.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:27:31.683321+00	2026-08-31 09:27:31.683369+00	2026-08-31 09:27:31.683369+00	bf538950-1584-4afd-ab0f-ecb1d1ca9065
2b04dc1e-bdf7-4ce0-8044-579c359da57c	2b04dc1e-bdf7-4ce0-8044-579c359da57c	{"sub": "2b04dc1e-bdf7-4ce0-8044-579c359da57c", "email": "utility.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:30:02.224521+00	2026-08-31 09:30:02.224572+00	2026-08-31 09:30:02.224572+00	7ca0e9d4-44a2-40c4-826c-04f9659d3ba4
de444250-3be9-40a6-9e2f-00d23d770b7f	de444250-3be9-40a6-9e2f-00d23d770b7f	{"sub": "de444250-3be9-40a6-9e2f-00d23d770b7f", "email": "devecon.head@staff.lk", "email_verified": false, "phone_verified": false}	email	2026-08-31 09:30:32.821593+00	2026-08-31 09:30:32.823316+00	2026-08-31 09:30:32.823316+00	01918e60-0d64-4002-b86e-f54a1ef774aa
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
f6ef249f-896f-4917-b12c-45ab6879fb7c	2026-08-13 06:37:23.898297+00	2026-08-13 06:37:23.898297+00	password	c5c6d25d-1953-4311-af71-99ee293dd8c4
48b32cd9-8f0b-4823-a148-f5e417c43661	2026-08-09 13:12:59.699846+00	2026-08-09 13:12:59.699846+00	otp	8610f3e5-c72e-461b-bae0-daf64a2747be
d706e60b-d5c9-446f-82a2-e5b37850cba3	2026-08-09 13:13:15.983811+00	2026-08-09 13:13:15.983811+00	password	790bb71c-368d-489e-8e55-4a8318c66d98
963d3650-d8a6-470a-a0db-90b9b6e5c84e	2026-08-09 14:14:55.427604+00	2026-08-09 14:14:55.427604+00	password	15dbe0d9-1da6-45dc-ab3d-75e169ce1e5b
daecd98e-7f36-4c84-b9f9-7693598c652b	2026-08-16 16:22:33.626363+00	2026-08-16 16:22:33.626363+00	password	f4765d0d-bf0a-4d1e-831d-059e0cdb27c6
5fc9202f-9584-41e4-907b-c79da660ddfa	2026-08-16 16:23:24.058239+00	2026-08-16 16:23:24.058239+00	password	2e82cd88-6a19-4142-8db5-714371dfccf4
fa59288f-8b06-4ff0-a351-195cb70d0876	2026-08-09 17:57:16.845932+00	2026-08-09 17:57:16.845932+00	password	6aeace30-2b6e-41e4-81c6-3798c4af901b
3a81bf6c-50a7-4f01-90dd-0588f703c436	2026-08-09 18:01:07.153091+00	2026-08-09 18:01:07.153091+00	password	775fa68b-6336-4c88-b087-38877d47d6d2
2d35e9a7-9031-4d16-aaff-7df49ffcf600	2026-08-09 18:54:08.747413+00	2026-08-09 18:54:08.747413+00	password	2092d067-d904-41b1-8644-863f8b0ed4c2
21bb30ee-57c2-43ed-af0c-372c6a826d84	2026-08-09 18:55:32.542052+00	2026-08-09 18:55:32.542052+00	password	1d9e43e2-7c25-455e-8c66-66d1b2f59dbf
f83307dc-ce2e-4326-91fc-d1925d3df201	2026-08-09 19:53:48.906219+00	2026-08-09 19:53:48.906219+00	password	a50744f0-5932-452e-8874-040b3e6841c9
985f15a9-316f-45e5-a252-4bec9ff4a4d9	2026-08-09 19:54:53.840831+00	2026-08-09 19:54:53.840831+00	password	47fea456-a25a-47ac-9752-8d09302de46e
f60ff7e5-16c5-417a-bca2-a719008a6a40	2026-08-09 19:57:17.462646+00	2026-08-09 19:57:17.462646+00	password	5449c50e-8ae8-45cf-91f4-cc804bf0e6ae
3bfa3ef2-6d41-40bc-9c2b-af01ab32242a	2026-08-09 20:00:26.139282+00	2026-08-09 20:00:26.139282+00	password	e7ccfd6e-35d0-4e37-bcff-8b085f24ebb4
f051145a-1d7d-41b6-a4bd-9bc005144cb0	2026-08-09 20:03:44.221489+00	2026-08-09 20:03:44.221489+00	password	14d5714c-63d1-450c-a08c-33f0c5ea16c7
a6cbe388-461f-486f-b7f6-a6e98f7a7d75	2026-08-09 20:06:44.015405+00	2026-08-09 20:06:44.015405+00	password	3a0eec98-79e1-4c93-9c2c-aa9421fea6c4
45c9b17b-b47d-4be7-a00b-981fa603e743	2026-08-09 20:07:04.706323+00	2026-08-09 20:07:04.706323+00	password	69d89089-c937-461b-8e3c-7343bb84bd98
4683dc33-67eb-4dc8-aafd-e0b0fa180545	2026-08-09 20:10:18.206926+00	2026-08-09 20:10:18.206926+00	password	0b2865b3-3cff-471e-a02e-0f2163a393ee
83ca68d7-f2cb-4766-a976-a422afc4dc4c	2026-08-09 20:10:49.36423+00	2026-08-09 20:10:49.36423+00	password	ef36b085-e48f-42ed-b1a7-5fa026399426
2a662415-3e79-4f65-a1ea-abd396d31ab3	2026-08-14 11:17:51.75402+00	2026-08-14 11:17:51.75402+00	password	27cf906e-09fd-48ea-be8c-5fee81e3e85b
9d8b2c17-90fd-48cd-bfe1-82f8d6faac86	2026-08-13 06:40:01.593129+00	2026-08-13 06:40:01.593129+00	password	310edf13-2052-4714-988f-eb0887658b4b
1327a63c-599e-4d9e-8bdb-95aff5e20a3b	2026-08-13 06:42:43.047575+00	2026-08-13 06:42:43.047575+00	password	bc2f0a06-c2e8-4ee2-9984-108a2bbee842
6f24a907-3f17-4d37-a85d-1689d1dfbd9b	2026-08-13 06:51:59.835582+00	2026-08-13 06:51:59.835582+00	password	12e06d07-045f-4e59-9010-8d8182bf04c4
a7242bfd-f61a-4a5e-82c8-ae4ae1772560	2026-08-13 06:52:15.890009+00	2026-08-13 06:52:15.890009+00	password	b76a7c2c-929f-4593-99ad-bbb6710de2bc
bfb18094-04b6-4c20-86f0-1a8fecafa608	2026-08-13 06:54:08.999496+00	2026-08-13 06:54:08.999496+00	password	bccb87f5-aceb-418f-9c70-fb11ef1f8ad4
21bb68a4-83d0-482f-b7ed-60f82869d131	2026-08-13 05:04:00.74503+00	2026-08-13 05:04:00.74503+00	password	26635d76-7f57-44d5-b4df-8d56aeb736d8
8c3713b7-919d-49e6-8ecc-dfa74dd57b3f	2026-08-13 06:55:27.428421+00	2026-08-13 06:55:27.428421+00	password	58c602a6-51b3-4094-a293-fe3fb95098df
39188e0f-b6a1-4782-9db5-b2f706caaccf	2026-08-16 16:28:24.93398+00	2026-08-16 16:28:24.93398+00	password	bd4f157f-9abc-4916-8c43-793447bc4b51
20db4204-ce7d-4bd9-aa1e-fd35117dee51	2026-08-13 06:21:50.892769+00	2026-08-13 06:21:50.892769+00	password	b512f9fe-441c-4902-aec7-c1274453a7ee
cf5eed45-9b47-44a3-acef-842eac8581ae	2026-08-13 06:29:02.122885+00	2026-08-13 06:29:02.122885+00	password	5e6f160b-675f-400b-a539-60dd100ced45
92fa0919-76d4-40d1-851a-77a9a8eadca8	2026-08-13 06:32:22.938249+00	2026-08-13 06:32:22.938249+00	password	acf6b56f-affe-4f26-9a34-07708b09e791
56da2f07-f521-4b3d-9f8a-37226a653d86	2026-08-13 06:32:55.932008+00	2026-08-13 06:32:55.932008+00	password	3562104c-544a-42b8-a503-3e1dd89e2025
1df6dac8-16d3-440b-a92a-4fc42958ba30	2026-08-13 06:36:41.150736+00	2026-08-13 06:36:41.150736+00	password	e56ec661-3d0d-48b5-8497-ae8094b6dcc0
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid, last_webauthn_challenge_data) FROM stdin;
\.


--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_authorizations (id, authorization_id, client_id, user_id, redirect_uri, scope, state, resource, code_challenge, code_challenge_method, response_type, status, authorization_code, created_at, expires_at, approved_at, nonce) FROM stdin;
\.


--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_client_states (id, provider_type, code_verifier, created_at) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_clients (id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at, client_type, token_endpoint_auth_method) FROM stdin;
\.


--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.oauth_consents (id, user_id, client_id, scopes, granted_at, revoked_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
77d9b101-0a42-460b-81bd-68a109ccefcb	3e8e373c-9978-47fd-ab39-009f0f8898c1	recovery_token	ff854d679de91d383b891b913acf384a29276efa730fa3c8199ce6ef	dewrangashamindu45@gmail.com	2026-08-13 06:58:15.701406	2026-08-13 06:58:15.701406
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	897	eyrucak3feif	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 13:12:59.695019+00	2026-08-09 13:12:59.695019+00	\N	48b32cd9-8f0b-4823-a148-f5e417c43661
00000000-0000-0000-0000-000000000000	1410	2gajs44w56zf	04391a6a-549b-409b-929b-860f9b0ba271	f	2026-08-14 11:17:51.749549+00	2026-08-14 11:17:51.749549+00	\N	2a662415-3e79-4f65-a1ea-abd396d31ab3
00000000-0000-0000-0000-000000000000	898	nypgh7w7qf33	a6148a55-6a57-4213-92c0-e52b6f87f01f	t	2026-08-09 13:13:15.977212+00	2026-08-09 14:12:43.772116+00	\N	d706e60b-d5c9-446f-82a2-e5b37850cba3
00000000-0000-0000-0000-000000000000	907	fsnc4ibo5fzn	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 14:12:43.77251+00	2026-08-09 14:12:43.77251+00	nypgh7w7qf33	d706e60b-d5c9-446f-82a2-e5b37850cba3
00000000-0000-0000-0000-000000000000	931	l3xwhkcjrxpu	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 18:01:07.14738+00	2026-08-09 18:01:07.14738+00	\N	3a81bf6c-50a7-4f01-90dd-0588f703c436
00000000-0000-0000-0000-000000000000	1438	p3cw6y2uuodi	ddea66f5-de28-469c-be1b-122b570703dd	f	2026-08-16 16:22:33.622403+00	2026-08-16 16:22:33.622403+00	\N	daecd98e-7f36-4c84-b9f9-7693598c652b
00000000-0000-0000-0000-000000000000	1439	auntrtz3pqyz	ddea66f5-de28-469c-be1b-122b570703dd	f	2026-08-16 16:23:24.054192+00	2026-08-16 16:23:24.054192+00	\N	5fc9202f-9584-41e4-907b-c79da660ddfa
00000000-0000-0000-0000-000000000000	942	ha22iolysung	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-09 18:54:08.728467+00	2026-08-09 18:54:08.728467+00	\N	2d35e9a7-9031-4d16-aaff-7df49ffcf600
00000000-0000-0000-0000-000000000000	954	7txwmtvlrpzl	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-09 19:54:53.839082+00	2026-08-09 19:54:53.839082+00	\N	985f15a9-316f-45e5-a252-4bec9ff4a4d9
00000000-0000-0000-0000-000000000000	967	lynhnpmvqy4z	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-09 20:06:44.014045+00	2026-08-09 20:06:44.014045+00	\N	a6cbe388-461f-486f-b7f6-a6e98f7a7d75
00000000-0000-0000-0000-000000000000	968	bubonugixcuh	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-09 20:07:04.705042+00	2026-08-09 20:07:04.705042+00	\N	45c9b17b-b47d-4be7-a00b-981fa603e743
00000000-0000-0000-0000-000000000000	1440	nmxmjqwl2v6p	ddea66f5-de28-469c-be1b-122b570703dd	f	2026-08-16 16:28:24.926359+00	2026-08-16 16:28:24.926359+00	\N	39188e0f-b6a1-4782-9db5-b2f706caaccf
00000000-0000-0000-0000-000000000000	911	wcjz2iesljk6	a6148a55-6a57-4213-92c0-e52b6f87f01f	t	2026-08-09 14:14:55.426219+00	2026-08-09 17:57:07.688201+00	\N	963d3650-d8a6-470a-a0db-90b9b6e5c84e
00000000-0000-0000-0000-000000000000	927	ahzup2xp6qch	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 17:57:07.694269+00	2026-08-09 17:57:07.694269+00	wcjz2iesljk6	963d3650-d8a6-470a-a0db-90b9b6e5c84e
00000000-0000-0000-0000-000000000000	928	xwx6xipjkzn2	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 17:57:16.843455+00	2026-08-09 17:57:16.843455+00	\N	fa59288f-8b06-4ff0-a351-195cb70d0876
00000000-0000-0000-0000-000000000000	944	hhxmdz5wwvxv	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-09 18:55:32.539764+00	2026-08-09 18:55:32.539764+00	\N	21bb30ee-57c2-43ed-af0c-372c6a826d84
00000000-0000-0000-0000-000000000000	952	f6cqhbyca65l	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 19:53:48.871665+00	2026-08-09 19:53:48.871665+00	\N	f83307dc-ce2e-4326-91fc-d1925d3df201
00000000-0000-0000-0000-000000000000	957	ydfhjbfe5wy5	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 19:57:17.456754+00	2026-08-09 19:57:17.456754+00	\N	f60ff7e5-16c5-417a-bca2-a719008a6a40
00000000-0000-0000-0000-000000000000	961	t2fbwqqis22n	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 20:00:26.135936+00	2026-08-09 20:00:26.135936+00	\N	3bfa3ef2-6d41-40bc-9c2b-af01ab32242a
00000000-0000-0000-0000-000000000000	963	qdq6joaam5om	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 20:03:44.220176+00	2026-08-09 20:03:44.220176+00	\N	f051145a-1d7d-41b6-a4bd-9bc005144cb0
00000000-0000-0000-0000-000000000000	973	2ggigkvcnq25	a6148a55-6a57-4213-92c0-e52b6f87f01f	f	2026-08-09 20:10:18.20566+00	2026-08-09 20:10:18.20566+00	\N	4683dc33-67eb-4dc8-aafd-e0b0fa180545
00000000-0000-0000-0000-000000000000	974	uumjipuuodgv	a50cdb87-15b2-488b-bc34-f3b178e9a040	t	2026-08-09 20:10:49.358384+00	2026-08-13 04:22:25.322171+00	\N	83ca68d7-f2cb-4766-a976-a422afc4dc4c
00000000-0000-0000-0000-000000000000	1291	jwt4bpwyh4rp	a50cdb87-15b2-488b-bc34-f3b178e9a040	f	2026-08-13 04:22:25.329995+00	2026-08-13 04:22:25.329995+00	uumjipuuodgv	83ca68d7-f2cb-4766-a976-a422afc4dc4c
00000000-0000-0000-0000-000000000000	1294	lqe5tdvh35tr	c17d2b20-b7c0-4cfc-84cc-182e003e07ff	f	2026-08-13 05:04:00.743638+00	2026-08-13 05:04:00.743638+00	\N	21bb68a4-83d0-482f-b7ed-60f82869d131
00000000-0000-0000-0000-000000000000	1315	rjf5lts4gout	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:21:50.88581+00	2026-08-13 06:21:50.88581+00	\N	20db4204-ce7d-4bd9-aa1e-fd35117dee51
00000000-0000-0000-0000-000000000000	1317	cekb47xhsg5v	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:29:02.108928+00	2026-08-13 06:29:02.108928+00	\N	cf5eed45-9b47-44a3-acef-842eac8581ae
00000000-0000-0000-0000-000000000000	1319	mdyjfxesat34	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:32:22.931526+00	2026-08-13 06:32:22.931526+00	\N	92fa0919-76d4-40d1-851a-77a9a8eadca8
00000000-0000-0000-0000-000000000000	1320	mdsflcjgfxv2	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:32:55.93054+00	2026-08-13 06:32:55.93054+00	\N	56da2f07-f521-4b3d-9f8a-37226a653d86
00000000-0000-0000-0000-000000000000	1325	qxjo4mg6mti2	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:36:41.149378+00	2026-08-13 06:36:41.149378+00	\N	1df6dac8-16d3-440b-a92a-4fc42958ba30
00000000-0000-0000-0000-000000000000	1327	dow5o525s7of	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:37:23.896992+00	2026-08-13 06:37:23.896992+00	\N	f6ef249f-896f-4917-b12c-45ab6879fb7c
00000000-0000-0000-0000-000000000000	1332	h2nnh6pyurwd	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:40:01.591492+00	2026-08-13 06:40:01.591492+00	\N	9d8b2c17-90fd-48cd-bfe1-82f8d6faac86
00000000-0000-0000-0000-000000000000	1335	3fj2p6ulf7pf	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:42:43.036809+00	2026-08-13 06:42:43.036809+00	\N	1327a63c-599e-4d9e-8bdb-95aff5e20a3b
00000000-0000-0000-0000-000000000000	1341	e2holdtoip3h	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:51:59.833672+00	2026-08-13 06:51:59.833672+00	\N	6f24a907-3f17-4d37-a85d-1689d1dfbd9b
00000000-0000-0000-0000-000000000000	1343	e2xrxruxbcmv	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:52:15.88681+00	2026-08-13 06:52:15.88681+00	\N	a7242bfd-f61a-4a5e-82c8-ae4ae1772560
00000000-0000-0000-0000-000000000000	1344	jra5kim7yspo	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:54:08.995936+00	2026-08-13 06:54:08.995936+00	\N	bfb18094-04b6-4c20-86f0-1a8fecafa608
00000000-0000-0000-0000-000000000000	1346	7jayxdlxcspq	3e8e373c-9978-47fd-ab39-009f0f8898c1	f	2026-08-13 06:55:27.415925+00	2026-08-13 06:55:27.415925+00	\N	8c3713b7-919d-49e6-8ecc-dfa74dd57b3f
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
20250804100000
20250901200500
20250903112500
20250904133000
20250925093508
20251007112900
20251104100000
20251111201300
20251201000000
20260115000000
20260121000000
20260219120000
20260302000000
20260625000000
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag, oauth_client_id, refresh_token_hmac_key, refresh_token_counter, scopes) FROM stdin;
48b32cd9-8f0b-4823-a148-f5e417c43661	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 13:12:59.691923+00	2026-08-09 13:12:59.691923+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
d706e60b-d5c9-446f-82a2-e5b37850cba3	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 13:13:15.955128+00	2026-08-09 14:12:43.774712+00	\N	aal1	\N	2026-08-09 14:12:43.774599	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
92fa0919-76d4-40d1-851a-77a9a8eadca8	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:32:22.904008+00	2026-08-13 06:32:22.904008+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
963d3650-d8a6-470a-a0db-90b9b6e5c84e	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 14:14:55.425109+00	2026-08-09 17:57:07.710862+00	\N	aal1	\N	2026-08-09 17:57:07.710711	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
56da2f07-f521-4b3d-9f8a-37226a653d86	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:32:55.929271+00	2026-08-13 06:32:55.929271+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
3a81bf6c-50a7-4f01-90dd-0588f703c436	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 18:01:06.917226+00	2026-08-09 18:01:06.917226+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
daecd98e-7f36-4c84-b9f9-7693598c652b	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-16 16:22:33.61743+00	2026-08-16 16:22:33.61743+00	\N	aal1	\N	\N	okhttp/4.12.0	223.224.30.206	\N	\N	\N	\N	\N
2d35e9a7-9031-4d16-aaff-7df49ffcf600	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 18:54:08.71103+00	2026-08-09 18:54:08.71103+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
5fc9202f-9584-41e4-907b-c79da660ddfa	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-16 16:23:24.046367+00	2026-08-16 16:23:24.046367+00	\N	aal1	\N	\N	okhttp/4.12.0	223.224.30.206	\N	\N	\N	\N	\N
f60ff7e5-16c5-417a-bca2-a719008a6a40	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 19:57:17.444978+00	2026-08-09 19:57:17.444978+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
3bfa3ef2-6d41-40bc-9c2b-af01ab32242a	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 20:00:26.133353+00	2026-08-09 20:00:26.133353+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
f051145a-1d7d-41b6-a4bd-9bc005144cb0	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 20:03:44.218958+00	2026-08-09 20:03:44.218958+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
4683dc33-67eb-4dc8-aafd-e0b0fa180545	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 20:10:18.204584+00	2026-08-09 20:10:18.204584+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
9d8b2c17-90fd-48cd-bfe1-82f8d6faac86	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:40:01.590192+00	2026-08-13 06:40:01.590192+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
6f24a907-3f17-4d37-a85d-1689d1dfbd9b	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:51:59.832135+00	2026-08-13 06:51:59.832135+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
a7242bfd-f61a-4a5e-82c8-ae4ae1772560	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:52:15.877632+00	2026-08-13 06:52:15.877632+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
83ca68d7-f2cb-4766-a976-a422afc4dc4c	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 20:10:49.357013+00	2026-08-13 04:32:31.573934+00	\N	aal1	\N	2026-08-13 04:32:31.573193	okhttp/4.12.0	61.245.169.239	\N	\N	\N	\N	\N
21bb68a4-83d0-482f-b7ed-60f82869d131	c17d2b20-b7c0-4cfc-84cc-182e003e07ff	2026-08-13 05:04:00.742388+00	2026-08-13 05:04:00.742388+00	\N	aal1	\N	\N	okhttp/4.12.0	223.224.11.157	\N	\N	\N	\N	\N
2a662415-3e79-4f65-a1ea-abd396d31ab3	04391a6a-549b-409b-929b-860f9b0ba271	2026-08-14 11:17:51.741484+00	2026-08-14 11:17:51.741484+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36	43.250.241.244	\N	\N	\N	\N	\N
20db4204-ce7d-4bd9-aa1e-fd35117dee51	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:21:50.862427+00	2026-08-13 06:21:50.862427+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
fa59288f-8b06-4ff0-a351-195cb70d0876	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 17:57:16.841043+00	2026-08-09 17:57:16.841043+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
cf5eed45-9b47-44a3-acef-842eac8581ae	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:29:02.088258+00	2026-08-13 06:29:02.088258+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
39188e0f-b6a1-4782-9db5-b2f706caaccf	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-16 16:28:24.90048+00	2026-08-16 16:28:24.90048+00	\N	aal1	\N	\N	okhttp/4.12.0	223.224.30.206	\N	\N	\N	\N	\N
21bb30ee-57c2-43ed-af0c-372c6a826d84	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 18:55:32.537576+00	2026-08-09 18:55:32.537576+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
f83307dc-ce2e-4326-91fc-d1925d3df201	a6148a55-6a57-4213-92c0-e52b6f87f01f	2026-08-09 19:53:48.843966+00	2026-08-09 19:53:48.843966+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
985f15a9-316f-45e5-a252-4bec9ff4a4d9	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 19:54:53.834537+00	2026-08-09 19:54:53.834537+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
1df6dac8-16d3-440b-a92a-4fc42958ba30	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:36:41.148079+00	2026-08-13 06:36:41.148079+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
a6cbe388-461f-486f-b7f6-a6e98f7a7d75	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 20:06:44.012558+00	2026-08-09 20:06:44.012558+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
45c9b17b-b47d-4be7-a00b-981fa603e743	a50cdb87-15b2-488b-bc34-f3b178e9a040	2026-08-09 20:07:04.700929+00	2026-08-09 20:07:04.700929+00	\N	aal1	\N	\N	okhttp/4.12.0	212.104.224.239	\N	\N	\N	\N	\N
f6ef249f-896f-4917-b12c-45ab6879fb7c	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:37:23.895774+00	2026-08-13 06:37:23.895774+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
1327a63c-599e-4d9e-8bdb-95aff5e20a3b	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:42:43.032956+00	2026-08-13 06:42:43.032956+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
bfb18094-04b6-4c20-86f0-1a8fecafa608	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:54:08.993325+00	2026-08-13 06:54:08.993325+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
8c3713b7-919d-49e6-8ecc-dfa74dd57b3f	3e8e373c-9978-47fd-ab39-009f0f8898c1	2026-08-13 06:55:27.40284+00	2026-08-13 06:55:27.40284+00	\N	aal1	\N	\N	Expo/1017756 CFNetwork/3860.600.12 Darwin/25.5.0	223.224.11.157	\N	\N	\N	\N	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	04391a6a-549b-409b-929b-860f9b0ba271	authenticated	authenticated	chairman@pradeshiya.gov.lk	$2a$10$zaeOEACifQ3V.LqIE2NhpOGL.2Eie3KNpOSuX2w7AGTmVCI49BMU6	2026-05-30 02:37:12.069387+00	\N		\N		\N			\N	2026-08-14 11:17:51.740707+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-05-30 02:37:12.062441+00	2026-08-14 11:17:51.752468+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ddea66f5-de28-469c-be1b-122b570703dd	authenticated	authenticated	dewrangashamindu17@gmail.com	$2a$10$P6liLMnxbmCK9dwSMqiefOLU9IFmIYW3guIEnC4E3X3eXwUy5zpai	2026-08-09 13:02:36.639335+00	\N		\N		\N			\N	2026-08-16 16:28:24.898012+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-09 13:02:36.608971+00	2026-08-16 16:28:24.929527+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	bc92f315-c11b-43ff-a8f6-bdef28797582	authenticated	authenticated	anshyajayarathna2003@gmail.com	$2a$10$5hcNsow67ss/5IGgMu0UwORb2Ve8ft/MaDaKRZbJTSpxbP1dogVBK	2026-08-13 03:53:11.205444+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-13 03:53:11.172469+00	2026-08-13 03:53:11.207113+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	ff539ee4-f139-44c1-9d00-3714f2c30bec	authenticated	authenticated	secretary@pradeshiya.gov.lk	$2a$10$mUOZ.H8EDIA1oBCSMPwi/.ttDpOgIsBVugifS8NiqcgJTTiWvJ7BK	2026-07-25 12:25:20.424882+00	\N		\N		\N			\N	2026-08-31 08:51:24.524351+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-07-25 12:25:20.378627+00	2026-08-31 08:51:24.550914+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a50cdb87-15b2-488b-bc34-f3b178e9a040	authenticated	authenticated	bbcnew16@gmail.com	$2a$10$KMkJgWfdfsp10dygtGNISuQTUAp3c22dVwvUSXlHJOzoR1iLQQHAG	2026-08-09 18:51:35.61097+00	\N		\N		\N			\N	2026-08-09 20:10:49.356892+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-09 18:51:35.589838+00	2026-08-13 04:22:25.33929+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a6148a55-6a57-4213-92c0-e52b6f87f01f	authenticated	authenticated	dulminikumari2002@gmail.com	$2a$10$44J6y/AepdeZrzjZnTmrHeCsp7Kt1tR7btsPQU0F/B4bHPiISqu9i	2026-08-09 13:05:04.25219+00	\N		\N		\N			\N	2026-08-09 20:10:18.204465+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-09 13:05:04.242422+00	2026-08-09 20:10:18.206523+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	aab36179-33a3-4b24-80f8-b732a2968c6b	authenticated	authenticated	library.head@staff.lk	$2a$10$SzcbjZUY1xg.gi1Io6l3teJc9.4Dj8ukn94PbIdjrxEdRDz1ZmgRq	2026-08-31 09:27:31.685858+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:27:31.677448+00	2026-08-31 09:27:31.686771+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	c17d2b20-b7c0-4cfc-84cc-182e003e07ff	authenticated	authenticated	lakshidharmarathna@gmail.com	$2a$10$K5qsL.0GdmdXNX7pRP3/S.s5fJ8wwgr3njH4xSTs8T19EsIPvwXxS	2026-08-13 05:02:25.143139+00	\N		\N		\N			\N	2026-08-13 05:04:00.742291+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-13 05:02:25.112219+00	2026-08-13 05:06:59.430403+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	e6eea446-2800-4328-9f59-a662a16abf41	authenticated	authenticated	subjectofficer@pradeshiya.gov.lk	$2a$10$XOpAVMzAfh.hI11l0bOEFuGRiXesb/1McI0WESKezNbZSEpQx2HtK	2026-07-25 12:26:22.168504+00	\N		\N		\N			\N	2026-08-13 05:27:50.738911+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-07-25 12:26:22.144795+00	2026-08-13 05:27:50.750174+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	1cb438d9-4387-4159-990c-29761709a9bf	authenticated	authenticated	planning.head@staff.lk	$2a$10$oPiUPVhkpShMRza5xhWT0O14pccp5csmj1iIe9BA2fmY2rpZlK2GC	2026-08-31 09:26:07.100817+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:26:07.066893+00	2026-08-31 09:26:07.102103+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	43a3dd17-e195-4d97-9c10-781eea40f7e6	authenticated	authenticated	anshya2003@gmail.com	$2a$10$YPDxPgEv9nt0e22o4fuWouatyLeEVaJlazqxwZyQXMEh8FveYKSWu	2026-08-11 19:09:29.829216+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-11 19:09:29.799714+00	2026-08-11 19:09:29.830188+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	5f91dc11-66f4-4c17-9267-029afe94a681	authenticated	authenticated	health.head@staff.lk	$2a$10$ImRO3Wgqn568SoHV5.5BYO7MOd4HJsaDOyUOWeyJ7KFNdXXMEpB4O	2026-08-31 09:23:31.715193+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:23:31.697359+00	2026-08-31 09:23:31.716124+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	3e8e373c-9978-47fd-ab39-009f0f8898c1	authenticated	authenticated	dewrangashamindu45@gmail.com	$2a$10$UbbbaW7LY3ltyt6Tn1EucuRtxmeCIZ4LXGfJMmWudBUTQgoubIfzy	2026-08-13 06:09:45.540059+00	\N		\N	ff854d679de91d383b891b913acf384a29276efa730fa3c8199ce6ef	2026-08-13 06:58:13.250709+00			\N	2026-08-13 06:55:27.401588+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-13 06:09:45.513912+00	2026-08-13 06:58:15.690381+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	cd536781-f062-41e0-a30f-e043665970a3	authenticated	authenticated	admin@pradeshiya.gov.lk	$2a$10$lEiwXv.t7EWWrdOkMbmHWeu6n6RWcF9kNoxKT/hpvImeLurnCxmLa	2026-05-25 03:22:51.632281+00	\N		\N		\N			\N	2026-08-31 09:39:27.231743+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-05-25 03:22:51.610943+00	2026-08-31 09:39:27.256247+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	a0c32bbf-deee-4036-845d-8dbbb8ae92e7	authenticated	authenticated	admin.head@staff.lk	$2a$10$yriR0yragtzSLv5oHbcrOOM4AqyjdRwK.0uG51gAnY6TRnHCoMYvC	2026-08-31 09:18:19.863575+00	\N		\N		\N			\N	2026-08-31 09:40:20.216226+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:18:19.844459+00	2026-08-31 09:40:20.22873+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	2b04dc1e-bdf7-4ce0-8044-579c359da57c	authenticated	authenticated	utility.head@staff.lk	$2a$10$iagUR4n5x.6oixTfozhtXONMt9aFaey25CREl.YS7gi2HUh6OJXoa	2026-08-31 09:30:02.230629+00	\N		\N		\N			\N	2026-08-31 09:41:03.921136+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:30:02.213725+00	2026-08-31 09:41:03.924842+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	9315fb98-1ca2-452d-abe0-082cb16a64fb	authenticated	authenticated	ccofficer@pradeshiya.gov.lk	$2a$10$TPU9uogL/TUHtElP9XY8.eAXVXA0bwS8iwriKXlOmyA6/HzYK/1I2	2026-07-18 17:52:29.910688+00	\N		\N		\N			\N	2026-08-31 09:42:16.878055+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-07-18 17:52:29.900165+00	2026-08-31 09:42:16.882476+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	de444250-3be9-40a6-9e2f-00d23d770b7f	authenticated	authenticated	devecon.head@staff.lk	$2a$10$Wikb2ufQKW4jqZS/kuoXi.GxcPlR65/5Xsba3Hy571oTBWlWssxc2	2026-08-31 09:30:32.824837+00	\N		\N		\N			\N	2026-08-31 10:03:13.510059+00	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-31 09:30:32.820391+00	2026-08-31 10:03:13.536518+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	6615ed1c-eba0-4654-98f3-bb24159b5444	authenticated	authenticated	isurulanka2007@gmail.com	$2a$10$LQaqZXh0uPPLGnJXziB6N.5dVitMJKPSz4UYPYX90SW7.CGfHTJsG	2026-08-12 13:49:53.435474+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{"email_verified": true}	\N	2026-08-12 13:49:53.403309+00	2026-08-12 13:49:53.437991+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_challenges (id, user_id, challenge_type, session_data, created_at, expires_at) FROM stdin;
\.


--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.webauthn_credentials (id, user_id, credential_id, public_key, attestation_type, aaguid, sign_count, transports, backup_eligible, backed_up, friendly_name, created_at, updated_at, last_used_at) FROM stdin;
\.


--
-- Data for Name: job; Type: TABLE DATA; Schema: cron; Owner: supabase_admin
--

COPY cron.job (jobid, schedule, command, nodename, nodeport, database, username, active, jobname) FROM stdin;
1	0 0 1 1 *	\r\n    \r\n    INSERT INTO user_leave_balances (user_id, leave_type_id, year, remaining_days, allocated_days)\r\n    SELECT \r\n        u.id, \r\n        lt.id, \r\n        EXTRACT(YEAR FROM CURRENT_DATE), \r\n        lt.max_days, \r\n        lt.max_days\r\n    FROM users u\r\n    CROSS JOIN leave_types lt\r\n    WHERE u.is_active = true; \r\n  	localhost	5432	postgres	postgres	t	yearly-leave-allocation
2	0 * * * *	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	localhost	5432	postgres	postgres	t	delete-notifications-older-than-24-hours
\.


--
-- Data for Name: job_run_details; Type: TABLE DATA; Schema: cron; Owner: supabase_admin
--

COPY cron.job_run_details (jobid, runid, job_pid, database, username, command, status, return_message, start_time, end_time) FROM stdin;
2	15	2497026	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 08:00:00.198774+00	2026-08-13 08:00:00.269347+00
2	9	2467725	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 02:00:00.223263+00	2026-08-13 02:00:00.273824+00
2	1	2434145	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 1	2026-08-12 18:00:00.208595+00	2026-08-12 18:00:00.211875+00
2	36	2584464	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 05:00:00.303711+00	2026-08-14 05:00:00.30746+00
2	30	2559154	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 23:00:00.229019+00	2026-08-13 23:00:00.284679+00
2	2	2438821	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-12 19:00:00.236149+00	2026-08-12 19:00:00.238838+00
2	10	2472551	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 03:00:00.170989+00	2026-08-13 03:00:00.175657+00
2	3	2442920	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 9	2026-08-12 20:00:00.237178+00	2026-08-12 20:00:00.296038+00
2	16	2501141	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 09:00:00.207338+00	2026-08-13 09:00:00.246007+00
2	21	2521692	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 14:00:00.20907+00	2026-08-13 14:00:00.253994+00
2	4	2447050	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 3	2026-08-12 21:00:00.206472+00	2026-08-12 21:00:00.263094+00
2	11	2477561	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 04:00:00.179312+00	2026-08-13 04:00:00.18142+00
2	5	2451230	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 2	2026-08-12 22:00:00.231359+00	2026-08-12 22:00:00.286127+00
2	25	2538641	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 18:00:00.225187+00	2026-08-13 18:00:00.279618+00
2	17	2505270	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 10:00:00.214387+00	2026-08-13 10:00:00.279512+00
2	12	2482155	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 05:00:00.219537+00	2026-08-13 05:00:00.243819+00
2	6	2455322	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-12 23:00:00.220288+00	2026-08-12 23:00:00.2626+00
2	7	2459422	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 00:00:00.212991+00	2026-08-13 00:00:00.264508+00
2	28	2551022	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 21:00:00.239356+00	2026-08-13 21:00:00.304384+00
2	13	2486939	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 06:00:00.177763+00	2026-08-13 06:00:00.193252+00
2	8	2463614	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 01:00:00.227013+00	2026-08-13 01:00:00.267692+00
2	22	2525928	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 15:00:00.22922+00	2026-08-13 15:00:00.289957+00
2	18	2509380	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 11:00:00.215491+00	2026-08-13 11:00:00.263052+00
2	14	2492707	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 07:00:00.177487+00	2026-08-13 07:00:00.185477+00
2	32	2567768	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 01:00:00.223015+00	2026-08-14 01:00:00.271603+00
2	26	2542869	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 19:00:00.196796+00	2026-08-13 19:00:00.240919+00
2	19	2513477	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 12:00:00.233975+00	2026-08-13 12:00:00.274918+00
2	23	2530030	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 16:00:00.232403+00	2026-08-13 16:00:00.274042+00
2	20	2517581	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 13:00:00.235733+00	2026-08-13 13:00:00.281449+00
2	24	2534107	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 17:00:00.252261+00	2026-08-13 17:00:00.295092+00
2	29	2555091	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 22:00:00.22542+00	2026-08-13 22:00:00.260831+00
2	27	2546937	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-13 20:00:00.221971+00	2026-08-13 20:00:00.260916+00
2	31	2563235	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 00:00:00.223098+00	2026-08-14 00:00:00.296066+00
2	37	2589063	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 22	2026-08-14 06:00:00.180724+00	2026-08-14 06:00:00.199919+00
2	34	2575929	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 03:00:00.234334+00	2026-08-14 03:00:00.302694+00
2	33	2571858	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 02:00:00.233165+00	2026-08-14 02:00:00.261748+00
2	35	2579997	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 04:00:00.221107+00	2026-08-14 04:00:00.261846+00
2	38	2593988	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 07:00:00.237424+00	2026-08-14 07:00:00.262975+00
2	39	2598798	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 08:00:00.206279+00	2026-08-14 08:00:00.221663+00
2	40	2603991	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 09:00:00.167823+00	2026-08-14 09:00:00.179704+00
2	41	2609015	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 10:00:00.178147+00	2026-08-14 10:00:00.196286+00
2	56	2672716	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 01:00:00.235223+00	2026-08-15 01:00:00.288139+00
2	50	2648161	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 19:00:00.231113+00	2026-08-14 19:00:00.260348+00
2	42	2614145	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 11:00:00.191359+00	2026-08-14 11:00:00.210909+00
2	77	2759047	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 22:00:00.203104+00	2026-08-15 22:00:00.272942+00
2	71	2734432	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 16:00:00.236807+00	2026-08-15 16:00:00.299179+00
2	43	2618725	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 12:00:00.228418+00	2026-08-14 12:00:00.248589+00
2	51	2652243	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 20:00:00.204942+00	2026-08-14 20:00:00.247389+00
2	44	2623289	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 13:00:00.173545+00	2026-08-14 13:00:00.18507+00
2	57	2676791	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 02:00:00.221049+00	2026-08-15 02:00:00.294845+00
2	62	2697277	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 1	2026-08-15 07:00:00.252373+00	2026-08-15 07:00:00.290416+00
2	45	2627546	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 14:00:00.213508+00	2026-08-14 14:00:00.265519+00
2	52	2656410	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 21:00:00.218987+00	2026-08-14 21:00:00.29991+00
2	46	2631690	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 15:00:00.206435+00	2026-08-14 15:00:00.249128+00
2	66	2714027	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 11:00:00.237373+00	2026-08-15 11:00:00.304476+00
2	58	2680862	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 03:00:00.237971+00	2026-08-15 03:00:00.303091+00
2	53	2660463	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 22:00:00.204405+00	2026-08-14 22:00:00.232784+00
2	47	2635806	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 16:00:00.217152+00	2026-08-14 16:00:00.270201+00
2	48	2639890	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 17:00:00.248263+00	2026-08-14 17:00:00.308534+00
2	69	2726253	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 14:00:00.225764+00	2026-08-15 14:00:00.306575+00
2	54	2664537	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 23:00:00.229806+00	2026-08-14 23:00:00.294216+00
2	49	2643957	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-14 18:00:00.266561+00	2026-08-14 18:00:00.324111+00
2	63	2701352	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 3	2026-08-15 08:00:00.222503+00	2026-08-15 08:00:00.276209+00
2	59	2684938	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 04:00:00.228316+00	2026-08-15 04:00:00.288074+00
2	55	2668626	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 00:00:00.228257+00	2026-08-15 00:00:00.290493+00
2	73	2742600	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 18:00:00.212063+00	2026-08-15 18:00:00.254973+00
2	67	2718092	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 12:00:00.241789+00	2026-08-15 12:00:00.272568+00
2	60	2689013	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 05:00:00.222538+00	2026-08-15 05:00:00.275918+00
2	64	2705434	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 09:00:00.245092+00	2026-08-15 09:00:00.31468+00
2	61	2693085	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 06:00:00.218088+00	2026-08-15 06:00:00.26397+00
2	65	2709952	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 10:00:00.220231+00	2026-08-15 10:00:00.251603+00
2	70	2730345	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 15:00:00.223478+00	2026-08-15 15:00:00.284844+00
2	68	2722175	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 13:00:00.222488+00	2026-08-15 13:00:00.27352+00
2	72	2738528	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 17:00:00.228775+00	2026-08-15 17:00:00.266859+00
2	78	2763105	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 23:00:00.246441+00	2026-08-15 23:00:00.296574+00
2	75	2750920	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 20:00:00.237503+00	2026-08-15 20:00:00.292266+00
2	74	2746826	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 19:00:00.236512+00	2026-08-15 19:00:00.298289+00
2	76	2754984	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-15 21:00:00.205527+00	2026-08-15 21:00:00.235467+00
2	79	2767170	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 00:00:00.247028+00	2026-08-16 00:00:00.324316+00
2	80	2771258	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 01:00:00.241432+00	2026-08-16 01:00:00.288101+00
2	81	2775319	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 02:00:00.23068+00	2026-08-16 02:00:00.289946+00
2	82	2779376	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 03:00:00.230744+00	2026-08-16 03:00:00.270051+00
2	97	2841324	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 18:00:00.225274+00	2026-08-16 18:00:00.297949+00
2	91	2816624	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 12:00:00.220564+00	2026-08-16 12:00:00.283645+00
2	83	2783437	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 04:00:00.228065+00	2026-08-16 04:00:00.300696+00
2	118	2927564	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 15:00:00.257785+00	2026-08-17 15:00:00.317212+00
2	112	2903150	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 09:00:00.242103+00	2026-08-17 09:00:00.297226+00
2	84	2787505	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 05:00:00.205539+00	2026-08-16 05:00:00.240578+00
2	92	2820689	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 13:00:00.216376+00	2026-08-16 13:00:00.275411+00
2	85	2792014	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 06:00:00.275432+00	2026-08-16 06:00:00.343212+00
2	98	2845543	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 19:00:00.209047+00	2026-08-16 19:00:00.253537+00
2	103	2865908	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 00:00:00.243889+00	2026-08-17 00:00:00.313427+00
2	86	2796298	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 07:00:00.231668+00	2026-08-16 07:00:00.309432+00
2	93	2824782	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 14:00:00.218084+00	2026-08-16 14:00:00.245261+00
2	87	2800363	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 08:00:00.227368+00	2026-08-16 08:00:00.277193+00
2	107	2882624	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 04:00:00.235373+00	2026-08-17 04:00:00.296856+00
2	99	2849610	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 20:00:00.237822+00	2026-08-16 20:00:00.285796+00
2	94	2828846	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 15:00:00.204456+00	2026-08-16 15:00:00.254852+00
2	88	2804435	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 09:00:00.231756+00	2026-08-16 09:00:00.278198+00
2	89	2808499	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 10:00:00.201925+00	2026-08-16 10:00:00.262074+00
2	110	2894923	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 07:00:00.24429+00	2026-08-17 07:00:00.313544+00
2	95	2833005	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 16:00:00.196909+00	2026-08-16 16:00:00.223007+00
2	90	2812564	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 11:00:00.224982+00	2026-08-16 11:00:00.292516+00
2	104	2869998	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 01:00:00.222621+00	2026-08-17 01:00:00.285717+00
2	100	2853676	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 21:00:00.236528+00	2026-08-16 21:00:00.277135+00
2	96	2837231	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 17:00:00.214305+00	2026-08-16 17:00:00.244922+00
2	114	2911294	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 11:00:00.236141+00	2026-08-17 11:00:00.314116+00
2	108	2886690	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 05:00:00.226006+00	2026-08-17 05:00:00.289298+00
2	101	2857767	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 22:00:00.237459+00	2026-08-16 22:00:00.281329+00
2	105	2874056	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 02:00:00.222693+00	2026-08-17 02:00:00.301314+00
2	102	2861828	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-16 23:00:00.226694+00	2026-08-16 23:00:00.299335+00
2	106	2878563	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 03:00:00.221416+00	2026-08-17 03:00:00.293721+00
2	111	2899089	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 08:00:00.227413+00	2026-08-17 08:00:00.290579+00
2	109	2890737	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 06:00:00.245348+00	2026-08-17 06:00:00.294388+00
2	113	2907221	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 10:00:00.230931+00	2026-08-17 10:00:00.275386+00
2	119	2931624	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 16:00:00.22224+00	2026-08-17 16:00:00.272639+00
2	116	2919421	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 13:00:00.245534+00	2026-08-17 13:00:00.292257+00
2	115	2915353	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 12:00:00.233705+00	2026-08-17 12:00:00.272419+00
2	117	2923486	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 14:00:00.233485+00	2026-08-17 14:00:00.287756+00
2	120	2935685	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 17:00:00.217717+00	2026-08-17 17:00:00.278256+00
2	121	2939769	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 18:00:00.230019+00	2026-08-17 18:00:00.265626+00
2	122	2944049	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 19:00:00.266829+00	2026-08-17 19:00:00.324306+00
2	123	2948106	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 20:00:00.210889+00	2026-08-17 20:00:00.289163+00
2	138	3009734	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 11:00:00.23067+00	2026-08-18 11:00:00.299191+00
2	132	2984761	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 05:00:00.26102+00	2026-08-18 05:00:00.351432+00
2	124	2952210	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 21:00:00.243388+00	2026-08-17 21:00:00.301354+00
2	159	3096093	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 08:00:00.208368+00	2026-08-19 08:00:00.254858+00
2	153	3071108	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 02:00:00.229374+00	2026-08-19 02:00:00.272229+00
2	125	2956277	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 22:00:00.182332+00	2026-08-17 22:00:00.223917+00
2	133	2988825	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 06:00:00.260902+00	2026-08-18 06:00:00.312305+00
2	126	2960342	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-17 23:00:00.230074+00	2026-08-17 23:00:00.296842+00
2	139	3013796	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 12:00:00.243374+00	2026-08-18 12:00:00.286956+00
2	144	3034280	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 17:00:00.266295+00	2026-08-18 17:00:00.351341+00
2	127	2964408	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 00:00:00.240576+00	2026-08-18 00:00:00.321471+00
2	134	2993014	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 07:00:00.194656+00	2026-08-18 07:00:00.241273+00
2	128	2968499	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 01:00:00.237104+00	2026-08-18 01:00:00.26779+00
2	148	3050767	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 21:00:00.25958+00	2026-08-18 21:00:00.337663+00
2	140	3017860	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 13:00:00.228077+00	2026-08-18 13:00:00.299911+00
2	135	2997522	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 08:00:00.217704+00	2026-08-18 08:00:00.274356+00
2	129	2972555	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 02:00:00.277757+00	2026-08-18 02:00:00.326573+00
2	130	2976626	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 03:00:00.18997+00	2026-08-18 03:00:00.257168+00
2	151	3062968	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 00:00:00.232114+00	2026-08-19 00:00:00.300065+00
2	136	3001576	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 09:00:00.217267+00	2026-08-18 09:00:00.282299+00
2	131	2980697	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 04:00:00.234464+00	2026-08-18 04:00:00.291667+00
2	145	3038346	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 18:00:00.232446+00	2026-08-18 18:00:00.293224+00
2	141	3021928	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 14:00:00.235893+00	2026-08-18 14:00:00.315036+00
2	137	3005631	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 10:00:00.240543+00	2026-08-18 10:00:00.295806+00
2	155	3079246	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 04:00:00.237983+00	2026-08-19 04:00:00.299165+00
2	149	3054826	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 22:00:00.220244+00	2026-08-18 22:00:00.269764+00
2	142	3026060	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 15:00:00.237621+00	2026-08-18 15:00:00.318172+00
2	146	3042557	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 19:00:00.230693+00	2026-08-18 19:00:00.272578+00
2	143	3030216	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 16:00:00.248003+00	2026-08-18 16:00:00.311924+00
2	147	3046613	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 20:00:00.242269+00	2026-08-18 20:00:00.286244+00
2	152	3067052	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 01:00:00.260769+00	2026-08-19 01:00:00.333812+00
2	150	3058893	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-18 23:00:00.164497+00	2026-08-18 23:00:00.174485+00
2	154	3075172	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 03:00:00.219477+00	2026-08-19 03:00:00.288402+00
2	160	3100157	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 09:00:00.236464+00	2026-08-19 09:00:00.297923+00
2	157	3087362	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 06:00:00.273056+00	2026-08-19 06:00:00.342067+00
2	156	3083305	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 05:00:00.228786+00	2026-08-19 05:00:00.266406+00
2	158	3092041	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 07:00:00.261526+00	2026-08-19 07:00:00.301955+00
2	161	3104214	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 10:00:00.215439+00	2026-08-19 10:00:00.296775+00
2	162	3108279	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 11:00:00.225024+00	2026-08-19 11:00:00.270087+00
2	163	3112343	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 12:00:00.235406+00	2026-08-19 12:00:00.302679+00
2	164	3116401	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 13:00:00.204947+00	2026-08-19 13:00:00.258666+00
2	179	3178161	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 04:00:00.227587+00	2026-08-20 04:00:00.279819+00
2	173	3153246	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 22:00:00.226526+00	2026-08-19 22:00:00.306981+00
2	165	3120469	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 14:00:00.251176+00	2026-08-19 14:00:00.324327+00
2	200	3264143	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 01:00:00.232458+00	2026-08-21 01:00:00.283911+00
2	194	3239557	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 19:00:00.24538+00	2026-08-20 19:00:00.28465+00
2	166	3124523	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 15:00:00.239648+00	2026-08-19 15:00:00.290985+00
2	174	3157296	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 23:00:00.204505+00	2026-08-19 23:00:00.260615+00
2	167	3128590	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 16:00:00.22313+00	2026-08-19 16:00:00.28196+00
2	180	3182218	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 05:00:00.213759+00	2026-08-20 05:00:00.28365+00
2	185	3202791	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 10:00:00.249712+00	2026-08-20 10:00:00.302724+00
2	168	3132662	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 17:00:00.186436+00	2026-08-19 17:00:00.259479+00
2	175	3161357	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 00:00:00.257345+00	2026-08-20 00:00:00.327853+00
2	169	3136733	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 18:00:00.234601+00	2026-08-19 18:00:00.307003+00
2	189	3219041	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 14:00:00.217044+00	2026-08-20 14:00:00.259707+00
2	181	3186283	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 06:00:00.216334+00	2026-08-20 06:00:00.268795+00
2	176	3165505	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 01:00:00.275688+00	2026-08-20 01:00:00.348596+00
2	170	3140928	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 19:00:00.261597+00	2026-08-19 19:00:00.315116+00
2	171	3145034	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 20:00:00.210195+00	2026-08-19 20:00:00.262196+00
2	192	3231222	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 17:00:00.221337+00	2026-08-20 17:00:00.263916+00
2	177	3169580	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 02:00:00.22566+00	2026-08-20 02:00:00.273997+00
2	172	3149189	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-19 21:00:00.223201+00	2026-08-19 21:00:00.261928+00
2	186	3206860	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 11:00:00.207544+00	2026-08-20 11:00:00.260002+00
2	182	3190588	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 07:00:00.241188+00	2026-08-20 07:00:00.301238+00
2	178	3174094	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 03:00:00.242732+00	2026-08-20 03:00:00.319313+00
2	196	3247764	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 21:00:00.225717+00	2026-08-20 21:00:00.268343+00
2	190	3223099	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 15:00:00.231105+00	2026-08-20 15:00:00.259781+00
2	183	3194656	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 08:00:00.251142+00	2026-08-20 08:00:00.290748+00
2	187	3210928	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 12:00:00.250253+00	2026-08-20 12:00:00.29218+00
2	184	3198731	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 09:00:00.233006+00	2026-08-20 09:00:00.287406+00
2	188	3214983	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 13:00:00.227469+00	2026-08-20 13:00:00.304153+00
2	193	3235374	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 18:00:00.248109+00	2026-08-20 18:00:00.292568+00
2	191	3227159	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 16:00:00.242921+00	2026-08-20 16:00:00.303663+00
2	195	3243711	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 20:00:00.251214+00	2026-08-20 20:00:00.325061+00
2	201	3268204	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 02:00:00.242838+00	2026-08-21 02:00:00.305066+00
2	198	3255898	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 23:00:00.208064+00	2026-08-20 23:00:00.264199+00
2	197	3251837	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-20 22:00:00.216441+00	2026-08-20 22:00:00.255386+00
2	199	3259965	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 00:00:00.229518+00	2026-08-21 00:00:00.271124+00
2	202	3272268	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 03:00:00.213424+00	2026-08-21 03:00:00.252525+00
2	203	3276333	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 04:00:00.241923+00	2026-08-21 04:00:00.30832+00
2	204	3280388	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 05:00:00.243839+00	2026-08-21 05:00:00.286799+00
2	205	3284440	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 06:00:00.267275+00	2026-08-21 06:00:00.315254+00
2	220	3346122	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 21:00:00.217239+00	2026-08-21 21:00:00.278212+00
2	214	3321568	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 15:00:00.21075+00	2026-08-21 15:00:00.276918+00
2	206	3288618	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 07:00:00.266373+00	2026-08-21 07:00:00.332365+00
2	241	3435635	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 18:00:00.231815+00	2026-08-22 18:00:00.321144+00
2	235	3411204	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 12:00:00.218745+00	2026-08-22 12:00:00.291393+00
2	207	3292674	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 08:00:00.25022+00	2026-08-21 08:00:00.301276+00
2	215	3325630	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 16:00:00.232921+00	2026-08-21 16:00:00.310003+00
2	208	3296735	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 09:00:00.231464+00	2026-08-21 09:00:00.275711+00
2	221	3350181	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 22:00:00.234253+00	2026-08-21 22:00:00.308768+00
2	226	3370923	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 03:00:00.23415+00	2026-08-22 03:00:00.287333+00
2	209	3300808	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 10:00:00.243139+00	2026-08-21 10:00:00.291338+00
2	216	3329695	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 17:00:00.245655+00	2026-08-21 17:00:00.286126+00
2	210	3304869	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 11:00:00.22518+00	2026-08-21 11:00:00.280692+00
2	230	3390880	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 07:00:00.24594+00	2026-08-22 07:00:00.289511+00
2	222	3354238	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 23:00:00.229256+00	2026-08-21 23:00:00.295432+00
2	217	3333758	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 18:00:00.24154+00	2026-08-21 18:00:00.318123+00
2	211	3308937	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 12:00:00.248057+00	2026-08-21 12:00:00.332001+00
2	212	3313444	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 13:00:00.21895+00	2026-08-21 13:00:00.247069+00
2	233	3403091	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 10:00:00.243337+00	2026-08-22 10:00:00.298703+00
2	218	3337940	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 19:00:00.225682+00	2026-08-21 19:00:00.268085+00
2	213	3317506	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 14:00:00.231544+00	2026-08-21 14:00:00.291616+00
2	227	3374989	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 04:00:00.239249+00	2026-08-22 04:00:00.308026+00
2	223	3358293	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 00:00:00.252425+00	2026-08-22 00:00:00.310454+00
2	219	3342016	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-21 20:00:00.242409+00	2026-08-21 20:00:00.314933+00
2	237	3419435	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 14:00:00.217294+00	2026-08-22 14:00:00.285333+00
2	231	3394940	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 08:00:00.265645+00	2026-08-22 08:00:00.331926+00
2	224	3362367	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 01:00:00.239325+00	2026-08-22 01:00:00.294528+00
2	228	3379060	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 05:00:00.247456+00	2026-08-22 05:00:00.285024+00
2	225	3366869	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 02:00:00.266042+00	2026-08-22 02:00:00.320353+00
2	229	3383118	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 06:00:00.231376+00	2026-08-22 06:00:00.27123+00
2	234	3407143	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 11:00:00.228985+00	2026-08-22 11:00:00.259163+00
2	232	3399041	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 09:00:00.192754+00	2026-08-22 09:00:00.270197+00
2	236	3415273	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 13:00:00.233713+00	2026-08-22 13:00:00.265929+00
2	242	3439847	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 19:00:00.235936+00	2026-08-22 19:00:00.288214+00
2	239	3427534	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 16:00:00.214065+00	2026-08-22 16:00:00.255312+00
2	238	3423489	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 15:00:00.232619+00	2026-08-22 15:00:00.301238+00
2	240	3431585	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 17:00:00.229676+00	2026-08-22 17:00:00.279497+00
2	243	3443897	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 20:00:00.22834+00	2026-08-22 20:00:00.268357+00
2	244	3447993	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 21:00:00.219092+00	2026-08-22 21:00:00.260845+00
2	245	3452054	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 22:00:00.212426+00	2026-08-22 22:00:00.225056+00
2	246	3456109	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-22 23:00:00.252055+00	2026-08-22 23:00:00.293461+00
2	261	3517816	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 14:00:00.245161+00	2026-08-23 14:00:00.283445+00
2	255	3493353	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 08:00:00.256343+00	2026-08-23 08:00:00.307718+00
2	247	3460170	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 00:00:00.231738+00	2026-08-23 00:00:00.271924+00
2	282	3604009	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 11:00:00.227133+00	2026-08-24 11:00:00.280154+00
2	276	3579366	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 05:00:00.25728+00	2026-08-24 05:00:00.333763+00
2	248	3464333	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 01:00:00.21532+00	2026-08-23 01:00:00.283995+00
2	256	3497398	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 09:00:00.250596+00	2026-08-23 09:00:00.317356+00
2	249	3468395	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 02:00:00.223703+00	2026-08-23 02:00:00.268274+00
2	262	3521893	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 15:00:00.228238+00	2026-08-23 15:00:00.279779+00
2	267	3542348	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 20:00:00.195439+00	2026-08-23 20:00:00.2328+00
2	250	3472461	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 03:00:00.215392+00	2026-08-23 03:00:00.257832+00
2	257	3501462	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 10:00:00.205572+00	2026-08-23 10:00:00.256079+00
2	251	3476524	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 04:00:00.220878+00	2026-08-23 04:00:00.262251+00
2	271	3558612	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 00:00:00.271441+00	2026-08-24 00:00:00.336689+00
2	263	3525951	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 16:00:00.222035+00	2026-08-23 16:00:00.272814+00
2	258	3505527	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 11:00:00.246854+00	2026-08-23 11:00:00.285926+00
2	252	3480589	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 05:00:00.209287+00	2026-08-23 05:00:00.272991+00
2	253	3485099	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 06:00:00.260647+00	2026-08-23 06:00:00.308498+00
2	274	3570785	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 03:00:00.212187+00	2026-08-24 03:00:00.260257+00
2	259	3509673	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 12:00:00.231594+00	2026-08-23 12:00:00.291501+00
2	254	3489291	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 07:00:00.235216+00	2026-08-23 07:00:00.326411+00
2	268	3546419	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 21:00:00.218211+00	2026-08-23 21:00:00.28723+00
2	264	3530016	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 17:00:00.229547+00	2026-08-23 17:00:00.284423+00
2	260	3513752	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 13:00:00.230007+00	2026-08-23 13:00:00.286709+00
2	278	3587625	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 07:00:00.234215+00	2026-08-24 07:00:00.291724+00
2	272	3562682	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 01:00:00.245935+00	2026-08-24 01:00:00.316799+00
2	265	3534068	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 18:00:00.244214+00	2026-08-23 18:00:00.29156+00
2	269	3550492	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 22:00:00.257702+00	2026-08-23 22:00:00.325266+00
2	266	3538264	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 19:00:00.232654+00	2026-08-23 19:00:00.267988+00
2	270	3554554	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-23 23:00:00.217036+00	2026-08-23 23:00:00.270325+00
2	275	3574842	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 04:00:00.252964+00	2026-08-24 04:00:00.286795+00
2	273	3566740	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 02:00:00.241591+00	2026-08-24 02:00:00.30066+00
2	277	3583428	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 06:00:00.252312+00	2026-08-24 06:00:00.293148+00
2	283	3608091	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 12:00:00.240988+00	2026-08-24 12:00:00.279107+00
2	280	3595864	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 09:00:00.222036+00	2026-08-24 09:00:00.27318+00
2	279	3591700	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 08:00:00.224625+00	2026-08-24 08:00:00.286704+00
2	281	3599935	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 10:00:00.233199+00	2026-08-24 10:00:00.289487+00
2	284	3612169	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 13:00:00.275014+00	2026-08-24 13:00:00.340221+00
2	285	3616244	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 14:00:00.238812+00	2026-08-24 14:00:00.290716+00
2	286	3620315	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 15:00:00.245986+00	2026-08-24 15:00:00.300194+00
2	287	3624389	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 16:00:00.244623+00	2026-08-24 16:00:00.306411+00
2	302	3686682	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 07:00:00.252796+00	2026-08-25 07:00:00.290182+00
2	296	3661809	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 01:00:00.210805+00	2026-08-25 01:00:00.256961+00
2	288	3628467	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 17:00:00.234617+00	2026-08-24 17:00:00.294807+00
2	323	3777154	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 04:00:00.221092+00	2026-08-26 04:00:00.269829+00
2	317	3750813	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 22:00:00.198589+00	2026-08-25 22:00:00.228908+00
2	289	3632701	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 18:00:00.196876+00	2026-08-24 18:00:00.258106+00
2	297	3665929	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 02:00:00.250042+00	2026-08-25 02:00:00.325073+00
2	290	3636965	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 19:00:00.226188+00	2026-08-24 19:00:00.261013+00
2	303	3690804	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 08:00:00.263188+00	2026-08-25 08:00:00.317204+00
2	308	3711852	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 13:00:00.232339+00	2026-08-25 13:00:00.310535+00
2	291	3641095	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 20:00:00.238802+00	2026-08-24 20:00:00.291015+00
2	298	3670050	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 03:00:00.252105+00	2026-08-25 03:00:00.32865+00
2	292	3645219	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 21:00:00.232697+00	2026-08-24 21:00:00.310171+00
2	312	3729253	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 17:00:00.243629+00	2026-08-25 17:00:00.304656+00
2	304	3694915	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 09:00:00.220051+00	2026-08-25 09:00:00.245009+00
2	299	3674171	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 04:00:00.197355+00	2026-08-25 04:00:00.240344+00
2	293	3649335	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 22:00:00.211793+00	2026-08-24 22:00:00.23263+00
2	294	3653460	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-24 23:00:00.236886+00	2026-08-24 23:00:00.321151+00
2	315	3742223	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 20:00:00.211619+00	2026-08-25 20:00:00.272805+00
2	300	3678300	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 05:00:00.182675+00	2026-08-25 05:00:00.236607+00
2	295	3657666	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 00:00:00.296044+00	2026-08-25 00:00:00.34984+00
2	309	3715970	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 14:00:00.215654+00	2026-08-25 14:00:00.284294+00
2	305	3699036	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 10:00:00.257194+00	2026-08-25 10:00:00.307164+00
2	301	3682442	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 06:00:00.236346+00	2026-08-25 06:00:00.301038+00
2	319	3759410	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 00:00:00.222851+00	2026-08-26 00:00:00.264654+00
2	313	3733533	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 18:00:00.234031+00	2026-08-25 18:00:00.293911+00
2	306	3703604	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 11:00:00.213859+00	2026-08-25 11:00:00.264014+00
2	310	3720697	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 15:00:00.257179+00	2026-08-25 15:00:00.323231+00
2	307	3707719	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 12:00:00.241508+00	2026-08-25 12:00:00.304255+00
2	311	3724974	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 16:00:00.22778+00	2026-08-25 16:00:00.254906+00
2	316	3746525	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 21:00:00.227898+00	2026-08-25 21:00:00.289051+00
2	314	3737931	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 19:00:00.23549+00	2026-08-25 19:00:00.284805+00
2	318	3755106	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-25 23:00:00.233604+00	2026-08-25 23:00:00.288424+00
2	324	3781467	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 05:00:00.23284+00	2026-08-26 05:00:00.284307+00
2	321	3768037	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 02:00:00.23622+00	2026-08-26 02:00:00.296919+00
2	320	3763721	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 01:00:00.245408+00	2026-08-26 01:00:00.297978+00
2	322	3772866	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 03:00:00.216929+00	2026-08-26 03:00:00.271773+00
2	325	3785762	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 06:00:00.241882+00	2026-08-26 06:00:00.300841+00
2	326	3790391	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 07:00:00.220573+00	2026-08-26 07:00:00.275196+00
2	327	3794681	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 08:00:00.248378+00	2026-08-26 08:00:00.31377+00
2	328	3799001	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 09:00:00.21572+00	2026-08-26 09:00:00.237123+00
2	343	3863656	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 00:00:00.210123+00	2026-08-27 00:00:00.25285+00
2	337	3837817	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 18:00:00.180984+00	2026-08-26 18:00:00.18807+00
2	329	3803387	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 10:00:00.239908+00	2026-08-26 10:00:00.295365+00
2	364	3954811	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 21:00:00.204508+00	2026-08-27 21:00:00.22692+00
2	358	3928722	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 15:00:00.239644+00	2026-08-27 15:00:00.291335+00
2	330	3807679	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 11:00:00.227291+00	2026-08-26 11:00:00.258561+00
2	338	3842256	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 19:00:00.231684+00	2026-08-26 19:00:00.283084+00
2	331	3811975	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 12:00:00.218914+00	2026-08-26 12:00:00.282113+00
2	344	3868037	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 01:00:00.198829+00	2026-08-27 01:00:00.231606+00
2	349	3889907	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 06:00:00.252453+00	2026-08-27 06:00:00.3285+00
2	332	3816275	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 13:00:00.226164+00	2026-08-26 13:00:00.282115+00
2	339	3846531	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 20:00:00.242282+00	2026-08-26 20:00:00.294988+00
2	333	3820605	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 14:00:00.233208+00	2026-08-26 14:00:00.282755+00
2	353	3907202	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 10:00:00.25508+00	2026-08-27 10:00:00.294773+00
2	345	3872326	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 02:00:00.244751+00	2026-08-27 02:00:00.284849+00
2	340	3850800	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 21:00:00.190216+00	2026-08-26 21:00:00.228356+00
2	334	3824914	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 15:00:00.248488+00	2026-08-26 15:00:00.309347+00
2	335	3829211	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 16:00:00.21472+00	2026-08-26 16:00:00.268166+00
2	356	3920121	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 13:00:00.240659+00	2026-08-27 13:00:00.292319+00
2	341	3855105	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 22:00:00.248624+00	2026-08-26 22:00:00.310924+00
2	336	3833502	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 17:00:00.223524+00	2026-08-26 17:00:00.269123+00
2	350	3894372	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 07:00:00.231056+00	2026-08-27 07:00:00.279805+00
2	346	3876611	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 03:00:00.219372+00	2026-08-27 03:00:00.268992+00
2	342	3859377	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-26 23:00:00.238063+00	2026-08-26 23:00:00.294639+00
2	360	3937336	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 17:00:00.210186+00	2026-08-27 17:00:00.278116+00
2	354	3911481	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 11:00:00.23334+00	2026-08-27 11:00:00.280569+00
2	347	3880893	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 04:00:00.241039+00	2026-08-27 04:00:00.296006+00
2	351	3898649	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 08:00:00.204326+00	2026-08-27 08:00:00.239077+00
2	348	3885618	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 05:00:00.222832+00	2026-08-27 05:00:00.277537+00
2	352	3902924	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 09:00:00.164463+00	2026-08-27 09:00:00.190053+00
2	357	3924405	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 14:00:00.243729+00	2026-08-27 14:00:00.287098+00
2	355	3915753	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 12:00:00.210326+00	2026-08-27 12:00:00.264021+00
2	359	3933028	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 16:00:00.150439+00	2026-08-27 16:00:00.154984+00
2	365	3959145	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 22:00:00.205333+00	2026-08-27 22:00:00.250403+00
2	362	3946149	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 19:00:00.232591+00	2026-08-27 19:00:00.2746+00
2	361	3941636	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 18:00:00.22973+00	2026-08-27 18:00:00.28477+00
2	363	3950465	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 20:00:00.229051+00	2026-08-27 20:00:00.271445+00
2	366	3963457	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-27 23:00:00.240771+00	2026-08-27 23:00:00.316523+00
2	367	3967763	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 00:00:00.204153+00	2026-08-28 00:00:00.217894+00
2	368	3972158	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 01:00:00.226655+00	2026-08-28 01:00:00.257926+00
2	369	3976472	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 02:00:00.225441+00	2026-08-28 02:00:00.279185+00
2	384	4042030	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 17:00:00.135019+00	2026-08-28 17:00:00.188301+00
2	378	4015349	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 11:00:00.237702+00	2026-08-28 11:00:00.29315+00
2	370	3980775	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 03:00:00.22231+00	2026-08-28 03:00:00.262287+00
2	405	4133621	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 14:00:00.098502+00	2026-08-29 14:00:00.106627+00
2	399	4107733	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 08:00:00.149964+00	2026-08-29 08:00:00.157918+00
2	371	3985087	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 04:00:00.246352+00	2026-08-28 04:00:00.290315+00
2	379	4019658	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 12:00:00.230971+00	2026-08-28 12:00:00.277759+00
2	372	3989398	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 05:00:00.228085+00	2026-08-28 05:00:00.26397+00
2	385	4046334	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 18:00:00.219355+00	2026-08-28 18:00:00.253633+00
2	390	4068026	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 23:00:00.149467+00	2026-08-28 23:00:00.164059+00
2	373	3993706	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 06:00:00.220209+00	2026-08-28 06:00:00.270634+00
2	380	4023969	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 13:00:00.221056+00	2026-08-28 13:00:00.253616+00
2	374	3998138	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 07:00:00.256882+00	2026-08-28 07:00:00.30392+00
2	394	4085303	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 03:00:00.125801+00	2026-08-29 03:00:00.130734+00
2	386	4050768	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 19:00:00.213901+00	2026-08-28 19:00:00.249742+00
2	381	4028269	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 14:00:00.233227+00	2026-08-28 14:00:00.277551+00
2	375	4002441	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 08:00:00.244316+00	2026-08-28 08:00:00.287444+00
2	376	4006750	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 09:00:00.227692+00	2026-08-28 09:00:00.29868+00
2	397	4098689	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 06:00:00.175053+00	2026-08-29 06:00:00.189731+00
2	382	4032594	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 15:00:00.181095+00	2026-08-28 15:00:00.225914+00
2	377	4011045	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 10:00:00.222682+00	2026-08-28 10:00:00.260298+00
2	391	4072341	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 00:00:00.187318+00	2026-08-29 00:00:00.20306+00
2	387	4055080	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 20:00:00.187806+00	2026-08-28 20:00:00.195975+00
2	383	4037659	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 16:00:00.172742+00	2026-08-28 16:00:00.230702+00
2	401	4116350	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 10:00:00.199744+00	2026-08-29 10:00:00.249843+00
2	395	4089617	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 04:00:00.197961+00	2026-08-29 04:00:00.243292+00
2	388	4059383	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 21:00:00.204973+00	2026-08-28 21:00:00.232209+00
2	392	4076672	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 01:00:00.22165+00	2026-08-29 01:00:00.276077+00
2	389	4063705	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-28 22:00:00.216482+00	2026-08-28 22:00:00.285495+00
2	393	4080985	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 02:00:00.121181+00	2026-08-29 02:00:00.126736+00
2	398	4103425	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 07:00:00.219932+00	2026-08-29 07:00:00.291924+00
2	396	4094363	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 05:00:00.18156+00	2026-08-29 05:00:00.197463+00
2	400	4112043	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 09:00:00.184031+00	2026-08-29 09:00:00.190644+00
2	406	4137972	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 15:00:00.194737+00	2026-08-29 15:00:00.198665+00
2	403	4124991	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 12:00:00.133339+00	2026-08-29 12:00:00.143684+00
2	402	4120673	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 11:00:00.205127+00	2026-08-29 11:00:00.278528+00
2	404	4129317	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 13:00:00.226264+00	2026-08-29 13:00:00.268666+00
2	407	4142282	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 16:00:00.223805+00	2026-08-29 16:00:00.283204+00
2	408	4146593	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 17:00:00.196512+00	2026-08-29 17:00:00.254535+00
2	409	4150993	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 18:00:00.219016+00	2026-08-29 18:00:00.244637+00
2	410	4155437	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 19:00:00.236705+00	2026-08-29 19:00:00.275461+00
2	425	26587	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 10:00:00.220551+00	2026-08-30 10:00:00.240603+00
2	419	532	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 04:00:00.142062+00	2026-08-30 04:00:00.147219+00
2	411	4159755	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 20:00:00.23611+00	2026-08-29 20:00:00.293475+00
2	446	118367	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 07:00:00.222817+00	2026-08-31 07:00:00.275247+00
2	440	91913	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 01:00:00.20753+00	2026-08-31 01:00:00.243956+00
2	412	4164206	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 21:00:00.312224+00	2026-08-29 21:00:00.344481+00
2	420	4885	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 05:00:00.123041+00	2026-08-30 05:00:00.128446+00
2	413	4168508	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 22:00:00.155745+00	2026-08-29 22:00:00.189506+00
2	426	30894	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 11:00:00.254449+00	2026-08-30 11:00:00.289694+00
2	431	52911	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 16:00:00.08092+00	2026-08-30 16:00:00.096897+00
2	414	4172843	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-29 23:00:00.167273+00	2026-08-29 23:00:00.197677+00
2	421	9207	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 06:00:00.254421+00	2026-08-30 06:00:00.313146+00
2	415	4177158	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 00:00:00.199897+00	2026-08-30 00:00:00.249788+00
2	435	70316	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 20:00:00.179693+00	2026-08-30 20:00:00.248467+00
2	427	35664	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 12:00:00.232447+00	2026-08-30 12:00:00.254635+00
2	422	13651	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 07:00:00.125699+00	2026-08-30 07:00:00.129554+00
2	416	4181563	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 01:00:00.204691+00	2026-08-30 01:00:00.251797+00
2	417	4185870	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 02:00:00.100145+00	2026-08-30 02:00:00.103899+00
2	438	83257	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 23:00:00.169223+00	2026-08-30 23:00:00.178088+00
2	423	17965	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 08:00:00.208029+00	2026-08-30 08:00:00.257196+00
2	418	4190188	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 03:00:00.229875+00	2026-08-30 03:00:00.242666+00
2	432	57233	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 17:00:00.163643+00	2026-08-30 17:00:00.230084+00
2	428	39979	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 13:00:00.183339+00	2026-08-30 13:00:00.228199+00
2	424	22277	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 09:00:00.136685+00	2026-08-30 09:00:00.14151+00
2	442	100555	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 03:00:00.227046+00	2026-08-31 03:00:00.252802+00
2	436	74633	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 21:00:00.182961+00	2026-08-30 21:00:00.220126+00
2	429	44275	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 14:00:00.17329+00	2026-08-30 14:00:00.183325+00
2	433	61551	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 18:00:00.196542+00	2026-08-30 18:00:00.207468+00
2	430	48609	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 15:00:00.150141+00	2026-08-30 15:00:00.154562+00
2	434	65998	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 19:00:00.232537+00	2026-08-30 19:00:00.265919+00
2	439	87580	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 00:00:00.218027+00	2026-08-31 00:00:00.259422+00
2	437	78947	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-30 22:00:00.192855+00	2026-08-30 22:00:00.199133+00
2	441	96240	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 02:00:00.181074+00	2026-08-31 02:00:00.206386+00
2	447	122681	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 08:00:00.223596+00	2026-08-31 08:00:00.283829+00
2	444	109183	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 05:00:00.145639+00	2026-08-31 05:00:00.169378+00
2	443	104866	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 04:00:00.216293+00	2026-08-31 04:00:00.254065+00
2	445	113932	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 06:00:00.209763+00	2026-08-31 06:00:00.28198+00
2	448	127231	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 09:00:00.188142+00	2026-08-31 09:00:00.200269+00
2	449	132601	postgres	postgres	delete from public.notifications\r\n    where created_at < now() - interval '24 hours';	succeeded	DELETE 0	2026-08-31 10:00:00.185629+00	2026-08-31 10:00:00.198972+00
\.


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.announcements (id, title, message, department_id, created_by, created_at, scheduled_at, expires_at, is_archived, priority, title_en, title_si, title_ta, message_en, message_si, message_ta, updated_at) FROM stdin;
23	dd	ddd	\N	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-12 13:44:01.826+00	2026-08-12 13:44:01.826+00	2026-08-12 13:45:00+00	f	Medium	dd	dd	dd	ddd	ddd	ddd	\N
24	Subject Officer	Today is the viva, bro...\nmalama karadarayak	\N	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-13 03:54:31.76+00	2026-08-13 03:54:31.76+00	2026-08-13 04:55:00+00	f	Medium	Subject Officer	Subject Officer	Subject Officer	Today is the viva, bro...\nmalama karadarayak	Today is the viva, bro...\nmalama karadarayak	Today is the viva, bro...\nmalama karadarayak	2026-08-13 03:54:58.321+00
25	Subject Officer	hhhh	\N	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-13 03:58:24.216+00	2026-08-13 03:58:24.216+00	2026-08-13 04:00:00+00	f	High	Subject Officer	Subject Officer	Subject Officer	hhhh	හ්හ්හ්හ්	ஹ்ஹ்ஹ்ஹ்	\N
26	ff	jjj	\N	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-13 04:05:32.843+00	2026-08-13 04:05:32.843+00	2026-08-13 04:06:00+00	f	Medium	ff	ff	ff	jjj	jjj	jjj	\N
27	gg	hh	\N	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-13 04:08:32.179+00	2026-08-13 04:08:32.179+00	2026-08-13 04:10:00+00	f	Medium	gg	gg	gg	hh	hh	hh	\N
28	Secretary	Today Meeting on 12.45 pm	\N	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-13 05:17:19.954+00	2026-08-13 05:17:19.954+00	2026-08-15 05:20:00+00	f	High	Secretary	Secretary	Secretary	Today Meeting on 12.45 pm	Today Meeting on 12.45 pm	Today Meeting on 12.45 pm	\N
29	Special Meeting	Be on Time!	\N	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-13 05:19:20.786+00	2026-08-13 05:19:20.786+00	2026-08-13 05:35:00+00	f	Urgent	Special Meeting	Special Meeting	Special Meeting	Be on Time!	Be on Time!	Be on Time!	\N
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.app_settings (id, maintenance_mode, latest_version) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at) FROM stdin;
193	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	16	\N	{"title":"hhh","assigned_to":"S.T.S.D Chandrakumara","due_date":"2026-08-13"}	\N	2026-08-12 07:55:36.776+00
194	cc3b3ba4-b678-4d45-8916-ef86f535abd0	COMPLAINT_STATUS_UPDATED	complaints	14	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-12 07:57:06.519+00
195	cc3b3ba4-b678-4d45-8916-ef86f535abd0	COMPLAINT_STATUS_UPDATED	complaints	14	{"status":"In Progress"}	{"status":"Resolved"}	\N	2026-08-12 07:57:41.731+00
196	cc3b3ba4-b678-4d45-8916-ef86f535abd0	COMPLAINT_STATUS_UPDATED	complaints	14	{"status":"Resolved"}	{"status":"Closed"}	\N	2026-08-12 07:57:58.537+00
197	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:37:15.924+00
198	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:39:38.525+00
199	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:40:13.755+00
200	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:40:53.696+00
201	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 08:40:54.595+00
202	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:41:13.997+00
203	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:41:20.969+00
204	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:42:42.6+00
205	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 08:42:59.086+00
206	2ace860d-4275-49eb-b92c-4dc932dd2c45	UPDATE_PROFILE	users	2ace860d-4275-49eb-b92c-4dc932dd2c45	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:44:52.599+00
207	2ace860d-4275-49eb-b92c-4dc932dd2c45	UPDATE_PROFILE	users	2ace860d-4275-49eb-b92c-4dc932dd2c45	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 08:44:56.362+00
208	2ace860d-4275-49eb-b92c-4dc932dd2c45	UPDATE_PROFILE	users	2ace860d-4275-49eb-b92c-4dc932dd2c45	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 08:46:28.863+00
209	2ace860d-4275-49eb-b92c-4dc932dd2c45	UPDATE_PROFILE	users	2ace860d-4275-49eb-b92c-4dc932dd2c45	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 08:46:38.629+00
210	cf50617c-2fb4-4a31-a525-3d7164d036a5	UPDATE_PROFILE	users	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 08:51:49.985+00
211	cf50617c-2fb4-4a31-a525-3d7164d036a5	UPDATE_PROFILE	users	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 10:50:23.904+00
212	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	62	\N	\N	\N	2026-08-12 10:50:47.915+00
213	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	62	\N	\N	\N	2026-08-12 10:53:53.536+00
214	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	62	\N	\N	\N	2026-08-12 10:54:23.457+00
215	d3d6bd6d-210d-477e-b877-d3c1176254e1	APPROVE_PROFILE_REQUEST	profile_change_requests	31	\N	\N	\N	2026-08-12 11:17:29.50316+00
216	cf50617c-2fb4-4a31-a525-3d7164d036a5	ANNOUNCEMENT_CREATED	announcements	23	\N	{"title":"dd","message":"ddd","title_en":"dd","title_si":"dd","title_ta":"dd","department_id":null}	\N	2026-08-12 13:44:02.296+00
217	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	39d773e7-ec1d-49c6-abfc-b78385d3c7b2	\N	{"title":"Mr","full_name":"Isuru Lanka","email":"isurulanka2007@gmail.com"}	\N	2026-08-12 13:49:53.395+00
218	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	17	\N	{"title":"jj","assigned_to":"S.T.S.D Chandrakumara","due_date":"2026-08-13"}	\N	2026-08-12 13:54:32.233+00
221	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	67	{"status":"Subject Approved","leave_type":"Casual Leave","start_date":"2026-08-28","end_date":"2026-08-28"}	\N	\N	2026-08-12 13:57:09.438+00
222	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	67	{"status":"Subject Approved","leave_type":"Casual Leave","start_date":"2026-08-28","end_date":"2026-08-28"}	\N	\N	2026-08-12 13:57:09.726+00
223	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	67	{"status":"CC Approved","leave_type":"Casual Leave","start_date":"2026-08-28","end_date":"2026-08-28"}	\N	\N	2026-08-12 13:57:32.966+00
224	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	67	{"status":"Approved","leave_type":"Casual Leave","start_date":"2026-08-28","end_date":"2026-08-28"}	\N	\N	2026-08-12 13:58:01.124+00
225	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	70	{"status":"Subject Approved","leave_type":"Short Leave","start_date":"2026-08-12","end_date":"2026-08-13"}	\N	\N	2026-08-12 14:15:54.686+00
226	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	70	{"status":"CC Approved","leave_type":"Short Leave","start_date":"2026-08-12","end_date":"2026-08-13"}	\N	\N	2026-08-12 14:16:21.002+00
227	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	70	{"status":"Approved","leave_type":"Short Leave","start_date":"2026-08-12","end_date":"2026-08-13"}	\N	\N	2026-08-12 14:17:04.522+00
228	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 15:43:37.234+00
229	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 15:43:47.946+00
230	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 15:59:56.06+00
231	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 16:00:06.071+00
232	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 16:05:11.738+00
233	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-12 16:05:22.601+00
234	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	15	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-12 17:19:17.492+00
235	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	15	{"status":"In Progress"}	{"status":"Resolved"}	\N	2026-08-12 17:27:14.586+00
236	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	16	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-12 17:38:32.491+00
237	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	16	{"status":"In Progress"}	{"status":"Closed"}	\N	2026-08-12 17:50:17.487+00
238	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	15	{"status":"Resolved"}	{"status":"Resolved"}	\N	2026-08-12 17:52:43.576+00
239	cc3b3ba4-b678-4d45-8916-ef86f535abd0	UPDATE_PROFILE	users	cc3b3ba4-b678-4d45-8916-ef86f535abd0	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 17:55:56.338+00
240	2ace860d-4275-49eb-b92c-4dc932dd2c45	UPDATE_PROFILE	users	2ace860d-4275-49eb-b92c-4dc932dd2c45	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 17:56:20.504+00
241	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	UPDATE_PROFILE	users	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-12 18:03:03.244+00
242	d3d6bd6d-210d-477e-b877-d3c1176254e1	REJECT_PROFILE_REQUEST	profile_change_requests	32	\N	\N	\N	2026-08-12 18:08:11.757615+00
244	cc3b3ba4-b678-4d45-8916-ef86f535abd0	ASSIGN_TASK_MULTIPLE	departments	6	\N	{"title":"Hello","assigned_count":1,"due_date":"2026-08-15"}	\N	2026-08-13 02:50:32.255+00
245	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	\N	{"title":"Ms","full_name":"Anashya Jayarathna","email":"anshyajayarathna2003@gmail.com"}	\N	2026-08-13 03:53:09.82+00
246	cf50617c-2fb4-4a31-a525-3d7164d036a5	ANNOUNCEMENT_CREATED	announcements	24	\N	{"title":"Subject Officer","message":"Today is the viva, bro...","title_en":"Subject Officer","title_si":"Subject Officer","title_ta":"Subject Officer","department_id":null}	\N	2026-08-13 03:54:32.239+00
247	cf50617c-2fb4-4a31-a525-3d7164d036a5	ANNOUNCEMENT_UPDATED	announcements	24	{"title":"Subject Officer","message":"Today is the viva, bro..."}	{"title":"Subject Officer","message":"Today is the viva, bro...\\nmalama karadarayak","title_en":"Subject Officer","title_si":"Subject Officer","title_ta":"Subject Officer"}	\N	2026-08-13 03:54:58.718+00
248	cf50617c-2fb4-4a31-a525-3d7164d036a5	ANNOUNCEMENT_CREATED	announcements	25	\N	{"title":"Subject Officer","message":"hhhh","title_en":"Subject Officer","title_si":"Subject Officer","title_ta":"Subject Officer","department_id":null}	\N	2026-08-13 03:58:24.875+00
249	cf50617c-2fb4-4a31-a525-3d7164d036a5	ANNOUNCEMENT_CREATED	announcements	26	\N	{"title":"ff","message":"jjj","title_en":"ff","title_si":"ff","title_ta":"ff","department_id":null}	\N	2026-08-13 04:05:34.05+00
250	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	ANNOUNCEMENT_CREATED	announcements	27	\N	{"title":"gg","message":"hh","title_en":"gg","title_si":"gg","title_ta":"gg","department_id":null}	\N	2026-08-13 04:08:33.568+00
251	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	\N	{"title":"Mrs","full_name":"A.L.L.Dharmarathna","email":"lakshidharmarathna@gmail.com"}	\N	2026-08-13 05:02:23.316+00
252	cf50617c-2fb4-4a31-a525-3d7164d036a5	UPDATE_PROFILE	users	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	{"updated_fields":["updated_at","avatar_url"]}	\N	2026-08-13 05:08:45.503+00
253	cc3b3ba4-b678-4d45-8916-ef86f535abd0	ASSIGN_TASK_MULTIPLE	departments	6	\N	{"title":"New Library Building Proposal","assigned_count":1,"due_date":"2026-08-15"}	\N	2026-08-13 05:13:46.764+00
254	cc3b3ba4-b678-4d45-8916-ef86f535abd0	ANNOUNCEMENT_CREATED	announcements	28	\N	{"title":"Secretary","message":"Today Meeting on 12.45 pm","title_en":"Secretary","title_si":"Secretary","title_ta":"Secretary","department_id":null}	\N	2026-08-13 05:17:20.729+00
255	cc3b3ba4-b678-4d45-8916-ef86f535abd0	ANNOUNCEMENT_CREATED	announcements	29	\N	{"title":"Special Meeting","message":"Be on Time!","title_en":"Special Meeting","title_si":"Special Meeting","title_ta":"Special Meeting","department_id":null}	\N	2026-08-13 05:19:21.609+00
256	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	71	{"status":"Subject Approved","leave_type":"Casual Leave","start_date":"2026-08-18","end_date":"2026-08-18"}	\N	\N	2026-08-13 05:22:46.399+00
257	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	71	{"status":"CC Approved","leave_type":"Casual Leave","start_date":"2026-08-18","end_date":"2026-08-18"}	\N	\N	2026-08-13 05:23:42.317+00
258	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	71	{"status":"Approved","leave_type":"Casual Leave","start_date":"2026-08-18","end_date":"2026-08-18"}	\N	\N	2026-08-13 05:24:14.965+00
260	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	17	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-13 05:42:30.441+00
261	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	18	{"status":"Open"}	{"status":"Resolved"}	\N	2026-08-13 05:42:49.19+00
262	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	17	{"status":"In Progress"}	{"status":"Closed"}	\N	2026-08-13 05:43:58.004+00
274	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	COMPLAINT_STAGE_UPDATED	complaints	26	{"status":"In Progress"}	{"status":"In Progress","stage":"cc_officer"}	\N	2026-08-14 07:56:05.918+00
276	2de84b7a-c902-4030-89d0-6047ff0bc47c	UPDATE_PROFILE	users	2de84b7a-c902-4030-89d0-6047ff0bc47c	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-31 09:21:40.218+00
277	2de84b7a-c902-4030-89d0-6047ff0bc47c	UPDATE_PROFILE	users	2de84b7a-c902-4030-89d0-6047ff0bc47c	\N	{"updated_fields":["updated_at","signature_url"]}	\N	2026-08-31 09:21:44.301+00
\.


--
-- Data for Name: complaint_attachments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_attachments (id, complaint_id, uploaded_by, file_name, file_type, mime_type, storage_path, public_url, file_size, created_at) FROM stdin;
\.


--
-- Data for Name: complaint_recipients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_recipients (id, complaint_id, recipient_id, created_at) FROM stdin;
\.


--
-- Data for Name: complaint_replies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaint_replies (id, complaint_id, replied_by, reply_message, created_at, reply_message_en, reply_message_si, reply_message_ta) FROM stdin;
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.complaints (id, user_id, department_id, title, description, status, assigned_supervisor_id, created_at, updated_at, category, attachment_url, signature_url, title_en, title_si, title_ta, description_en, description_si, description_ta, current_stage) FROM stdin;
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departments (id, department_name, department_type, description, created_at, image_url, department_name_si, department_name_ta) FROM stdin;
1	General Administration & Staff Services	Regular	වැඩසටහන් අංක 01 - සාමාන්‍ය පරිපාලනය හා කාර්ය මණ්ඩල සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/administration.jpg	සාමාන්‍ය පරිපාලනය හා කාර්ය මණ්ඩල සේවා	பொது நிர்வாகம் மற்றும் பணியாளர் சேவைகள்
2	Public Health Services	Regular	වැඩසටහන් අංක 02 - සෞඛ්‍ය සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/public_health.jpg	සෞඛ්‍ය සේවා	சுகாதார சேவைகள்
3	Physical Planning, Roads, Lands & Buildings	Regular	වැඩසටහන් අංක 03 - භෞතික සැලසුම්, මාවත්, ඉඩම් හා ගොඩනැගිලි	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/engineering.jpg	භෞතික සැලසුම්, මාවත්, ඉඩම් හා ගොඩනැගිලි	பௌதிக திட்டமிடல், சாலைகள், நிலங்கள் மற்றும் கட்டிடங்கள்
5	Public Utility Services	Regular	වැඩසටහන් අංක 05 - පොදු උපයෝගී සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/environment_welfare.jpg	පොදු උපයෝගී සේවා	பொது பயன்பாட்டு சேவைகள்
6	Development & Economic Affairs	Regular	සංවර්ධන හා ආර්ථික කටයුතු දෙපාර්තමේන්තුව	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/development_planning.jpg	සංවර්ධන හා ආර්ථික කටයුතු	அபிவிருத்தி மற்றும் பொருளாதார விவகாரங்கள்
4	Community Services (Library & Preschool)	Library	වැඩසටහන් අංක 06 - ප්‍රජා සේවා (පුස්තකාල හා ප්‍රාථමික අධ්‍යාපන)	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/library.jpg	ප්‍රජා සේවා (පුස්තකාල හා ප්‍රාථමික අධ්‍යාපන)	சமூக சேவைகள் (நூலகம் மற்றும் முன்பள்ளி)
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.designations (id, department_id, designation_en, designation_si, designation_ta, created_at) FROM stdin;
1	1	Management Service Officer (Sup. Grade)	කළමනාකරණ සේවා නිලධාරී (අධි ශ්‍රේණිය)	மேலாண்மை சேவை அலுவலர் (உயர் தரம்)	2026-07-25 15:49:18.81494
2	1	Development Officer	සංවර්ධන නිලධාරී	அభిவிருத்தி அலுவலர்	2026-07-25 15:49:18.81494
3	1	Management Service Officer	කළමනාකරණ සේවා නිලධාරී	மேலாண்மை சேவை அலுவலர்	2026-07-25 15:49:18.81494
4	1	Revenue Inspector	ආදායම් පරීක්ෂක	வருவாய் পরিদর্শক	2026-07-25 15:49:18.81494
5	1	Driver	රියදුරු	ஓட்டுநர்	2026-07-25 15:49:18.81494
6	1	Office Assistant	කාර්යාල කාර්ය සහායක	அலுவலக உதவியாளர்	2026-07-25 15:49:18.81494
7	1	Labour / Watcher	මුරකරන / කම්කරු	காவலர் / தொழிலாளி	2026-07-25 15:49:18.81494
8	2	Ayurvedic Medical Officer	ආයුර්වේද වෛද්‍ය නිලධාරී	ஆயுள்வேத மருத்துவ அலுவலர்	2026-07-25 15:49:18.81494
9	2	Ayurvedic Coordinator	ආයුර්වේද සංයෝජක	ஆயுள்வேத ஒருங்கிணைப்பாளர்	2026-07-25 15:49:18.81494
10	2	Health Labourer	සෞඛ්‍ය කම්කරු	சுகாதாரத் தொழிலாளி	2026-07-25 15:49:18.81494
11	3	Technical Officer	තාක්ෂණ නිලධාරී	தொழில்நுட்ப அலுவலர்	2026-07-25 15:49:18.81494
17	6	Development Officer	සංවර්ධන නිලධාරී	அభిவிருத்தி அலுவலர்	2026-07-25 15:49:18.81494
18	6	Economic Research Assistant	ආර්ථික පර්යේෂණ සහායක	பொருளாதார ஆராய்ச்சி உதவியாளர்	2026-07-25 15:49:18.81494
12	3	Field Labourer	ක්ෂේත්‍ර කම්කරු	வேலை தொழிலாளி	2026-07-25 15:49:18.81494
19	5	Electrical Worker	විදුලි කාර්මික	மின்சார பணியாளர்	2026-07-25 15:49:18.81494
20	5	Fair Inspector	වෙළද පොල පරීක්ෂක	சந்தை পরিদর্শক	2026-07-25 15:49:18.81494
13	4	Librarian	පුස්තකාලයාධිපති	நூலகர்	2026-07-25 15:49:18.81494
15	4	Library Assistant	පුස්තකාල සහායක	நூலக உதவியாளர்	2026-07-26 06:19:19.053964
14	4	Preschool Teacher	ප්‍රාථමික පාසල් පාලිකා	பால்கர் ஆசிரியர்	2026-07-25 15:49:18.81494
16	4	Preschool Assistant	ප්‍රාථමික පාසල් සහායක	பால்கர் உதவியாளர்	2026-07-26 06:20:52.876136
\.


--
-- Data for Name: leave_forms; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_forms (id, leave_request_id, form_details, digital_signature, submitted_at) FROM stdin;
67	71	{"officer":{"user_id":"d0b7881e-8daf-4ddd-b915-60b8c7a195a5","name":"Mrs. A.L.L.Dharmarathna","designation":"Development Officer","department":"Development & Economic Affairs"},"leave":{"type":"Casual Leave","type_key":"casual","start_date":"2026-08-18","end_date":"2026-08-18","no_of_days":1,"duration":"Full Day","time_range":null,"reason":"Urgent personal matter and essential home task.","applied_date":"2026-08-13"},"duty_coverage":{"officer_id":"c9f7a318-d3f1-4433-9511-48d0a825e31c","officer_name":"Mr. S.T.S.D Chandrakumara","designation":"Economic Research Assistant"},"status":"Pending","language":"en"}	{"paths":["M 245 129.375 L 242.30322265625 129.375 L 231.5526123046875 131.45156860351562 L 201.47958374023438 145.2143096923828 L 189.93113708496094 153.3414764404297 L 166.78297424316406 181.0663604736328 L 157.67076110839844 197.6508331298828 L 148.75 224.8767852783203 L 152.19451904296875 237.81951904296875 L 157.2855987548828 240.83030700683594 L 180.78341674804688 242.01805114746094 L 200.04959106445312 238.5334014892578 L 217.64231872558594 233.03314208984375 L 246.1642608642578 214.95216369628906 L 253.2116241455078 203.0863494873047 L 249.58445739746094 191.251708984375 L 237.2614288330078 178.23867797851562 L 222.26930236816406 166.23321533203125 L 208.23883056640625 157.55691528320312 L 189.7791290283203 150 L 188.25885009765625 151.60728454589844 L 192.5759735107422 163.49017333984375 L 196.46719360351562 176.62966918945312 L 201.20565795898438 191.3846893310547 L 212.93943786621094 214.05433654785156 L 219.28582763671875 220.5358428955078 L 228.00428771972656 227.35084533691406 L 231.4512176513672 230.68496704101562 L 232.98194885253906 232.35694885253906 L 230.3660125732422 232.9419708251953 L 218.07870483398438 232.5 L 160.27667236328125 224.51675415039062 L 131.13897705078125 224.23800659179688 L 87.9536361694336 234.14817810058594 L 74.35313415527344 240.5677032470703 L 66.79410552978516 245.70590209960938 L 61.25 248.125"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-13 05:17:18.309
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_requests (id, user_id, leave_type_id, start_date, end_date, no_of_days, reason, status, supervisor_id, supervisor_remark, created_at, updated_at, admin_approved_at, admin_approved_by, final_approved_at, final_approved_by, approval_stage, attachment_url, reason_en, reason_si, reason_ta, supervisor_remark_en, supervisor_remark_si, supervisor_remark_ta, coverage_officer_id, cc_approved_at, cc_approved_by, subject_signature, cc_signature, secretary_signature, chairman_signature) FROM stdin;
71	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	11	2026-08-18	2026-08-18	1	Urgent personal matter and essential home task.	Approved	cc3b3ba4-b678-4d45-8916-ef86f535abd0		2026-08-13 05:17:18.093+00	2026-08-13 05:24:13.657+00	2026-08-13 05:22:45.793+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-13 05:24:13.657+00	cc3b3ba4-b678-4d45-8916-ef86f535abd0	completed	\N	Urgent personal matter and essential home task.	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.	\N	\N	\N	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-13 05:23:41.698+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786531821127.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1786550720307.png	\N
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.leave_types (id, name_en, max_days, created_at, name_si, name_ta) FROM stdin;
11	Casual Leave	21	2026-06-25 12:49:35.782202	අනියම් නිවාඩු	சாதாரண விடுமுறை
13	Half Day	0	2026-06-25 12:49:35.782202	අර්ධ දින නිවාඩු	அரை நாள் விடுமுறை
14	Short Leave	2	2026-06-25 12:49:35.782202	කෙටි නිවාඩු	குறுகிய விடுப்பு
12	Medical Leave	24	2026-06-25 12:49:35.782202	විවේකී / අසනීප නිවාඩු	ஓய்வு / நோய் விடுப்பு
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, user_id, title, message, is_read, is_auto_generated, created_by, created_at, read_at, notification_type, related_entity, related_id, title_en, title_si, title_ta, message_en, message_si, message_ta, is_for_mobile, notification_key, payload) FROM stdin;
\.


--
-- Data for Name: profile_change_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.profile_change_requests (id, user_id, old_value, new_value, status, approved_by, approved_at, requested_at, created_at) FROM stdin;
32	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":18}	{}	Rejected	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-12 18:08:02.889+00	2026-08-12 17:20:57.325205+00	2026-08-12 17:20:57.325205+00
33	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-13 05:47:41.017706+00	2026-08-13 05:47:41.017706+00
31	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{"department_id":"6","designation_id":"18"}	Approved	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-12 11:17:24.977+00	2026-08-12 08:27:21.813385+00	2026-08-12 08:27:21.813385+00
\.


--
-- Data for Name: role_privileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.role_privileges (id, role_id, privilege_id, is_enabled, updated_at) FROM stdin;
5511	5	123	t	2026-08-13 02:33:24.957+00
429	5	33	f	2026-08-13 02:33:24.957+00
886	2	100	t	2026-08-11 15:00:18.489+00
982	2	116	f	2026-08-11 15:00:18.489+00
988	2	117	f	2026-08-11 15:00:18.489+00
4551	4	123	t	2026-08-11 19:07:32.647+00
391	4	31	t	2026-08-11 19:07:32.647+00
392	4	32	f	2026-08-11 19:07:32.647+00
394	4	34	f	2026-08-11 19:07:32.647+00
395	4	35	f	2026-08-11 19:07:32.647+00
396	4	36	f	2026-08-11 19:07:32.647+00
397	5	1	t	2026-08-13 02:33:24.957+00
398	5	2	t	2026-08-13 02:33:24.957+00
399	5	3	t	2026-08-13 02:33:24.957+00
400	5	4	t	2026-08-13 02:33:24.957+00
401	5	5	t	2026-08-13 02:33:24.957+00
402	5	6	t	2026-08-13 02:33:24.957+00
404	5	8	f	2026-08-13 02:33:24.957+00
405	5	9	f	2026-08-13 02:33:24.957+00
406	5	10	f	2026-08-13 02:33:24.957+00
407	5	11	f	2026-08-13 02:33:24.957+00
408	5	12	f	2026-08-13 02:33:24.957+00
409	5	13	f	2026-08-13 02:33:24.957+00
410	5	14	f	2026-08-13 02:33:24.957+00
4935	1	123	t	2026-08-11 14:59:28.043+00
885	1	100	t	2026-08-11 14:59:28.043+00
975	1	115	f	2026-08-11 14:59:28.043+00
981	1	116	f	2026-08-11 14:59:28.043+00
987	1	117	f	2026-08-11 14:59:28.043+00
411	5	15	f	2026-08-13 02:33:24.957+00
412	5	16	f	2026-08-13 02:33:24.957+00
413	5	17	f	2026-08-13 02:33:24.957+00
977	4	115	f	2026-08-11 19:07:32.647+00
983	4	116	f	2026-08-11 19:07:32.647+00
989	4	117	f	2026-08-11 19:07:32.647+00
414	5	18	f	2026-08-13 02:33:24.957+00
415	5	19	f	2026-08-13 02:33:24.957+00
416	5	20	f	2026-08-13 02:33:24.957+00
417	5	21	f	2026-08-13 02:33:24.957+00
418	5	22	f	2026-08-13 02:33:24.957+00
419	5	23	f	2026-08-13 02:33:24.957+00
420	5	24	f	2026-08-13 02:33:24.957+00
421	5	25	f	2026-08-13 02:33:24.957+00
422	5	26	t	2026-08-13 02:33:24.957+00
423	5	27	t	2026-08-13 02:33:24.957+00
424	5	28	t	2026-08-13 02:33:24.957+00
425	5	29	t	2026-08-13 02:33:24.957+00
426	5	30	t	2026-08-13 02:33:24.957+00
427	5	31	f	2026-08-13 02:33:24.957+00
5703	9	77	t	2026-08-14 07:20:08.439+00
4359	8	123	t	2026-08-14 07:55:40.821+00
849	1	94	t	2026-08-11 14:59:28.043+00
324	1	36	f	2026-08-11 14:59:28.043+00
5031	2	123	t	2026-08-11 15:00:18.489+00
850	2	94	t	2026-08-11 15:00:18.489+00
5705	9	99	t	2026-08-14 07:20:08.439+00
36	8	36	f	2026-08-14 07:55:40.822+00
986	8	117	f	2026-08-14 07:55:40.822+00
5706	9	19	t	2026-08-14 07:20:08.439+00
5707	9	55	t	2026-08-14 07:20:08.439+00
179	2	35	f	2026-08-11 15:00:18.489+00
180	2	36	f	2026-08-11 15:00:18.489+00
976	2	115	f	2026-08-11 15:00:18.489+00
428	5	32	f	2026-08-13 02:33:24.957+00
5710	9	84	t	2026-08-14 07:20:08.439+00
5711	9	88	t	2026-08-14 07:20:08.439+00
654	5	55	f	2026-08-13 02:33:24.957+00
660	5	56	f	2026-08-13 02:33:24.957+00
666	5	61	f	2026-08-13 02:33:24.957+00
672	5	62	f	2026-08-13 02:33:24.957+00
678	5	65	f	2026-08-13 02:33:24.957+00
684	5	66	f	2026-08-13 02:33:24.957+00
690	5	67	f	2026-08-13 02:33:24.957+00
696	5	68	t	2026-08-13 02:33:24.957+00
702	5	69	f	2026-08-13 02:33:24.957+00
708	5	70	f	2026-08-13 02:33:24.957+00
714	5	71	f	2026-08-13 02:33:24.957+00
720	5	72	f	2026-08-13 02:33:24.957+00
726	5	73	f	2026-08-13 02:33:24.957+00
732	5	74	f	2026-08-13 02:33:24.957+00
738	5	75	f	2026-08-13 02:33:24.957+00
744	5	76	f	2026-08-13 02:33:24.957+00
750	5	77	f	2026-08-13 02:33:24.957+00
756	5	78	t	2026-08-13 02:33:24.957+00
762	5	79	t	2026-08-13 02:33:24.957+00
768	5	80	t	2026-08-13 02:33:24.957+00
774	5	81	f	2026-08-13 02:33:24.957+00
780	5	82	f	2026-08-13 02:33:24.957+00
786	5	83	f	2026-08-13 02:33:24.957+00
430	5	34	f	2026-08-13 02:33:24.957+00
431	5	35	f	2026-08-13 02:33:24.957+00
432	5	36	f	2026-08-13 02:33:24.957+00
5712	9	123	t	2026-08-14 07:20:08.436+00
5713	9	1	t	2026-08-14 07:20:08.439+00
5714	9	2	t	2026-08-14 07:20:08.439+00
5715	9	3	t	2026-08-14 07:20:08.439+00
5716	9	4	t	2026-08-14 07:20:08.439+00
5717	9	5	t	2026-08-14 07:20:08.439+00
5718	9	6	t	2026-08-14 07:20:08.439+00
5719	9	7	t	2026-08-14 07:20:08.439+00
5720	9	8	t	2026-08-14 07:20:08.439+00
5721	9	9	t	2026-08-14 07:20:08.439+00
5722	9	10	t	2026-08-14 07:20:08.439+00
5723	9	11	f	2026-08-14 07:20:08.439+00
5724	9	12	f	2026-08-14 07:20:08.439+00
5725	9	13	f	2026-08-14 07:20:08.439+00
5726	9	14	f	2026-08-14 07:20:08.439+00
5727	9	15	t	2026-08-14 07:20:08.439+00
5728	9	16	t	2026-08-14 07:20:08.439+00
5729	9	17	f	2026-08-14 07:20:08.439+00
5730	9	18	f	2026-08-14 07:20:08.439+00
5733	9	56	f	2026-08-14 07:20:08.439+00
5734	9	20	f	2026-08-14 07:20:08.439+00
5735	9	21	f	2026-08-14 07:20:08.439+00
5736	9	22	f	2026-08-14 07:20:08.439+00
5737	9	61	f	2026-08-14 07:20:08.439+00
5738	9	23	f	2026-08-14 07:20:08.439+00
5739	9	24	f	2026-08-14 07:20:08.439+00
5740	9	62	f	2026-08-14 07:20:08.439+00
5741	9	65	f	2026-08-14 07:20:08.439+00
5742	9	66	f	2026-08-14 07:20:08.439+00
5743	9	25	f	2026-08-14 07:20:08.439+00
5744	9	67	f	2026-08-14 07:20:08.439+00
5745	9	68	f	2026-08-14 07:20:08.439+00
5746	9	69	f	2026-08-14 07:20:08.439+00
5747	9	70	f	2026-08-14 07:20:08.439+00
5748	9	71	f	2026-08-14 07:20:08.439+00
5749	9	72	f	2026-08-14 07:20:08.439+00
5750	9	73	f	2026-08-14 07:20:08.439+00
5751	9	118	f	2026-08-14 07:20:08.439+00
5752	9	119	f	2026-08-14 07:20:08.439+00
792	5	84	t	2026-08-13 02:33:24.957+00
798	5	85	f	2026-08-13 02:33:24.957+00
804	5	86	f	2026-08-13 02:33:24.957+00
810	5	87	f	2026-08-13 02:33:24.957+00
816	5	88	f	2026-08-13 02:33:24.957+00
822	5	89	t	2026-08-13 02:33:24.957+00
828	5	90	t	2026-08-13 02:33:24.957+00
834	5	91	f	2026-08-13 02:33:24.957+00
840	5	92	f	2026-08-13 02:33:24.957+00
846	5	93	f	2026-08-13 02:33:24.957+00
852	5	94	f	2026-08-13 02:33:24.957+00
858	5	95	t	2026-08-13 02:33:24.957+00
864	5	96	t	2026-08-13 02:33:24.957+00
870	5	97	t	2026-08-13 02:33:24.957+00
876	5	98	t	2026-08-13 02:33:24.957+00
882	5	99	f	2026-08-13 02:33:24.957+00
888	5	100	f	2026-08-13 02:33:24.957+00
894	5	101	f	2026-08-13 02:33:24.957+00
900	5	102	f	2026-08-13 02:33:24.957+00
906	5	103	f	2026-08-13 02:33:24.957+00
912	5	104	f	2026-08-13 02:33:24.957+00
918	5	105	f	2026-08-13 02:33:24.957+00
924	5	106	f	2026-08-13 02:33:24.957+00
930	5	107	f	2026-08-13 02:33:24.957+00
936	5	108	f	2026-08-13 02:33:24.957+00
942	5	109	f	2026-08-13 02:33:24.957+00
5753	9	74	f	2026-08-14 07:20:08.439+00
5754	9	26	f	2026-08-14 07:20:08.439+00
5755	9	75	f	2026-08-14 07:20:08.439+00
5756	9	76	f	2026-08-14 07:20:08.439+00
5758	9	27	f	2026-08-14 07:20:08.439+00
5759	9	78	f	2026-08-14 07:20:08.439+00
5760	9	79	f	2026-08-14 07:20:08.439+00
5761	9	80	f	2026-08-14 07:20:08.439+00
5762	9	81	f	2026-08-14 07:20:08.439+00
5763	9	82	f	2026-08-14 07:20:08.439+00
5764	9	83	f	2026-08-14 07:20:08.439+00
5765	9	28	f	2026-08-14 07:20:08.439+00
5767	9	85	f	2026-08-14 07:20:08.439+00
5768	9	86	f	2026-08-14 07:20:08.439+00
5769	9	87	f	2026-08-14 07:20:08.439+00
5771	9	89	f	2026-08-14 07:20:08.439+00
5772	9	29	t	2026-08-14 07:20:08.439+00
5773	9	90	t	2026-08-14 07:20:08.439+00
5774	9	91	t	2026-08-14 07:20:08.439+00
5775	9	92	t	2026-08-14 07:20:08.439+00
5776	9	93	t	2026-08-14 07:20:08.439+00
5777	9	94	t	2026-08-14 07:20:08.439+00
5778	9	30	f	2026-08-14 07:20:08.439+00
5779	9	95	f	2026-08-14 07:20:08.439+00
5780	9	96	f	2026-08-14 07:20:08.439+00
5781	9	97	f	2026-08-14 07:20:08.439+00
5782	9	98	f	2026-08-14 07:20:08.439+00
5783	9	31	f	2026-08-14 07:20:08.439+00
5785	9	100	f	2026-08-14 07:20:08.439+00
5786	9	101	f	2026-08-14 07:20:08.439+00
5787	9	102	f	2026-08-14 07:20:08.439+00
5788	9	32	f	2026-08-14 07:20:08.439+00
5789	9	103	f	2026-08-14 07:20:08.439+00
5790	9	104	f	2026-08-14 07:20:08.439+00
5791	9	33	f	2026-08-14 07:20:08.439+00
5792	9	105	f	2026-08-14 07:20:08.439+00
5793	9	106	f	2026-08-14 07:20:08.439+00
5794	9	107	f	2026-08-14 07:20:08.439+00
5795	9	34	f	2026-08-14 07:20:08.439+00
5796	9	108	f	2026-08-14 07:20:08.439+00
5797	9	109	f	2026-08-14 07:20:08.439+00
5798	9	35	f	2026-08-14 07:20:08.439+00
5799	9	110	f	2026-08-14 07:20:08.439+00
5800	9	111	f	2026-08-14 07:20:08.439+00
5801	9	36	f	2026-08-14 07:20:08.439+00
5802	9	112	f	2026-08-14 07:20:08.439+00
5803	9	113	f	2026-08-14 07:20:08.439+00
5804	9	114	f	2026-08-14 07:20:08.439+00
5805	9	115	f	2026-08-14 07:20:08.439+00
5806	9	116	f	2026-08-14 07:20:08.439+00
5807	9	117	f	2026-08-14 07:20:08.439+00
308	1	20	f	2026-08-11 14:59:28.043+00
309	1	21	f	2026-08-11 14:59:28.043+00
310	1	22	f	2026-08-11 14:59:28.043+00
9	8	9	f	2026-08-14 07:55:40.822+00
370	4	10	f	2026-08-11 19:07:32.647+00
371	4	11	f	2026-08-11 19:07:32.647+00
10	8	10	f	2026-08-14 07:55:40.822+00
11	8	11	f	2026-08-14 07:55:40.822+00
12	8	12	f	2026-08-14 07:55:40.822+00
311	1	23	f	2026-08-11 14:59:28.043+00
312	1	24	f	2026-08-11 14:59:28.043+00
313	1	25	t	2026-08-11 14:59:28.043+00
314	1	26	f	2026-08-11 14:59:28.043+00
315	1	27	t	2026-08-11 14:59:28.043+00
321	1	33	f	2026-08-11 14:59:28.043+00
153	2	9	f	2026-08-11 15:00:18.489+00
154	2	10	f	2026-08-11 15:00:18.489+00
155	2	11	f	2026-08-11 15:00:18.489+00
156	2	12	f	2026-08-11 15:00:18.489+00
13	8	13	f	2026-08-14 07:55:40.822+00
372	4	12	f	2026-08-11 19:07:32.647+00
373	4	13	f	2026-08-11 19:07:32.647+00
374	4	14	f	2026-08-11 19:07:32.647+00
375	4	15	t	2026-08-11 19:07:32.647+00
376	4	16	t	2026-08-11 19:07:32.647+00
377	4	17	t	2026-08-11 19:07:32.647+00
378	4	18	t	2026-08-11 19:07:32.647+00
379	4	19	f	2026-08-11 19:07:32.647+00
380	4	20	f	2026-08-11 19:07:32.647+00
14	8	14	f	2026-08-14 07:55:40.822+00
15	8	15	f	2026-08-14 07:55:40.822+00
403	5	7	t	2026-08-13 02:33:24.957+00
1589	5	118	f	2026-08-13 02:33:24.957+00
1595	5	119	f	2026-08-13 02:33:24.957+00
948	5	110	f	2026-08-13 02:33:24.957+00
954	5	111	f	2026-08-13 02:33:24.957+00
960	5	112	f	2026-08-13 02:33:24.957+00
966	5	113	f	2026-08-13 02:33:24.957+00
972	5	114	f	2026-08-13 02:33:24.957+00
978	5	115	f	2026-08-13 02:33:24.957+00
984	5	116	f	2026-08-13 02:33:24.957+00
990	5	117	f	2026-08-13 02:33:24.957+00
381	4	21	f	2026-08-11 19:07:32.647+00
382	4	22	f	2026-08-11 19:07:32.647+00
383	4	23	f	2026-08-11 19:07:32.647+00
384	4	24	f	2026-08-11 19:07:32.647+00
385	4	25	t	2026-08-11 19:07:32.647+00
386	4	26	f	2026-08-11 19:07:32.647+00
393	4	33	f	2026-08-11 19:07:32.647+00
16	8	16	f	2026-08-14 07:55:40.822+00
17	8	17	f	2026-08-14 07:55:40.822+00
18	8	18	f	2026-08-14 07:55:40.822+00
19	8	19	f	2026-08-14 07:55:40.822+00
20	8	20	f	2026-08-14 07:55:40.822+00
21	8	21	f	2026-08-14 07:55:40.822+00
22	8	22	f	2026-08-14 07:55:40.822+00
23	8	23	f	2026-08-14 07:55:40.822+00
24	8	24	f	2026-08-14 07:55:40.822+00
25	8	25	t	2026-08-14 07:55:40.822+00
26	8	26	f	2026-08-14 07:55:40.822+00
27	8	27	t	2026-08-14 07:55:40.822+00
28	8	28	f	2026-08-14 07:55:40.822+00
157	2	13	f	2026-08-11 15:00:18.489+00
158	2	14	f	2026-08-11 15:00:18.489+00
159	2	15	f	2026-08-11 15:00:18.489+00
160	2	16	f	2026-08-11 15:00:18.489+00
161	2	17	f	2026-08-11 15:00:18.489+00
162	2	18	f	2026-08-11 15:00:18.489+00
163	2	19	f	2026-08-11 15:00:18.489+00
164	2	20	f	2026-08-11 15:00:18.489+00
165	2	21	f	2026-08-11 15:00:18.489+00
166	2	22	f	2026-08-11 15:00:18.489+00
167	2	23	f	2026-08-11 15:00:18.489+00
168	2	24	f	2026-08-11 15:00:18.489+00
169	2	25	t	2026-08-11 15:00:18.489+00
170	2	26	f	2026-08-11 15:00:18.489+00
177	2	33	f	2026-08-11 15:00:18.489+00
29	8	29	t	2026-08-14 07:55:40.822+00
30	8	30	t	2026-08-14 07:55:40.822+00
31	8	31	t	2026-08-14 07:55:40.822+00
32	8	32	f	2026-08-14 07:55:40.822+00
297	1	9	f	2026-08-11 14:59:28.043+00
298	1	10	f	2026-08-11 14:59:28.043+00
299	1	11	f	2026-08-11 14:59:28.043+00
300	1	12	f	2026-08-11 14:59:28.043+00
301	1	13	f	2026-08-11 14:59:28.043+00
302	1	14	f	2026-08-11 14:59:28.043+00
303	1	15	f	2026-08-11 14:59:28.043+00
304	1	16	f	2026-08-11 14:59:28.043+00
305	1	17	f	2026-08-11 14:59:28.043+00
306	1	18	f	2026-08-11 14:59:28.043+00
307	1	19	f	2026-08-11 14:59:28.043+00
657	1	56	f	2026-08-11 14:59:28.043+00
663	1	61	f	2026-08-11 14:59:28.043+00
669	1	62	f	2026-08-11 14:59:28.043+00
675	1	65	f	2026-08-11 14:59:28.043+00
681	1	66	f	2026-08-11 14:59:28.043+00
687	1	67	t	2026-08-11 14:59:28.043+00
693	1	68	t	2026-08-11 14:59:28.043+00
699	1	69	t	2026-08-11 14:59:28.043+00
705	1	70	t	2026-08-11 14:59:28.043+00
717	1	72	t	2026-08-11 14:59:28.043+00
723	1	73	t	2026-08-11 14:59:28.043+00
729	1	74	f	2026-08-11 14:59:28.043+00
735	1	75	f	2026-08-11 14:59:28.043+00
741	1	76	f	2026-08-11 14:59:28.043+00
659	4	56	f	2026-08-11 19:07:32.647+00
753	1	78	t	2026-08-11 14:59:28.043+00
665	4	61	f	2026-08-11 19:07:32.647+00
671	4	62	f	2026-08-11 19:07:32.647+00
759	1	79	t	2026-08-11 14:59:28.043+00
677	4	65	f	2026-08-11 19:07:32.647+00
765	1	80	t	2026-08-11 14:59:28.043+00
316	1	28	t	2026-08-11 14:59:28.043+00
789	1	84	t	2026-08-11 14:59:28.043+00
683	4	66	f	2026-08-11 19:07:32.647+00
795	1	85	t	2026-08-11 14:59:28.043+00
801	1	86	t	2026-08-11 14:59:28.043+00
807	1	87	t	2026-08-11 14:59:28.043+00
317	1	29	t	2026-08-11 14:59:28.043+00
318	1	30	t	2026-08-11 14:59:28.043+00
319	1	31	t	2026-08-11 14:59:28.043+00
320	1	32	f	2026-08-11 14:59:28.043+00
322	1	34	f	2026-08-11 14:59:28.043+00
323	1	35	f	2026-08-11 14:59:28.043+00
658	2	56	f	2026-08-11 15:00:18.489+00
664	2	61	f	2026-08-11 15:00:18.489+00
670	2	62	f	2026-08-11 15:00:18.489+00
676	2	65	f	2026-08-11 15:00:18.489+00
682	2	66	f	2026-08-11 15:00:18.489+00
688	2	67	t	2026-08-11 15:00:18.489+00
694	2	68	t	2026-08-11 15:00:18.489+00
700	2	69	t	2026-08-11 15:00:18.489+00
706	2	70	t	2026-08-11 15:00:18.489+00
718	2	72	t	2026-08-11 15:00:18.489+00
724	2	73	t	2026-08-11 15:00:18.489+00
730	2	74	f	2026-08-11 15:00:18.489+00
736	2	75	f	2026-08-11 15:00:18.489+00
742	2	76	f	2026-08-11 15:00:18.489+00
171	2	27	t	2026-08-11 15:00:18.489+00
754	2	78	t	2026-08-11 15:00:18.489+00
760	2	79	t	2026-08-11 15:00:18.489+00
766	2	80	t	2026-08-11 15:00:18.489+00
172	2	28	t	2026-08-11 15:00:18.489+00
790	2	84	t	2026-08-11 15:00:18.489+00
796	2	85	t	2026-08-11 15:00:18.489+00
802	2	86	t	2026-08-11 15:00:18.489+00
808	2	87	t	2026-08-11 15:00:18.489+00
173	2	29	t	2026-08-11 15:00:18.489+00
174	2	30	t	2026-08-11 15:00:18.489+00
175	2	31	t	2026-08-11 15:00:18.489+00
176	2	32	f	2026-08-11 15:00:18.489+00
178	2	34	f	2026-08-11 15:00:18.489+00
689	4	67	t	2026-08-11 19:07:32.647+00
695	4	68	t	2026-08-11 19:07:32.647+00
701	4	69	t	2026-08-11 19:07:32.647+00
707	4	70	t	2026-08-11 19:07:32.647+00
719	4	72	t	2026-08-11 19:07:32.647+00
725	4	73	t	2026-08-11 19:07:32.647+00
731	4	74	f	2026-08-11 19:07:32.647+00
737	4	75	f	2026-08-11 19:07:32.647+00
743	4	76	f	2026-08-11 19:07:32.647+00
749	4	77	t	2026-08-11 19:07:32.647+00
387	4	27	t	2026-08-11 19:07:32.647+00
755	4	78	t	2026-08-11 19:07:32.647+00
761	4	79	t	2026-08-11 19:07:32.647+00
767	4	80	t	2026-08-11 19:07:32.647+00
773	4	81	t	2026-08-11 19:07:32.647+00
779	4	82	t	2026-08-11 19:07:32.647+00
785	4	83	t	2026-08-11 19:07:32.647+00
388	4	28	t	2026-08-11 19:07:32.647+00
791	4	84	t	2026-08-11 19:07:32.647+00
797	4	85	t	2026-08-11 19:07:32.647+00
803	4	86	t	2026-08-11 19:07:32.647+00
809	4	87	t	2026-08-11 19:07:32.647+00
815	4	88	t	2026-08-11 19:07:32.647+00
389	4	29	t	2026-08-11 19:07:32.647+00
390	4	30	t	2026-08-11 19:07:32.647+00
656	8	56	f	2026-08-14 07:55:40.822+00
662	8	61	f	2026-08-14 07:55:40.822+00
668	8	62	f	2026-08-14 07:55:40.822+00
674	8	65	f	2026-08-14 07:55:40.822+00
680	8	66	f	2026-08-14 07:55:40.822+00
686	8	67	t	2026-08-14 07:55:40.822+00
692	8	68	t	2026-08-14 07:55:40.822+00
698	8	69	t	2026-08-14 07:55:40.822+00
704	8	70	t	2026-08-14 07:55:40.822+00
716	8	72	t	2026-08-14 07:55:40.822+00
722	8	73	t	2026-08-14 07:55:40.822+00
728	8	74	f	2026-08-14 07:55:40.822+00
734	8	75	f	2026-08-14 07:55:40.822+00
740	8	76	f	2026-08-14 07:55:40.822+00
746	8	77	t	2026-08-14 07:55:40.822+00
752	8	78	f	2026-08-14 07:55:40.822+00
758	8	79	f	2026-08-14 07:55:40.822+00
764	8	80	f	2026-08-14 07:55:40.822+00
770	8	81	f	2026-08-14 07:55:40.822+00
776	8	82	t	2026-08-14 07:55:40.822+00
782	8	83	t	2026-08-14 07:55:40.822+00
788	8	84	f	2026-08-14 07:55:40.822+00
794	8	85	f	2026-08-14 07:55:40.822+00
800	8	86	f	2026-08-14 07:55:40.822+00
806	8	87	f	2026-08-14 07:55:40.822+00
812	8	88	f	2026-08-14 07:55:40.822+00
33	8	33	f	2026-08-14 07:55:40.822+00
34	8	34	f	2026-08-14 07:55:40.822+00
35	8	35	f	2026-08-14 07:55:40.822+00
289	1	1	t	2026-08-11 14:59:28.043+00
290	1	2	t	2026-08-11 14:59:28.043+00
291	1	3	t	2026-08-11 14:59:28.043+00
292	1	4	t	2026-08-11 14:59:28.043+00
293	1	5	t	2026-08-11 14:59:28.043+00
1592	1	119	t	2026-08-11 14:59:28.043+00
819	1	89	t	2026-08-11 14:59:28.043+00
825	1	90	t	2026-08-11 14:59:28.043+00
837	1	92	t	2026-08-11 14:59:28.043+00
843	1	93	t	2026-08-11 14:59:28.043+00
855	1	95	t	2026-08-11 14:59:28.043+00
861	1	96	t	2026-08-11 14:59:28.043+00
867	1	97	t	2026-08-11 14:59:28.043+00
873	1	98	t	2026-08-11 14:59:28.043+00
361	4	1	t	2026-08-11 19:07:32.647+00
879	1	99	t	2026-08-11 14:59:28.043+00
891	1	101	t	2026-08-11 14:59:28.043+00
362	4	2	t	2026-08-11 19:07:32.647+00
897	1	102	f	2026-08-11 14:59:28.043+00
903	1	103	f	2026-08-11 14:59:28.043+00
909	1	104	f	2026-08-11 14:59:28.043+00
363	4	3	t	2026-08-11 19:07:32.647+00
915	1	105	f	2026-08-11 14:59:28.043+00
921	1	106	f	2026-08-11 14:59:28.043+00
927	1	107	f	2026-08-11 14:59:28.043+00
933	1	108	f	2026-08-11 14:59:28.043+00
939	1	109	f	2026-08-11 14:59:28.043+00
945	1	110	f	2026-08-11 14:59:28.043+00
951	1	111	f	2026-08-11 14:59:28.043+00
957	1	112	f	2026-08-11 14:59:28.043+00
963	1	113	f	2026-08-11 14:59:28.043+00
969	1	114	f	2026-08-11 14:59:28.043+00
364	4	4	t	2026-08-11 19:07:32.647+00
365	4	5	t	2026-08-11 19:07:32.647+00
821	4	89	t	2026-08-11 19:07:32.647+00
827	4	90	t	2026-08-11 19:07:32.647+00
839	4	92	t	2026-08-11 19:07:32.647+00
145	2	1	t	2026-08-11 15:00:18.489+00
146	2	2	t	2026-08-11 15:00:18.489+00
147	2	3	t	2026-08-11 15:00:18.489+00
148	2	4	t	2026-08-11 15:00:18.489+00
149	2	5	t	2026-08-11 15:00:18.489+00
1593	2	119	t	2026-08-11 15:00:18.489+00
820	2	89	t	2026-08-11 15:00:18.489+00
826	2	90	t	2026-08-11 15:00:18.489+00
838	2	92	t	2026-08-11 15:00:18.489+00
844	2	93	t	2026-08-11 15:00:18.489+00
856	2	95	t	2026-08-11 15:00:18.489+00
862	2	96	t	2026-08-11 15:00:18.489+00
868	2	97	t	2026-08-11 15:00:18.489+00
874	2	98	t	2026-08-11 15:00:18.489+00
880	2	99	t	2026-08-11 15:00:18.489+00
892	2	101	t	2026-08-11 15:00:18.489+00
898	2	102	f	2026-08-11 15:00:18.489+00
904	2	103	f	2026-08-11 15:00:18.489+00
910	2	104	f	2026-08-11 15:00:18.489+00
916	2	105	f	2026-08-11 15:00:18.489+00
922	2	106	f	2026-08-11 15:00:18.489+00
928	2	107	f	2026-08-11 15:00:18.489+00
934	2	108	f	2026-08-11 15:00:18.489+00
940	2	109	f	2026-08-11 15:00:18.489+00
946	2	110	f	2026-08-11 15:00:18.489+00
952	2	111	f	2026-08-11 15:00:18.489+00
958	2	112	f	2026-08-11 15:00:18.489+00
964	2	113	f	2026-08-11 15:00:18.489+00
970	2	114	f	2026-08-11 15:00:18.489+00
845	4	93	t	2026-08-11 19:07:32.647+00
857	4	95	t	2026-08-11 19:07:32.647+00
863	4	96	t	2026-08-11 19:07:32.647+00
869	4	97	t	2026-08-11 19:07:32.647+00
875	4	98	t	2026-08-11 19:07:32.647+00
881	4	99	t	2026-08-11 19:07:32.647+00
893	4	101	t	2026-08-11 19:07:32.647+00
899	4	102	f	2026-08-11 19:07:32.647+00
905	4	103	f	2026-08-11 19:07:32.647+00
911	4	104	f	2026-08-11 19:07:32.647+00
917	4	105	f	2026-08-11 19:07:32.647+00
923	4	106	f	2026-08-11 19:07:32.647+00
929	4	107	f	2026-08-11 19:07:32.647+00
935	4	108	f	2026-08-11 19:07:32.647+00
941	4	109	f	2026-08-11 19:07:32.647+00
947	4	110	f	2026-08-11 19:07:32.647+00
953	4	111	f	2026-08-11 19:07:32.647+00
959	4	112	f	2026-08-11 19:07:32.647+00
965	4	113	f	2026-08-11 19:07:32.647+00
971	4	114	f	2026-08-11 19:07:32.647+00
1	8	1	t	2026-08-14 07:55:40.822+00
2	8	2	t	2026-08-14 07:55:40.822+00
3	8	3	t	2026-08-14 07:55:40.822+00
4	8	4	t	2026-08-14 07:55:40.822+00
1591	8	119	t	2026-08-14 07:55:40.822+00
818	8	89	f	2026-08-14 07:55:40.822+00
824	8	90	t	2026-08-14 07:55:40.822+00
836	8	92	t	2026-08-14 07:55:40.822+00
842	8	93	t	2026-08-14 07:55:40.822+00
854	8	95	t	2026-08-14 07:55:40.822+00
860	8	96	t	2026-08-14 07:55:40.822+00
866	8	97	t	2026-08-14 07:55:40.822+00
872	8	98	t	2026-08-14 07:55:40.822+00
878	8	99	t	2026-08-14 07:55:40.822+00
890	8	101	t	2026-08-14 07:55:40.822+00
896	8	102	f	2026-08-14 07:55:40.822+00
902	8	103	f	2026-08-14 07:55:40.822+00
908	8	104	f	2026-08-14 07:55:40.822+00
914	8	105	f	2026-08-14 07:55:40.822+00
920	8	106	f	2026-08-14 07:55:40.822+00
926	8	107	f	2026-08-14 07:55:40.822+00
932	8	108	f	2026-08-14 07:55:40.822+00
938	8	109	f	2026-08-14 07:55:40.822+00
944	8	110	f	2026-08-14 07:55:40.822+00
950	8	111	f	2026-08-14 07:55:40.822+00
956	8	112	f	2026-08-14 07:55:40.822+00
962	8	113	f	2026-08-14 07:55:40.822+00
968	8	114	f	2026-08-14 07:55:40.822+00
974	8	115	f	2026-08-14 07:55:40.822+00
980	8	116	f	2026-08-14 07:55:40.822+00
294	1	6	t	2026-08-11 14:59:28.043+00
295	1	7	t	2026-08-11 14:59:28.043+00
296	1	8	t	2026-08-11 14:59:28.043+00
217	6	1	t	2026-08-11 07:22:22.601527+00
218	6	2	t	2026-08-11 07:22:22.601527+00
219	6	3	t	2026-08-11 07:22:22.601527+00
220	6	4	t	2026-08-11 07:22:22.601527+00
221	6	5	t	2026-08-11 07:22:22.601527+00
222	6	6	t	2026-08-11 07:22:22.601527+00
223	6	7	t	2026-08-11 07:22:22.601527+00
224	6	8	t	2026-08-11 07:22:22.601527+00
225	6	9	t	2026-08-11 07:22:22.601527+00
226	6	10	t	2026-08-11 07:22:22.601527+00
227	6	11	t	2026-08-11 07:22:22.601527+00
228	6	12	t	2026-08-11 07:22:22.601527+00
229	6	13	t	2026-08-11 07:22:22.601527+00
230	6	14	t	2026-08-11 07:22:22.601527+00
231	6	15	t	2026-08-11 07:22:22.601527+00
232	6	16	t	2026-08-11 07:22:22.601527+00
233	6	17	t	2026-08-11 07:22:22.601527+00
234	6	18	t	2026-08-11 07:22:22.601527+00
235	6	19	t	2026-08-11 07:22:22.601527+00
236	6	20	t	2026-08-11 07:22:22.601527+00
237	6	21	t	2026-08-11 07:22:22.601527+00
238	6	22	t	2026-08-11 07:22:22.601527+00
239	6	23	t	2026-08-11 07:22:22.601527+00
240	6	24	t	2026-08-11 07:22:22.601527+00
241	6	25	t	2026-08-11 07:22:22.601527+00
242	6	26	t	2026-08-11 07:22:22.601527+00
243	6	27	t	2026-08-11 07:22:22.601527+00
244	6	28	t	2026-08-11 07:22:22.601527+00
245	6	29	t	2026-08-11 07:22:22.601527+00
246	6	30	t	2026-08-11 07:22:22.601527+00
247	6	31	t	2026-08-11 07:22:22.601527+00
248	6	32	t	2026-08-11 07:22:22.601527+00
249	6	33	t	2026-08-11 07:22:22.601527+00
250	6	34	t	2026-08-11 07:22:22.601527+00
251	6	35	t	2026-08-11 07:22:22.601527+00
252	6	36	t	2026-08-11 07:22:22.601527+00
649	6	55	t	2026-08-11 07:22:22.601527+00
655	6	56	t	2026-08-11 07:22:22.601527+00
661	6	61	t	2026-08-11 07:22:22.601527+00
667	6	62	t	2026-08-11 07:22:22.601527+00
673	6	65	t	2026-08-11 07:22:22.601527+00
679	6	66	t	2026-08-11 07:22:22.601527+00
685	6	67	t	2026-08-11 07:22:22.601527+00
691	6	68	t	2026-08-11 07:22:22.601527+00
697	6	69	t	2026-08-11 07:22:22.601527+00
703	6	70	t	2026-08-11 07:22:22.601527+00
709	6	71	t	2026-08-11 07:22:22.601527+00
715	6	72	t	2026-08-11 07:22:22.601527+00
721	6	73	t	2026-08-11 07:22:22.601527+00
727	6	74	t	2026-08-11 07:22:22.601527+00
733	6	75	t	2026-08-11 07:22:22.601527+00
739	6	76	t	2026-08-11 07:22:22.601527+00
745	6	77	t	2026-08-11 07:22:22.601527+00
751	6	78	t	2026-08-11 07:22:22.601527+00
757	6	79	t	2026-08-11 07:22:22.601527+00
763	6	80	t	2026-08-11 07:22:22.601527+00
769	6	81	t	2026-08-11 07:22:22.601527+00
775	6	82	t	2026-08-11 07:22:22.601527+00
781	6	83	t	2026-08-11 07:22:22.601527+00
787	6	84	t	2026-08-11 07:22:22.601527+00
793	6	85	t	2026-08-11 07:22:22.601527+00
799	6	86	t	2026-08-11 07:22:22.601527+00
805	6	87	t	2026-08-11 07:22:22.601527+00
811	6	88	t	2026-08-11 07:22:22.601527+00
817	6	89	t	2026-08-11 07:22:22.601527+00
823	6	90	t	2026-08-11 07:22:22.601527+00
829	6	91	t	2026-08-11 07:22:22.601527+00
835	6	92	t	2026-08-11 07:22:22.601527+00
841	6	93	t	2026-08-11 07:22:22.601527+00
847	6	94	t	2026-08-11 07:22:22.601527+00
853	6	95	t	2026-08-11 07:22:22.601527+00
859	6	96	t	2026-08-11 07:22:22.601527+00
865	6	97	t	2026-08-11 07:22:22.601527+00
871	6	98	t	2026-08-11 07:22:22.601527+00
877	6	99	t	2026-08-11 07:22:22.601527+00
883	6	100	t	2026-08-11 07:22:22.601527+00
889	6	101	t	2026-08-11 07:22:22.601527+00
895	6	102	t	2026-08-11 07:22:22.601527+00
901	6	103	t	2026-08-11 07:22:22.601527+00
907	6	104	t	2026-08-11 07:22:22.601527+00
913	6	105	t	2026-08-11 07:22:22.601527+00
919	6	106	t	2026-08-11 07:22:22.601527+00
925	6	107	t	2026-08-11 07:22:22.601527+00
931	6	108	t	2026-08-11 07:22:22.601527+00
937	6	109	t	2026-08-11 07:22:22.601527+00
943	6	110	t	2026-08-11 07:22:22.601527+00
949	6	111	t	2026-08-11 07:22:22.601527+00
955	6	112	t	2026-08-11 07:22:22.601527+00
961	6	113	t	2026-08-11 07:22:22.601527+00
967	6	114	t	2026-08-11 07:22:22.601527+00
973	6	115	t	2026-08-11 07:22:22.601527+00
979	6	116	t	2026-08-11 07:22:22.601527+00
985	6	117	t	2026-08-11 07:22:22.601527+00
1584	6	118	t	2026-08-11 07:22:22.601527+00
1590	6	119	t	2026-08-11 07:22:22.601527+00
651	1	55	t	2026-08-11 14:59:28.043+00
711	1	71	t	2026-08-11 14:59:28.043+00
1586	1	118	t	2026-08-11 14:59:28.043+00
747	1	77	t	2026-08-11 14:59:28.043+00
771	1	81	t	2026-08-11 14:59:28.043+00
777	1	82	t	2026-08-11 14:59:28.043+00
783	1	83	t	2026-08-11 14:59:28.043+00
366	4	6	t	2026-08-11 19:07:32.647+00
367	4	7	t	2026-08-11 19:07:32.647+00
368	4	8	t	2026-08-11 19:07:32.647+00
150	2	6	t	2026-08-11 15:00:18.489+00
151	2	7	t	2026-08-11 15:00:18.489+00
152	2	8	t	2026-08-11 15:00:18.489+00
652	2	55	t	2026-08-11 15:00:18.489+00
712	2	71	t	2026-08-11 15:00:18.489+00
1587	2	118	t	2026-08-11 15:00:18.489+00
748	2	77	t	2026-08-11 15:00:18.489+00
772	2	81	t	2026-08-11 15:00:18.489+00
778	2	82	t	2026-08-11 15:00:18.489+00
784	2	83	t	2026-08-11 15:00:18.489+00
814	2	88	t	2026-08-11 15:00:18.489+00
832	2	91	t	2026-08-11 15:00:18.489+00
369	4	9	t	2026-08-11 19:07:32.647+00
653	4	55	t	2026-08-11 19:07:32.647+00
713	4	71	t	2026-08-11 19:07:32.647+00
1588	4	118	t	2026-08-11 19:07:32.647+00
1594	4	119	t	2026-08-11 19:07:32.647+00
833	4	91	t	2026-08-11 19:07:32.647+00
851	4	94	t	2026-08-11 19:07:32.647+00
887	4	100	t	2026-08-11 19:07:32.647+00
5	8	5	t	2026-08-14 07:55:40.822+00
6	8	6	t	2026-08-14 07:55:40.822+00
7	8	7	t	2026-08-14 07:55:40.822+00
8	8	8	f	2026-08-14 07:55:40.822+00
650	8	55	t	2026-08-14 07:55:40.822+00
710	8	71	t	2026-08-14 07:55:40.822+00
1585	8	118	t	2026-08-14 07:55:40.822+00
830	8	91	t	2026-08-14 07:55:40.822+00
848	8	94	t	2026-08-14 07:55:40.822+00
884	8	100	t	2026-08-14 07:55:40.822+00
813	1	88	t	2026-08-11 14:59:28.043+00
831	1	91	t	2026-08-11 14:59:28.043+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, role_name, created_at, role_name_si, role_name_ta) FROM stdin;
6	Admin	2026-05-29 09:43:41.12734	පරිපාලක	நிர்வாகி
8	CC Officer	2026-07-18 15:40:17.77573	සම්බන්ධීකරණ නිලධාරී	ஒருங்கிணைப்பாளர்
1	Chairman	2026-05-29 07:35:01.794472	සභාපති	தலைவர்
2	Secretary	2026-05-29 07:35:01.794472	ලේකම්	செயலாளர்
4	Subject Officer	2026-05-29 07:35:01.794472	විෂය භාර නිලධාරී	விடய அதிகாரி
5	Staff	2026-05-29 07:35:01.794472	කාර්ය මණ්ඩලය	ஊழியர்
9	Department Head	2026-08-13 06:07:58.369752	දෙපාර්තුමේන්තු ප්‍රධානි	திணைக்களத் தலைவர்
\.


--
-- Data for Name: system_privilege_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_privilege_categories (id, category_key, category_name_en, category_name_si, category_name_ta, display_order, created_at) FROM stdin;
1	dashboard_general	Dashboard	උපකරණ පුවරුව	லாஷ்போர்டு	1	2026-08-11 05:55:33.169842+00
2	staff_management	Staff Management	කාර්ය මණ්ඩල කළමනාකරණය	ஊழியர் மேலாண்மை	2	2026-08-11 05:55:33.169842+00
3	department_management	Department Management	දෙපාර්තමේන්තු කළමනාකරණය	துறை மேலாண்மை	3	2026-08-11 05:55:33.169842+00
4	designation_management	Designation Management	තනතුරු කළමනාකරණය	பதவி மேலாண்மை	4	2026-08-11 05:55:33.169842+00
5	leave_management	Leave Management	නිවාඩු කළමනාකරණය	விடுப்பு மேலாண்மை	5	2026-08-11 05:55:33.169842+00
7	complaints	Complaints	පැමිණිලි	முறையீடுகள்	7	2026-08-11 05:55:33.169842+00
8	task_management	Task Management	කාර්ය කළමනාකරණය	பணி மேலாண்மை	8	2026-08-11 05:55:33.169842+00
9	announcement_management	Announcement Management	නිවේදන කළමනාකරණය	அறிவிப்பு மேலாண்மை	9	2026-08-11 05:55:33.169842+00
10	notification_management	Notification Management	දැනුම්දීම් කළමනාකරණය	அறிவித்தல் மேலாண்மை	10	2026-08-11 05:55:33.169842+00
11	reports	Reports & Analytics	වාර්තා	அறிக்கைகள்	11	2026-08-11 05:55:33.169842+00
12	audit_system	Audit System	විගණන පද්ධතිය	தணிக்கை அமைப்பு	12	2026-08-11 05:55:33.169842+00
13	role_management	Role Management	භූමිකා කළමනාකරණය	பங்கு மேலாண்மை	13	2026-08-11 05:55:33.169842+00
14	system_privilege_management	System Privileges	පද්ධති වරප්‍රසාද	கட்டமைப்பு அனுமதிகள்	14	2026-08-11 05:55:33.169842+00
15	system_settings	System Settings	පද්ධති සැකසුම්	கட்டமைப்பு அமைப்புகள்	15	2026-08-11 05:55:33.169842+00
6	profile_requests	Profile Requests	පැතිකඩ ඉල්ලීම්	சுயவிவர கோரிக்கைகள்	6	2026-08-11 05:55:33.169842+00
16	mobile_app_users	Mobile App Users	ජංගම යෙදුම් පරිශීලකයින්	மொபைல் பயன்பாட்டு பயனர்கள்	16	2026-08-11 05:55:33.169842+00
\.


--
-- Data for Name: system_privileges; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_privileges (id, category_id, privilege_key, privilege_name_en, privilege_name_si, privilege_name_ta, display_order, created_at) FROM stdin;
1	1	dashboard_view_dashboard	View Dashboard	උපකරණ පුවරුව බලන්න	டாஷ்போர்டைப் பார்க்க	1	2026-08-11 05:55:33.169842+00
2	1	dashboard_view_notifications	View Notifications	දැනුම්දීම් බලන්න	அறிவிப்புகளைப் பார்க்க	2	2026-08-11 05:55:33.169842+00
3	1	dashboard_mark_notifications_read	Mark Notifications as Read	දැනුම්දීම් කියවූ ලෙස සලකුණු කරන්න	அறிவிப்புகளை வாசித்ததாக குறிக்க	3	2026-08-11 05:55:33.169842+00
4	1	dashboard_view_own_profile	View Own Profile	ස්වකීය ප්‍රොෆයිලය බලන්න	சொந்த சுயவிவரத்தைப் பார்க்க	4	2026-08-11 05:55:33.169842+00
5	1	dashboard_edit_own_profile	Edit Own Profile	ස්වකීය ප්‍රොෆයිලය සංස්කරණය කරන්න	சொந்த சுயவிவரத்தைத் திருத்த	5	2026-08-11 05:55:33.169842+00
6	1	dashboard_change_password	Change Password	මුරපදය වෙනස් කරන්න	கடவுச்சொல்லை மாற்ற	6	2026-08-11 05:55:33.169842+00
7	1	dashboard_logout	Logout	පද්ධතියෙන් ඉවත් වන්න	வெளியேறு	7	2026-08-11 05:55:33.169842+00
8	2	staff_view_profile	View Staff	කාර්ය මණ්ඩලය බලන්න	ஊழியரைப் பார்க்க	1	2026-08-11 05:55:33.169842+00
9	2	staff_add_staff	Add Staff	නව කාර්ය මණ්ඩල සාමාජිකයෙකු එක් කරන්න	புதிய ஊழியரைச் சேர்க்க	2	2026-08-11 05:55:33.169842+00
10	2	staff_edit_staff	Edit Staff	කාර්ය මණ්ඩල විස්තර සංස්කරණය කරන්න	ஊழியர் விவரங்களைத் திருத்த	3	2026-08-11 05:55:33.169842+00
11	2	staff_delete_staff	Delete Staff	කාර්ය මණ්ඩල සාමාජිකයෙකු ඉවත් කරන්න	ஊழியரை நீக்கு	4	2026-08-11 05:55:33.169842+00
12	2	staff_activate_staff	Activate Staff	කාර්ය මණ්ඩල ගිණුම සක්‍රීය කරන්න	ஊழியர் கணக்கை செயல்படுத்து	5	2026-08-11 05:55:33.169842+00
13	2	staff_deactivate_staff	Deactivate Staff	කාර්ය මණ්ඩල ගිණුම අක්‍රීය කරන්න	ஊழியர் கணக்கை முடக்கு	6	2026-08-11 05:55:33.169842+00
14	2	staff_manage_roles	Manage Staff Roles	කාර්ය මණ්ඩල භූමිකා කළමනාකරණය කරන්න	ஊழியர் பங்குகளை நிர்வகிக்க	7	2026-08-11 05:55:33.169842+00
15	2	staff_manage_departments	Manage Staff Departments	දෙපාර්තමේන්තු කළමනාකරණය කරන්න	ஊழியர் துறைகளை நிர்வகிக்க	8	2026-08-11 05:55:33.169842+00
16	2	staff_manage_designations	Manage Staff Designations	තනතුරු කළමනාකරණය කරන්න	ஊழியர் பதவிகளை நிர்வகிக்க	9	2026-08-11 05:55:33.169842+00
17	2	staff_view_attendance	View Staff Attendance	පැමිණීම බලන්න	ஊழியர் வருகையைப் பார்க்க	10	2026-08-11 05:55:33.169842+00
18	2	staff_view_leave_history	View Staff Leave History	නිවාඩු ඉතිහාසය බලන්න	ஊழியர் விடுப்பு வரலாற்றைப் பார்	11	2026-08-11 05:55:33.169842+00
19	3	department_edit	Edit Department	දෙපාර්තමේන්තුව සංස්කරණය කරන්න	துறையைத் திருத்த	1	2026-08-11 05:55:33.169842+00
20	3	department_delete	Delete Department	දෙපාර්තමේන්තුව ඉවත් කරන්න	துறையை நீக்கு	2	2026-08-11 05:55:33.169842+00
21	3	department_activate	Activate Department	දෙපාර්තමේන්තුව සක්‍රීය කරන්න	துறையை செயல்படுத்து	3	2026-08-11 05:55:33.169842+00
22	3	department_deactivate	Deactivate Department	දෙපාර්තමේන්තුව අක්‍රීය කරන්න	துறையை முடக்கு	4	2026-08-11 05:55:33.169842+00
23	4	designation_edit	Edit Designation	තනතුර සංස්කරණය කරන්න	பதவியைத் திருத்த	1	2026-08-11 05:55:33.169842+00
24	4	designation_delete	Delete Designation	තනතුර ඉවත් කරන්න	பதவியை நீக்கு	2	2026-08-11 05:55:33.169842+00
25	5	leave_management	Leave Management Access	නිවාඩු කළමනාකරණ ප්‍රවේශය	விடுப்பு மேலாண்மை அணுகல்	1	2026-08-11 05:55:33.169842+00
26	6	profile_requests	Profile Requests Access	ප්‍රොෆයිල් ඉල්ලීම් ප්‍රවේශය	சுயவிவர கோரிக்கைகள் அணுகல்	1	2026-08-11 05:55:33.169842+00
27	7	complaints	Complaints Access	පැමිණිලි ප්‍රවේශය	முறையீடுகள் அணுகல்	1	2026-08-11 05:55:33.169842+00
28	8	task_management	Task Management Access	කාර්ය කළමනාකරණ ප්‍රවේශය	பணி மேலாண்மை அணுகல்	1	2026-08-11 05:55:33.169842+00
29	9	announcement_management	Announcement Access	නිවේදන ප්‍රවේශය	அறிவிப்பு அணுகல்	1	2026-08-11 05:55:33.169842+00
30	10	notification_management	Notification Access	දැනුම්දීම් ප්‍රවේශය	அறிவித்தல் அணுகல்	1	2026-08-11 05:55:33.169842+00
31	11	reports	Reports Access	වාර්තා ප්‍රවේශය	அறிக்கைகள் அணுகல்	1	2026-08-11 05:55:33.169842+00
32	12	audit_system	Audit System Access	විගණන පද්ධති ප්‍රවේශය	தணிக்கை அமைப்பு அணுகல்	1	2026-08-11 05:55:33.169842+00
33	13	role_management	Role Management Access	භූමිකා කළමනාකරණ ප්‍රවේශය	பங்கு மேலாண்மை அணுகல்	1	2026-08-11 05:55:33.169842+00
34	14	system_privilege_management	System Privileges Access	පද්ධති වරප්‍රසාද ප්‍රවේශය	கட்டமைப்பு அனுமதிகள் அணுகல்	1	2026-08-11 05:55:33.169842+00
35	15	system_settings	System Settings Access	පද්ධති සැකසුම් ප්‍රවේශය	கட்டமைப்பு அமைப்புகள் அணுகல்	1	2026-08-11 05:55:33.169842+00
36	16	mobile_app_users	Mobile App Users Access	ජංගම දුරකතන පරිශීලක ප්‍රවේශය	மொபைல் பயன்பாட்டு பயனர்கள் அணுகல்	1	2026-08-11 05:55:33.169842+00
55	3	department_view	View Departments	දෙපාර්තමේන්තු බලන්න	துறைகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
56	3	department_add	Add Department	දෙපාර්තමේන්තුවක් එක් කරන්න	துறையைச் சேர்க்க	2	2026-08-11 07:00:04.457855+00
61	4	designation_view	View Designations	තනතුරු බලන්න	பதவிகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
62	4	designation_add	Add Designation	තනතුරක් එක් කරන්න	பதவியைச் சேர்க்க	2	2026-08-11 07:00:04.457855+00
65	4	designation_activate	Activate Designation	තනතුර සක්‍රීය කරන්න	பதவியை செயல்படுத்து	5	2026-08-11 07:00:04.457855+00
66	4	designation_deactivate	Deactivate Designation	තනතුර අක්‍රීය කරන්න	பதவியை முடக்கு	6	2026-08-11 07:00:04.457855+00
67	5	leave_view	View Leave Requests	නිවාඩු ඉල්ලීම් බලන්න	விடுப்பு கோரிக்கைகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
68	5	leave_add	Apply for Leave	නිවාඩු සඳහා අයදුම් කරන්න	விடுப்புக்கு விண்ணப்பிக்க	2	2026-08-11 07:00:04.457855+00
69	5	leave_edit	Edit Leave Request	නිවාඩු ඉල්ලීම සංස්කරණය කරන්න	விடுப்பு கோரிக்கையைத் திருத்த	3	2026-08-11 07:00:04.457855+00
70	5	leave_delete	Delete Leave Request	නිවාඩු ඉල්ලීම ඉවත් කරන්න	விடுப்பு கோரிக்கையை நீக்க	4	2026-08-11 07:00:04.457855+00
71	5	leave_approve	Approve Leave	නිවාඩු අනුමත කරන්න	விடுப்பை அங்கீகரிக்க	5	2026-08-11 07:00:04.457855+00
72	5	leave_reject	Reject Leave	නිවාඩු ප්‍රතික්ෂේප කරන්න	விடுப்பை நிராகரிக்க	6	2026-08-11 07:00:04.457855+00
73	5	leave_manage	Manage Leave	නිවාඩු කළමනාකරණය කරන්න	விடுப்பை நிர்வகிக்க	7	2026-08-11 07:00:04.457855+00
74	6	profile_requests_view	View Profile Requests	පැතිකඩ ඉල්ලීම් බලන්න	சுயவிவர கோரிக்கைகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
75	6	profile_requests_approve	Approve Profile Requests	පැතිකඩ ඉල්ලීම් අනුමත කරන්න	சுயவிவர கோரிக்கைகளை அங்கீகரிக்க	2	2026-08-11 07:00:04.457855+00
76	6	profile_requests_reject	Reject Profile Requests	පැතිකඩ ඉල්ලීම් ප්‍රතික්ෂේප කරන්න	சுயவிவர கோரிக்கைகளை நிராகரிக்க	3	2026-08-11 07:00:04.457855+00
77	7	complaints_view	View Complaints	පැමිණිලි බලන්න	முறையீடுகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
78	7	complaints_add	Create Complaint	පැමිණිල්ලක් ඉදිරිපත් කරන්න	முறையீட்டை உருவாக்க	2	2026-08-11 07:00:04.457855+00
79	7	complaints_edit	Edit Complaint	පැමිණිල්ල සංස්කරණය කරන්න	முறையீட்டைத் திருத்த	3	2026-08-11 07:00:04.457855+00
80	7	complaints_delete	Delete Complaint	පැමිණිල්ල ඉවත් කරන්න	முறையீட்டை நீக்கு	4	2026-08-11 07:00:04.457855+00
81	7	complaints_assign	Assign Complaint	පැමිණිල්ලක් පවරන්න	முறையீட்டை ஒதுக்க	5	2026-08-11 07:00:04.457855+00
82	7	complaints_reply	Reply to Complaint	පැමිණිල්ලට පිළිතුරු දෙන්න	முறையீட்டிற்கு பதிலளிக்க	6	2026-08-11 07:00:04.457855+00
83	7	complaints_close	Close Complaint	පැමිණිල්ල අවසන් කරන්න	முறையீட்டை மூட	7	2026-08-11 07:00:04.457855+00
84	8	task_view	View Tasks	කාර්යයන් බලන්න	பணிகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
85	8	task_add	Create Task	කාර්යයක් සාදන්න	பணியை உருவாக்க	2	2026-08-11 07:00:04.457855+00
86	8	task_edit	Edit Task	කාර්යය සංස්කරණය කරන්න	பணியைத் திருத்த	3	2026-08-11 07:00:04.457855+00
87	8	task_delete	Delete Task	කාර්යය ඉවත් කරන්න	பணியை நீக்கு	4	2026-08-11 07:00:04.457855+00
88	8	task_assign	Assign Task	කාර්යයක් පවරන්න	பணியை ஒதுக்க	5	2026-08-11 07:00:04.457855+00
89	8	task_complete	Complete Task	කාර්යය සම්පූර්ණ කරන්න	பணியை முடிக்க	6	2026-08-11 07:00:04.457855+00
90	9	announcement_view	View Announcements	නිවේදන බලන්න	அறிவிப்புகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
91	9	announcement_add	Create Announcement	නිවේදනයක් සාදන්න	அறிவிப்பை உருவாக்க	2	2026-08-11 07:00:04.457855+00
92	9	announcement_edit	Edit Announcement	නිවේදනය සංස්කරණය කරන්න	அறிவிப்பைத் திருத்த	3	2026-08-11 07:00:04.457855+00
93	9	announcement_delete	Delete Announcement	නිවේදනය ඉවත් කරන්න	அறிவிப்பை நீக்கு	4	2026-08-11 07:00:04.457855+00
94	9	announcement_publish	Publish Announcement	නිවේදනය ප්‍රකාශයට පත් කරන්න	அறிவிப்பை வெளியிட	5	2026-08-11 07:00:04.457855+00
95	10	notification_view	View Notifications	දැනුම්දීම් බලන්න	அறிவிப்புகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
96	10	notification_send	Send Notifications	දැනුම්දීම් යවන්න	அறிவிப்புகளை அனுப்ப	2	2026-08-11 07:00:04.457855+00
97	10	notification_delete	Delete Notifications	දැනුම්දීම් ඉවත් කරන්න	அறிவிப்புகளை நீக்க	3	2026-08-11 07:00:04.457855+00
98	10	notification_mark_read	Mark Notifications as Read	දැනුම්දීම් කියවූ ලෙස සලකුණු කරන්න	அறிவிப்புகளை வாசித்ததாக குறிக்க	4	2026-08-11 07:00:04.457855+00
99	11	reports_view	View Reports	වාර්තා බලන්න	அறிக்கைகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
100	11	reports_generate	Generate Reports	වාර්තා සාදන්න	அறிக்கைகளை உருவாக்க	2	2026-08-11 07:00:04.457855+00
101	11	reports_export	Export Reports	වාර්තා අපනයනය කරන්න	அறிக்கைகளை ஏற்றுமதி செய்ய	3	2026-08-11 07:00:04.457855+00
102	12	audit_view	View Audit Logs	විගණන සටහන් බලන්න	தணிக்கை பதிவுகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
103	12	audit_export	Export Audit Logs	විගණන සටහන් අපනයනය කරන්න	தணிக்கை பதிவுகளை ஏற்றுமதி செய்ய	2	2026-08-11 07:00:04.457855+00
104	13	role_view	View Roles	භූමිකා බලන්න	பங்குகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
105	13	role_add	Create Role	භූමිකාවක් සාදන්න	பங்கை உருவாக்க	2	2026-08-11 07:00:04.457855+00
106	13	role_edit	Edit Role	භූමිකාව සංස්කරණය කරන්න	பங்கைத் திருத்த	3	2026-08-11 07:00:04.457855+00
107	13	role_delete	Delete Role	භූමිකාව ඉවත් කරන්න	பங்கை நீக்கு	4	2026-08-11 07:00:04.457855+00
108	14	system_privilege_view	View System Privileges	පද්ධති වරප්‍රසාද බලන්න	கணினி அனுமதிகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
109	14	system_privilege_manage	Manage System Privileges	පද්ධති වරප්‍රසාද කළමනාකරණය කරන්න	கணினி அனுமதிகளை நிர்வகிக்க	2	2026-08-11 07:00:04.457855+00
110	15	system_settings_view	View System Settings	පද්ධති සැකසුම් බලන්න	கணினி அமைப்புகளைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
111	15	system_settings_edit	Edit System Settings	පද්ධති සැකසුම් සංස්කරණය කරන්න	கணினி அமைப்புகளைத் திருத்த	2	2026-08-11 07:00:04.457855+00
112	16	mobile_users_view	View Mobile App Users	ජංගම යෙදුම් පරිශීලකයින් බලන්න	மொபைல் பயன்பாட்டு பயனர்களைப் பார்க்க	1	2026-08-11 07:00:04.457855+00
113	16	mobile_users_add	Add Mobile App User	ජංගම යෙදුම් පරිශීලකයෙකු එක් කරන්න	மொபைல் பயன்பாட்டு பயனரைச் சேர்க்க	2	2026-08-11 07:00:04.457855+00
114	16	mobile_users_edit	Edit Mobile App User	ජංගම යෙදුම් පරිශීලකයා සංස්කරණය කරන්න	மொபைல் பயன்பாட்டு பயனரைத் திருத்த	3	2026-08-11 07:00:04.457855+00
115	16	mobile_users_delete	Delete Mobile App User	ජංගම යෙදුම් පරිශීලකයා ඉවත් කරන්න	மொபைல் பயன்பாட்டு பயனரை நீக்கு	4	2026-08-11 07:00:04.457855+00
116	16	mobile_users_activate	Activate Mobile App User	ජංගම පරිශීලකයා සක්‍රීය කරන්න	மொபைல் பயனரை செயல்படுத்து	5	2026-08-11 07:00:04.457855+00
117	16	mobile_users_deactivate	Deactivate Mobile App User	ජංගම පරිශීලකයා අක්‍රීය කරන්න	மொபைல் பயனரை முடக்கு	6	2026-08-11 07:00:04.457855+00
118	5	leave_type_view	View Leave Types	නිවාඩු වර්ග බලන්න	விடுப்பு வகைகளைப் பார்க்க	8	2026-08-11 07:20:14.858556+00
119	5	leave_type_add	Add Leave Type	නිවාඩු වර්ගයක් එක් කරන්න	விடுப்பு வகையைச் சேர்க்க	9	2026-08-11 07:20:14.858556+00
123	1	profile_edit	Edit Profile & Signature	පැතිකඩ සංස්කරණය	சுயவிவர திருத்தம்	0	2026-08-11 14:29:09.600749+00
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, description, assigned_to, assigned_by, department_id, due_date, status, created_at, updated_at, title_en, title_si, title_ta, description_en, description_si, description_ta) FROM stdin;
16	hhh	hhhh	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-13 00:00:00	Completed	2026-08-12 07:55:36.407+00	2026-08-12 17:54:36.828+00	hhh	හ්හ්හ්	ஹ்ஹ்ஹ்	hhhh	හ්හ්හ්හ්	ஹ்ஹ்ஹ்ஹ்
17	jj	ll	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-13 00:00:00	Completed	2026-08-12 13:54:31.722+00	2026-08-12 17:54:51.408+00	jj	ජේජේ	ஜேஜே	ll	ll	ll
19	New Library Building Proposal	You have to prepare the final proposal	c9f7a318-d3f1-4433-9511-48d0a825e31c	cc3b3ba4-b678-4d45-8916-ef86f535abd0	6	2026-08-15 00:00:00	Pending	2026-08-13 05:13:46.43+00	2026-08-13 05:13:46.43+00	New Library Building Proposal	නව පුස්තකාල ගොඩනැගිලි යෝජනාව	புதிய நூலகக் கட்டிட முன்மொழிவு	You have to prepare the final proposal	ඔබ අවසාන යෝජනාව සකස් කළ යුතුය	நீங்கள் இறுதி முன்மொழிவைத் தயாரிக்க வேண்டும்
18	Hello	Good Morning	c9f7a318-d3f1-4433-9511-48d0a825e31c	cc3b3ba4-b678-4d45-8916-ef86f535abd0	6	2026-08-15 00:00:00	Completed	2026-08-13 02:50:31.457+00	2026-08-13 05:21:46.978+00	Hello	ආයුබෝවන්	வணக்கம்	Good Morning	සුභ උදෑසනක්	காலை வணக்கம்
\.


--
-- Data for Name: user_leave_balances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_leave_balances (id, user_id, leave_type_id, year, remaining_days, allocated_days, used_days) FROM stdin;
95	c9f7a318-d3f1-4433-9511-48d0a825e31c	11	2027	21.0	21	0
96	c9f7a318-d3f1-4433-9511-48d0a825e31c	13	2027	0.0	0	0
97	c9f7a318-d3f1-4433-9511-48d0a825e31c	14	2027	2.0	2	0
98	c9f7a318-d3f1-4433-9511-48d0a825e31c	12	2027	24.0	24	0
99	c9f7a318-d3f1-4433-9511-48d0a825e31c	11	2026	16.0	21	5
100	c9f7a318-d3f1-4433-9511-48d0a825e31c	13	2026	0.0	0	0
101	c9f7a318-d3f1-4433-9511-48d0a825e31c	14	2026	2.0	2	0
102	c9f7a318-d3f1-4433-9511-48d0a825e31c	12	2026	17.0	24	7
104	a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	11	2026	21.0	21	0
105	a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	13	2026	0.0	0	0
106	a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	14	2026	2.0	2	0
107	a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	12	2026	24.0	24	0
109	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	13	2026	0.0	0	0
110	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	14	2026	2.0	2	0
111	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	12	2026	24.0	24	0
108	d0b7881e-8daf-4ddd-b915-60b8c7a195a5	11	2026	20.0	21	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, auth_id, full_name, email, phone, avatar_url, is_active, role_id, department_id, created_at, nic, full_name_si, full_name_ta, updated_at, staff_category, signature_url, birthday, gender, is_first_login, designation_id, title, joined_date) FROM stdin;
c9f7a318-d3f1-4433-9511-48d0a825e31c	ddea66f5-de28-469c-be1b-122b570703dd	S.T.S.D Chandrakumara	dewrangashamindu17@gmail.com	+94752052510	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/avatars/1786287022299.jpg	t	5	6	2026-08-09 13:02:37.114391	200401600537	\N	\N	2026-08-09 15:05:03.855+00	Staff	\N	2004-08-12	Male	f	18	Mr	2026-01-01
2de84b7a-c902-4030-89d0-6047ff0bc47c	a0c32bbf-deee-4036-845d-8dbbb8ae92e7	General Admin Head	admin.head@staff.lk	\N	\N	t	9	1	2026-08-31 09:20:12.063658	\N	\N	\N	2026-08-31 09:21:44.097+00	Staff	\N	\N	\N	t	\N	\N	\N
35fb3d59-57aa-489a-907b-5a0bcc3f589c	5f91dc11-66f4-4c17-9267-029afe94a681	Public Health Head	health.head@staff.lk	\N	\N	t	9	2	2026-08-31 09:24:15.429314	\N	\N	\N	\N	Staff	\N	\N	\N	t	\N	\N	\N
cc3b3ba4-b678-4d45-8916-ef86f535abd0	ff539ee4-f139-44c1-9d00-3714f2c30bec	Secretary	secretary@pradeshiya.gov.lk	\N	\N	t	2	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-12 17:55:56.03+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1786550720307.png	\N	\N	t	\N	\N	\N
5e5abd30-dfdf-43e7-a93d-a785129d17d1	1cb438d9-4387-4159-990c-29761709a9bf	Physical Planning Head	planning.head@staff.lk	\N	\N	t	9	3	2026-08-31 09:27:05.610575	\N	\N	\N	\N	Staff	\N	\N	\N	t	\N	\N	\N
731816d7-c8f8-434b-a5f3-933d8592131a	aab36179-33a3-4b24-80f8-b732a2968c6b	Community Services Head	library.head@staff.lk	\N	\N	t	9	4	2026-08-31 09:29:04.497904	\N	\N	\N	\N	Staff	\N	\N	\N	t	\N	\N	\N
2ace860d-4275-49eb-b92c-4dc932dd2c45	04391a6a-549b-409b-929b-860f9b0ba271	Chairman	chairman@pradeshiya.gov.lk	\N	\N	t	1	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-12 17:56:20.096+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/2ace860d-4275-49eb-b92c-4dc932dd2c45/signature-1786524396619.png	\N	\N	t	\N	\N	\N
dfc361d0-1cb0-47a5-bf8b-cf21871c8773	9315fb98-1ca2-452d-abe0-082cb16a64fb	CC Officer	ccofficer@pradeshiya.gov.lk	\N	\N	t	8	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-12 18:03:03.037+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	\N	\N	t	\N	\N	\N
a84bd302-7544-4a4f-9cc1-f0e3dabc5cbf	2b04dc1e-bdf7-4ce0-8044-579c359da57c	Public Utility Head	utility.head@staff.lk	\N	\N	t	9	5	2026-08-31 09:32:02.127562	\N	\N	\N	\N	Staff	\N	\N	\N	t	\N	\N	\N
94c118cf-063a-4729-a3d0-87aadf6ab5ef	de444250-3be9-40a6-9e2f-00d23d770b7f	Dev & Econ Head	devecon.head@staff.lk	\N	\N	t	9	6	2026-08-31 09:32:02.127562	\N	\N	\N	\N	Staff	\N	\N	\N	t	\N	\N	\N
a7520866-d0b0-4fc9-b06a-8f6ed568e6cb	bc92f315-c11b-43ff-a8f6-bdef28797582	Anashya Jayarathna	anshyajayarathna2003@gmail.com	+94778442568	\N	t	5	1	2026-08-13 03:53:11.440837	200385610377	\N	\N	\N	Staff	\N	2003-12-22	Female	t	3	Ms	2023-02-21
d0b7881e-8daf-4ddd-b915-60b8c7a195a5	c17d2b20-b7c0-4cfc-84cc-182e003e07ff	A.L.L.Dharmarathna	lakshidharmarathna@gmail.com	+94706209030	\N	t	5	6	2026-08-13 05:02:25.342298	708240370V	\N	\N	\N	Staff	\N	1970-11-20	Female	t	17	Mrs	2025-01-09
cf50617c-2fb4-4a31-a525-3d7164d036a5	e6eea446-2800-4328-9f59-a662a16abf41	Subject Officer	subjectofficer@pradeshiya.gov.lk	\N	\N	t	4	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-13 05:08:45.299+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786531821127.png	\N	\N	t	\N	\N	\N
d3d6bd6d-210d-477e-b877-d3c1176254e1	cd536781-f062-41e0-a30f-e043665970a3	System Administrator	admin@pradeshiya.gov.lk	\N	\N	t	6	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-10 15:09:00.394+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/d3d6bd6d-210d-477e-b877-d3c1176254e1/signature-1786374539346.png	\N	\N	t	\N	\N	\N
af05eabc-dd3a-41c1-9fa0-32342d69ccdf	3e8e373c-9978-47fd-ab39-009f0f8898c1	amavi	dewrangashamindu45@gmail.com	\N	\N	t	\N	\N	2026-08-13 06:12:58.964832	200010006162	\N	\N	\N	Staff	\N	2000-04-09	Male	t	\N	\N	\N
\.


--
-- Data for Name: messages_2026_08_13; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_13 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_14; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_14 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_15; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_15 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_16; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_16 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_17; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_17 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_18; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_18 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: messages_2026_08_19; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.messages_2026_08_19 (topic, extension, payload, event, private, updated_at, inserted_at, id, binary_payload) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2026-05-24 06:58:18
20211116045059	2026-05-24 06:58:19
20211116050929	2026-05-24 06:58:20
20211116051442	2026-05-24 06:58:21
20211116212300	2026-05-24 06:58:22
20211116213355	2026-05-24 06:58:22
20211116213934	2026-05-24 06:58:23
20211116214523	2026-05-24 06:58:24
20211122062447	2026-05-24 06:58:25
20211124070109	2026-05-24 06:58:25
20211202204204	2026-05-24 06:58:26
20211202204605	2026-05-24 06:58:27
20211210212804	2026-05-24 06:58:29
20211228014915	2026-05-24 06:58:29
20220107221237	2026-05-24 06:58:30
20220228202821	2026-05-24 06:58:31
20220312004840	2026-05-24 06:58:31
20220603231003	2026-05-24 06:58:32
20220603232444	2026-05-24 06:58:33
20220615214548	2026-05-24 06:58:34
20220712093339	2026-05-24 06:58:34
20220908172859	2026-05-24 06:58:35
20220916233421	2026-05-24 06:58:36
20230119133233	2026-05-24 06:58:36
20230128025114	2026-05-24 06:58:37
20230128025212	2026-05-24 06:58:38
20230227211149	2026-05-24 06:58:39
20230228184745	2026-05-24 06:58:39
20230308225145	2026-05-24 06:58:40
20230328144023	2026-05-24 06:58:41
20231018144023	2026-05-24 06:58:41
20231204144023	2026-05-24 06:58:42
20231204144024	2026-05-24 06:58:43
20231204144025	2026-05-24 06:58:44
20240108234812	2026-05-24 06:58:44
20240109165339	2026-05-24 06:58:45
20240227174441	2026-05-24 06:58:46
20240311171622	2026-05-24 06:58:47
20240321100241	2026-05-24 06:58:49
20240401105812	2026-05-24 06:58:50
20240418121054	2026-05-24 06:58:51
20240523004032	2026-05-24 06:58:54
20240618124746	2026-05-24 06:58:54
20240801235015	2026-05-24 06:58:55
20240805133720	2026-05-24 06:58:56
20240827160934	2026-05-24 06:58:56
20240919163303	2026-05-24 06:58:57
20240919163305	2026-05-24 06:58:58
20241019105805	2026-05-24 06:58:59
20241030150047	2026-05-24 06:59:01
20241108114728	2026-05-24 06:59:02
20241121104152	2026-05-24 06:59:03
20241130184212	2026-05-24 06:59:04
20241220035512	2026-05-24 06:59:04
20241220123912	2026-05-24 06:59:05
20241224161212	2026-05-24 06:59:06
20250107150512	2026-05-24 06:59:06
20250110162412	2026-05-24 06:59:07
20250123174212	2026-05-24 06:59:07
20250128220012	2026-05-24 06:59:08
20250506224012	2026-05-24 06:59:09
20250523164012	2026-05-24 06:59:09
20250714121412	2026-05-24 06:59:10
20250905041441	2026-05-24 06:59:11
20251103001201	2026-05-24 06:59:11
20251120212548	2026-05-24 06:59:12
20251120215549	2026-05-24 06:59:13
20260218120000	2026-05-24 06:59:14
20260326120000	2026-05-24 06:59:14
20260514120000	2026-06-03 02:33:40
20260527120000	2026-06-03 02:33:41
20260528120000	2026-06-03 02:33:42
20260603120000	2026-06-04 14:50:39
20260605120000	2026-06-16 15:04:02
20260606110000	2026-06-16 15:04:03
20260616120000	2026-06-27 02:25:08
20260624120000	2026-06-27 02:25:10
20260626120000	2026-07-07 03:30:16
20260706120000	2026-07-07 03:30:17
20260707120000	2026-07-15 03:31:04
20260709120000	2026-07-15 03:31:05
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_realtime_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at, action_filter, selected_columns) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type, versioning_status) FROM stdin;
avatars	avatars	\N	2026-06-22 14:00:12.228116+00	2026-06-22 14:00:12.228116+00	t	f	\N	\N	\N	STANDARD	DISABLED
attachments	attachments	\N	2026-06-22 14:00:39.280363+00	2026-06-22 14:00:39.280363+00	t	f	\N	\N	\N	STANDARD	DISABLED
medical-documents	medical-documents	\N	2026-07-15 17:42:26.568881+00	2026-07-15 17:42:26.568881+00	t	f	\N	\N	\N	STANDARD	DISABLED
Departments	Departments	\N	2026-06-10 04:38:13.877882+00	2026-06-10 04:38:13.877882+00	t	f	\N	\N	\N	STANDARD	DISABLED
complaint-files	complaint-files	\N	2026-07-15 18:34:24.297842+00	2026-07-15 18:34:24.297842+00	t	f	10485760	\N	\N	STANDARD	DISABLED
signatures	signatures	\N	2026-07-19 13:20:43.412173+00	2026-07-19 13:20:43.412173+00	t	f	\N	\N	\N	STANDARD	DISABLED
public-assets	public-assets	\N	2026-07-23 19:36:53.042851+00	2026-07-23 19:36:53.042851+00	t	f	\N	\N	\N	STANDARD	DISABLED
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_analytics (name, type, format, created_at, updated_at, id, deleted_at) FROM stdin;
\.


--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets_vectors (id, type, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2026-05-24 06:57:53.277746
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2026-05-24 06:57:53.291234
2	storage-schema	f6a1fa2c93cbcd16d4e487b362e45fca157a8dbd	2026-05-24 06:57:53.296632
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2026-05-24 06:57:53.313895
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2026-05-24 06:57:53.32828
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2026-05-24 06:57:53.334486
6	change-column-name-in-get-size	ded78e2f1b5d7e616117897e6443a925965b30d2	2026-05-24 06:57:53.341529
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2026-05-24 06:57:53.347138
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2026-05-24 06:57:53.352721
9	fix-search-function	af597a1b590c70519b464a4ab3be54490712796b	2026-05-24 06:57:53.35889
10	search-files-search-function	b595f05e92f7e91211af1bbfe9c6a13bb3391e16	2026-05-24 06:57:53.365592
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2026-05-24 06:57:53.372522
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2026-05-24 06:57:53.379089
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2026-05-24 06:57:53.385673
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2026-05-24 06:57:58.745592
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2026-05-24 06:57:58.816166
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2026-05-24 06:57:58.828076
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2026-05-24 06:57:58.832126
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2026-05-24 06:57:58.837008
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2026-05-24 06:57:58.842625
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2026-05-24 06:57:58.851476
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2026-05-24 06:57:58.858258
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2026-05-24 06:57:58.884443
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2026-05-24 06:57:58.906761
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2026-05-24 06:57:58.912344
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2026-05-24 06:57:58.917315
26	objects-prefixes	215cabcb7f78121892a5a2037a09fedf9a1ae322	2026-05-24 06:57:58.921928
27	search-v2	859ba38092ac96eb3964d83bf53ccc0b141663a6	2026-05-24 06:57:58.92568
28	object-bucket-name-sorting	c73a2b5b5d4041e39705814fd3a1b95502d38ce4	2026-05-24 06:57:58.929938
29	create-prefixes	ad2c1207f76703d11a9f9007f821620017a66c21	2026-05-24 06:57:58.934024
30	update-object-levels	2be814ff05c8252fdfdc7cfb4b7f5c7e17f0bed6	2026-05-24 06:57:58.937913
31	objects-level-index	b40367c14c3440ec75f19bbce2d71e914ddd3da0	2026-05-24 06:57:58.942018
32	backward-compatible-index-on-objects	e0c37182b0f7aee3efd823298fb3c76f1042c0f7	2026-05-24 06:57:58.94566
33	backward-compatible-index-on-prefixes	b480e99ed951e0900f033ec4eb34b5bdcb4e3d49	2026-05-24 06:57:58.949395
34	optimize-search-function-v1	ca80a3dc7bfef894df17108785ce29a7fc8ee456	2026-05-24 06:57:58.95316
35	add-insert-trigger-prefixes	458fe0ffd07ec53f5e3ce9df51bfdf4861929ccc	2026-05-24 06:57:58.95678
36	optimise-existing-functions	6ae5fca6af5c55abe95369cd4f93985d1814ca8f	2026-05-24 06:57:58.960494
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2026-05-24 06:57:58.964507
38	iceberg-catalog-flag-on-buckets	02716b81ceec9705aed84aa1501657095b32e5c5	2026-05-24 06:57:58.970388
39	add-search-v2-sort-support	6706c5f2928846abee18461279799ad12b279b78	2026-05-24 06:57:58.984845
40	fix-prefix-race-conditions-optimized	7ad69982ae2d372b21f48fc4829ae9752c518f6b	2026-05-24 06:57:58.98836
41	add-object-level-update-trigger	07fcf1a22165849b7a029deed059ffcde08d1ae0	2026-05-24 06:57:58.992463
42	rollback-prefix-triggers	771479077764adc09e2ea2043eb627503c034cd4	2026-05-24 06:57:58.996147
43	fix-object-level	84b35d6caca9d937478ad8a797491f38b8c2979f	2026-05-24 06:57:58.999942
44	vector-bucket-type	99c20c0ffd52bb1ff1f32fb992f3b351e3ef8fb3	2026-05-24 06:57:59.003723
45	vector-buckets	049e27196d77a7cb76497a85afae669d8b230953	2026-05-24 06:57:59.100966
46	buckets-objects-grants	fedeb96d60fefd8e02ab3ded9fbde05632f84aed	2026-05-24 06:57:59.124675
47	iceberg-table-metadata	649df56855c24d8b36dd4cc1aeb8251aa9ad42c2	2026-05-24 06:57:59.129521
48	iceberg-catalog-ids	e0e8b460c609b9999ccd0df9ad14294613eed939	2026-05-24 06:57:59.133597
49	buckets-objects-grants-postgres	072b1195d0d5a2f888af6b2302a1938dd94b8b3d	2026-05-24 06:57:59.152449
50	search-v2-optimised	6323ac4f850aa14e7387eb32102869578b5bd478	2026-05-24 06:57:59.157796
51	index-backward-compatible-search	2ee395d433f76e38bcd3856debaf6e0e5b674011	2026-05-24 06:57:59.936935
52	drop-not-used-indexes-and-functions	5cc44c8696749ac11dd0dc37f2a3802075f3a171	2026-05-24 06:57:59.938689
53	drop-index-lower-name	d0cb18777d9e2a98ebe0bc5cc7a42e57ebe41854	2026-05-24 06:57:59.949093
54	drop-index-object-level	6289e048b1472da17c31a7eba1ded625a6457e67	2026-05-24 06:57:59.951714
55	prevent-direct-deletes	262a4798d5e0f2e7c8970232e03ce8be695d5819	2026-05-24 06:57:59.953436
56	fix-optimized-search-function	b823ed1e418101032fa01374edc9a436e54e3ed4	2026-05-24 06:57:59.959205
57	s3-multipart-uploads-metadata	f127886e00d1b374fadbc7c6b31e09336aad5287	2026-05-24 06:57:59.964695
58	operation-ergonomics	00ca5d483b3fe0d522133d9002ccc5df98365120	2026-05-24 06:57:59.968762
59	drop-unused-functions	38456f13e39691c2bbb4b5151d0d1cdbabd4a8c4	2026-05-24 06:57:59.973493
60	optimize-existing-functions-again	db35e1c91a9201e59f4fef8d972c2f277d68b157	2026-05-24 06:57:59.977799
61	mark-filename-immutable	fe0096517ae9d60aaec1d110172ba9036dc66bb7	2026-08-10 13:31:01.993004
62	object-versioning-core	0b855f00ff3be0bfca91efee02a9858912491a9a	2026-08-22 08:02:59.59059
63	fix-search-name-relative-to-prefix	c7485e417624f795ce8bb2da21927f48e088904d	2026-08-26 08:48:01.54966
64	fix-search-by-timestamp-sqli	0af424ecd388a39bb1645184b222185a12149675	2026-08-26 08:48:01.614747
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, archived_at, is_delete_marker, is_versioned) FROM stdin;
9c003472-ec3a-413e-852c-2c2c5d97513e	avatars	avatars/1786102233828.jpg	e1b33b45-2a92-4e2b-a37c-8da412da049b	2026-08-07 11:30:36.619177+00	2026-08-07 11:30:36.619177+00	2026-08-07 11:30:36.619177+00	{"eTag": "\\"fbbe8c5606058819643b129dc6673a0e\\"", "size": 91595, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T11:30:37.000Z", "contentLength": 91595, "httpStatusCode": 200}	d6fc58cd-cdde-4d3a-9328-6851d4ea28be	e1b33b45-2a92-4e2b-a37c-8da412da049b	{}	\N	f	f
17ad1fa5-e2e2-407f-a661-92e2e2e46ec8	signatures	af88b08e-4cea-469c-acac-02f83efc0771/signature-1786691782686.png	43bf7538-9546-40fd-b678-dcfb69b41a30	2026-08-14 07:16:26.657856+00	2026-08-14 07:16:26.657856+00	2026-08-14 07:16:26.657856+00	{"eTag": "\\"622a721b7611dc965b4ce057d9a568af\\"", "size": 14158, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-14T07:16:27.000Z", "contentLength": 14158, "httpStatusCode": 200}	72c40ce5-cb89-4b9a-b11d-f80369998163	43bf7538-9546-40fd-b678-dcfb69b41a30	{}	\N	f	f
255be916-2783-4137-87f3-13e6e6a90e25	avatars	04391a6a-549b-409b-929b-860f9b0ba271_1786196767906.jfif	04391a6a-549b-409b-929b-860f9b0ba271	2026-08-08 13:46:11.391445+00	2026-08-08 13:46:11.391445+00	2026-08-08 13:46:11.391445+00	{"eTag": "\\"94ce8ed26370b09ebc17a558c9ec1538\\"", "size": 38658, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T13:46:12.000Z", "contentLength": 38658, "httpStatusCode": 200}	0c9e70b4-8430-4abb-ab18-85f95b5e7fec	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
94985de1-78cd-46de-87dd-59340f88ff9e	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/33/1786220087487_0_IMG_4478.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 20:15:05.985755+00	2026-08-08 20:15:05.985755+00	2026-08-08 20:15:05.985755+00	{"eTag": "\\"430eff4a0f17be0c01e4cfd10c7b89f6\\"", "size": 3887789, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:15:06.000Z", "contentLength": 3887789, "httpStatusCode": 200}	cb3e9eda-4e95-42d7-8fc4-9f30313ad5cd	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
8470a01c-bfb7-4c9b-a6d9-d7981b502539	Departments	finance_revenue.jpg	\N	2026-06-10 04:39:55.41791+00	2026-06-10 04:39:55.41791+00	2026-06-10 04:39:55.41791+00	{"eTag": "\\"618a7c57965381578294828dd4efea7b-1\\"", "size": 673162, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 673162, "httpStatusCode": 200}	84818e0a-64ae-41aa-bc57-59a7efeab614	\N	\N	\N	f	f
a91faf88-b1ce-486d-9010-cb2375aba0fe	Departments	preschool.jpg	\N	2026-06-10 04:40:27.245714+00	2026-06-10 04:40:27.245714+00	2026-06-10 04:40:27.245714+00	{"eTag": "\\"dfaad68f5bd4c72c3973b2e70af2ec59-1\\"", "size": 1787402, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 1787402, "httpStatusCode": 200}	de92ebdc-1d8f-4640-a0e0-86be4273a450	\N	\N	\N	f	f
d66515eb-58d9-4e01-94e6-06821ae48460	Departments	public_health.jpg	\N	2026-06-10 04:40:28.613443+00	2026-06-10 04:40:28.613443+00	2026-06-10 04:40:28.613443+00	{"eTag": "\\"430bddad8264bae30984ae690ca4febf-1\\"", "size": 1873009, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 1873009, "httpStatusCode": 200}	07746e01-c158-4255-8205-34ed4398189e	\N	\N	\N	f	f
0221e53b-ac0b-48a4-9683-c8b9484e0944	Departments	agriculture.jpg	\N	2026-06-10 04:40:30.126664+00	2026-06-10 04:40:30.126664+00	2026-06-10 04:40:30.126664+00	{"eTag": "\\"1eeefe2e9a82381308b35ebc84d26a12-1\\"", "size": 2783024, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 2783024, "httpStatusCode": 200}	925a6a60-03b5-4479-9590-7e45631fa179	\N	\N	\N	f	f
3444f34c-531a-4408-97c9-398acd40075e	Departments	environment_welfare.jpg	\N	2026-06-10 04:40:30.190025+00	2026-06-10 04:40:30.190025+00	2026-06-10 04:40:30.190025+00	{"eTag": "\\"11e7ca9f0a295e02ce20fd82939acfc9-1\\"", "size": 2833010, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 2833010, "httpStatusCode": 200}	8916f1eb-ce4e-4ede-b62d-38b4aa5d0ec9	\N	\N	\N	f	f
18678eff-be8e-4151-bc3f-5d21779cda78	Departments	administration.jpg	\N	2026-06-10 04:40:30.272096+00	2026-06-10 04:40:30.272096+00	2026-06-10 04:40:30.272096+00	{"eTag": "\\"3067a4d6617518d0fcf04a1ea9b54cd1-1\\"", "size": 2902178, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 2902178, "httpStatusCode": 200}	3c5803bd-d6a2-4214-a516-53b9f7fc4798	\N	\N	\N	f	f
ae4e3c00-dddd-40d4-9b19-b6cabd296438	Departments	ayurveda.jpg	\N	2026-06-10 04:40:52.869469+00	2026-06-10 04:40:52.869469+00	2026-06-10 04:40:52.869469+00	{"eTag": "\\"a76cdc7d6931f4e806e6f1bf3eb4f5a4-1\\"", "size": 4291757, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 4291757, "httpStatusCode": 200}	905a7dbc-6cd3-4dda-9c35-45e33def8774	\N	\N	\N	f	f
e14cbedc-c5bd-45d1-bea0-23fffab2f995	Departments	library.jpg	\N	2026-06-10 04:40:54.777827+00	2026-06-10 04:40:54.777827+00	2026-06-10 04:40:54.777827+00	{"eTag": "\\"b179d25d70a70cc5360e4fd4f1435873-1\\"", "size": 4988559, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 4988559, "httpStatusCode": 200}	2ef0ce04-e057-4c49-9483-2b44efd6054b	\N	\N	\N	f	f
3b2499b9-da75-4e39-8ac0-00a19035771b	Departments	development_planning.jpg	\N	2026-06-10 04:40:57.379577+00	2026-06-10 04:40:57.379577+00	2026-06-10 04:40:57.379577+00	{"eTag": "\\"da42e07f5c8dc00c4e4773647990826f-2\\"", "size": 6662124, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:39:42.000Z", "contentLength": 6662124, "httpStatusCode": 200}	8fa2b62c-7dd1-48c3-a094-db50be5ffc26	\N	\N	\N	f	f
505b3cb6-3238-40a7-b3e5-ebc2b93649fd	Departments	engineering.jpg	\N	2026-06-10 04:41:08.172863+00	2026-06-10 04:41:08.172863+00	2026-06-10 04:41:08.172863+00	{"eTag": "\\"59a279002ca22f5a9903b9b5183cdf9b-1\\"", "size": 5309238, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-10T04:40:53.000Z", "contentLength": 5309238, "httpStatusCode": 200}	35cc6e4e-56fe-4954-a2e0-04925ae97896	\N	\N	\N	f	f
57cf3b64-0bd2-4bec-9780-6d850e330d2e	avatars	avatars/1782425819325.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-06-25 22:17:01.009424+00	2026-06-25 22:17:01.009424+00	2026-06-25 22:17:01.009424+00	{"eTag": "\\"e2725e2fb8859737244deb5cd4ecb980\\"", "size": 143671, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T22:17:01.000Z", "contentLength": 143671, "httpStatusCode": 200}	769fccbc-b480-41cb-87be-2d377cb90d0e	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
520d0b28-6880-43dd-a362-6fd55f3e6306	avatars	avatars/1782426051913.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-06-25 22:20:53.54859+00	2026-06-25 22:20:53.54859+00	2026-06-25 22:20:53.54859+00	{"eTag": "\\"9e79241aef37e3d6614cb51cb7a3d2fd\\"", "size": 120055, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T22:20:54.000Z", "contentLength": 120055, "httpStatusCode": 200}	201acea8-7653-4d0f-afb8-de8febf862ad	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
8e51b9a0-3a9d-4e6b-864a-e1e5fb4bc163	complaint-files	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/2/1786103123244-signature.json	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-07 11:45:24.024933+00	2026-08-07 11:45:24.024933+00	2026-08-07 11:45:24.024933+00	{"eTag": "\\"3b3616c710f3b79ce074592904a3b3ca\\"", "size": 1302, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T11:45:24.000Z", "contentLength": 1302, "httpStatusCode": 200}	58bb05ad-984e-481b-9217-6963e8c184fb	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
fdadb21e-dbcc-4137-873b-37565a5de4b3	avatars	avatars/1782426102613.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-06-25 22:21:43.974181+00	2026-06-25 22:21:43.974181+00	2026-06-25 22:21:43.974181+00	{"eTag": "\\"e2725e2fb8859737244deb5cd4ecb980\\"", "size": 143671, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-06-25T22:21:44.000Z", "contentLength": 143671, "httpStatusCode": 200}	dfbf7c07-f550-4fb1-9834-dfca87a67d7e	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
2d555beb-2104-4653-abaf-89af44e65ec8	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/3/1784143890341-akjr9497ucv-1000099816.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-15 19:31:32.360923+00	2026-07-15 19:31:32.360923+00	2026-07-15 19:31:32.360923+00	{"eTag": "\\"dacdc52a99e1d025a9fef5751cca6927\\"", "size": 746636, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T19:31:33.000Z", "contentLength": 746636, "httpStatusCode": 200}	b50dd9be-d3aa-4d35-8a03-0def722cdc85	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
b7b512cc-a8e5-4e9c-ad3b-6dd4231e4986	complaint-files	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/3/1786103339296-signature.json	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-07 11:48:59.889221+00	2026-08-07 11:48:59.889221+00	2026-08-07 11:48:59.889221+00	{"eTag": "\\"1dcf4257ecf621ef71b9489e4add5cf5\\"", "size": 559, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T11:49:00.000Z", "contentLength": 559, "httpStatusCode": 200}	e5e9c085-845e-460d-929f-8e5c7542ae6a	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
fcff597f-7ef1-4985-a5e6-980741ecc22f	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/3/1784143892783-signature.json	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-15 19:31:32.738398+00	2026-07-15 19:31:32.738398+00	2026-07-15 19:31:32.738398+00	{"eTag": "\\"228b144f4b34c2aaaa6e16a67f52d124\\"", "size": 1449, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-07-15T19:31:33.000Z", "contentLength": 1449, "httpStatusCode": 200}	e3f30006-86fb-483f-b7fe-70a8053b038f	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
951ed18c-3879-4a7a-830b-c245bfed0b98	avatars	avatars/1784185817720.jpg	d64594ad-cee0-4fe5-b780-049df1fe7030	2026-07-16 07:10:18.61809+00	2026-07-16 07:10:18.61809+00	2026-07-16 07:10:18.61809+00	{"eTag": "\\"e618772eebaed5cc7c73fbcd46be8317\\"", "size": 7818, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T07:10:19.000Z", "contentLength": 7818, "httpStatusCode": 200}	a3c38504-1f01-4d29-92e4-9e765a9c74e9	d64594ad-cee0-4fe5-b780-049df1fe7030	{}	\N	f	f
ef1e30f5-d474-41ba-b8ea-ed907e7169b9	complaint-files	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/4/1786103399098-signature.json	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-07 11:49:59.749721+00	2026-08-07 11:49:59.749721+00	2026-08-07 11:49:59.749721+00	{"eTag": "\\"930b95ed7ebce947ffb6f576be6839f3\\"", "size": 1145, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T11:50:00.000Z", "contentLength": 1145, "httpStatusCode": 200}	830eee17-575e-4434-a038-72e1dfc663ef	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
314fab79-579a-46f7-abfb-5c725d525cdc	complaint-files	40ddf563-f4f6-46d9-b89f-e8b82d655718/4/1784186527406-raxpgkb7qjd-HANSIKA-PRABHA-BIRTH-CERTIFICATE-new.docx	d64594ad-cee0-4fe5-b780-049df1fe7030	2026-07-16 07:22:08.32778+00	2026-07-16 07:22:08.32778+00	2026-07-16 07:22:08.32778+00	{"eTag": "\\"ec81c0b1f8a05de51e6c4f8320180d1a\\"", "size": 38872, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T07:22:09.000Z", "contentLength": 38872, "httpStatusCode": 200}	818b6b28-9be4-4268-afbb-1034de901b7c	d64594ad-cee0-4fe5-b780-049df1fe7030	{}	\N	f	f
b72c42ce-33c6-4468-bc77-cd784ad4dacb	complaint-files	40ddf563-f4f6-46d9-b89f-e8b82d655718/4/1784186528548-signature.json	d64594ad-cee0-4fe5-b780-049df1fe7030	2026-07-16 07:22:08.887978+00	2026-07-16 07:22:08.887978+00	2026-07-16 07:22:08.887978+00	{"eTag": "\\"227f029e6ca68033c6fc5bed80bfc714\\"", "size": 4606, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T07:22:09.000Z", "contentLength": 4606, "httpStatusCode": 200}	36682652-ec37-4e6a-b8e2-bc640f5249a2	d64594ad-cee0-4fe5-b780-049df1fe7030	{}	\N	f	f
164275c0-d8de-48bf-b23d-2e84185622df	complaint-files	40ddf563-f4f6-46d9-b89f-e8b82d655718/5/1784188915310-signature.json	d64594ad-cee0-4fe5-b780-049df1fe7030	2026-07-16 08:01:56.019787+00	2026-07-16 08:01:56.019787+00	2026-07-16 08:01:56.019787+00	{"eTag": "\\"4a4bb6f788e72abbc953723120e85788\\"", "size": 1608, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T08:01:56.000Z", "contentLength": 1608, "httpStatusCode": 200}	9f2f7562-4112-402e-8a73-b18db7f6c24d	d64594ad-cee0-4fe5-b780-049df1fe7030	{}	\N	f	f
899afb07-d917-46b2-9bd2-e3d6ef7e408b	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/6/1784195547335-cpq9bzvwg8o-HANSIKA-PRABHA-BIRTH-CERTIFICATE-1-.pdf	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-16 09:52:29.424752+00	2026-07-16 09:52:29.424752+00	2026-07-16 09:52:29.424752+00	{"eTag": "\\"ddb62632812f03b9b05c607e7ca5c919\\"", "size": 131420, "mimetype": "application/pdf", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T09:52:30.000Z", "contentLength": 131420, "httpStatusCode": 200}	6aef0277-c32e-4948-bb30-466abcb761ae	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
6dc403e8-1ab0-49c9-b519-f98c2c799373	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/6/1784195549158-signature.json	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-16 09:52:29.88882+00	2026-07-16 09:52:29.88882+00	2026-07-16 09:52:29.88882+00	{"eTag": "\\"d2ccd61391927c5254dc55e55f78dd9e\\"", "size": 1483, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-07-16T09:52:30.000Z", "contentLength": 1483, "httpStatusCode": 200}	ebeacbac-5a1c-4a56-84b6-4ebe2e295bda	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
a0253e79-6f14-4c86-96e3-261318df20ff	complaint-files	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/7/1786128460314-iroqqgjf78s-IMG_4470.jpg	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-07 18:47:52.468665+00	2026-08-07 18:47:52.468665+00	2026-08-07 18:47:52.468665+00	{"eTag": "\\"b64b8b971fd9bc80ca22ad6096ae700c\\"", "size": 4672119, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T18:47:53.000Z", "contentLength": 4672119, "httpStatusCode": 200}	392c6f88-161f-4bf6-97d2-0421e5f1d077	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
21a7af94-4c7e-4cef-8ea9-9e094ad8455e	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/7/1784655319505-dcjd40zwk66-1000113527.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-21 17:35:22.856593+00	2026-07-21 17:35:22.856593+00	2026-07-21 17:35:22.856593+00	{"eTag": "\\"fa9cdf346296c7f4af309b5a93078135\\"", "size": 682433, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-21T17:35:23.000Z", "contentLength": 682433, "httpStatusCode": 200}	8d4502ed-5f53-4428-abf5-00be22fa1fc3	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
bea38bff-037d-4add-93fd-b46162a896d6	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/7/1784655322089-klrz47rfrkl-Progress-Report-03-Group-03.docx	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-21 17:35:23.563174+00	2026-07-21 17:35:23.563174+00	2026-07-21 17:35:23.563174+00	{"eTag": "\\"b0f01333e68d151cd7b55908e84e93bd\\"", "size": 24196, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-07-21T17:35:24.000Z", "contentLength": 24196, "httpStatusCode": 200}	ea8989fe-ed75-49db-b5ef-f24237b8fd1b	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
8e2f54ae-312e-40ef-a4d0-eef0a8e74903	complaint-files	bedc4ffc-c467-4fd6-8ec6-6fb134c1fea5/7/1784655322548-signature.json	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-21 17:35:23.910232+00	2026-07-21 17:35:23.910232+00	2026-07-21 17:35:23.910232+00	{"eTag": "\\"7d52c7525c823f2dea0d114fdca16d95\\"", "size": 1227, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-07-21T17:35:24.000Z", "contentLength": 1227, "httpStatusCode": 200}	89f3cdbd-8430-4f1b-993b-fcbd9046c19c	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
b06357b3-f833-4c1d-b8a3-61574ffcf21f	avatars	avatars/1784655461755.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-21 17:37:43.930794+00	2026-07-21 17:37:43.930794+00	2026-07-21 17:37:43.930794+00	{"eTag": "\\"59204d8830fa341e82bf48913ed54315\\"", "size": 161325, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-21T17:37:44.000Z", "contentLength": 161325, "httpStatusCode": 200}	9d8c76f0-000f-46cc-9488-613c66d90347	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
c6f73121-e2ae-4081-97b1-173d6b644b91	signatures	24f5ecaf-9dc4-4e37-b4f8-4e247334dc4d/signature-1784731194087.png	cd536781-f062-41e0-a30f-e043665970a3	2026-07-22 14:39:56.689675+00	2026-07-22 14:39:56.689675+00	2026-07-22 14:39:56.689675+00	{"eTag": "\\"0f5bb9d149853292cd0e4fa6da928cbc\\"", "size": 9540, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-22T14:39:57.000Z", "contentLength": 9540, "httpStatusCode": 200}	33a4abc1-00ec-40a4-9ebc-8dae4ed956c4	cd536781-f062-41e0-a30f-e043665970a3	{}	\N	f	f
c3b97675-f494-44cc-919e-0f220d7192f5	avatars	04391a6a-549b-409b-929b-860f9b0ba271_1784737004194.jpg	04391a6a-549b-409b-929b-860f9b0ba271	2026-07-22 16:16:52.036026+00	2026-07-22 16:16:52.036026+00	2026-07-22 16:16:52.036026+00	{"eTag": "\\"cf3788f522db45dc1de5d9e416aeefe7\\"", "size": 962334, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-22T16:16:52.000Z", "contentLength": 962334, "httpStatusCode": 200}	1f485151-bb6a-419f-aa36-01f33757ebcd	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
8af064dc-b5c6-486e-831f-648c45aa6037	avatars	cd536781-f062-41e0-a30f-e043665970a3_1784738529285.jpg	cd536781-f062-41e0-a30f-e043665970a3	2026-07-22 16:42:11.977047+00	2026-07-22 16:42:11.977047+00	2026-07-22 16:42:11.977047+00	{"eTag": "\\"e2725e2fb8859737244deb5cd4ecb980\\"", "size": 143671, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-22T16:42:12.000Z", "contentLength": 143671, "httpStatusCode": 200}	30c52661-1b21-48eb-b240-ec630a38a306	cd536781-f062-41e0-a30f-e043665970a3	{}	\N	f	f
c3136786-0268-4090-8b61-f59b90f920bf	avatars	04391a6a-549b-409b-929b-860f9b0ba271_1784826145271.jpg	04391a6a-549b-409b-929b-860f9b0ba271	2026-07-23 17:02:28.387531+00	2026-07-23 17:02:28.387531+00	2026-07-23 17:02:28.387531+00	{"eTag": "\\"cf3788f522db45dc1de5d9e416aeefe7\\"", "size": 962334, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T17:02:29.000Z", "contentLength": 962334, "httpStatusCode": 200}	233a6efd-d365-47bd-80c2-6691763f85a2	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
0292a4be-4c93-464c-854a-f85fb378d94f	signatures	2a040309-24b3-4b4e-ac21-2c6381d7dfea/signature-1784826176333.png	04391a6a-549b-409b-929b-860f9b0ba271	2026-07-23 17:02:57.06856+00	2026-07-23 17:02:57.06856+00	2026-07-23 17:02:57.06856+00	{"eTag": "\\"d5b5bd93799f484b1ab823798a40a4f2\\"", "size": 14711, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T17:02:58.000Z", "contentLength": 14711, "httpStatusCode": 200}	bd4fc433-411b-4774-9bc6-b33878599d0d	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
93c8b294-2e8d-4f97-b46b-1c59fd666f9a	avatars	avatars/1784828278054.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-23 17:38:00.531476+00	2026-07-23 17:38:00.531476+00	2026-07-23 17:38:00.531476+00	{"eTag": "\\"832aaf5a65eda51a9df90652207b7923\\"", "size": 36844, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T17:38:01.000Z", "contentLength": 36844, "httpStatusCode": 200}	49cbe8b5-a724-48be-8494-c47171ca2b06	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
d8142dc2-7248-494d-9429-cf0132b40d95	avatars	avatars/1784828414941.jpg	4c183eda-7c66-422d-aedf-03c8e6f6838e	2026-07-23 17:40:18.250302+00	2026-07-23 17:40:18.250302+00	2026-07-23 17:40:18.250302+00	{"eTag": "\\"185be98dde9c323331c52fd47c195660\\"", "size": 328055, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T17:40:19.000Z", "contentLength": 328055, "httpStatusCode": 200}	f6c07c0a-981d-4c6b-b38b-e2394088cae3	4c183eda-7c66-422d-aedf-03c8e6f6838e	{}	\N	f	f
1f9cad60-6977-4c84-8473-c876bd067c2d	avatars	avatars/1784833252237.jpg	6fcf2721-2c13-4c7f-ac0b-cf61baf2504d	2026-07-23 19:00:55.013753+00	2026-07-23 19:00:55.013753+00	2026-07-23 19:00:55.013753+00	{"eTag": "\\"f0f1d42ca09310d0d72cbf0871b20337\\"", "size": 148037, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T19:00:55.000Z", "contentLength": 148037, "httpStatusCode": 200}	49c17799-0b36-4190-8dd6-98682a3ef27a	6fcf2721-2c13-4c7f-ac0b-cf61baf2504d	{}	\N	f	f
a408e551-0fe1-4059-b698-1537f9aebb14	Departments	images.jfif	\N	2026-08-08 12:47:01.690818+00	2026-08-08 12:47:01.690818+00	2026-08-08 12:47:01.690818+00	{"eTag": "\\"bcc34a121d1d076afc8e28578240e6a1-1\\"", "size": 63168, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T12:47:02.000Z", "contentLength": 63168, "httpStatusCode": 200}	a82f7518-35a6-4fd2-9333-c8e0665372f8	\N	\N	\N	f	f
054bed0b-4818-4102-bba2-29578c43b25f	public-assets	logo.png	\N	2026-07-23 19:37:52.630027+00	2026-07-23 19:37:52.630027+00	2026-07-23 19:37:52.630027+00	{"eTag": "\\"8355b451377c3b0f06924768f2f23350-1\\"", "size": 81505, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-23T19:37:53.000Z", "contentLength": 81505, "httpStatusCode": 200}	4d10d7e8-22ce-483e-84ad-6ac831fb5c9f	\N	\N	\N	f	f
f34bd5f8-48d3-4e39-a22f-a1fa5d53326c	avatars	e6eea446-2800-4328-9f59-a662a16abf41_1785000280195.jpg	e6eea446-2800-4328-9f59-a662a16abf41	2026-07-25 17:24:46.668494+00	2026-07-25 17:24:46.668494+00	2026-07-25 17:24:46.668494+00	{"eTag": "\\"cf3788f522db45dc1de5d9e416aeefe7\\"", "size": 962334, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-25T17:24:47.000Z", "contentLength": 962334, "httpStatusCode": 200}	0301dbce-1de3-4d2e-8e5f-ac7fa97efe82	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
9eab66dd-a504-448b-abb6-9e26b593af6f	Departments	images (1).jfif	\N	2026-08-08 12:49:26.913096+00	2026-08-08 12:49:26.913096+00	2026-08-08 12:49:26.913096+00	{"eTag": "\\"da68676ff7b23d4e4dde0bd5c8015bd9-1\\"", "size": 38658, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T12:49:27.000Z", "contentLength": 38658, "httpStatusCode": 200}	d85abb4e-4e99-4d06-a5da-62cdab17dfc7	\N	\N	\N	f	f
bdfa535b-31a4-47af-a8fd-5c0407c85f18	avatars	avatars/1785048337677.jpg	6b4a2988-2654-479c-9fce-03bb70decc48	2026-07-26 06:45:40.971494+00	2026-07-26 06:45:40.971494+00	2026-07-26 06:45:40.971494+00	{"eTag": "\\"a55c72dfb8a493bda222895b7a85ee0b\\"", "size": 273143, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-07-26T06:45:41.000Z", "contentLength": 273143, "httpStatusCode": 200}	c461626a-d0c4-4444-948f-d356887d7dbc	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
e5b1b9e0-2a36-475d-b045-82251a2e34dc	avatars	e6eea446-2800-4328-9f59-a662a16abf41_1786200370651.jpg	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-08 14:46:14.300547+00	2026-08-08 14:46:14.300547+00	2026-08-08 14:46:14.300547+00	{"eTag": "\\"624c2105964d9132d809209e8a87a211\\"", "size": 74461, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T14:46:15.000Z", "contentLength": 74461, "httpStatusCode": 200}	c7b90000-ae8d-4dbc-ad30-90393873a67b	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
6b9ac2ca-9d4c-4056-9bf3-337a603f3e01	signatures	cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1785496448890.png	e6eea446-2800-4328-9f59-a662a16abf41	2026-07-31 11:14:10.00009+00	2026-07-31 11:14:10.00009+00	2026-07-31 11:14:10.00009+00	{"eTag": "\\"0dec80f40c622cd7486c2796b67fb714\\"", "size": 15420, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-31T11:14:10.000Z", "contentLength": 15420, "httpStatusCode": 200}	f8f7020e-bbf7-4e74-997b-e3280d5ef941	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
29f8d24c-fd1d-43f8-9bc6-dd40e0370852	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/34/1786220587759_0_IMG_4478.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 20:23:17.751048+00	2026-08-08 20:23:17.751048+00	2026-08-08 20:23:17.751048+00	{"eTag": "\\"430eff4a0f17be0c01e4cfd10c7b89f6\\"", "size": 3887789, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:23:18.000Z", "contentLength": 3887789, "httpStatusCode": 200}	5022a51e-4d71-4e27-9e21-146d9c2d255c	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
62ca2cec-b337-4d8d-88a4-bb276ac3a54f	signatures	dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	9315fb98-1ca2-452d-abe0-082cb16a64fb	2026-07-31 11:46:25.807406+00	2026-07-31 11:46:25.807406+00	2026-07-31 11:46:25.807406+00	{"eTag": "\\"375af3b0310ad69f0ddf03e88d3270d6\\"", "size": 17536, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-07-31T11:46:26.000Z", "contentLength": 17536, "httpStatusCode": 200}	8959431a-b34e-4f4b-af9a-9e7b1ac6b04d	9315fb98-1ca2-452d-abe0-082cb16a64fb	{}	\N	f	f
ce456398-0e0f-4119-9048-572b6e274ac5	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/2/1785566831604_0_1000115440.jpg	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-01 06:47:14.466371+00	2026-08-01 06:47:14.466371+00	2026-08-01 06:47:14.466371+00	{"eTag": "\\"9cc38f321ea47f38db3b24cb8837a3b9\\"", "size": 131520, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-01T06:47:15.000Z", "contentLength": 131520, "httpStatusCode": 200}	43f2f8c7-969e-4952-9cd4-ef9c52045490	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
3e07a06d-e573-4f73-be97-24307efd9fae	complaint-files	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/1/1786100444042-signature.json	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-07 11:00:44.885926+00	2026-08-07 11:00:44.885926+00	2026-08-07 11:00:44.885926+00	{"eTag": "\\"2225405c268218c7d881be2f7dff6a93\\"", "size": 2517, "mimetype": "application/json", "cacheControl": "max-age=3600", "lastModified": "2026-08-07T11:00:45.000Z", "contentLength": 2517, "httpStatusCode": 200}	5548f8a5-820e-441e-b680-435d1ee039ec	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
26ca9f30-9fed-4e5b-82dc-db032728d049	signatures	af88b08e-4cea-469c-acac-02f83efc0771/signature-1786702975602.png	568eb388-61df-4b6a-8ee9-790e74b937c7	2026-08-14 10:23:00.541512+00	2026-08-14 10:23:00.541512+00	2026-08-14 10:23:00.541512+00	{"eTag": "\\"dd6d453ee2fdcfc5c5d0a143c2d65a65\\"", "size": 10140, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-14T10:23:01.000Z", "contentLength": 10140, "httpStatusCode": 200}	5dcdf910-6da4-4d81-b935-5a393cc15e90	568eb388-61df-4b6a-8ee9-790e74b937c7	{}	\N	f	f
318a6180-b55c-4baf-ae83-308f5ebc3edc	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/24/1786217170587_0_IMG_4479.jpg	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 19:26:13.15488+00	2026-08-08 19:26:13.15488+00	2026-08-08 19:26:13.15488+00	{"eTag": "\\"edc34dac2d27bf81cb78586aa45fcfc3\\"", "size": 174260, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T19:26:14.000Z", "contentLength": 174260, "httpStatusCode": 200}	94cb0171-76fa-4e7d-91f5-c3a21c2357f0	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
39d7ed6c-d984-46d1-a454-108b4aa03f4b	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/35/1786221055237_0_IMG_4476.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 20:30:58.02601+00	2026-08-08 20:30:58.02601+00	2026-08-08 20:30:58.02601+00	{"eTag": "\\"8aa1cd8dd34ba6f48e395cea9904d392\\"", "size": 381657, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:30:58.000Z", "contentLength": 381657, "httpStatusCode": 200}	32fe01a7-9881-40da-b741-f7b3f2e6c2c2	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
ad4e62cc-756a-4441-80c2-38fba151b975	medical-documents	76cc0275-308c-42ad-b03d-e917b5b09b39/36/1786222257655_0_1000399776.jpg	e1b33b45-2a92-4e2b-a37c-8da412da049b	2026-08-08 20:50:59.11616+00	2026-08-08 20:50:59.11616+00	2026-08-08 20:50:59.11616+00	{"eTag": "\\"cafb611cc45810e0e55fc1e30bfe211b\\"", "size": 156491, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:51:00.000Z", "contentLength": 156491, "httpStatusCode": 200}	d8427c57-5fd9-4586-a9b3-81cfb9e058a2	e1b33b45-2a92-4e2b-a37c-8da412da049b	{}	\N	f	f
22b53a55-fc9a-4695-bd21-760e3b05ecc1	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/37/1786222325222_0_IMG_4478.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 20:52:15.019301+00	2026-08-08 20:52:15.019301+00	2026-08-08 20:52:15.019301+00	{"eTag": "\\"430eff4a0f17be0c01e4cfd10c7b89f6\\"", "size": 3887789, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:52:15.000Z", "contentLength": 3887789, "httpStatusCode": 200}	da15563a-b773-4fc4-8e05-9418e715cab1	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
5635dffd-a752-4e0a-a481-943822e38927	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/38/1786222511685_0_IMG_4478.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 20:55:19.520405+00	2026-08-08 20:55:19.520405+00	2026-08-08 20:55:19.520405+00	{"eTag": "\\"430eff4a0f17be0c01e4cfd10c7b89f6\\"", "size": 3887789, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T20:55:20.000Z", "contentLength": 3887789, "httpStatusCode": 200}	c371c74a-d35d-4a25-9b42-87d5dada8ba8	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
94003785-22f9-4b40-a2d6-48a453c1585a	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/39/1786222970981_0_IMG_4475.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-08 21:03:22.061511+00	2026-08-08 21:03:22.061511+00	2026-08-08 21:03:22.061511+00	{"eTag": "\\"c34423916141dcc90f86bdfbc8e96aa2\\"", "size": 6987742, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-08T21:03:22.000Z", "contentLength": 6987742, "httpStatusCode": 200}	aaf6772a-109c-4440-9180-8b360fd28c5b	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
cb6657cd-71ee-49fd-9cea-2cf4ec9472bd	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/41/1786261246710_0_IMG_4476.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-09 07:40:47.609361+00	2026-08-09 07:40:47.609361+00	2026-08-09 07:40:47.609361+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T07:40:47.605Z", "contentLength": 0, "httpStatusCode": 200}	346363d6-7637-428a-bf90-56f1aceb937a	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
33fe5709-ce4f-44d6-8215-3534627be049	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/42/1786262255372_0_IMG_4473.jpg	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-09 07:57:36.121919+00	2026-08-09 07:57:36.121919+00	2026-08-09 07:57:36.121919+00	{"eTag": "\\"d41d8cd98f00b204e9800998ecf8427e\\"", "size": 0, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T07:57:36.121Z", "contentLength": 0, "httpStatusCode": 200}	edd9351f-325b-40f9-93ae-21dc4e439a5c	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
449dfbbd-d70d-4bfd-8feb-9f42b0c2896c	medical-documents	76cc0275-308c-42ad-b03d-e917b5b09b39/44/1786263307988_0_1000399776.jpg	e1b33b45-2a92-4e2b-a37c-8da412da049b	2026-08-09 08:15:09.220273+00	2026-08-09 08:15:09.220273+00	2026-08-09 08:15:09.220273+00	{"eTag": "\\"cafb611cc45810e0e55fc1e30bfe211b\\"", "size": 156491, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T08:15:10.000Z", "contentLength": 156491, "httpStatusCode": 200}	aa39d9a0-2286-40d6-a7fd-c391e9bd9725	e1b33b45-2a92-4e2b-a37c-8da412da049b	{}	\N	f	f
e06803e5-d06c-4a0a-9659-dcc16f5fc334	medical-documents	a5f1f4e2-4fb0-45f2-b3aa-c6c673b8aa10/45/1786263485014_0_IMG_4480.png	6b4a2988-2654-479c-9fce-03bb70decc48	2026-08-09 08:18:07.930174+00	2026-08-09 08:18:07.930174+00	2026-08-09 08:18:07.930174+00	{"eTag": "\\"86572389b5b9f71d9d59d1dc46d35e5e\\"", "size": 885346, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T08:18:08.000Z", "contentLength": 885346, "httpStatusCode": 200}	5d8c8fb5-b0d4-42c8-ba72-51e6e5941bfe	6b4a2988-2654-479c-9fce-03bb70decc48	{}	\N	f	f
334617d2-a046-459f-b49c-173615dd59b6	complaint-files	76cc0275-308c-42ad-b03d-e917b5b09b39/10/1786274711588-6da8bc6j34q-1000399892.jpg	e1b33b45-2a92-4e2b-a37c-8da412da049b	2026-08-09 11:25:13.276216+00	2026-08-09 11:25:13.276216+00	2026-08-09 11:25:13.276216+00	{"eTag": "\\"fae3d51d4b5f98b58ca51b955820187f\\"", "size": 211249, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T11:25:14.000Z", "contentLength": 211249, "httpStatusCode": 200}	80959aae-1149-4259-8b35-50b03fcfdb85	e1b33b45-2a92-4e2b-a37c-8da412da049b	{}	\N	f	f
1b297d29-6819-48bf-96f3-1d5f2fb510a3	medical-documents	c9f7a318-d3f1-4433-9511-48d0a825e31c/49/1786285202397_0_CA3B1298-19A6-4B7E-B34A-46501CCA8E81.jpg	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-09 14:20:12.964937+00	2026-08-09 14:20:12.964937+00	2026-08-09 14:20:12.964937+00	{"eTag": "\\"36eba66d816110f2d90ade396f49df8e\\"", "size": 902264, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T14:20:13.000Z", "contentLength": 902264, "httpStatusCode": 200}	f431791f-fbd9-48e9-94cc-29e7050298c2	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
d9ad9a55-9ce8-4379-8d25-09dc80fe37e7	complaint-files	c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285926868-ylfhv1fr02-IMG_4479.jpg	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-09 14:32:08.878126+00	2026-08-09 14:32:08.878126+00	2026-08-09 14:32:08.878126+00	{"eTag": "\\"edc34dac2d27bf81cb78586aa45fcfc3\\"", "size": 174260, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T14:32:09.000Z", "contentLength": 174260, "httpStatusCode": 200}	70e6aa05-bee6-497c-a3d9-281108c34a2d	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
7dca18a3-91a3-436b-8d8e-9038311fc052	complaint-files	c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285929024-qiyoali2i7-JASPER_2026_Poster-Template.docx	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-09 14:32:32.389453+00	2026-08-09 14:32:32.389453+00	2026-08-09 14:32:32.389453+00	{"eTag": "\\"a6b56e4e431f22478f0be5543404b32b\\"", "size": 1635742, "mimetype": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T14:32:33.000Z", "contentLength": 1635742, "httpStatusCode": 200}	5db907a5-3391-4769-861d-b7ba85ec3c96	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
f6a1b1af-6aac-4306-84c4-af6da95519a1	avatars	avatars/1786287022299.jpg	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-09 14:50:24.512979+00	2026-08-09 14:50:24.512979+00	2026-08-09 14:50:24.512979+00	{"eTag": "\\"b8273c1819e2434b6d29eff41d1c92ec\\"", "size": 126375, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-09T14:50:25.000Z", "contentLength": 126375, "httpStatusCode": 200}	574cd4fd-41e1-43cc-9d4b-331888cbcdf0	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
537868b7-ae5f-4d30-b0fa-fbdd71c4e298	signatures	d3d6bd6d-210d-477e-b877-d3c1176254e1/signature-1786374539346.png	cd536781-f062-41e0-a30f-e043665970a3	2026-08-10 15:08:59.874587+00	2026-08-10 15:08:59.874587+00	2026-08-10 15:08:59.874587+00	{"eTag": "\\"3a89ebbef4179579ae754fa5a54b2c1a\\"", "size": 9089, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-10T15:09:00.000Z", "contentLength": 9089, "httpStatusCode": 200}	fba6e548-382e-4b1e-bea5-43b705ea532d	cd536781-f062-41e0-a30f-e043665970a3	{}	\N	f	f
0ee14bff-168f-4be1-ab56-9bd9212ab7bf	avatars	04391a6a-549b-409b-929b-860f9b0ba271_1786457651723.png	04391a6a-549b-409b-929b-860f9b0ba271	2026-08-11 14:14:13.836601+00	2026-08-11 14:14:13.836601+00	2026-08-11 14:14:13.836601+00	{"eTag": "\\"d00f98a903d9b49610dbfecccf5ce611\\"", "size": 4386, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:14:14.000Z", "contentLength": 4386, "httpStatusCode": 200}	65c40801-604a-416d-9101-82e14ef2c760	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
c1e2c782-7cb5-4844-894b-bacfa222774e	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786457977421.png	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-11 14:19:39.440715+00	2026-08-11 14:19:39.440715+00	2026-08-11 14:19:39.440715+00	{"eTag": "\\"af85722898252f110408bee5dacb8402\\"", "size": 81505, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:19:40.000Z", "contentLength": 81505, "httpStatusCode": 200}	d274cd7c-988e-46b4-a3d4-c0f3755bc9ec	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
d4d36d15-30ae-4db5-9882-cc856146bb0f	avatars	9315fb98-1ca2-452d-abe0-082cb16a64fb_1786458834094.png	9315fb98-1ca2-452d-abe0-082cb16a64fb	2026-08-11 14:33:56.810197+00	2026-08-11 14:33:56.810197+00	2026-08-11 14:33:56.810197+00	{"eTag": "\\"af85722898252f110408bee5dacb8402\\"", "size": 81505, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:33:57.000Z", "contentLength": 81505, "httpStatusCode": 200}	7c2deea5-dc0a-48cc-9c52-d83c8e2a63e7	9315fb98-1ca2-452d-abe0-082cb16a64fb	{}	\N	f	f
00a1d390-c52d-49c1-bf24-2320f2c910cd	avatars	e6eea446-2800-4328-9f59-a662a16abf41_1786458931195.jpg	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-11 14:35:33.220216+00	2026-08-11 14:35:33.220216+00	2026-08-11 14:35:33.220216+00	{"eTag": "\\"624c2105964d9132d809209e8a87a211\\"", "size": 74461, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:35:34.000Z", "contentLength": 74461, "httpStatusCode": 200}	9254f8f0-9421-4e62-a298-0b3cb2432302	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
e0b4f5b2-5132-461b-8a25-886e4b36f5d6	avatars	e6eea446-2800-4328-9f59-a662a16abf41_1786459175514.jpg	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-11 14:39:37.498926+00	2026-08-11 14:39:37.498926+00	2026-08-11 14:39:37.498926+00	{"eTag": "\\"624c2105964d9132d809209e8a87a211\\"", "size": 74461, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:39:38.000Z", "contentLength": 74461, "httpStatusCode": 200}	b48661d6-058e-4659-af2f-b775405560cb	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
2db86b8b-7a42-4097-b250-82b5f0a490b0	avatars	e6eea446-2800-4328-9f59-a662a16abf41_1786459498640.jpg	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-11 14:45:01.116478+00	2026-08-11 14:45:01.116478+00	2026-08-11 14:45:01.116478+00	{"eTag": "\\"624c2105964d9132d809209e8a87a211\\"", "size": 74461, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:45:02.000Z", "contentLength": 74461, "httpStatusCode": 200}	3c2ab5f5-8991-4b21-97db-cab8823fcfd5	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
f31470bb-08ac-4cdd-a333-b170d2c306b6	signatures	cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786459511243.png	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-11 14:45:12.778833+00	2026-08-11 14:45:12.778833+00	2026-08-11 14:45:12.778833+00	{"eTag": "\\"8ba352d7550b2319fb0ee4734e52eb3a\\"", "size": 9242, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T14:45:13.000Z", "contentLength": 9242, "httpStatusCode": 200}	675daea1-a5f0-4e46-9151-690118d7623b	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
81643e55-528f-4afb-9222-b6d844c918f1	medical-documents	c9f7a318-d3f1-4433-9511-48d0a825e31c/59/1786478235804_0_1000102166.jpg	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-11 19:57:20.591273+00	2026-08-11 19:57:20.591273+00	2026-08-11 19:57:20.591273+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T19:57:21.000Z", "contentLength": 1197449, "httpStatusCode": 200}	cbd4a5a6-f06d-4cfe-8844-0e5c1664c534	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
55b11ff9-804e-4a3e-810c-e59fe58afbb2	medical-documents	c9f7a318-d3f1-4433-9511-48d0a825e31c/60/1786484075686_0_1000116215.jpg	ddea66f5-de28-469c-be1b-122b570703dd	2026-08-11 21:34:38.404656+00	2026-08-11 21:34:38.404656+00	2026-08-11 21:34:38.404656+00	{"eTag": "\\"f08d4a558277a2de6f83c672f7bbcc13\\"", "size": 118279, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-11T21:34:39.000Z", "contentLength": 118279, "httpStatusCode": 200}	d66938f1-dc75-413c-8cfb-893323dd79e2	ddea66f5-de28-469c-be1b-122b570703dd	{}	\N	f	f
9ec85953-867b-4176-b4bd-b185b9952daa	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786514370633.jpg	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 05:59:35.747033+00	2026-08-12 05:59:35.747033+00	2026-08-12 05:59:35.747033+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T05:59:36.000Z", "contentLength": 1197449, "httpStatusCode": 200}	0a8f713d-e013-4325-a221-c790dd8371d3	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
da9c42e5-6c09-4066-8ffb-3f0fb84db189	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786523831316.jpg	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 08:37:15.74318+00	2026-08-12 08:37:15.74318+00	2026-08-12 08:37:15.74318+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:37:16.000Z", "contentLength": 1197449, "httpStatusCode": 200}	3aaad243-e465-4069-99bc-cf6e30d7678d	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
1c87ff91-cd0f-4959-b213-a198687a082a	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786524007287.jpg	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 08:40:12.974711+00	2026-08-12 08:40:12.974711+00	2026-08-12 08:40:12.974711+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:40:13.000Z", "contentLength": 1197449, "httpStatusCode": 200}	89bbbfa9-6ae2-407d-8460-85087fa2710b	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
804f4896-7183-499c-b85e-45d156ccd729	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786524068477.jpg	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 08:41:14.032758+00	2026-08-12 08:41:14.032758+00	2026-08-12 08:41:14.032758+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:41:14.000Z", "contentLength": 1197449, "httpStatusCode": 200}	5830423b-e262-454c-bbea-05f4078f7222	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
20e5eea9-6ace-41d8-8d46-e9e14a51afa7	avatars	ff539ee4-f139-44c1-9d00-3714f2c30bec_1786524158165.jpg	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 08:42:42.167585+00	2026-08-12 08:42:42.167585+00	2026-08-12 08:42:42.167585+00	{"eTag": "\\"e40eea5c507233e164dd14b3ab7071e9\\"", "size": 1197449, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:42:43.000Z", "contentLength": 1197449, "httpStatusCode": 200}	6249ff21-fbc7-4e6f-b9e2-928f8aa932d4	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
2cc13b61-a8e3-4d1d-8758-dbe137727bf1	avatars	04391a6a-549b-409b-929b-860f9b0ba271_1786524386313.jpg	04391a6a-549b-409b-929b-860f9b0ba271	2026-08-12 08:46:28.568912+00	2026-08-12 08:46:28.568912+00	2026-08-12 08:46:28.568912+00	{"eTag": "\\"5cc8d31849a11a82a8d958010725ad19\\"", "size": 73162, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:46:29.000Z", "contentLength": 73162, "httpStatusCode": 200}	a575cebf-1d97-460c-8acf-58840873943e	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
7f128bf1-902b-4cbf-9d41-06a216c4c36d	signatures	2ace860d-4275-49eb-b92c-4dc932dd2c45/signature-1786524396619.png	04391a6a-549b-409b-929b-860f9b0ba271	2026-08-12 08:46:38.379111+00	2026-08-12 08:46:38.379111+00	2026-08-12 08:46:38.379111+00	{"eTag": "\\"6bcbf934cff0cec14d48287df76dbd89\\"", "size": 12150, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T08:46:39.000Z", "contentLength": 12150, "httpStatusCode": 200}	7aca437a-be89-4ddf-aa4a-fdcc68cca8b4	04391a6a-549b-409b-929b-860f9b0ba271	{}	\N	f	f
1e09db4b-57d2-4528-b36a-31223bc8b150	signatures	cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786531821127.png	e6eea446-2800-4328-9f59-a662a16abf41	2026-08-12 10:50:23.900037+00	2026-08-12 10:50:23.900037+00	2026-08-12 10:50:23.900037+00	{"eTag": "\\"a0cfc13a6c1cde9d654280704b9560dd\\"", "size": 15725, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T10:50:24.000Z", "contentLength": 15725, "httpStatusCode": 200}	1bfb827b-557a-419b-bde8-8e9c28ac163f	e6eea446-2800-4328-9f59-a662a16abf41	{}	\N	f	f
31ef11ce-cd03-4676-adcd-91020dee0c3f	signatures	cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1786550720307.png	ff539ee4-f139-44c1-9d00-3714f2c30bec	2026-08-12 16:05:22.31993+00	2026-08-12 16:05:22.31993+00	2026-08-12 16:05:22.31993+00	{"eTag": "\\"9ad72aead68f559ec8b5ee30adcd20de\\"", "size": 14031, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-12T16:05:23.000Z", "contentLength": 14031, "httpStatusCode": 200}	0a9c49de-ed7a-4175-bc8c-d288b8355730	ff539ee4-f139-44c1-9d00-3714f2c30bec	{}	\N	f	f
658eabac-efcb-4310-af70-f4a30a9d1e96	signatures	af88b08e-4cea-469c-acac-02f83efc0771/signature-1786691518626.png	43bf7538-9546-40fd-b678-dcfb69b41a30	2026-08-14 07:12:03.273098+00	2026-08-14 07:12:03.273098+00	2026-08-14 07:12:03.273098+00	{"eTag": "\\"92fb8a24fdd789ee3c2a4853912b6fb0\\"", "size": 8462, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-14T07:12:04.000Z", "contentLength": 8462, "httpStatusCode": 200}	d504a0b4-e4f6-45da-9866-31e71336e388	43bf7538-9546-40fd-b678-dcfb69b41a30	{}	\N	f	f
5c36520c-f06d-4304-b3e6-8a8ec64da112	signatures	af88b08e-4cea-469c-acac-02f83efc0771/signature-1786691556368.png	43bf7538-9546-40fd-b678-dcfb69b41a30	2026-08-14 07:12:40.412139+00	2026-08-14 07:12:40.412139+00	2026-08-14 07:12:40.412139+00	{"eTag": "\\"92fb8a24fdd789ee3c2a4853912b6fb0\\"", "size": 8462, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2026-08-14T07:12:41.000Z", "contentLength": 8462, "httpStatusCode": 200}	bac31c56-d2ee-4ad5-b375-e932f8b432ee	43bf7538-9546-40fd-b678-dcfb69b41a30	{}	\N	f	f
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata, metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.vector_indexes (id, name, bucket_id, data_type, dimension, distance_metric, metadata_configuration, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1454, true);


--
-- Name: jobid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.jobid_seq', 3, true);


--
-- Name: runid_seq; Type: SEQUENCE SET; Schema: cron; Owner: supabase_admin
--

SELECT pg_catalog.setval('cron.runid_seq', 449, true);


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.announcements_id_seq', 29, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 277, true);


--
-- Name: complaint_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaint_attachments_id_seq', 8, true);


--
-- Name: complaint_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaint_recipients_id_seq', 24, true);


--
-- Name: complaint_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaint_replies_id_seq', 15, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.complaints_id_seq', 34, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departments_id_seq', 10, true);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.designations_id_seq', 21, true);


--
-- Name: leave_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_forms_id_seq', 67, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 71, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 15, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 593, true);


--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.profile_change_requests_id_seq', 33, true);


--
-- Name: role_privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.role_privileges_id_seq', 6095, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 9, true);


--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_privilege_categories_id_seq', 1, false);


--
-- Name: system_privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_privileges_id_seq', 124, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tasks_id_seq', 19, true);


--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_leave_balances_id_seq', 111, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_realtime_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 7322, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: custom_oauth_providers custom_oauth_providers_identifier_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_identifier_key UNIQUE (identifier);


--
-- Name: custom_oauth_providers custom_oauth_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.custom_oauth_providers
    ADD CONSTRAINT custom_oauth_providers_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_code_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_code_key UNIQUE (authorization_code);


--
-- Name: oauth_authorizations oauth_authorizations_authorization_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_authorization_id_key UNIQUE (authorization_id);


--
-- Name: oauth_authorizations oauth_authorizations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_pkey PRIMARY KEY (id);


--
-- Name: oauth_client_states oauth_client_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_client_states
    ADD CONSTRAINT oauth_client_states_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_pkey PRIMARY KEY (id);


--
-- Name: oauth_consents oauth_consents_user_client_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_client_unique UNIQUE (user_id, client_id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webauthn_challenges webauthn_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_pkey PRIMARY KEY (id);


--
-- Name: webauthn_credentials webauthn_credentials_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_pkey PRIMARY KEY (id);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: complaint_attachments complaint_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_pkey PRIMARY KEY (id);


--
-- Name: complaint_recipients complaint_recipients_complaint_id_recipient_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_complaint_id_recipient_id_key UNIQUE (complaint_id, recipient_id);


--
-- Name: complaint_recipients complaint_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_pkey PRIMARY KEY (id);


--
-- Name: complaint_replies complaint_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: leave_forms leave_forms_leave_request_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_leave_request_id_key UNIQUE (leave_request_id);


--
-- Name: leave_forms leave_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profile_change_requests profile_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_pkey PRIMARY KEY (id);


--
-- Name: role_privileges role_privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_pkey PRIMARY KEY (id);


--
-- Name: role_privileges role_privileges_role_id_privilege_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_role_id_privilege_id_key UNIQUE (role_id, privilege_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: system_privilege_categories system_privilege_categories_category_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privilege_categories
    ADD CONSTRAINT system_privilege_categories_category_key_key UNIQUE (category_key);


--
-- Name: system_privilege_categories system_privilege_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privilege_categories
    ADD CONSTRAINT system_privilege_categories_pkey PRIMARY KEY (id);


--
-- Name: system_privileges system_privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_pkey PRIMARY KEY (id);


--
-- Name: system_privileges system_privileges_privilege_key_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_privilege_key_key UNIQUE (privilege_key);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_leave_balances user_leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_pkey PRIMARY KEY (id);


--
-- Name: user_leave_balances user_leave_balances_user_id_leave_type_id_year_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_user_id_leave_type_id_year_key UNIQUE (user_id, leave_type_id, year);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_emp_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_emp_id_key UNIQUE (nic);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_13 messages_2026_08_13_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_13
    ADD CONSTRAINT messages_2026_08_13_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_14 messages_2026_08_14_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_14
    ADD CONSTRAINT messages_2026_08_14_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_15 messages_2026_08_15_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_15
    ADD CONSTRAINT messages_2026_08_15_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_16 messages_2026_08_16_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_16
    ADD CONSTRAINT messages_2026_08_16_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_17 messages_2026_08_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_17
    ADD CONSTRAINT messages_2026_08_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_18 messages_2026_08_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_18
    ADD CONSTRAINT messages_2026_08_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2026_08_19 messages_2026_08_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages_2026_08_19
    ADD CONSTRAINT messages_2026_08_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages messages_payload_exclusive; Type: CHECK CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages
    ADD CONSTRAINT messages_payload_exclusive CHECK (((payload IS NULL) OR (binary_payload IS NULL))) NOT VALID;


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: buckets_vectors buckets_vectors_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets_vectors
    ADD CONSTRAINT buckets_vectors_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: vector_indexes vector_indexes_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: custom_oauth_providers_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_created_at_idx ON auth.custom_oauth_providers USING btree (created_at);


--
-- Name: custom_oauth_providers_enabled_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_enabled_idx ON auth.custom_oauth_providers USING btree (enabled);


--
-- Name: custom_oauth_providers_identifier_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_identifier_idx ON auth.custom_oauth_providers USING btree (identifier);


--
-- Name: custom_oauth_providers_provider_type_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX custom_oauth_providers_provider_type_idx ON auth.custom_oauth_providers USING btree (provider_type);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_oauth_client_states_created_at; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_oauth_client_states_created_at ON auth.oauth_client_states USING btree (created_at);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: idx_users_created_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_created_at_desc ON auth.users USING btree (created_at DESC);


--
-- Name: idx_users_email; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_email ON auth.users USING btree (email);


--
-- Name: idx_users_last_sign_in_at_desc; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_last_sign_in_at_desc ON auth.users USING btree (last_sign_in_at DESC);


--
-- Name: idx_users_name; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_users_name ON auth.users USING btree (((raw_user_meta_data ->> 'name'::text))) WHERE ((raw_user_meta_data ->> 'name'::text) IS NOT NULL);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_auth_pending_exp_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_auth_pending_exp_idx ON auth.oauth_authorizations USING btree (expires_at) WHERE (status = 'pending'::auth.oauth_authorization_status);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: oauth_consents_active_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_client_idx ON auth.oauth_consents USING btree (client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_active_user_client_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_active_user_client_idx ON auth.oauth_consents USING btree (user_id, client_id) WHERE (revoked_at IS NULL);


--
-- Name: oauth_consents_user_order_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX oauth_consents_user_order_idx ON auth.oauth_consents USING btree (user_id, granted_at DESC);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_oauth_client_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_oauth_client_id_idx ON auth.sessions USING btree (oauth_client_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: webauthn_challenges_expires_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_expires_at_idx ON auth.webauthn_challenges USING btree (expires_at);


--
-- Name: webauthn_challenges_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_challenges_user_id_idx ON auth.webauthn_challenges USING btree (user_id);


--
-- Name: webauthn_credentials_credential_id_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX webauthn_credentials_credential_id_key ON auth.webauthn_credentials USING btree (credential_id);


--
-- Name: webauthn_credentials_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX webauthn_credentials_user_id_idx ON auth.webauthn_credentials USING btree (user_id);


--
-- Name: complaint_attachments_complaint_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX complaint_attachments_complaint_idx ON public.complaint_attachments USING btree (complaint_id);


--
-- Name: complaint_recipients_complaint_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX complaint_recipients_complaint_idx ON public.complaint_recipients USING btree (complaint_id);


--
-- Name: complaint_recipients_recipient_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX complaint_recipients_recipient_idx ON public.complaint_recipients USING btree (recipient_id);


--
-- Name: idx_announcements_expires_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_announcements_expires_at ON public.announcements USING btree (expires_at);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_complaint_attachments_complaint; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaint_attachments_complaint ON public.complaint_attachments USING btree (complaint_id);


--
-- Name: idx_complaint_recipients_complaint; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaint_recipients_complaint ON public.complaint_recipients USING btree (complaint_id);


--
-- Name: idx_complaint_recipients_recipient; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaint_recipients_recipient ON public.complaint_recipients USING btree (recipient_id);


--
-- Name: idx_complaints_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaints_status ON public.complaints USING btree (status);


--
-- Name: idx_complaints_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_complaints_user ON public.complaints USING btree (user_id);


--
-- Name: idx_leave_requests_coverage_officer; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_requests_coverage_officer ON public.leave_requests USING btree (coverage_officer_id);


--
-- Name: idx_leave_requests_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_requests_status ON public.leave_requests USING btree (status);


--
-- Name: idx_leave_requests_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_leave_requests_user ON public.leave_requests USING btree (user_id);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_department ON public.users USING btree (department_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_13_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_13_inserted_at_topic_idx ON realtime.messages_2026_08_13 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_14_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_14_inserted_at_topic_idx ON realtime.messages_2026_08_14 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_15_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_15_inserted_at_topic_idx ON realtime.messages_2026_08_15 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_16_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_16_inserted_at_topic_idx ON realtime.messages_2026_08_16 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_17_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_17_inserted_at_topic_idx ON realtime.messages_2026_08_17 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_18_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_18_inserted_at_topic_idx ON realtime.messages_2026_08_18 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2026_08_19_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_2026_08_19_inserted_at_topic_idx ON realtime.messages_2026_08_19 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_action_filter_selec; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_action_filter_selec ON realtime.subscription USING btree (subscription_id, entity, filters, action_filter, COALESCE(selected_columns, '{}'::text[]));


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: buckets_analytics_unique_name_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX buckets_analytics_unique_name_idx ON storage.buckets_analytics USING btree (name) WHERE (deleted_at IS NULL);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_bucket_id_name_lower; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name_lower ON storage.objects USING btree (bucket_id, lower(name) COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: vector_indexes_name_bucket_id_idx; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX vector_indexes_name_bucket_id_idx ON storage.vector_indexes USING btree (name, bucket_id);


--
-- Name: messages_2026_08_13_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_13_inserted_at_topic_idx;


--
-- Name: messages_2026_08_13_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_13_pkey;


--
-- Name: messages_2026_08_14_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_14_inserted_at_topic_idx;


--
-- Name: messages_2026_08_14_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_14_pkey;


--
-- Name: messages_2026_08_15_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_15_inserted_at_topic_idx;


--
-- Name: messages_2026_08_15_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_15_pkey;


--
-- Name: messages_2026_08_16_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_16_inserted_at_topic_idx;


--
-- Name: messages_2026_08_16_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_16_pkey;


--
-- Name: messages_2026_08_17_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_17_inserted_at_topic_idx;


--
-- Name: messages_2026_08_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_17_pkey;


--
-- Name: messages_2026_08_18_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_18_inserted_at_topic_idx;


--
-- Name: messages_2026_08_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_18_pkey;


--
-- Name: messages_2026_08_19_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2026_08_19_inserted_at_topic_idx;


--
-- Name: messages_2026_08_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2026_08_19_pkey;


--
-- Name: leave_requests after_leave_request_insert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER after_leave_request_insert AFTER INSERT ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.notify_subject_officer_on_leave();


--
-- Name: users tr_extract_nic_details; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER tr_extract_nic_details BEFORE INSERT OR UPDATE OF nic ON public.users FOR EACH ROW WHEN ((new.nic IS NOT NULL)) EXECUTE FUNCTION public.extract_nic_details();


--
-- Name: leave_requests trg_validate_new_leave_request; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trg_validate_new_leave_request BEFORE INSERT ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.validate_new_leave_request();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: buckets protect_buckets_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_buckets_delete BEFORE DELETE ON storage.buckets FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects protect_objects_delete; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER protect_objects_delete BEFORE DELETE ON storage.objects FOR EACH STATEMENT EXECUTE FUNCTION storage.protect_delete();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_authorizations oauth_authorizations_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_authorizations
    ADD CONSTRAINT oauth_authorizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_client_id_fkey FOREIGN KEY (client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: oauth_consents oauth_consents_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.oauth_consents
    ADD CONSTRAINT oauth_consents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_oauth_client_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_oauth_client_id_fkey FOREIGN KEY (oauth_client_id) REFERENCES auth.oauth_clients(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: webauthn_challenges webauthn_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_challenges
    ADD CONSTRAINT webauthn_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: webauthn_credentials webauthn_credentials_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.webauthn_credentials
    ADD CONSTRAINT webauthn_credentials_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaint_attachments complaint_attachments_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_attachments complaint_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaint_recipients complaint_recipients_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_recipients complaint_recipients_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaint_replies complaint_replies_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_replies complaint_replies_replied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_assigned_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_assigned_supervisor_id_fkey FOREIGN KEY (assigned_supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: designations designations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: users fk_users_designation; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_designation FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: leave_forms leave_forms_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_coverage_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_coverage_officer_id_fkey FOREIGN KEY (coverage_officer_id) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests leave_requests_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_change_requests profile_change_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: profile_change_requests profile_change_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_privileges role_privileges_privilege_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_privilege_id_fkey FOREIGN KEY (privilege_id) REFERENCES public.system_privileges(id) ON DELETE CASCADE;


--
-- Name: role_privileges role_privileges_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: system_privileges system_privileges_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.system_privilege_categories(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: user_leave_balances user_leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT;


--
-- Name: user_leave_balances user_leave_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: vector_indexes vector_indexes_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.vector_indexes
    ADD CONSTRAINT vector_indexes_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets_vectors(id);


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: users Allow users to update their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own profile" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = auth_id)) WITH CHECK ((auth.uid() = auth_id));


--
-- Name: users Allow users to view their own profile; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to view their own profile" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = auth_id));


--
-- Name: complaint_attachments Users delete own complaint attachments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users delete own complaint attachments" ON public.complaint_attachments FOR DELETE TO authenticated USING ((uploaded_by IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: complaint_recipients Users delete own complaint recipients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users delete own complaint recipients" ON public.complaint_recipients FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND (u.auth_id = auth.uid())))));


--
-- Name: complaint_attachments Users insert own complaint attachments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users insert own complaint attachments" ON public.complaint_attachments FOR INSERT TO authenticated WITH CHECK (((uploaded_by IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_attachments.complaint_id) AND (u.auth_id = auth.uid()))))));


--
-- Name: complaint_recipients Users insert own complaint recipients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users insert own complaint recipients" ON public.complaint_recipients FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND (u.auth_id = auth.uid())))));


--
-- Name: complaint_attachments Users view related complaint attachments; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users view related complaint attachments" ON public.complaint_attachments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users sender ON ((sender.id = c.user_id)))
  WHERE ((c.id = complaint_attachments.complaint_id) AND ((sender.auth_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM (public.complaint_recipients cr
             JOIN public.users recipient_user ON ((recipient_user.id = cr.recipient_id)))
          WHERE ((cr.complaint_id = c.id) AND (recipient_user.auth_id = auth.uid())))))))));


--
-- Name: complaint_recipients Users view related complaint recipients; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users view related complaint recipients" ON public.complaint_recipients FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users sender ON ((sender.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND ((sender.auth_id = auth.uid()) OR (complaint_recipients.recipient_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_id = auth.uid()))))))));


--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: role_privileges; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.role_privileges ENABLE ROW LEVEL SECURITY;

--
-- Name: system_privilege_categories; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_privilege_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: system_privileges; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_privileges ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects Allow authenticated users to manage avatars 1oj01fe_0; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow authenticated users to manage avatars 1oj01fe_0" ON storage.objects FOR SELECT TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: objects Allow authenticated users to manage avatars 1oj01fe_1; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow authenticated users to manage avatars 1oj01fe_1" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: objects Allow authenticated users to manage avatars 1oj01fe_2; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Allow authenticated users to manage avatars 1oj01fe_2" ON storage.objects FOR UPDATE TO authenticated USING ((auth.role() = 'authenticated'::text));


--
-- Name: objects Authenticated complaint uploads; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated complaint uploads" ON storage.objects FOR INSERT TO authenticated WITH CHECK ((bucket_id = 'complaint-files'::text));


--
-- Name: objects Authenticated users can delete signatures; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated users can delete signatures" ON storage.objects FOR DELETE TO authenticated USING ((bucket_id = 'signatures'::text));


--
-- Name: objects Authenticated users can update signatures; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Authenticated users can update signatures" ON storage.objects FOR UPDATE TO authenticated USING ((bucket_id = 'signatures'::text)) WITH CHECK ((bucket_id = 'signatures'::text));


--
-- Name: objects Public can view signatures; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Public can view signatures" ON storage.objects FOR SELECT USING ((bucket_id = 'signatures'::text));


--
-- Name: objects Public complaint file reads; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Public complaint file reads" ON storage.objects FOR SELECT USING ((bucket_id = 'complaint-files'::text));


--
-- Name: objects Users delete own complaint files; Type: POLICY; Schema: storage; Owner: supabase_storage_admin
--

CREATE POLICY "Users delete own complaint files" ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'complaint-files'::text) AND ((storage.foldername(name))[1] IN ( SELECT (users.id)::text AS id
   FROM public.users
  WHERE (users.auth_id = auth.uid())))));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_vectors; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets_vectors ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: vector_indexes; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.vector_indexes ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: supabase_admin
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime_messages_publication OWNER TO supabase_admin;

--
-- Name: supabase_realtime announcements; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.announcements;


--
-- Name: supabase_realtime audit_logs; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.audit_logs;


--
-- Name: supabase_realtime complaint_attachments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.complaint_attachments;


--
-- Name: supabase_realtime complaint_recipients; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.complaint_recipients;


--
-- Name: supabase_realtime complaint_replies; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.complaint_replies;


--
-- Name: supabase_realtime complaints; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.complaints;


--
-- Name: supabase_realtime departments; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.departments;


--
-- Name: supabase_realtime leave_forms; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.leave_forms;


--
-- Name: supabase_realtime leave_requests; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.leave_requests;


--
-- Name: supabase_realtime leave_types; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.leave_types;


--
-- Name: supabase_realtime notifications; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.notifications;


--
-- Name: supabase_realtime profile_change_requests; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.profile_change_requests;


--
-- Name: supabase_realtime roles; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.roles;


--
-- Name: supabase_realtime tasks; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.tasks;


--
-- Name: supabase_realtime user_leave_balances; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.user_leave_balances;


--
-- Name: supabase_realtime users; Type: PUBLICATION TABLE; Schema: public; Owner: postgres
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.users;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: supabase_admin
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT USAGE ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA cron; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA cron TO postgres WITH GRANT OPTION;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA storage TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA vault; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA vault TO postgres WITH GRANT OPTION;
GRANT USAGE ON SCHEMA vault TO service_role;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.alter_job(job_id bigint, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION job_cache_invalidate(); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.job_cache_invalidate() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule(job_name text, schedule text, command text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule(job_name text, schedule text, command text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.schedule_in_database(job_name text, schedule text, command text, database text, username text, active boolean) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_id bigint); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_id bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION unschedule(job_name text); Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON FUNCTION cron.unschedule(job_name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.armor(bytea, text[], text[]) FROM postgres;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.crypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.dearmor(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.digest(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_bytes(integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_random_uuid() FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.gen_salt(text, integer) FROM postgres;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM supabase_admin;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO supabase_admin WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.hmac(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT shared_blk_read_time double precision, OUT shared_blk_write_time double precision, OUT local_blk_read_time double precision, OUT local_blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision, OUT jit_deform_count bigint, OUT jit_deform_time double precision, OUT stats_since timestamp with time zone, OUT minmax_stats_since timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO dashboard_user;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) FROM postgres;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint, minmax_only boolean) TO dashboard_user;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_key_id(bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) FROM postgres;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v1mc() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v4() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_nil() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_dns() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_oid() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_url() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.uuid_ns_x500() FROM postgres;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION pg_reload_conf(); Type: ACL; Schema: pg_catalog; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pg_catalog.pg_reload_conf() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION extract_nic_details(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.extract_nic_details() TO anon;
GRANT ALL ON FUNCTION public.extract_nic_details() TO authenticated;
GRANT ALL ON FUNCTION public.extract_nic_details() TO service_role;


--
-- Name: FUNCTION notify_coverage_officer(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_coverage_officer() TO anon;
GRANT ALL ON FUNCTION public.notify_coverage_officer() TO authenticated;
GRANT ALL ON FUNCTION public.notify_coverage_officer() TO service_role;


--
-- Name: FUNCTION notify_leave_final_status(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_leave_final_status() TO anon;
GRANT ALL ON FUNCTION public.notify_leave_final_status() TO authenticated;
GRANT ALL ON FUNCTION public.notify_leave_final_status() TO service_role;


--
-- Name: FUNCTION notify_subject_officer_on_leave(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.notify_subject_officer_on_leave() TO anon;
GRANT ALL ON FUNCTION public.notify_subject_officer_on_leave() TO authenticated;
GRANT ALL ON FUNCTION public.notify_subject_officer_on_leave() TO service_role;


--
-- Name: FUNCTION rls_auto_enable(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.rls_auto_enable() TO anon;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO authenticated;
GRANT ALL ON FUNCTION public.rls_auto_enable() TO service_role;


--
-- Name: FUNCTION validate_new_leave_request(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_new_leave_request() TO anon;
GRANT ALL ON FUNCTION public.validate_new_leave_request() TO authenticated;
GRANT ALL ON FUNCTION public.validate_new_leave_request() TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text, negate boolean) TO service_role;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION send_binary(payload bytea, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send_binary(payload bytea, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION wal2json_escape_identifier(name text); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO postgres;
GRANT ALL ON FUNCTION realtime.wal2json_escape_identifier(name text) TO dashboard_user;


--
-- Name: FUNCTION _crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault._crypto_aead_det_decrypt(message bytea, additional bytea, key_id bigint, context bytea, nonce bytea) TO service_role;


--
-- Name: FUNCTION create_secret(new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.create_secret(new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: FUNCTION update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid); Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION vault.update_secret(secret_id uuid, new_secret text, new_name text, new_description text, new_key_id uuid) TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE custom_oauth_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.custom_oauth_providers TO postgres;
GRANT ALL ON TABLE auth.custom_oauth_providers TO dashboard_user;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE oauth_authorizations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_authorizations TO postgres;
GRANT ALL ON TABLE auth.oauth_authorizations TO dashboard_user;


--
-- Name: TABLE oauth_client_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_client_states TO postgres;
GRANT ALL ON TABLE auth.oauth_client_states TO dashboard_user;


--
-- Name: TABLE oauth_clients; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_clients TO postgres;
GRANT ALL ON TABLE auth.oauth_clients TO dashboard_user;


--
-- Name: TABLE oauth_consents; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.oauth_consents TO postgres;
GRANT ALL ON TABLE auth.oauth_consents TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,MAINTAIN,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE webauthn_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_challenges TO postgres;
GRANT ALL ON TABLE auth.webauthn_challenges TO dashboard_user;


--
-- Name: TABLE webauthn_credentials; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.webauthn_credentials TO postgres;
GRANT ALL ON TABLE auth.webauthn_credentials TO dashboard_user;


--
-- Name: TABLE job; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT SELECT ON TABLE cron.job TO postgres WITH GRANT OPTION;


--
-- Name: TABLE job_run_details; Type: ACL; Schema: cron; Owner: supabase_admin
--

GRANT ALL ON TABLE cron.job_run_details TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements TO dashboard_user;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON TABLE extensions.pg_stat_statements_info FROM postgres;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE extensions.pg_stat_statements_info TO dashboard_user;


--
-- Name: TABLE announcements; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.announcements TO anon;
GRANT ALL ON TABLE public.announcements TO authenticated;
GRANT ALL ON TABLE public.announcements TO service_role;


--
-- Name: SEQUENCE announcements_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.announcements_id_seq TO anon;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.announcements_id_seq TO service_role;


--
-- Name: TABLE app_settings; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.app_settings TO anon;
GRANT ALL ON TABLE public.app_settings TO authenticated;
GRANT ALL ON TABLE public.app_settings TO service_role;


--
-- Name: SEQUENCE app_settings_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.app_settings_id_seq TO anon;
GRANT ALL ON SEQUENCE public.app_settings_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.app_settings_id_seq TO service_role;


--
-- Name: TABLE audit_logs; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.audit_logs TO anon;
GRANT ALL ON TABLE public.audit_logs TO authenticated;
GRANT ALL ON TABLE public.audit_logs TO service_role;


--
-- Name: SEQUENCE audit_logs_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO anon;
GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.audit_logs_id_seq TO service_role;


--
-- Name: TABLE complaint_attachments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.complaint_attachments TO anon;
GRANT ALL ON TABLE public.complaint_attachments TO authenticated;
GRANT ALL ON TABLE public.complaint_attachments TO service_role;


--
-- Name: SEQUENCE complaint_attachments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.complaint_attachments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.complaint_attachments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.complaint_attachments_id_seq TO service_role;


--
-- Name: TABLE complaint_recipients; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.complaint_recipients TO anon;
GRANT ALL ON TABLE public.complaint_recipients TO authenticated;
GRANT ALL ON TABLE public.complaint_recipients TO service_role;


--
-- Name: SEQUENCE complaint_recipients_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.complaint_recipients_id_seq TO anon;
GRANT ALL ON SEQUENCE public.complaint_recipients_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.complaint_recipients_id_seq TO service_role;


--
-- Name: TABLE complaint_replies; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.complaint_replies TO anon;
GRANT ALL ON TABLE public.complaint_replies TO authenticated;
GRANT ALL ON TABLE public.complaint_replies TO service_role;


--
-- Name: SEQUENCE complaint_replies_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.complaint_replies_id_seq TO anon;
GRANT ALL ON SEQUENCE public.complaint_replies_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.complaint_replies_id_seq TO service_role;


--
-- Name: TABLE complaints; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.complaints TO anon;
GRANT ALL ON TABLE public.complaints TO authenticated;
GRANT ALL ON TABLE public.complaints TO service_role;


--
-- Name: SEQUENCE complaints_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.complaints_id_seq TO anon;
GRANT ALL ON SEQUENCE public.complaints_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.complaints_id_seq TO service_role;


--
-- Name: TABLE departments; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.departments TO anon;
GRANT ALL ON TABLE public.departments TO authenticated;
GRANT ALL ON TABLE public.departments TO service_role;


--
-- Name: SEQUENCE departments_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.departments_id_seq TO anon;
GRANT ALL ON SEQUENCE public.departments_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.departments_id_seq TO service_role;


--
-- Name: TABLE designations; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.designations TO anon;
GRANT ALL ON TABLE public.designations TO authenticated;
GRANT ALL ON TABLE public.designations TO service_role;


--
-- Name: SEQUENCE designations_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.designations_id_seq TO anon;
GRANT ALL ON SEQUENCE public.designations_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.designations_id_seq TO service_role;


--
-- Name: TABLE leave_forms; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.leave_forms TO anon;
GRANT ALL ON TABLE public.leave_forms TO authenticated;
GRANT ALL ON TABLE public.leave_forms TO service_role;


--
-- Name: SEQUENCE leave_forms_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.leave_forms_id_seq TO anon;
GRANT ALL ON SEQUENCE public.leave_forms_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.leave_forms_id_seq TO service_role;


--
-- Name: TABLE leave_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.leave_requests TO anon;
GRANT ALL ON TABLE public.leave_requests TO authenticated;
GRANT ALL ON TABLE public.leave_requests TO service_role;


--
-- Name: SEQUENCE leave_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.leave_requests_id_seq TO anon;
GRANT ALL ON SEQUENCE public.leave_requests_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.leave_requests_id_seq TO service_role;


--
-- Name: TABLE leave_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.leave_types TO anon;
GRANT ALL ON TABLE public.leave_types TO authenticated;
GRANT ALL ON TABLE public.leave_types TO service_role;


--
-- Name: SEQUENCE leave_types_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.leave_types_id_seq TO anon;
GRANT ALL ON SEQUENCE public.leave_types_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.leave_types_id_seq TO service_role;


--
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- Name: SEQUENCE notifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.notifications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO service_role;


--
-- Name: TABLE profile_change_requests; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.profile_change_requests TO anon;
GRANT ALL ON TABLE public.profile_change_requests TO authenticated;
GRANT ALL ON TABLE public.profile_change_requests TO service_role;


--
-- Name: SEQUENCE profile_change_requests_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.profile_change_requests_id_seq TO anon;
GRANT ALL ON SEQUENCE public.profile_change_requests_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.profile_change_requests_id_seq TO service_role;


--
-- Name: TABLE role_privileges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.role_privileges TO anon;
GRANT ALL ON TABLE public.role_privileges TO authenticated;
GRANT ALL ON TABLE public.role_privileges TO service_role;


--
-- Name: SEQUENCE role_privileges_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.role_privileges_id_seq TO anon;
GRANT ALL ON SEQUENCE public.role_privileges_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.role_privileges_id_seq TO service_role;


--
-- Name: TABLE roles; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.roles TO anon;
GRANT ALL ON TABLE public.roles TO authenticated;
GRANT ALL ON TABLE public.roles TO service_role;


--
-- Name: SEQUENCE roles_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.roles_id_seq TO anon;
GRANT ALL ON SEQUENCE public.roles_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.roles_id_seq TO service_role;


--
-- Name: TABLE system_privilege_categories; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_privilege_categories TO anon;
GRANT ALL ON TABLE public.system_privilege_categories TO authenticated;
GRANT ALL ON TABLE public.system_privilege_categories TO service_role;


--
-- Name: SEQUENCE system_privilege_categories_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.system_privilege_categories_id_seq TO anon;
GRANT ALL ON SEQUENCE public.system_privilege_categories_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.system_privilege_categories_id_seq TO service_role;


--
-- Name: TABLE system_privileges; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_privileges TO anon;
GRANT ALL ON TABLE public.system_privileges TO authenticated;
GRANT ALL ON TABLE public.system_privileges TO service_role;


--
-- Name: SEQUENCE system_privileges_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.system_privileges_id_seq TO anon;
GRANT ALL ON SEQUENCE public.system_privileges_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.system_privileges_id_seq TO service_role;


--
-- Name: TABLE tasks; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;


--
-- Name: SEQUENCE tasks_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.tasks_id_seq TO anon;
GRANT ALL ON SEQUENCE public.tasks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.tasks_id_seq TO service_role;


--
-- Name: TABLE user_leave_balances; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.user_leave_balances TO anon;
GRANT ALL ON TABLE public.user_leave_balances TO authenticated;
GRANT ALL ON TABLE public.user_leave_balances TO service_role;


--
-- Name: SEQUENCE user_leave_balances_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.user_leave_balances_id_seq TO anon;
GRANT ALL ON SEQUENCE public.user_leave_balances_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.user_leave_balances_id_seq TO service_role;


--
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2026_08_13; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_13 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_13 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_14; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_14 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_14 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_15; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_15 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_15 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_16; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_16 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_16 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_17; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_17 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_17 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_18; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_18 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_18 TO dashboard_user;


--
-- Name: TABLE messages_2026_08_19; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages_2026_08_19 TO postgres;
GRANT ALL ON TABLE realtime.messages_2026_08_19 TO dashboard_user;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.buckets FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.buckets TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO postgres WITH GRANT OPTION;


--
-- Name: TABLE buckets_analytics; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets_analytics TO service_role;
GRANT ALL ON TABLE storage.buckets_analytics TO authenticated;
GRANT ALL ON TABLE storage.buckets_analytics TO anon;


--
-- Name: TABLE buckets_vectors; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.buckets_vectors TO service_role;
GRANT SELECT ON TABLE storage.buckets_vectors TO authenticated;
GRANT SELECT ON TABLE storage.buckets_vectors TO anon;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

REVOKE ALL ON TABLE storage.objects FROM supabase_storage_admin;
GRANT ALL ON TABLE storage.objects TO supabase_storage_admin WITH GRANT OPTION;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO postgres WITH GRANT OPTION;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE vector_indexes; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT SELECT ON TABLE storage.vector_indexes TO service_role;
GRANT SELECT ON TABLE storage.vector_indexes TO authenticated;
GRANT SELECT ON TABLE storage.vector_indexes TO anon;


--
-- Name: TABLE secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.secrets TO service_role;


--
-- Name: TABLE decrypted_secrets; Type: ACL; Schema: vault; Owner: supabase_admin
--

GRANT SELECT,REFERENCES,DELETE,TRUNCATE ON TABLE vault.decrypted_secrets TO postgres WITH GRANT OPTION;
GRANT SELECT,DELETE ON TABLE vault.decrypted_secrets TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: cron; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA cron GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES TO service_role;


--
-- Name: ensure_rls; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER ensure_rls ON ddl_command_end
         WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
   EXECUTE FUNCTION public.rls_auto_enable();


ALTER EVENT TRIGGER ensure_rls OWNER TO postgres;

--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO supabase_admin;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict N3ipNrDOdqk24FcbF0votRqUlsWEXjJaa4iKdz7sNwfrvkl9iMQrgDRT0mnYMs7

