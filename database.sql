--
-- PostgreSQL database dump
--

\restrict GUkXUFSUMsIfWlickkjnmGDwpzRaaCXhi1COOfLRM5FVqW2gjImJrboS9E3kFoJ

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA public;


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- Name: extract_nic_details(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: notify_coverage_officer(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: notify_leave_final_status(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: notify_subject_officer_on_leave(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: rls_auto_enable(); Type: FUNCTION; Schema: public; Owner: -
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


--
-- Name: validate_new_leave_request(); Type: FUNCTION; Schema: public; Owner: -
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


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: announcements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.announcements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: announcements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.announcements_id_seq OWNED BY public.announcements.id;


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    id bigint NOT NULL,
    maintenance_mode boolean DEFAULT false NOT NULL,
    latest_version text DEFAULT '1.0.0'::text
);


--
-- Name: app_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: complaint_attachments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: complaint_attachments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: complaint_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_recipients (
    id bigint NOT NULL,
    complaint_id integer NOT NULL,
    recipient_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: complaint_recipients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
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
-- Name: complaint_replies; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: complaint_replies_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaint_replies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaint_replies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaint_replies_id_seq OWNED BY public.complaint_replies.id;


--
-- Name: complaints; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaints (
    id integer NOT NULL,
    user_id uuid,
    department_id integer,
    title character varying(200) NOT NULL,
    description text NOT NULL,
    status character varying(20) DEFAULT 'Open'::character varying,
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
    CONSTRAINT complaints_status_check CHECK (((status)::text = ANY ((ARRAY['Open'::character varying, 'In Progress'::character varying, 'Resolved'::character varying, 'Closed'::character varying])::text[])))
);


--
-- Name: complaints_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.complaints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: complaints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.complaints_id_seq OWNED BY public.complaints.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    department_id integer NOT NULL,
    designation_en character varying(100) NOT NULL,
    designation_si character varying(100) NOT NULL,
    designation_ta character varying(100) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: leave_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_forms (
    id integer NOT NULL,
    leave_request_id integer,
    form_details text,
    digital_signature text,
    submitted_at timestamp without time zone DEFAULT now()
);


--
-- Name: leave_forms_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_forms_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_forms_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_forms_id_seq OWNED BY public.leave_forms.id;


--
-- Name: leave_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: leave_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_requests_id_seq OWNED BY public.leave_requests.id;


--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    name_en character varying(50) NOT NULL,
    max_days integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    name_si character varying,
    name_ta character varying
);


--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: profile_change_requests; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_change_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_change_requests_id_seq OWNED BY public.profile_change_requests.id;


--
-- Name: role_privileges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.role_privileges (
    id integer NOT NULL,
    role_id integer,
    privilege_id integer,
    is_enabled boolean DEFAULT false,
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: role_privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.role_privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: role_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.role_privileges_id_seq OWNED BY public.role_privileges.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    role_name_si character varying(255),
    role_name_ta character varying(255)
);


--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: system_privilege_categories; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_privilege_categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_privilege_categories_id_seq OWNED BY public.system_privilege_categories.id;


--
-- Name: system_privileges; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: system_privileges_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.system_privileges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: system_privileges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.system_privileges_id_seq OWNED BY public.system_privileges.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: user_leave_balances; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.user_leave_balances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.user_leave_balances_id_seq OWNED BY public.user_leave_balances.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
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


--
-- Name: COLUMN users.nic; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.nic IS '[SENSITIVE]';


--
-- Name: announcements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements ALTER COLUMN id SET DEFAULT nextval('public.announcements_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: complaint_replies id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_replies ALTER COLUMN id SET DEFAULT nextval('public.complaint_replies_id_seq'::regclass);


--
-- Name: complaints id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints ALTER COLUMN id SET DEFAULT nextval('public.complaints_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: leave_forms id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_forms ALTER COLUMN id SET DEFAULT nextval('public.leave_forms_id_seq'::regclass);


--
-- Name: leave_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests ALTER COLUMN id SET DEFAULT nextval('public.leave_requests_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: profile_change_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_change_requests ALTER COLUMN id SET DEFAULT nextval('public.profile_change_requests_id_seq'::regclass);


--
-- Name: role_privileges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_privileges ALTER COLUMN id SET DEFAULT nextval('public.role_privileges_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: system_privilege_categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privilege_categories ALTER COLUMN id SET DEFAULT nextval('public.system_privilege_categories_id_seq'::regclass);


--
-- Name: system_privileges id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privileges ALTER COLUMN id SET DEFAULT nextval('public.system_privileges_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: user_leave_balances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_leave_balances ALTER COLUMN id SET DEFAULT nextval('public.user_leave_balances_id_seq'::regclass);


--
-- Data for Name: announcements; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.announcements (id, title, message, department_id, created_by, created_at, scheduled_at, expires_at, is_archived, priority, title_en, title_si, title_ta, message_en, message_si, message_ta, updated_at) FROM stdin;
20	Chairman	Hello	\N	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-10 14:53:15.882+00	2026-08-10 14:53:15.882+00	2026-08-10 16:55:00+00	f	Medium	Chairman	Chairman	Chairman	Hello	ආයුබෝවන්	வணக்கம்	\N
21	C	hha	\N	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 08:00:39.074+00	2026-08-11 08:00:39.074+00	2026-08-11 08:02:00+00	f	Medium	C	C	C	hha	hha	hha	\N
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (id, maintenance_mode, latest_version) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, user_id, action, entity_type, entity_id, old_value, new_value, ip_address, created_at) FROM stdin;
69	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	c9f7a318-d3f1-4433-9511-48d0a825e31c	\N	{"title":"Mr","full_name":"Shamindu Dewranga","email":"dewrangashamindu17@gmail.com","assigned_to":"Shamindu Dewranga"}	\N	2026-08-09 13:02:33.35+00
70	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	\N	{"title":"Mr","full_name":"Dulmini Gamlath","email":"dulminikumari2002@gmail.com","assigned_to":"Dulmini Gamlath"}	\N	2026-08-09 13:05:00.82+00
71	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	f23bc81d-73d8-40fc-88c9-c9d67aedca6c	\N	{"title":"Ms","full_name":"Lakshmi Dharmarathne","email":"lakshmidharmarathna@gmail.com","assigned_to":"Lakshmi Dharmarathne"}	\N	2026-08-09 13:07:49.26+00
72	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	47	\N	\N	\N	2026-08-09 13:18:29.584+00
73	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	47	\N	\N	\N	2026-08-09 13:27:14.028+00
74	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	47	\N	\N	\N	2026-08-09 13:27:44.574+00
75	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	48	\N	\N	\N	2026-08-09 14:13:19.169+00
76	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	48	\N	\N	\N	2026-08-09 14:14:10.679+00
77	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	48	\N	\N	\N	2026-08-09 14:14:38.365+00
78	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	49	\N	\N	\N	2026-08-09 14:20:31.959+00
79	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	49	\N	\N	\N	2026-08-09 14:21:00.636+00
80	cc3b3ba4-b678-4d45-8916-ef86f535abd0	LEAVE_REJECTED	leave_requests	49	\N	\N	\N	2026-08-09 14:21:48.959+00
81	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	50	\N	\N	\N	2026-08-09 14:30:54.107+00
82	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	50	\N	\N	\N	2026-08-09 14:31:11.111+00
83	cc3b3ba4-b678-4d45-8916-ef86f535abd0	LEAVE_REJECTED	leave_requests	50	\N	\N	\N	2026-08-09 14:31:48.694+00
84	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	11	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-09 14:35:45.252+00
85	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	11	{"status":"In Progress"}	{"status":"Resolved"}	\N	2026-08-09 14:35:58.542+00
86	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	11	{"status":"Resolved"}	{"status":"Closed"}	\N	2026-08-09 14:36:11.343+00
87	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	12	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-09 14:38:13.783+00
88	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	12	{"status":"In Progress"}	{"status":"Resolved"}	\N	2026-08-09 14:39:06.26+00
89	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	12	{"status":"Resolved"}	{"status":"Closed"}	\N	2026-08-09 14:40:00.575+00
90	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	12	\N	{"title":"New Library Building Proposal","assigned_to":"Shamindu Dewranga","due_date":"2026-08-10"}	\N	2026-08-09 14:42:13.14+00
91	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	13	\N	{"title":"hjhg","assigned_to":"Shamindu Dewranga","due_date":"2026-08-11"}	\N	2026-08-09 14:47:21.65+00
92	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	14	\N	{"title":"ghhh","assigned_to":"Shamindu Dewranga","due_date":"2026-08-11"}	\N	2026-08-09 14:48:04.437+00
93	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	15	\N	{"title":"Secretary","message":"ggggggg","title_en":"Secretary","title_si":"ලේකම්","title_ta":"செயலாளர்","department_id":"4"}	\N	2026-08-09 14:49:31.536+00
94	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	16	\N	{"title":"Secretary","message":"hh","title_en":"Secretary","title_si":"ලේකම්","title_ta":"செயலாளர்","department_id":"6"}	\N	2026-08-09 14:50:30.858+00
95	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	17	\N	{"title":"chairman","message":"title","title_en":"chairman","title_si":"chairman","title_ta":"chairman","department_id":null}	\N	2026-08-09 14:51:30.462+00
96	d3d6bd6d-210d-477e-b877-d3c1176254e1	APPROVE_PROFILE_REQUEST	profile_change_requests	22	\N	\N	\N	2026-08-09 14:52:46.489995+00
97	d3d6bd6d-210d-477e-b877-d3c1176254e1	REJECT_PROFILE_REQUEST	profile_change_requests	23	\N	\N	\N	2026-08-09 14:54:24.196656+00
98	d3d6bd6d-210d-477e-b877-d3c1176254e1	APPROVE_PROFILE_REQUEST	profile_change_requests	24	\N	\N	\N	2026-08-09 18:00:46.551661+00
99	cf50617c-2fb4-4a31-a525-3d7164d036a5	LEAVE_REJECTED	leave_requests	51	\N	\N	\N	2026-08-09 18:17:02.559+00
100	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	aeaaa2b7-65d9-4590-9cda-80447216bf62	\N	{"title":"Ms","full_name":"Amavi Chandrakumara","email":"bbcnew16@gmail.com"}	\N	2026-08-09 18:44:46.53+00
101	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	ac2347dd-63ef-4596-aa07-8219ce3ca093	\N	{"title":"Mr","full_name":"Amavi","email":"bbcnew16@gmail.com"}	\N	2026-08-09 18:51:36.646+00
102	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	18	\N	{"title":"Chairman","message":"ggg","title_en":"Chairman","title_si":"Chairman","title_ta":"Chairman","department_id":null}	\N	2026-08-09 19:46:48.653+00
103	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	19	\N	{"title":"hh","message":"hh","title_en":"hh","title_si":"hh","title_ta":"hh","department_id":null}	\N	2026-08-09 19:48:27.66+00
104	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	52	\N	\N	\N	2026-08-09 19:55:02.957+00
105	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	52	\N	\N	\N	2026-08-09 19:55:30.572+00
106	cc3b3ba4-b678-4d45-8916-ef86f535abd0	LEAVE_REJECTED	leave_requests	52	\N	\N	\N	2026-08-09 19:56:07.876+00
107	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	53	\N	\N	\N	2026-08-09 19:58:33.6+00
108	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	53	\N	\N	\N	2026-08-09 19:59:06.137+00
109	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	53	\N	\N	\N	2026-08-09 19:59:52.965+00
110	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	54	\N	\N	\N	2026-08-09 20:05:12.067+00
111	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	54	\N	\N	\N	2026-08-09 20:06:09.516+00
112	cc3b3ba4-b678-4d45-8916-ef86f535abd0	SECRETARY_APPROVED	leave_requests	54	\N	\N	\N	2026-08-09 20:06:33.877+00
113	cf50617c-2fb4-4a31-a525-3d7164d036a5	SUBJECT_APPROVED	leave_requests	55	\N	\N	\N	2026-08-09 20:08:53.271+00
114	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	CC_APPROVED	leave_requests	55	\N	\N	\N	2026-08-09 20:09:16.669+00
115	cc3b3ba4-b678-4d45-8916-ef86f535abd0	LEAVE_REJECTED	leave_requests	55	\N	\N	\N	2026-08-09 20:09:41.345+00
116	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	297e22da-ddf4-4964-8452-6fee8738b1cb	\N	{"title":"Mrs","full_name":"Hansika Samnathi","email":"hansika@edu.lnbti.lk"}	\N	2026-08-10 08:19:04.447+00
117	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	20	\N	{"title":"Chairman","message":"Hello","title_en":"Chairman","title_si":"Chairman","title_ta":"Chairman","department_id":null}	\N	2026-08-10 14:53:16.433+00
118	cf50617c-2fb4-4a31-a525-3d7164d036a5	STAFF_REGISTERED	users	7f22da36-c2b9-4f8c-8c90-55e27c11543b	\N	{"title":"Ms","full_name":"Anshya","email":"anshyajayarathna2003@gmail.com"}	\N	2026-08-11 04:36:44.444+00
144	2ace860d-4275-49eb-b92c-4dc932dd2c45	ANNOUNCEMENT_CREATED	announcements	21	\N	{"title":"C","message":"hha","title_en":"C","title_si":"C","title_ta":"C","department_id":null}	\N	2026-08-11 08:00:39.558+00
176	2ace860d-4275-49eb-b92c-4dc932dd2c45	ASSIGN_TASK	tasks	15	\N	{"title":"bh","assigned_to":"S.T.S.D Chandrakumara","due_date":"2026-08-12"}	\N	2026-08-11 15:10:20.763+00
177	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	13	{"status":"Open"}	{"status":"In Progress"}	\N	2026-08-11 15:16:30.463+00
178	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	13	{"status":"In Progress"}	{"status":"Resolved"}	\N	2026-08-11 15:16:44.256+00
179	2ace860d-4275-49eb-b92c-4dc932dd2c45	COMPLAINT_STATUS_UPDATED	complaints	13	{"status":"Resolved"}	{"status":"Closed"}	\N	2026-08-11 15:16:50.641+00
\.


--
-- Data for Name: complaint_attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint_attachments (id, complaint_id, uploaded_by, file_name, file_type, mime_type, storage_path, public_url, file_size, created_at) FROM stdin;
7	11	c9f7a318-d3f1-4433-9511-48d0a825e31c	IMG_4479.jpg	photo	image/jpeg	c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285926868-ylfhv1fr02-IMG_4479.jpg	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/complaint-files/c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285926868-ylfhv1fr02-IMG_4479.jpg	174260	2026-08-09 14:32:08.815+00
8	11	c9f7a318-d3f1-4433-9511-48d0a825e31c	JASPER_2026_Poster Template.docx	document	application/vnd.openxmlformats-officedocument.wordprocessingml.document	c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285929024-qiyoali2i7-JASPER_2026_Poster-Template.docx	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/complaint-files/c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285929024-qiyoali2i7-JASPER_2026_Poster-Template.docx	1635742	2026-08-09 14:32:32.3+00
\.


--
-- Data for Name: complaint_recipients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint_recipients (id, complaint_id, recipient_id, created_at) FROM stdin;
12	11	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:32:06.367+00
13	12	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:37:37.578+00
14	13	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 07:46:16.912+00
\.


--
-- Data for Name: complaint_replies; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint_replies (id, complaint_id, replied_by, reply_message, created_at, reply_message_en, reply_message_si, reply_message_ta) FROM stdin;
3	11	2ace860d-4275-49eb-b92c-4dc932dd2c45	Repair Started	2026-08-09 14:35:44.286+00	Repair Started	අලුත්වැඩියාව ආරම්භ කරන ලදී	பழுதுபார்ப்பு தொடங்கப்பட்டது
4	12	2ace860d-4275-49eb-b92c-4dc932dd2c45	Gave money	2026-08-09 14:38:13.083+00	Gave money	සල්ලි දුන්නා	பணம் கொடுத்தார்
5	12	2ace860d-4275-49eb-b92c-4dc932dd2c45	Books will be received by the date	2026-08-09 14:39:05.539+00	Books will be received by the date	දිනයට පොත් ලැබෙනු ඇත	திகதிக்குள் புத்தகங்கள் கிடைக்கும்
6	12	2ace860d-4275-49eb-b92c-4dc932dd2c45	Complain done...!	2026-08-09 14:39:59.971+00	Complain done...!	Complain done...!	Complain done...!
\.


--
-- Data for Name: complaints; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaints (id, user_id, department_id, title, description, status, assigned_supervisor_id, created_at, updated_at, category, attachment_url, signature_url, title_en, title_si, title_ta, description_en, description_si, description_ta) FROM stdin;
13	c9f7a318-d3f1-4433-9511-48d0a825e31c	6	කැඩුණු / බිඳුණු භාණ්ඩ	[භාණ්ඩ වර්ගය: Putuwa]\n[කැඩී ඇති ප්‍රමාණය: 3]\n\nPutu 3 kedila	Closed	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 07:46:16.912+00	2026-08-11 15:16:50.223+00	damaged	\N	\N	Damaged Items	කැඩුණු / බිඳුණු භාණ්ඩ	சேதமடைந்த பொருட்கள்	\N	[භාණ්ඩ වර්ගය: Putuwa]\n[කැඩී ඇති ප්‍රමාණය: 3]\n\nPutu 3 kedila	\N
11	c9f7a318-d3f1-4433-9511-48d0a825e31c	6	කැඩුණු / බිඳුණු භාණ්ඩ	ජනේලයක් කැඩී ඇත	Closed	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:32:06.367+00	2026-08-09 14:36:10.989+00	damaged	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/complaint-files/c9f7a318-d3f1-4433-9511-48d0a825e31c/11/1786285926868-ylfhv1fr02-IMG_4479.jpg	\N	\N	කැඩුණු / බිඳුණු භාණ්ඩ	\N	\N	ජනේලයක් කැඩී ඇත	\N
12	c9f7a318-d3f1-4433-9511-48d0a825e31c	6	භාණ්ඩ හිඟයක් / ඉල්ලීමක්	පොත් 100 ගේන්න ඕන	Closed	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:37:37.578+00	2026-08-09 14:39:53.465+00	shortage	\N	\N	\N	භාණ්ඩ හිඟයක් / ඉල්ලීමක්	\N	\N	පොත් 100 ගේන්න ඕන	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.departments (id, department_name, department_type, description, created_at, image_url, department_name_si, department_name_ta) FROM stdin;
1	General Administration & Staff Services	Regular	වැඩසටහන් අංක 01 - සාමාන්‍ය පරිපාලනය හා කාර්ය මණ්ඩල සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/administration.jpg	සාමාන්‍ය පරිපාලනය හා කාර්ය මණ්ඩල සේවා	பொது நிர்வாகம் மற்றும் பணியாளர் சேவைகள்
2	Public Health Services	Regular	වැඩසටහන් අංක 02 - සෞඛ්‍ය සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/public_health.jpg	සෞඛ්‍ය සේවා	சுகாதார சேவைகள்
3	Physical Planning, Roads, Lands & Buildings	Regular	වැඩසටහන් අංක 03 - භෞතික සැලසුම්, මාවත්, ඉඩම් හා ගොඩනැගිලි	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/engineering.jpg	භෞතික සැලසුම්, මාවත්, ඉඩම් හා ගොඩනැගිලි	பௌதிக திட்டமிடல், சாலைகள், நிலங்கள் மற்றும் கட்டிடங்கள்
5	Public Utility Services	Regular	වැඩසටහන් අංක 05 - පොදු උපයෝගී සේවා	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/environment_welfare.jpg	පොදු උපයෝගී සේවා	பொது பயன்பாட்டு சேவைகள்
6	Development & Economic Affairs	Regular	සංවර්ධන හා ආර්ථික කටයුතු දෙපාර්තමේන්තුව	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/development_planning.jpg	සංවර්ධන හා ආර්ථික කටයුතු	அபிவிருத்தி மற்றும் பொருளாதார விவகாரங்கள்
4	Community Services (Library & Preschool)	Library	වැඩසටහන් අංක 06 - ප්‍රජා සේවා (පුස්තකාල හා ප්‍රාථමික අධ්‍යාපන)	2026-07-25 15:46:49.960686	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/Departments/library.jpg	ප්‍රජා සේවා (පුස්තකාල හා ප්‍රාථමික අධ්‍යාපන)	சமூக சேவைகள் (நூலகம் மற்றும் முன்பள்ளி)
10	Technical Service	Regular	Technical	2026-08-11 04:18:25.614253	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR7F6igBR7Enhhmx1G_r97M_Vr_kI610lkfEVKyefNog&s=10	තාක්ෂණික සේවා	தொழில்நுட்ப சேவை
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: -
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
21	10	Technical Officer	තාක්ෂණික නිලධාරී	தொழில்நுட்ப அதிகாரி	2026-08-11 04:18:26.134383
\.


--
-- Data for Name: leave_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_forms (id, leave_request_id, form_details, digital_signature, submitted_at) FROM stdin;
55	55	{"officer":{"user_id":"ac2347dd-63ef-4596-aa07-8219ce3ca093","name":"Mr. Amavi","designation":"සංවර්ධන නිලධාරී","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"අනියම් නිවාඩු","type_key":"casual","start_date":"2026-08-25","end_date":"2026-08-25","no_of_days":1,"duration":"සම්පූර්ණ දිනය","time_range":null,"reason":"පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","officer_name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක"},"status":"Pending","language":"si"}	{"paths":["M 193.125 138.75 L 191.3834228515625 137.00843811035156 L 185.16111755371094 133.02406311035156 L 172.3919219970703 123.64192962646484 L 169.12490844726562 111.25022888183594 L 180.1168212890625 90.34011840820312 L 219.1458740234375 63.98683547973633 L 242.724853515625 58.560028076171875 L 278.0982971191406 64.04914855957031 L 291.0023193359375 82.48414611816406 L 291.3919372558594 99.7457504272461 L 286.8289794921875 114.65774536132812 L 275.7803039550781 134.34542846679688 L 261.0780029296875 155.08743286132812 L 235.1040496826172 189.44461059570312 L 233.75 191.25","M 207.5 56.875 L 209.1031494140625 58.478145599365234 L 214.11585998535156 66.17379760742188 L 233.7842559814453 102.56851196289062 L 243.8669891357422 123.21735382080078 L 262.8999328613281 163.9832305908203 L 272.07781982421875 191.99920654296875 L 275 198.75","M 210.625 153.75 L 210 148.82354736328125 L 211.58645629882812 139.9041748046875 L 222.20314025878906 120.92185974121094 L 229.6326446533203 114.94205474853516 L 243.16030883789062 113.45516204833984 L 262.78375244140625 126.53373718261719 L 268.1414489746094 132.36434936523438 L 278.1862487792969 135.625 L 295.43701171875 120.81298828125 L 310.6080627441406 103.91246795654297 L 319.7940673828125 92.70591735839844 L 342.4113464355469 68.21365356445312 L 351.04827880859375 59.43891525268555 L 358.4649353027344 51.535072326660156 L 357.63641357421875 49.51143264770508 L 326.23748779296875 48.125 L 277.03961181640625 45.77302932739258 L 257.6731872558594 45.47870635986328 L 239.0277099609375 46.11114501953125 L 237.64222717285156 46.73276901245117 L 238.05433654785156 47.4293327331543 L 241.7640838623047 50.661277770996094 L 269.0150146484375 81.28038024902344 L 278.02496337890625 95.56995391845703 L 296.8698425292969 141.44630432128906 L 310.0548095703125 183.14697265625 L 310.625 185"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 20:08:23.999
47	47	{"officer":{"user_id":"c9f7a318-d3f1-4433-9511-48d0a825e31c","name":"Mr. Shamindu Dewranga","designation":"සංවර්ධන නිලධාරී","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"අනියම් නිවාඩු","type_key":"casual","start_date":"2026-07-01","end_date":"2026-07-01","no_of_days":1,"duration":"සම්පූර්ණ දිනය","time_range":null,"reason":"අසනීපයක් නිසා නිවාඩු අවශ්‍යයි","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","officer_name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක"},"status":"Pending","language":"si"}	{"paths":["M 170.66666730244953 75.33333333333331 L 167.66666730244953 73.33333333333331 L 151.3333339691162 70.66666666666663 L 132.66666730244953 75 L 117.66666730244953 80.33333333333331 L 108.66666730244953 88.33333333333331 L 107.66666730244953 97 L 111.33333396911621 104.66666666666663 L 124.00000063578287 110.33333333333331 L 142.00000063578287 116.33333333333331 L 162.3333339691162 124 L 179.3333339691162 132.66666666666663 L 188.66666730244953 140.33333333333331 L 189.3333339691162 148 L 182.66666730244953 155.33333333333331 L 171.66666730244953 161.66666666666663 L 161.66666730244953 165.66666666666663 L 153.00000063578287 167 L 146.3333339691162 166 L 143.00000063578287 154 L 143.00000063578287 135 L 144.3333339691162 113.33333333333331 L 150.3333339691162 92.66666666666663 L 155.66666730244953 74 L 161.3333339691162 57 L 164.66666730244953 44.333333333333314 L 164.66666730244953 36 L 163.3333339691162 32 L 161.00000063578287 31 L 160.66666730244953 31.333333333333314 L 160.66666730244953 37.333333333333314 L 160.66666730244953 49.333333333333314 L 160.66666730244953 66 L 162.00000063578287 88.33333333333331 L 166.00000063578287 115.33333333333331 L 172.3333339691162 144.33333333333331 L 180.66666730244953 172.66666666666663 L 189.66666730244953 198 L 203.00000063578287 218.33333333333331 L 207.00000063578287 223.33333333333331"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 13:17:00.136
49	49	{"officer":{"user_id":"c9f7a318-d3f1-4433-9511-48d0a825e31c","name":"Mr. Shamindu Dewranga","designation":"සංවර්ධන නිලධාරී","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"වෛද්‍ය නිවාඩු","type_key":"medical","start_date":"2026-08-13","end_date":"2026-08-17","no_of_days":3,"duration":"3 දින","reason":"ඩෙංගු හෝ බරපතල වෛරස් උණ තත්ත්වයක් හේතුවෙන් ප්‍රතිකාර සහ විවේකය ලබා ගැනීමට.","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","officer_name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක"},"attachments":[{"fileName":"CA3B1298-19A6-4B7E-B34A-46501CCA8E81.jpg","storagePath":"c9f7a318-d3f1-4433-9511-48d0a825e31c/49/1786285202397_0_CA3B1298-19A6-4B7E-B34A-46501CCA8E81.jpg","mimeType":"image/jpeg","size":902264}],"status":"Pending","language":"si"}	{"paths":["M 213.3333339691162 94 L 211.00000063578287 94.66666666666663 L 200.3333339691162 99.66666666666663 L 191.66666730244953 103 L 182.66666730244953 107.33333333333331 L 173.66666730244953 110.66666666666663 L 168.66666730244953 113.66666666666663 L 168.3333339691162 115.66666666666663 L 169.3333339691162 118 L 177.66666730244953 121 L 189.3333339691162 124 L 205.00000063578287 127 L 221.00000063578284 131.66666666666663 L 234.66666730244953 137.66666666666663 L 240.3333339691162 146.66666666666663 L 238.3333339691162 157.66666666666663 L 222.66666730244953 168.66666666666663 L 196.66666730244953 180.66666666666663 L 171.66666730244953 191.66666666666663 L 163.3333339691162 192 L 163.3333339691162 180.66666666666663 L 163.3333339691162 164.33333333333331 L 163.3333339691162 146.33333333333331 L 163.3333339691162 126.33333333333331 L 164.66666730244953 106.33333333333331 L 169.3333339691162 86.33333333333331 L 177.3333339691162 67.66666666666663 L 190.3333339691162 47 L 202.66666730244953 26.66666666666663 L 207.00000063578287 13.666666666666629 L 207.00000063578287 11 L 207.00000063578287 11.666666666666629 L 207.00000063578287 17.66666666666663 L 209.66666730244953 29.333333333333314 L 218.00000063578287 50.333333333333314 L 227.66666730244953 84 L 234.3333339691162 131 L 236.00000063578284 192.66666666666663 L 229.00000063578284 273 L 224.00000063578284 296"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 14:20:13.177
51	51	{"officer":{"user_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"අනියම් නිවාඩු","type_key":"casual","start_date":"2026-08-21","end_date":"2026-08-21","no_of_days":1,"duration":"සම්පූර්ණ දිනය","time_range":null,"reason":"පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"c9f7a318-d3f1-4433-9511-48d0a825e31c","officer_name":"Mr. Shamindu Dewranga","designation":"සංවර්ධන නිලධාරී"},"status":"Pending","language":"si"}	{"paths":["M 94.375 151.875 L 94.375 143.5393829345703 L 106.19064331054688 106.30935668945312 L 121.54324340820312 90.22632598876953 L 145.83200073242188 72.85961151123047 L 195.9909210205078 61.546688079833984 L 212.8116455078125 72.78568267822266 L 223.12950134277344 96.48239135742188 L 213.30577087402344 125.59978485107422 L 189.99008178710938 164.70237731933594 L 173.64599609375 185.80909729003906 L 147.3943634033203 212.47576904296875 L 146.875 213.125","M 126.25 43.125 L 131.68801879882812 48.56302261352539 L 140.318359375 63.25315475463867 L 150.1882781982422 84.63356018066406 L 169.1613311767578 134.4788360595703 L 177.8933563232422 157.1721649169922 L 186.58628845214844 175.6725616455078 L 199.06195068359375 205.53492736816406 L 215 233.125"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 18:01:31.731
52	52	{"officer":{"user_id":"ac2347dd-63ef-4596-aa07-8219ce3ca093","name":"Mr. Amavi","designation":"සංවර්ධන නිලධාරී","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"අනියම් නිවාඩු","type_key":"casual","start_date":"2026-08-14","end_date":"2026-08-14","no_of_days":1,"duration":"සම්පූර්ණ දිනය","time_range":null,"reason":"පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","officer_name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක"},"status":"Pending","language":"si"}	{"paths":["M 105 135.625 L 111.44662475585938 127.4350357055664 L 121.26485443115234 118.32344055175781 L 136.56594848632812 107.5604248046875 L 172.63571166992188 88.4457015991211 L 189.8258819580078 84.04273986816406 L 207.4791717529297 86.69269561767578 L 208.27105712890625 95.56049346923828 L 189.8079833984375 125.05203247070312 L 175.94183349609375 142.380859375 L 150.04180908203125 172.17112731933594 L 139.3023223876953 182.57266235351562 L 132.5 188.75","M 220.625 116.25 L 219.50030517578125 115.625 L 215.5077667236328 116.62109375 L 195.63479614257812 131.2401885986328 L 185.92527770996094 143.05320739746094 L 177.63568115234375 154.982177734375 L 173.125 174.18121337890625 L 174.73318481445312 176.6082000732422 L 193.19300842285156 179.51400756835938 L 213.22898864746094 175.53245544433594 L 252.5009002685547 168.39271545410156 L 267.7059326171875 166.875 L 284.855224609375 171.41314697265625 L 287.8507080078125 174.5885772705078 L 286.39556884765625 182.20889282226562 L 281.2995910644531 189.05555725097656 L 268.66552734375 203.6993408203125 L 263.056640625 209.92919921875 L 256.3893737792969 217.7069091796875 L 255.14337158203125 219.71324157714844 L 254.375 220.9375 L 255.48561096191406 220 L 255.625 220","M 161.875 62.5 L 162.8343505859375 65.66871643066406 L 171.1700439453125 79.88006591796875 L 194.41409301757812 113.75843048095703 L 227.0048065185547 164.54661560058594 L 242.14804077148438 190.321533203125 L 266.34918212890625 231.25491333007812 L 302.8839111328125 334.32586669921875 L 297.5 20.625"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 19:04:09.758
54	54	{"officer":{"user_id":"18ba6a00-b287-4c42-9d84-a99f7b12ddd4","name":"Mr. Dulmini Gamlath","designation":"ආර්ථික පර්යේෂණ සහායක","department":"සංවර්ධන හා ආර්ථික කටයුතු"},"leave":{"type":"අනියම් නිවාඩු","type_key":"casual","start_date":"2026-08-21","end_date":"2026-08-21","no_of_days":1,"duration":"සම්පූර්ණ දිනය","time_range":null,"reason":"පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.","applied_date":"2026-08-09"},"duty_coverage":{"officer_id":"ac2347dd-63ef-4596-aa07-8219ce3ca093","officer_name":"Mr. Amavi","designation":"සංවර්ධන නිලධාරී"},"status":"Pending","language":"si"}	{"paths":["M 132.5 151.25 L 131.875 147.4999237060547 L 139.3929443359375 117.30113983154297 L 151.9039306640625 103.10569763183594 L 192.4453582763672 81.23435974121094 L 214.49722290039062 78.75 L 244.79013061523438 90.29586791992188 L 247.9923858642578 102.29114532470703 L 229.7345733642578 137.71975708007812 L 212.02052307128906 157.8447723388672 L 176.71920776367188 187.46058654785156 L 166.875 195","M 150 55.625 L 151.6032257080078 58.83146286010742 L 153.75 63.75 L 397.5 672.5","M 161.63803100585938 89.14546966552734 L 178.2278594970703 136.02554321289062 L 196.3382110595703 180.17642211914062 L 205.14620971679688 197.7924346923828 L 212.22471618652344 212.0994873046875 L 217.5110626220703 222.52212524414062 L 220.625 228.75","M 208.125 138.125 L 207.5 136.40792846679688 L 206.875 135.1636505126953 L 206.25 133.28707885742188 L 206.7406768798828 132.00930786132812 L 215.14093017578125 137.77957153320312 L 229.3407745361328 153.93165588378906 L 252.43482971191406 173.79046630859375 L 265.2015380859375 166.95574951171875 L 283.2608642578125 136.81048583984375 L 301.99169921875 104.19998168945312 L 317.8651428222656 83.86238098144531 L 329.77215576171875 76.39213562011719 L 337.21636962890625 76.25 L 337.1875 75 L 319.959228515625 69.31436157226562 L 298.5955505371094 64.37538146972656 L 248.3943328857422 57.15192794799805 L 224.34500122070312 54.51221466064453 L 190.10626220703125 48.900699615478516 L 181.8064422607422 45.4173469543457 L 178.4693145751953 38.5460090637207 L 185.7488250732422 30.84463119506836 L 195.5810089111328 23.84387969970703 L 214.6406707763672 19.718761444091797 L 231.04110717773438 36.642723083496094 L 239.14785766601562 54.11964416503906 L 254.75965881347656 100.38475036621094 L 267.4226989746094 145.59677124023438 L 272.6062316894531 163.3140106201172 L 284.1336975097656 187.73928833007812 L 288.75 197.5"],"strokeColor":"#7A1020","strokeWidth":4.5}	2026-08-09 20:04:25.66
\.


--
-- Data for Name: leave_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_requests (id, user_id, leave_type_id, start_date, end_date, no_of_days, reason, status, supervisor_id, supervisor_remark, created_at, updated_at, admin_approved_at, admin_approved_by, final_approved_at, final_approved_by, approval_stage, attachment_url, reason_en, reason_si, reason_ta, supervisor_remark_en, supervisor_remark_si, supervisor_remark_ta, coverage_officer_id, cc_approved_at, cc_approved_by, subject_signature, cc_signature, secretary_signature, chairman_signature) FROM stdin;
47	c9f7a318-d3f1-4433-9511-48d0a825e31c	11	2026-07-01	2026-07-01	1	අසනීපයක් නිසා නිවාඩු අවශ්‍යයි	Approved	cc3b3ba4-b678-4d45-8916-ef86f535abd0		2026-08-09 13:16:59.868+00	2026-08-09 13:27:43.482+00	2026-08-09 13:18:28.863+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 13:27:43.482+00	cc3b3ba4-b678-4d45-8916-ef86f535abd0	completed	\N	\N	අසනීපයක් නිසා නිවාඩු අවශ්‍යයි	\N	\N	\N	\N	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 13:27:12.494+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1785496969225.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1785498560834.png	\N
49	c9f7a318-d3f1-4433-9511-48d0a825e31c	12	2026-08-13	2026-08-17	3	ඩෙංගු හෝ බරපතල වෛරස් උණ තත්ත්වයක් හේතුවෙන් ප්‍රතිකාර සහ විවේකය ලබා ගැනීමට.	Rejected	cc3b3ba4-b678-4d45-8916-ef86f535abd0	You have to be there.	2026-08-09 14:20:02.021+00	2026-08-09 14:21:47.713+00	2026-08-09 14:20:31.294+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	\N	cc_approved	["c9f7a318-d3f1-4433-9511-48d0a825e31c/49/1786285202397_0_CA3B1298-19A6-4B7E-B34A-46501CCA8E81.jpg"]	To receive treatment and rest due to dengue or severe viral fever.	ඩෙංගු හෝ බරපතල වෛරස් උණ තත්ත්වයක් හේතුවෙන් ප්‍රතිකාර සහ විවේකය ලබා ගැනීමට.	டெங்கு அல்லது கடுமையான வைரஸ் காய்ச்சலுக்கான சிகிச்சை மற்றும் ஓய்வு.	\N	\N	\N	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 14:20:59.115+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1785496969225.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	\N	\N
51	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	11	2026-08-21	2026-08-21	1	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	Rejected	cf50617c-2fb4-4a31-a525-3d7164d036a5		2026-08-09 18:01:31.492+00	2026-08-09 18:17:01.985+00	\N	\N	\N	\N	admin_review	\N	Urgent personal matter and essential home task.	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.	\N	\N	\N	c9f7a318-d3f1-4433-9511-48d0a825e31c	\N	\N	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786298568999.png	\N	\N	\N
52	ac2347dd-63ef-4596-aa07-8219ce3ca093	11	2026-08-14	2026-08-14	1	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	Rejected	cc3b3ba4-b678-4d45-8916-ef86f535abd0		2026-08-09 19:04:09.523+00	2026-08-09 19:56:07.493+00	2026-08-09 19:55:02.283+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	\N	cc_approved	\N	Urgent personal matter and essential home task.	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.	\N	\N	\N	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 19:55:29.306+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786298568999.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1785498560834.png	\N
54	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	11	2026-08-21	2026-08-21	1	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	Approved	cc3b3ba4-b678-4d45-8916-ef86f535abd0		2026-08-09 20:04:25.428+00	2026-08-09 20:06:32.994+00	2026-08-09 20:05:11.403+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 20:06:32.994+00	cc3b3ba4-b678-4d45-8916-ef86f535abd0	completed	\N	Urgent personal matter and essential home task.	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.	\N	\N	\N	ac2347dd-63ef-4596-aa07-8219ce3ca093	2026-08-09 20:06:08.677+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786298568999.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1785498560834.png	\N
55	ac2347dd-63ef-4596-aa07-8219ce3ca093	11	2026-08-25	2026-08-25	1	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	Rejected	cc3b3ba4-b678-4d45-8916-ef86f535abd0		2026-08-09 20:08:23.7+00	2026-08-09 20:09:40.964+00	2026-08-09 20:08:52.652+00	cf50617c-2fb4-4a31-a525-3d7164d036a5	\N	\N	cc_approved	\N	Urgent personal matter and essential home task.	පෞද්ගලික හදිසි ගමනක් සහ නිවසේ අත්‍යවශ්‍ය කටයුත්තක් ඉටු කර ගැනීමට.	அவசர தனிப்பட்ட தேவை மற்றும் வீட்டில் அவசியமான வேலை.	\N	\N	\N	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 20:09:16.06+00	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786298568999.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1785498560834.png	\N
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.leave_types (id, name_en, max_days, created_at, name_si, name_ta) FROM stdin;
11	Casual Leave	21	2026-06-25 12:49:35.782202	අනියම් නිවාඩු	சாதாரண விடுமுறை
13	Half Day	0	2026-06-25 12:49:35.782202	අර්ධ දින නිවාඩු	அரை நாள் விடுமுறை
14	Short Leave	2	2026-06-25 12:49:35.782202	කෙටි නිවාඩු	குறுகிய விடுப்பு
12	Medical Leave	24	2026-06-25 12:49:35.782202	විවේකී / අසනීප නිවාඩු	ஓய்வு / நோய் விடுப்பு
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, title, message, is_read, is_auto_generated, created_by, created_at, read_at, notification_type, related_entity, related_id, title_en, title_si, title_ta, message_en, message_si, message_ta, is_for_mobile, notification_key, payload) FROM stdin;
469	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from S.T.S.D Chandrakumara requires your review.	f	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-10 08:35:48.373804+00	\N	Leave	leave_requests	56	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from S.T.S.D Chandrakumara requires your review.	S.T.S.D Chandrakumara වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	S.T.S.D Chandrakumara இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "S.T.S.D Chandrakumara"}
385	c9f7a318-d3f1-4433-9511-48d0a825e31c	නිවාඩු අයදුම්පත යවන ලදී	2026-08-12 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:12:55.815+00	\N	leave	leave_requests	48	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-12 was sent successfully.	2026-08-12 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-12 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
384	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:12:55.696947+00	2026-08-09 14:13:08.022+00	Leave	leave_requests	48	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
386	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 14:13:18.73+00	2026-08-09 14:13:59.952+00	Leave	leave_requests	48	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
387	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Shamindu Dewranga is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 14:14:10.482+00	2026-08-09 14:14:28.91+00	Leave	leave_requests	48	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Shamindu Dewranga is awaiting your final approval.	Shamindu Dewranga ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Shamindu Dewranga இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	f	leave_requires_final_approval	{"employee_name": "Shamindu Dewranga"}
388	c9f7a318-d3f1-4433-9511-48d0a825e31c	Leave Final Approved	Your leave request from 2026-08-12 to 2026-08-12 has been approved.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 14:14:37.694+00	\N	Leave	leave_requests	48	Leave Final Approved	නිවාඩු අයදුම්පත අනුමත කරන ලදී	விடுப்பு அங்கீகரிக்கப்பட்டது	Your leave request from 2026-08-12 to 2026-08-12 has been approved.	2026-08-12 සිට 2026-08-12 දක්වා ඔබගේ නිවාඩු ඉල්ලීම අනුමත කර ඇත.	2026-08-12 முதல் 2026-08-12 வரையிலான உங்கள் விடுப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.	f	leave_final_approved	{"end_date": "2026-08-12", "start_date": "2026-08-12", "approved_by": "Secretary"}
389	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	Duty Coverage Assigned	You have been assigned as a duty coverage officer.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 14:14:37.931+00	\N	Leave	leave_requests	48	Duty Coverage Assigned	රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත	பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்	You have been assigned as a duty coverage officer.	ඔබව රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත.	நீங்கள் பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்.	f	acting_officer_assigned	{"end_date": "2026-08-12", "start_date": "2026-08-12"}
391	c9f7a318-d3f1-4433-9511-48d0a825e31c	නිවාඩු අයදුම්පත යවන ලදී	2026 අගෝස්තු 13 සිට 2026 අගෝස්තු 17 දක්වා සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:20:13.41+00	\N	leave	leave_requests	49	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026 අගෝස්තු 13 සිට 2026 අගෝස්තු 17 දක්වා was sent successfully.	2026 අගෝස්තු 13 සිට 2026 අගෝස්තු 17 දක්වා සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026 අගෝස්තු 13 සිට 2026 අගෝස්තු 17 දක්වා தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
390	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:20:02.428781+00	2026-08-09 14:20:15.144+00	Leave	leave_requests	49	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
392	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 14:20:31.643+00	2026-08-09 14:20:44.158+00	Leave	leave_requests	49	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
393	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Shamindu Dewranga is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 14:21:00.312+00	2026-08-09 14:21:16.814+00	Leave	leave_requests	49	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Shamindu Dewranga is awaiting your final approval.	Shamindu Dewranga ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Shamindu Dewranga இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	f	leave_requires_final_approval	{"employee_name": "Shamindu Dewranga"}
394	c9f7a318-d3f1-4433-9511-48d0a825e31c	Leave Request Rejected	Your leave request from 2026-08-13 to 2026-08-17 has been rejected.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 14:21:47.92+00	\N	Leave	leave_requests	49	Leave Request Rejected	නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී	விடுப்பு நிராகரிக்கப்பட்டது	Your leave request from 2026-08-13 to 2026-08-17 has been rejected.	2026-08-13 සිට 2026-08-17 දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.	2026-08-13 முதல் 2026-08-17 வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	f	leave_request_rejected	{"end_date": "2026-08-17", "start_date": "2026-08-13", "rejected_by": "Secretary"}
486	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Task Assigned	Chairman assigned you a new task:	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 15:10:20.762+00	\N	Task	tasks	15	New Task Assigned	නව කාර්යයක් පවරන ලදී	புதிய பணி ஒதுக்கீடு	Chairman assigned you a new task:	සභාපති විසින් ඔබට නව කාර්යයක් පවරා ඇත:	தலைவர் உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்:	t	task_assigned	{"task_title": "bh", "assigned_by": "Chairman"}
397	c9f7a318-d3f1-4433-9511-48d0a825e31c	නිවාඩු අයදුම්පත යවන ලදී	2026-08-24 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:30:45.642+00	\N	leave	leave_requests	50	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-24 was sent successfully.	2026-08-24 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-24 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
396	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:30:45.556373+00	2026-08-09 14:30:46.729+00	Leave	leave_requests	50	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
398	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Shamindu Dewranga requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 14:30:53.809+00	2026-08-09 14:31:06.105+00	Leave	leave_requests	50	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Shamindu Dewranga requires your review.	Shamindu Dewranga වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Shamindu Dewranga இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Shamindu Dewranga"}
399	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Shamindu Dewranga is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 14:31:10.938+00	2026-08-09 14:31:26.495+00	Leave	leave_requests	50	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Shamindu Dewranga is awaiting your final approval.	Shamindu Dewranga ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Shamindu Dewranga இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	f	leave_requires_final_approval	{"employee_name": "Shamindu Dewranga"}
400	c9f7a318-d3f1-4433-9511-48d0a825e31c	Leave Request Rejected	Your leave request from 2026-08-24 to 2026-08-24 has been rejected.	t	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 14:31:48.516+00	2026-08-09 14:33:22.07+00	Leave	leave_requests	50	Leave Request Rejected	නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී	விடுப்பு நிராகரிக்கப்பட்டது	Your leave request from 2026-08-24 to 2026-08-24 has been rejected.	2026-08-24 සිට 2026-08-24 දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.	2026-08-24 முதல் 2026-08-24 வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	f	leave_request_rejected	{"end_date": "2026-08-24", "start_date": "2026-08-24", "rejected_by": "Secretary"}
470	c9f7a318-d3f1-4433-9511-48d0a825e31c	නිවාඩු අයදුම්පත යවන ලදී	2026-08-10 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-10 08:35:48.568+00	2026-08-10 10:49:37.706+00	leave	leave_requests	56	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-10 was sent successfully.	2026-08-10 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-10 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
395	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	Duty Coverage Assigned	You have been assigned as a duty coverage officer.	t	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 14:21:48.151+00	2026-08-09 14:32:23.285+00	Leave	leave_requests	49	Duty Coverage Assigned	රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත	பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்	You have been assigned as a duty coverage officer.	ඔබව රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත.	நீங்கள் பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்.	f	acting_officer_assigned	{"end_date": "2026-08-17", "start_date": "2026-08-13"}
401	2ace860d-4275-49eb-b92c-4dc932dd2c45	නව පැමිණිල්ලක්	Mr. Shamindu Dewranga විසින් නව පැමිණිල්ලක් යොමු කර ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:32:32.717+00	2026-08-09 14:34:28.16+00	Complaint	complaints	11	\N	\N	\N	\N	\N	\N	t	\N	\N
402	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to In Progress.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:35:44.819+00	\N	Complaint	complaints	11	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to In Progress.	ඔබගේ පැමිණිල්ලේ තත්ත්වය In Progress ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை In Progress என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "Repair Started", "status": "In Progress", "complaint_title": "කැඩුණු / බිඳුණු භාණ්ඩ"}
403	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to Resolved.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:35:58.346+00	\N	Complaint	complaints	11	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to Resolved.	ඔබගේ පැමිණිල්ලේ තත්ත්වය Resolved ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை Resolved என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "", "status": "Resolved", "complaint_title": "කැඩුණු / බිඳුණු භාණ්ඩ"}
404	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to Closed.	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:36:11.165+00	2026-08-09 14:36:46.088+00	Complaint	complaints	11	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to Closed.	ඔබගේ පැමිණිල්ලේ තත්ත්වය Closed ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை Closed என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "", "status": "Closed", "complaint_title": "කැඩුණු / බිඳුණු භාණ්ඩ"}
405	2ace860d-4275-49eb-b92c-4dc932dd2c45	නව පැමිණිල්ලක්	Mr. Shamindu Dewranga විසින් නව පැමිණිල්ලක් යොමු කර ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:37:38.062+00	2026-08-09 14:37:47.104+00	Complaint	complaints	12	\N	\N	\N	\N	\N	\N	t	\N	\N
417	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	New Announcement	New announcement posted: "chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	\N	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
425	c9f7a318-d3f1-4433-9511-48d0a825e31c	Profile Request Approved	Your profile update request has been approved.	t	t	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 14:52:42.168+00	2026-08-09 14:53:03.306+00	Profile	profile_request	22	Profile Request Approved	පැතිකඩ ඉල්ලීම අනුමත කරන ලදී	சுயவிவர கோரிக்கை அங்கீகரிக்கப்பட்டது	Your profile update request has been approved.	ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම අනුමත කරන ලදී.	உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை  அங்கீகரிக்கப்பட்டுள்ளது.	f	profile_request_approved	{"title": "Profile Request Approved", "message": "Your profile update request for \\"Profile details\\" has been approved by පද්ධති පරිපාලක.", "field_name": "Profile details", "approved_by": "පද්ධති පරිපාලක"}
426	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:53:12.73+00	2026-08-09 14:53:12.287+00	profile_change	profile_change_requests	23	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. Shamindu Dewranga has requested a role/department change.	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. Shamindu Dewranga பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
406	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to In Progress.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:38:13.3+00	\N	Complaint	complaints	12	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to In Progress.	ඔබගේ පැමිණිල්ලේ තත්ත්වය In Progress ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை In Progress என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "salli dunna", "status": "In Progress", "complaint_title": "භාණ්ඩ හිඟයක් / ඉල්ලීමක්"}
409	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Task Assigned	Chairman assigned you a new task: New Library Building Proposal	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:42:13.14+00	2026-08-09 14:43:12.519+00	Task	tasks	12	New Task Assigned	නව කාර්යයක් පවරන ලදී	புதிய பணி ஒதுக்கீடு	Chairman assigned you a new task: New Library Building Proposal	Chairman විසින් ඔබට නව කාර්යයක් පවරා ඇත: New Library Building Proposal	Chairman உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்: New Library Building Proposal	f	task_assigned	{"task_title": "New Library Building Proposal", "assigned_by": "Chairman"}
407	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to Resolved.	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:39:05.867+00	2026-08-09 14:39:21.338+00	Complaint	complaints	12	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to Resolved.	ඔබගේ පැමිණිල්ලේ තත්ත්වය Resolved ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை Resolved என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "Date ekata labei poth", "status": "Resolved", "complaint_title": "භාණ්ඩ හිඟයක් / ඉල්ලීමක්"}
408	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Updated	Your complaint status has been updated to Closed.	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:40:00.278+00	2026-08-09 14:40:53.732+00	Complaint	complaints	12	Complaint Status Updated	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	Your complaint status has been updated to Closed.	ඔබගේ පැමිණිල්ලේ තත්ත්වය Closed ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை Closed என புதுப்பிக்கப்பட்டுள்ளது.	f	complaint_status_updated	{"remark": "Complain done...!", "status": "Closed", "complaint_title": "භාණ්ඩ හිඟයක් / ඉල්ලීමක්"}
410	2ace860d-4275-49eb-b92c-4dc932dd2c45	Task Started	The task "New Library Building Proposal" has been started.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:45:35.2+00	2026-08-09 14:45:52.264+00	Task	tasks	12	Task Started	කාර්යයක් ආරම්භ කරන ලදී	பணி தொடங்கப்பட்டது	The task "New Library Building Proposal" has been started.	ඔබ පැවරූ "නව පුස්තකාල ගොඩනැගිලි යෝජනාව" කාර්යය ආරම්භ කර ඇත.	"புதிய நூலகக் கட்டிட முன்மொழிவு" பணி தொடங்கப்பட்டுள்ளது.	t	\N	\N
411	2ace860d-4275-49eb-b92c-4dc932dd2c45	Task Completed	The task "New Library Building Proposal" has been successfully completed.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:46:00.391+00	2026-08-09 14:46:00.008+00	Task	tasks	12	Task Completed	කාර්යයක් සම්පූර්ණ කරන ලදී	பணி முடிக்கப்பட்டது	The task "New Library Building Proposal" has been successfully completed.	ඔබ පැවරූ "නව පුස්තකාල ගොඩනැගිලි යෝජනාව" කාර්යය සාර්ථකව සම්පූර්ණ කර ඇත.	"புதிய நூலகக் கட்டிட முன்மொழிவு" பணி வெற்றிகரமாக முடிக்கப்பட்டது.	t	\N	\N
412	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Task Assigned	Chairman assigned you a new task: hjhg	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:47:21.65+00	\N	Task	tasks	13	New Task Assigned	නව කාර්යයක් පවරන ලදී	புதிய பணி ஒதுக்கீடு	Chairman assigned you a new task: hjhg	Chairman විසින් ඔබට නව කාර්යයක් පවරා ඇත: hjhg	Chairman உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்: hjhg	f	task_assigned	{"task_title": "hjhg", "assigned_by": "Chairman"}
413	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Task Assigned	Chairman assigned you a new task: ghhh	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:48:04.437+00	\N	Task	tasks	14	New Task Assigned	නව කාර්යයක් පවරන ලදී	புதிய பணி ஒதுக்கீடு	Chairman assigned you a new task: ghhh	Chairman විසින් ඔබට නව කාර්යයක් පවරා ඇත: ghhh	Chairman உங்களுக்கு ஒரு புதிய பணியை ஒதுக்கியுள்ளார்: ghhh	f	task_assigned	{"task_title": "ghhh", "assigned_by": "Chairman"}
415	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	New Announcement	New announcement posted: "Secretary"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:50:31.159+00	\N	Announcement	announcements	16	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Secretary"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Secretary"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Secretary"	f	announcement_created	{"announcement_title": "Secretary"}
414	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Announcement	New announcement posted: "Secretary"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:50:31.159+00	2026-08-09 14:50:44.221+00	Announcement	announcements	16	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Secretary"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Secretary"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Secretary"	f	announcement_created	{"announcement_title": "Secretary"}
416	cf50617c-2fb4-4a31-a525-3d7164d036a5	New Announcement	New announcement posted: "chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	\N	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
423	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	New Announcement	New announcement posted: "chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	2026-08-11 15:07:50.696+00	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
419	f23bc81d-73d8-40fc-88c9-c9d67aedca6c	New Announcement	New announcement posted: "chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	\N	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
418	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Announcement	New announcement posted: "chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	2026-08-09 14:51:50.444+00	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
422	2ace860d-4275-49eb-b92c-4dc932dd2c45	New Announcement	New announcement posted: "chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	2026-08-09 14:51:47.671+00	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
424	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 14:52:20.583+00	2026-08-09 14:52:27.081+00	profile_change	profile_change_requests	22	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. Shamindu Dewranga has requested a role/department change.	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. Shamindu Dewranga பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
427	c9f7a318-d3f1-4433-9511-48d0a825e31c	Profile Request Rejected	Your profile update request has been rejected.	f	t	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 14:54:19.913+00	\N	Profile	profile_request	23	Profile Request Rejected	පැතිකඩ ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී	சுயவிவர கோரிக்கை நிராகரிக்கப்பட்டது	Your profile update request has been rejected.	ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම ප්‍රතික්ෂේප කරන ලදී.	உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	f	profile_request_rejected	{"title": "Profile Request Rejected", "message": "Your profile update request for \\"Profile details\\" has been rejected by පද්ධති පරිපාලක.", "field_name": "Profile details", "rejected_by": "පද්ධති පරිපාලක"}
421	cc3b3ba4-b678-4d45-8916-ef86f535abd0	New Announcement	New announcement posted: "chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	2026-08-09 15:03:07.919+00	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
428	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 18:00:19.05+00	2026-08-09 18:00:36.088+00	profile_change	profile_change_requests	24	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. Shamindu Dewranga has requested a role/department change.	Mr. Shamindu Dewranga විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. Shamindu Dewranga பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
429	c9f7a318-d3f1-4433-9511-48d0a825e31c	Profile Request Approved	Your profile update request has been approved.	f	t	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 18:00:46.392+00	\N	Profile	profile_request	24	Profile Request Approved	පැතිකඩ ඉල්ලීම අනුමත කරන ලදී	சுயவிவர கோரிக்கை அங்கீகரிக்கப்பட்டது	Your profile update request has been approved.	ඔබගේ පැතිකඩ වෙනස් කිරීමේ ඉල්ලීම අනුමත කරන ලදී.	உங்கள் சுயவிவர புதுப்பிப்பு கோரிக்கை  அங்கீகரிக்கப்பட்டுள்ளது.	f	profile_request_approved	{"title": "Profile Request Approved", "message": "Your profile update request for \\"Profile details\\" has been approved by පද්ධති පරිපාලක.", "field_name": "Profile details", "approved_by": "පද්ධති පරිපාලක"}
420	d3d6bd6d-210d-477e-b877-d3c1176254e1	New Announcement	New announcement posted: "chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 14:51:31.269+00	2026-08-10 07:47:39.478+00	Announcement	announcements	17	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "chairman"	f	announcement_created	{"announcement_title": "chairman"}
431	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	නිවාඩු අයදුම්පත යවන ලදී	2026-08-21 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 18:01:32.029+00	\N	leave	leave_requests	51	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-21 was sent successfully.	2026-08-21 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-21 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
430	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Dulmini Gamlath requires your review.	t	t	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 18:01:31.637445+00	2026-08-09 18:01:54.401+00	Leave	leave_requests	51	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Dulmini Gamlath requires your review.	Dulmini Gamlath වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Dulmini Gamlath இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Dulmini Gamlath"}
432	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	Leave Request Rejected	Your leave request from 2026-08-21 to 2026-08-21 has been rejected.	f	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 18:17:02.283+00	\N	Leave	leave_requests	51	Leave Request Rejected	නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී	விடுப்பு நிராகரிக்கப்பட்டது	Your leave request from 2026-08-21 to 2026-08-21 has been rejected.	2026-08-21 සිට 2026-08-21 දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.	2026-08-21 முதல் 2026-08-21 வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	f	leave_request_rejected	{"end_date": "2026-08-21", "start_date": "2026-08-21", "rejected_by": "Subject Officer"}
471	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:44:49.88+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2}
434	ac2347dd-63ef-4596-aa07-8219ce3ca093	නිවාඩු අයදුම්පත යවන ලදී	2026-08-14 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	ac2347dd-63ef-4596-aa07-8219ce3ca093	2026-08-09 19:04:09.995+00	\N	leave	leave_requests	52	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-14 was sent successfully.	2026-08-14 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-14 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
433	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Amavi requires your review.	t	t	ac2347dd-63ef-4596-aa07-8219ce3ca093	2026-08-09 19:04:09.641327+00	2026-08-09 19:04:14.224+00	Leave	leave_requests	52	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Amavi requires your review.	Amavi වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Amavi இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Amavi"}
437	2ace860d-4275-49eb-b92c-4dc932dd2c45	New Announcement	New announcement posted: "Chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	2026-08-09 19:48:37.333+00	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
435	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 19:41:44.561+00	2026-08-10 07:47:39.478+00	profile_change	profile_change_requests	25	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. S.T.S.D Chandrakumara has requested a role/department change.	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. S.T.S.D Chandrakumara பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
438	c9f7a318-d3f1-4433-9511-48d0a825e31c	New Announcement	New announcement posted: "Chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	2026-08-10 08:19:24.33+00	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
439	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
441	ac2347dd-63ef-4596-aa07-8219ce3ca093	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
443	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.925+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
472	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:46:44.728+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2}
476	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:55:05.246+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
479	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:12:02.613+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
481	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:16:46.703+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
483	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:20:43.565+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
487	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Update	The status of your complaint has been updated to: In Progress.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 15:16:30.172+00	\N	Complaint	complaints	13	Complaint Status Update	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	The status of your complaint has been updated to: In Progress.	ඔබගේ පැමිණිල්ලේ වත්මන් තත්ත්වය "In Progress" ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை "In Progress" என புதுப்பிக்கப்பட்டுள்ளது.	t	complaint_status_updated	{"remark": "", "status": "In Progress", "complaint_title": "Damaged Items"}
440	cf50617c-2fb4-4a31-a525-3d7164d036a5	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
442	f23bc81d-73d8-40fc-88c9-c9d67aedca6c	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
444	cc3b3ba4-b678-4d45-8916-ef86f535abd0	New Announcement	New announcement posted: "Chairman"	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.926+00	\N	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
445	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Amavi requires your review.	f	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 19:55:02.645+00	\N	Leave	leave_requests	52	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Amavi requires your review.	Amavi වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Amavi இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	t	leave_requires_approval	{"employee_name": "Amavi"}
446	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Amavi is awaiting your final approval.	f	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 19:55:30.384+00	\N	Leave	leave_requests	52	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Amavi is awaiting your final approval.	Amavi ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Amavi இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	t	leave_requires_final_approval	{"employee_name": "Amavi"}
447	ac2347dd-63ef-4596-aa07-8219ce3ca093	Leave Request Rejected	Your leave request from 2026-08-14 to 2026-08-14 has been rejected.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 19:56:07.678+00	\N	Leave	leave_requests	52	Leave Request Rejected	නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී	விடுப்பு நிராகரிக்கப்பட்டது	Your leave request from 2026-08-14 to 2026-08-14 has been rejected.	2026-08-14 සිට 2026-08-14 දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.	2026-08-14 முதல் 2026-08-14 வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	t	leave_request_rejected	{"end_date": "2026-08-14", "start_date": "2026-08-14", "rejected_by": "Secretary"}
449	c9f7a318-d3f1-4433-9511-48d0a825e31c	නිවාඩු අයදුම්පත යවන ලදී	2026-08-24 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 19:58:04.363+00	2026-08-10 11:11:54.902+00	leave	leave_requests	53	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-24 was sent successfully.	2026-08-24 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-24 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
448	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from S.T.S.D Chandrakumara requires your review.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 19:58:04.296477+00	2026-08-09 19:58:11.562+00	Leave	leave_requests	53	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from S.T.S.D Chandrakumara requires your review.	S.T.S.D Chandrakumara වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	S.T.S.D Chandrakumara இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "S.T.S.D Chandrakumara"}
473	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:52:38.976+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
450	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from S.T.S.D Chandrakumara requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 19:58:33.311+00	2026-08-09 19:58:55.043+00	Leave	leave_requests	53	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from S.T.S.D Chandrakumara requires your review.	S.T.S.D Chandrakumara වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	S.T.S.D Chandrakumara இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	t	leave_requires_approval	{"employee_name": "S.T.S.D Chandrakumara"}
451	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from S.T.S.D Chandrakumara is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 19:59:05.934+00	2026-08-09 19:59:25.801+00	Leave	leave_requests	53	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from S.T.S.D Chandrakumara is awaiting your final approval.	S.T.S.D Chandrakumara ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	S.T.S.D Chandrakumara இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	t	leave_requires_final_approval	{"employee_name": "S.T.S.D Chandrakumara"}
485	2ace860d-4275-49eb-b92c-4dc932dd2c45	නව පැමිණිල්ලක්	Mr. S.T.S.D Chandrakumara විසින් නව පැමිණිල්ලක් යොමු කර ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-11 07:46:17.373+00	2026-08-11 14:13:50.765+00	Complaint	complaints	13	\N	\N	\N	\N	\N	\N	t	\N	\N
455	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	නිවාඩු අයදුම්පත යවන ලදී	2026-08-21 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 20:04:25.878+00	\N	leave	leave_requests	54	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-21 was sent successfully.	2026-08-21 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-21 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
454	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Dulmini Gamlath requires your review.	t	t	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	2026-08-09 20:04:25.56613+00	2026-08-09 20:05:01.124+00	Leave	leave_requests	54	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Dulmini Gamlath requires your review.	Dulmini Gamlath වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Dulmini Gamlath இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Dulmini Gamlath"}
456	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Dulmini Gamlath requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 20:05:11.806+00	2026-08-09 20:05:58.417+00	Leave	leave_requests	54	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Dulmini Gamlath requires your review.	Dulmini Gamlath වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Dulmini Gamlath இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	t	leave_requires_approval	{"employee_name": "Dulmini Gamlath"}
457	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Dulmini Gamlath is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 20:06:09.313+00	2026-08-09 20:06:25.605+00	Leave	leave_requests	54	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Dulmini Gamlath is awaiting your final approval.	Dulmini Gamlath ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Dulmini Gamlath இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	t	leave_requires_final_approval	{"employee_name": "Dulmini Gamlath"}
458	18ba6a00-b287-4c42-9d84-a99f7b12ddd4	Leave Final Approved	Your leave request from 2026-08-21 to 2026-08-21 has been approved.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 20:06:33.394+00	\N	Leave	leave_requests	54	Leave Final Approved	නිවාඩු අයදුම්පත අනුමත කරන ලදී	விடுப்பு அங்கீகரிக்கப்பட்டது	Your leave request from 2026-08-21 to 2026-08-21 has been approved.	2026-08-21 සිට 2026-08-21 දක්වා ඔබගේ නිවාඩු ඉල්ලීම අනුමත කර ඇත.	2026-08-21 முதல் 2026-08-21 வரையிலான உங்கள் விடுப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.	t	leave_final_approved	{"end_date": "2026-08-21", "start_date": "2026-08-21", "approved_by": "Secretary"}
453	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 20:03:40.192+00	2026-08-10 07:47:39.478+00	profile_change	profile_change_requests	27	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. S.T.S.D Chandrakumara has requested a role/department change.	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. S.T.S.D Chandrakumara பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
452	c9f7a318-d3f1-4433-9511-48d0a825e31c	Leave Final Approved	Your leave request from 2026-08-24 to 2026-08-24 has been approved.	t	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 19:59:52.696+00	2026-08-10 08:20:48.95+00	Leave	leave_requests	53	Leave Final Approved	නිවාඩු අයදුම්පත අනුමත කරන ලදී	விடுப்பு அங்கீகரிக்கப்பட்டது	Your leave request from 2026-08-24 to 2026-08-24 has been approved.	2026-08-24 සිට 2026-08-24 දක්වා ඔබගේ නිවාඩු ඉල්ලීම අනුමත කර ඇත.	2026-08-24 முதல் 2026-08-24 வரையிலான உங்கள் விடுப்பு கோரிக்கை அங்கீகரிக்கப்பட்டுள்ளது.	t	leave_final_approved	{"end_date": "2026-08-24", "start_date": "2026-08-24", "approved_by": "Secretary"}
459	ac2347dd-63ef-4596-aa07-8219ce3ca093	Duty Coverage Assigned	You have been assigned as a duty coverage officer.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 20:06:33.566+00	\N	Leave	leave_requests	54	Duty Coverage Assigned	රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත	பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்	You have been assigned as a duty coverage officer.	ඔබව රාජකාරි ආවරණ නිලධාරියා ලෙස පත් කර ඇත.	நீங்கள் பணி பொறுப்பு அதிகாரியாக நியமிக்கப்பட்டுள்ளீர்கள்.	t	acting_officer_assigned	{"start_date": "2026-08-21", "employee_name": "Dulmini Gamlath"}
474	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:52:46.913+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
461	ac2347dd-63ef-4596-aa07-8219ce3ca093	නිවාඩු අයදුම්පත යවන ලදී	2026-08-25 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	f	t	ac2347dd-63ef-4596-aa07-8219ce3ca093	2026-08-09 20:08:24.214+00	\N	leave	leave_requests	55	Leave Request Sent	නිවාඩු අයදුම්පත යවන ලදී	விடுப்பு விண்ணப்பம் அனுப்பப்பட்டது	Your leave request for 2026-08-25 was sent successfully.	2026-08-25 සඳහා ඔබගේ නිවාඩු අයදුම්පත සාර්ථකයි.	2026-08-25 தேதிக்கான உங்கள் விடுப்பு விண்ணப்பம் வெற்றிகரமாக அனுப்பப்பட்டது.	t	\N	\N
460	cf50617c-2fb4-4a31-a525-3d7164d036a5	Leave Approval Required	New leave request from Amavi requires your review.	t	t	ac2347dd-63ef-4596-aa07-8219ce3ca093	2026-08-09 20:08:23.866753+00	2026-08-09 20:08:42.387+00	Leave	leave_requests	55	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Amavi requires your review.	Amavi වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Amavi இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	f	leave_requires_approval	{"employee_name": "Amavi"}
477	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:03:39.82+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
462	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	Leave Approval Required	New leave request from Amavi requires your review.	t	t	cf50617c-2fb4-4a31-a525-3d7164d036a5	2026-08-09 20:08:53.01+00	2026-08-09 20:09:09.143+00	Leave	leave_requests	55	Leave Approval Required	නිවාඩු අනුමැතිය අවශ්‍ය වේ	விடுப்பு ஒப்புதல் தேவை	New leave request from Amavi requires your review.	Amavi වෙතින් ලැබුණු නව නිවාඩු ඉල්ලීම සමාලෝචනය කළ යුතුය.	Amavi இன் புதிய விடுப்பு கோரிக்கையை மதிப்பாய்வு செய்ய வேண்டும்.	t	leave_requires_approval	{"employee_name": "Amavi"}
467	2ace860d-4275-49eb-b92c-4dc932dd2c45	කාර්යයක් ආරම්භ කරන ලදී	ඔබ පැවරූ "hjhg" කාර්යය ආරම්භ කර ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-10 08:16:01.845+00	2026-08-11 14:13:50.765+00	Task	tasks	13	Task Started	කාර්යයක් ආරම්භ කරන ලදී	பணி தொடங்கப்பட்டது	The task "hjhg" has been started.	ඔබ පැවරූ "hjhg" කාර්යය ආරම්භ කර ඇත.	"hjhg" பணி தொடங்கப்பட்டுள்ளது.	t	\N	\N
463	cc3b3ba4-b678-4d45-8916-ef86f535abd0	Final Leave Approval Required	Leave request from Amavi is awaiting your final approval.	t	t	dfc361d0-1cb0-47a5-bf8b-cf21871c8773	2026-08-09 20:09:16.502+00	2026-08-09 20:09:35.137+00	Leave	leave_requests	55	Final Leave Approval Required	අවසාන නිවාඩු අනුමැතිය අවශ්‍ය වේ	இறுதி விடுப்பு ஒப்புதல் தேவை	Leave request from Amavi is awaiting your final approval.	Amavi ගේ නිවාඩු ඉල්ලීම ඔබගේ අවසාන අනුමැතිය අපේක්ෂාවෙන් පවතී.	Amavi இன் விடுப்பு கோரிக்கை உங்கள் இறுதி ஒப்புதலுக்காக காத்திருக்கிறது.	t	leave_requires_final_approval	{"employee_name": "Amavi"}
464	ac2347dd-63ef-4596-aa07-8219ce3ca093	Leave Request Rejected	Your leave request from 2026-08-25 to 2026-08-25 has been rejected.	f	t	cc3b3ba4-b678-4d45-8916-ef86f535abd0	2026-08-09 20:09:41.145+00	\N	Leave	leave_requests	55	Leave Request Rejected	නිවාඩු අයදුම්පත ප්‍රතික්ෂේප කරන ලදී	விடுப்பு நிராகரிக்கப்பட்டது	Your leave request from 2026-08-25 to 2026-08-25 has been rejected.	2026-08-25 සිට 2026-08-25 දක්වා ඔබගේ නිවාඩු ඉල්ලීම ප්‍රතික්ෂේප කර ඇත.	2026-08-25 முதல் 2026-08-25 வரையிலான உங்கள் விடுப்பு கோரிக்கை நிராகரிக்கப்பட்டுள்ளது.	t	leave_request_rejected	{"end_date": "2026-08-25", "start_date": "2026-08-25", "rejected_by": "Secretary"}
468	2ace860d-4275-49eb-b92c-4dc932dd2c45	කාර්යයක් සම්පූර්ණ කරන ලදී	ඔබ පැවරූ "hjhg" කාර්යය සාර්ථකව සම්පූර්ණ කර ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-10 08:16:11.099+00	2026-08-11 03:55:59.835+00	Task	tasks	13	Task Completed	කාර්යයක් සම්පූර්ණ කරන ලදී	பணி முடிக்கப்பட்டது	The task "hjhg" has been successfully completed.	ඔබ පැවරූ "hjhg" කාර්යය සාර්ථකව සම්පූර්ණ කර ඇත.	"hjhg" பணி வெற்றிகரமாக முடிக்கப்பட்டது.	t	\N	\N
475	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 04:54:58.055+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
436	d3d6bd6d-210d-477e-b877-d3c1176254e1	New Announcement	New announcement posted: "Chairman"	t	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-09 19:46:48.925+00	2026-08-10 07:47:39.478+00	Announcement	announcements	18	New Announcement	නව නිවේදනයක්	புதிய அறிவிப்பு	New announcement posted: "Chairman"	නව නිවේදනයක් ප්‍රකාශයට පත් කර ඇත: "Chairman"	புதிய அறிவிப்பு வெளியிடப்பட்டுள்ளது: "Chairman"	t	announcement_created	{"announcement_title": "Chairman"}
465	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 20:09:50.104+00	2026-08-10 07:47:39.478+00	profile_change	profile_change_requests	28	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. S.T.S.D Chandrakumara has requested a role/department change.	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. S.T.S.D Chandrakumara பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
466	d3d6bd6d-210d-477e-b877-d3c1176254e1	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	t	t	c9f7a318-d3f1-4433-9511-48d0a825e31c	2026-08-09 20:14:22.628+00	2026-08-10 07:47:39.478+00	profile_change	profile_change_requests	29	Profile Change Request	පැතිකඩ වෙනස් කිරීමේ ඉල්ලීමක්	சுயவிவர மாற்ற கோரிக்கை	Mr. S.T.S.D Chandrakumara has requested a role/department change.	Mr. S.T.S.D Chandrakumara විසින් තනතුර/අංශය වෙනස් කිරීමේ ඉල්ලීමක් එවා ඇත.	Mr. S.T.S.D Chandrakumara பதவி/துறை மாற்ற கோரியுள்ளார்.	t	\N	\N
478	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:03:46.034+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
480	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:12:08.595+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
482	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:17:10.691+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
484	cc3b3ba4-b678-4d45-8916-ef86f535abd0	System Privileges Updated	Your role permissions and module access privileges have been updated by the Administrator.	f	t	\N	2026-08-11 05:20:51.861+00	\N	System	role	2	System Privileges Updated	පද්ධති විශේෂ බලතල යාවත්කාලීන කරන ලදී	கட்டமைப்பு சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன	Your role permissions and module access privileges have been updated by the Administrator.	පරිපාලක විසින් ඔබගේ භූමිකාවට අදාළ පද්ධති බලතල සහ මොඩියුල ප්‍රවේශයන් වෙනස් කර ඇත.	நிர்வாகியால் உங்கள் பாத்திர அனுமதிகள் மற்றும் தொகுதி அணுகல் சலுகைகள் புதுப்பிக்கப்பட்டுள்ளன.	t	privileges_updated	{"role_id": 2, "force_refresh": true}
488	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Update	The status of your complaint has been updated to: Successfully Resolved.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 15:16:44.041+00	\N	Complaint	complaints	13	Complaint Status Update	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	The status of your complaint has been updated to: Successfully Resolved.	ඔබගේ පැමිණිල්ලේ වත්මන් තත්ත්වය "සාර්ථකව විසඳන ලදී" ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை "வெற்றிகரமாக தீர்க்கப்பட்டது" என புதுப்பிக்கப்பட்டுள்ளது.	t	complaint_status_updated	{"remark": "", "status": "Resolved", "complaint_title": "Damaged Items"}
489	c9f7a318-d3f1-4433-9511-48d0a825e31c	Complaint Status Update	The status of your complaint has been updated to: Closed.	f	t	2ace860d-4275-49eb-b92c-4dc932dd2c45	2026-08-11 15:16:50.435+00	\N	Complaint	complaints	13	Complaint Status Update	පැමිණිල්ලේ තත්ත්වය යාවත්කාලීන කරන ලදී	புகார் நிலை புதுப்பிக்கப்பட்டுள்ளது	The status of your complaint has been updated to: Closed.	ඔබගේ පැමිණිල්ලේ වත්මන් තත්ත්වය "වසා ඇත" ලෙස යාවත්කාලීන කර ඇත.	உங்கள் புகாரின் நிலை "மூடப்பட்டுள்ளது" என புதுப்பிக்கப்பட்டுள்ளது.	t	complaint_status_updated	{"remark": "", "status": "Closed", "complaint_title": "Damaged Items"}
\.


--
-- Data for Name: profile_change_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profile_change_requests (id, user_id, old_value, new_value, status, approved_by, approved_at, requested_at, created_at) FROM stdin;
22	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{"department_id":"2","designation_id":"9"}	Approved	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 14:52:41.18+00	2026-08-09 14:52:16.476917+00	2026-08-09 14:52:16.476917+00
23	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":2,"designation_id":9}	{}	Rejected	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 14:54:18.601+00	2026-08-09 14:53:12.384361+00	2026-08-09 14:53:12.384361+00
24	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":2,"designation_id":9}	{"department_id":"6","designation_id":"17"}	Approved	d3d6bd6d-210d-477e-b877-d3c1176254e1	2026-08-09 18:00:43.931+00	2026-08-09 18:00:18.681024+00	2026-08-09 18:00:18.681024+00
25	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-09 19:41:44.493628+00	2026-08-09 19:41:44.493628+00
26	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-09 20:03:29.672256+00	2026-08-09 20:03:29.672256+00
27	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-09 20:03:40.089957+00	2026-08-09 20:03:40.089957+00
28	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-09 20:09:50.058023+00	2026-08-09 20:09:50.058023+00
29	c9f7a318-d3f1-4433-9511-48d0a825e31c	{"department_id":6,"designation_id":17}	{}	pending	\N	\N	2026-08-09 20:14:22.528227+00	2026-08-09 20:14:22.528227+00
\.


--
-- Data for Name: role_privileges; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.role_privileges (id, role_id, privilege_id, is_enabled, updated_at) FROM stdin;
886	2	100	t	2026-08-11 15:00:18.489+00
982	2	116	f	2026-08-11 15:00:18.489+00
988	2	117	f	2026-08-11 15:00:18.489+00
4551	4	123	t	2026-08-11 15:01:06.385+00
391	4	31	t	2026-08-11 15:01:06.385+00
392	4	32	f	2026-08-11 15:01:06.385+00
394	4	34	f	2026-08-11 15:01:06.385+00
395	4	35	f	2026-08-11 15:01:06.385+00
396	4	36	f	2026-08-11 15:01:06.385+00
429	5	33	f	2026-08-11 07:22:22.601527+00
4935	1	123	t	2026-08-11 14:59:28.043+00
885	1	100	t	2026-08-11 14:59:28.043+00
975	1	115	f	2026-08-11 14:59:28.043+00
981	1	116	f	2026-08-11 14:59:28.043+00
987	1	117	f	2026-08-11 14:59:28.043+00
977	4	115	f	2026-08-11 15:01:06.385+00
983	4	116	f	2026-08-11 15:01:06.385+00
989	4	117	f	2026-08-11 15:01:06.385+00
404	5	8	f	2026-08-11 07:22:22.601527+00
405	5	9	f	2026-08-11 07:22:22.601527+00
406	5	10	f	2026-08-11 07:22:22.601527+00
407	5	11	f	2026-08-11 07:22:22.601527+00
408	5	12	f	2026-08-11 07:22:22.601527+00
409	5	13	f	2026-08-11 07:22:22.601527+00
410	5	14	f	2026-08-11 07:22:22.601527+00
411	5	15	f	2026-08-11 07:22:22.601527+00
412	5	16	f	2026-08-11 07:22:22.601527+00
413	5	17	f	2026-08-11 07:22:22.601527+00
414	5	18	f	2026-08-11 07:22:22.601527+00
415	5	19	f	2026-08-11 07:22:22.601527+00
416	5	20	f	2026-08-11 07:22:22.601527+00
417	5	21	f	2026-08-11 07:22:22.601527+00
418	5	22	f	2026-08-11 07:22:22.601527+00
419	5	23	f	2026-08-11 07:22:22.601527+00
420	5	24	f	2026-08-11 07:22:22.601527+00
421	5	25	f	2026-08-11 07:22:22.601527+00
422	5	26	f	2026-08-11 07:22:22.601527+00
397	5	1	t	2026-08-11 07:22:22.601527+00
398	5	2	t	2026-08-11 07:22:22.601527+00
399	5	3	t	2026-08-11 07:22:22.601527+00
400	5	4	t	2026-08-11 07:22:22.601527+00
401	5	5	t	2026-08-11 07:22:22.601527+00
402	5	6	t	2026-08-11 07:22:22.601527+00
423	5	27	f	2026-08-11 07:22:22.601527+00
424	5	28	f	2026-08-11 07:22:22.601527+00
425	5	29	f	2026-08-11 07:22:22.601527+00
426	5	30	f	2026-08-11 07:22:22.601527+00
427	5	31	f	2026-08-11 07:22:22.601527+00
4359	8	123	t	2026-08-11 14:58:19.95+00
849	1	94	t	2026-08-11 14:59:28.043+00
324	1	36	f	2026-08-11 14:59:28.043+00
5031	2	123	t	2026-08-11 15:00:18.489+00
850	2	94	t	2026-08-11 15:00:18.489+00
36	8	36	f	2026-08-11 14:58:19.951+00
986	8	117	f	2026-08-11 14:58:19.951+00
179	2	35	f	2026-08-11 15:00:18.489+00
180	2	36	f	2026-08-11 15:00:18.489+00
976	2	115	f	2026-08-11 15:00:18.489+00
428	5	32	f	2026-08-11 07:22:22.601527+00
430	5	34	f	2026-08-11 07:22:22.601527+00
431	5	35	f	2026-08-11 07:22:22.601527+00
432	5	36	f	2026-08-11 07:22:22.601527+00
654	5	55	f	2026-08-11 07:22:22.601527+00
660	5	56	f	2026-08-11 07:22:22.601527+00
666	5	61	f	2026-08-11 07:22:22.601527+00
672	5	62	f	2026-08-11 07:22:22.601527+00
678	5	65	f	2026-08-11 07:22:22.601527+00
684	5	66	f	2026-08-11 07:22:22.601527+00
690	5	67	f	2026-08-11 07:22:22.601527+00
696	5	68	f	2026-08-11 07:22:22.601527+00
702	5	69	f	2026-08-11 07:22:22.601527+00
708	5	70	f	2026-08-11 07:22:22.601527+00
714	5	71	f	2026-08-11 07:22:22.601527+00
720	5	72	f	2026-08-11 07:22:22.601527+00
726	5	73	f	2026-08-11 07:22:22.601527+00
732	5	74	f	2026-08-11 07:22:22.601527+00
738	5	75	f	2026-08-11 07:22:22.601527+00
744	5	76	f	2026-08-11 07:22:22.601527+00
750	5	77	f	2026-08-11 07:22:22.601527+00
756	5	78	f	2026-08-11 07:22:22.601527+00
762	5	79	f	2026-08-11 07:22:22.601527+00
768	5	80	f	2026-08-11 07:22:22.601527+00
774	5	81	f	2026-08-11 07:22:22.601527+00
780	5	82	f	2026-08-11 07:22:22.601527+00
786	5	83	f	2026-08-11 07:22:22.601527+00
792	5	84	f	2026-08-11 07:22:22.601527+00
798	5	85	f	2026-08-11 07:22:22.601527+00
804	5	86	f	2026-08-11 07:22:22.601527+00
810	5	87	f	2026-08-11 07:22:22.601527+00
816	5	88	f	2026-08-11 07:22:22.601527+00
822	5	89	f	2026-08-11 07:22:22.601527+00
828	5	90	f	2026-08-11 07:22:22.601527+00
834	5	91	f	2026-08-11 07:22:22.601527+00
840	5	92	f	2026-08-11 07:22:22.601527+00
846	5	93	f	2026-08-11 07:22:22.601527+00
852	5	94	f	2026-08-11 07:22:22.601527+00
858	5	95	f	2026-08-11 07:22:22.601527+00
864	5	96	f	2026-08-11 07:22:22.601527+00
870	5	97	f	2026-08-11 07:22:22.601527+00
876	5	98	f	2026-08-11 07:22:22.601527+00
882	5	99	f	2026-08-11 07:22:22.601527+00
888	5	100	f	2026-08-11 07:22:22.601527+00
894	5	101	f	2026-08-11 07:22:22.601527+00
900	5	102	f	2026-08-11 07:22:22.601527+00
906	5	103	f	2026-08-11 07:22:22.601527+00
912	5	104	f	2026-08-11 07:22:22.601527+00
918	5	105	f	2026-08-11 07:22:22.601527+00
924	5	106	f	2026-08-11 07:22:22.601527+00
930	5	107	f	2026-08-11 07:22:22.601527+00
936	5	108	f	2026-08-11 07:22:22.601527+00
942	5	109	f	2026-08-11 07:22:22.601527+00
308	1	20	f	2026-08-11 14:59:28.043+00
309	1	21	f	2026-08-11 14:59:28.043+00
948	5	110	f	2026-08-11 07:22:22.601527+00
310	1	22	f	2026-08-11 14:59:28.043+00
954	5	111	f	2026-08-11 07:22:22.601527+00
380	4	20	f	2026-08-11 15:01:06.385+00
381	4	21	f	2026-08-11 15:01:06.385+00
382	4	22	f	2026-08-11 15:01:06.385+00
960	5	112	f	2026-08-11 07:22:22.601527+00
383	4	23	f	2026-08-11 15:01:06.385+00
384	4	24	f	2026-08-11 15:01:06.385+00
385	4	25	t	2026-08-11 15:01:06.385+00
386	4	26	f	2026-08-11 15:01:06.385+00
393	4	33	f	2026-08-11 15:01:06.385+00
966	5	113	f	2026-08-11 07:22:22.601527+00
9	8	9	f	2026-08-11 14:58:19.95+00
972	5	114	f	2026-08-11 07:22:22.601527+00
311	1	23	f	2026-08-11 14:59:28.043+00
312	1	24	f	2026-08-11 14:59:28.043+00
313	1	25	t	2026-08-11 14:59:28.043+00
314	1	26	f	2026-08-11 14:59:28.043+00
315	1	27	t	2026-08-11 14:59:28.043+00
978	5	115	f	2026-08-11 07:22:22.601527+00
321	1	33	f	2026-08-11 14:59:28.043+00
153	2	9	f	2026-08-11 15:00:18.489+00
154	2	10	f	2026-08-11 15:00:18.489+00
155	2	11	f	2026-08-11 15:00:18.489+00
156	2	12	f	2026-08-11 15:00:18.489+00
984	5	116	f	2026-08-11 07:22:22.601527+00
10	8	10	f	2026-08-11 14:58:19.95+00
990	5	117	f	2026-08-11 07:22:22.601527+00
1589	5	118	f	2026-08-11 07:22:22.601527+00
11	8	11	f	2026-08-11 14:58:19.95+00
12	8	12	f	2026-08-11 14:58:19.95+00
13	8	13	f	2026-08-11 14:58:19.95+00
14	8	14	f	2026-08-11 14:58:19.95+00
15	8	15	f	2026-08-11 14:58:19.95+00
1595	5	119	f	2026-08-11 07:22:22.601527+00
16	8	16	f	2026-08-11 14:58:19.95+00
17	8	17	f	2026-08-11 14:58:19.95+00
18	8	18	f	2026-08-11 14:58:19.95+00
19	8	19	f	2026-08-11 14:58:19.95+00
20	8	20	f	2026-08-11 14:58:19.95+00
21	8	21	f	2026-08-11 14:58:19.95+00
22	8	22	f	2026-08-11 14:58:19.951+00
23	8	23	f	2026-08-11 14:58:19.951+00
24	8	24	f	2026-08-11 14:58:19.951+00
25	8	25	t	2026-08-11 14:58:19.951+00
26	8	26	f	2026-08-11 14:58:19.951+00
27	8	27	f	2026-08-11 14:58:19.951+00
403	5	7	t	2026-08-11 07:22:22.601527+00
157	2	13	f	2026-08-11 15:00:18.489+00
158	2	14	f	2026-08-11 15:00:18.489+00
159	2	15	f	2026-08-11 15:00:18.489+00
160	2	16	f	2026-08-11 15:00:18.489+00
161	2	17	f	2026-08-11 15:00:18.489+00
162	2	18	f	2026-08-11 15:00:18.489+00
163	2	19	f	2026-08-11 15:00:18.489+00
28	8	28	f	2026-08-11 14:58:19.951+00
29	8	29	t	2026-08-11 14:58:19.951+00
30	8	30	t	2026-08-11 14:58:19.951+00
164	2	20	f	2026-08-11 15:00:18.489+00
165	2	21	f	2026-08-11 15:00:18.489+00
166	2	22	f	2026-08-11 15:00:18.489+00
167	2	23	f	2026-08-11 15:00:18.489+00
168	2	24	f	2026-08-11 15:00:18.489+00
169	2	25	t	2026-08-11 15:00:18.489+00
170	2	26	f	2026-08-11 15:00:18.489+00
177	2	33	f	2026-08-11 15:00:18.489+00
370	4	10	f	2026-08-11 15:01:06.385+00
371	4	11	f	2026-08-11 15:01:06.385+00
372	4	12	f	2026-08-11 15:01:06.385+00
31	8	31	t	2026-08-11 14:58:19.951+00
32	8	32	f	2026-08-11 14:58:19.951+00
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
373	4	13	f	2026-08-11 15:01:06.385+00
374	4	14	f	2026-08-11 15:01:06.385+00
375	4	15	f	2026-08-11 15:01:06.385+00
376	4	16	f	2026-08-11 15:01:06.385+00
377	4	17	f	2026-08-11 15:01:06.385+00
378	4	18	f	2026-08-11 15:01:06.385+00
379	4	19	f	2026-08-11 15:01:06.385+00
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
753	1	78	t	2026-08-11 14:59:28.043+00
759	1	79	t	2026-08-11 14:59:28.043+00
765	1	80	t	2026-08-11 14:59:28.043+00
316	1	28	t	2026-08-11 14:59:28.043+00
789	1	84	t	2026-08-11 14:59:28.043+00
795	1	85	t	2026-08-11 14:59:28.043+00
801	1	86	t	2026-08-11 14:59:28.043+00
807	1	87	t	2026-08-11 14:59:28.043+00
317	1	29	t	2026-08-11 14:59:28.043+00
318	1	30	t	2026-08-11 14:59:28.043+00
319	1	31	t	2026-08-11 14:59:28.043+00
320	1	32	f	2026-08-11 14:59:28.043+00
322	1	34	f	2026-08-11 14:59:28.043+00
323	1	35	f	2026-08-11 14:59:28.043+00
659	4	56	f	2026-08-11 15:01:06.385+00
665	4	61	f	2026-08-11 15:01:06.385+00
671	4	62	f	2026-08-11 15:01:06.385+00
677	4	65	f	2026-08-11 15:01:06.385+00
683	4	66	f	2026-08-11 15:01:06.385+00
689	4	67	t	2026-08-11 15:01:06.385+00
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
656	8	56	f	2026-08-11 14:58:19.95+00
662	8	61	f	2026-08-11 14:58:19.951+00
668	8	62	f	2026-08-11 14:58:19.951+00
674	8	65	f	2026-08-11 14:58:19.951+00
695	4	68	t	2026-08-11 15:01:06.385+00
701	4	69	t	2026-08-11 15:01:06.385+00
707	4	70	t	2026-08-11 15:01:06.385+00
719	4	72	t	2026-08-11 15:01:06.385+00
725	4	73	t	2026-08-11 15:01:06.385+00
731	4	74	f	2026-08-11 15:01:06.385+00
737	4	75	f	2026-08-11 15:01:06.385+00
743	4	76	f	2026-08-11 15:01:06.385+00
749	4	77	t	2026-08-11 15:01:06.385+00
387	4	27	t	2026-08-11 15:01:06.385+00
755	4	78	t	2026-08-11 15:01:06.385+00
761	4	79	t	2026-08-11 15:01:06.385+00
767	4	80	t	2026-08-11 15:01:06.385+00
773	4	81	t	2026-08-11 15:01:06.385+00
779	4	82	t	2026-08-11 15:01:06.385+00
785	4	83	t	2026-08-11 15:01:06.385+00
388	4	28	t	2026-08-11 15:01:06.385+00
791	4	84	t	2026-08-11 15:01:06.385+00
797	4	85	t	2026-08-11 15:01:06.385+00
803	4	86	t	2026-08-11 15:01:06.385+00
809	4	87	t	2026-08-11 15:01:06.385+00
815	4	88	t	2026-08-11 15:01:06.385+00
389	4	29	t	2026-08-11 15:01:06.385+00
680	8	66	f	2026-08-11 14:58:19.951+00
686	8	67	t	2026-08-11 14:58:19.951+00
692	8	68	t	2026-08-11 14:58:19.951+00
698	8	69	t	2026-08-11 14:58:19.951+00
704	8	70	t	2026-08-11 14:58:19.951+00
716	8	72	t	2026-08-11 14:58:19.951+00
722	8	73	t	2026-08-11 14:58:19.951+00
728	8	74	f	2026-08-11 14:58:19.951+00
734	8	75	f	2026-08-11 14:58:19.951+00
740	8	76	f	2026-08-11 14:58:19.951+00
746	8	77	f	2026-08-11 14:58:19.951+00
752	8	78	f	2026-08-11 14:58:19.951+00
758	8	79	f	2026-08-11 14:58:19.951+00
764	8	80	f	2026-08-11 14:58:19.951+00
770	8	81	f	2026-08-11 14:58:19.951+00
776	8	82	f	2026-08-11 14:58:19.951+00
782	8	83	f	2026-08-11 14:58:19.951+00
788	8	84	f	2026-08-11 14:58:19.951+00
794	8	85	f	2026-08-11 14:58:19.951+00
800	8	86	f	2026-08-11 14:58:19.951+00
806	8	87	f	2026-08-11 14:58:19.951+00
812	8	88	f	2026-08-11 14:58:19.951+00
33	8	33	f	2026-08-11 14:58:19.951+00
34	8	34	f	2026-08-11 14:58:19.951+00
35	8	35	f	2026-08-11 14:58:19.951+00
390	4	30	t	2026-08-11 15:01:06.385+00
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
879	1	99	t	2026-08-11 14:59:28.043+00
891	1	101	t	2026-08-11 14:59:28.043+00
897	1	102	f	2026-08-11 14:59:28.043+00
903	1	103	f	2026-08-11 14:59:28.043+00
909	1	104	f	2026-08-11 14:59:28.043+00
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
361	4	1	t	2026-08-11 15:01:06.385+00
362	4	2	t	2026-08-11 15:01:06.385+00
363	4	3	t	2026-08-11 15:01:06.385+00
364	4	4	t	2026-08-11 15:01:06.385+00
365	4	5	t	2026-08-11 15:01:06.385+00
821	4	89	t	2026-08-11 15:01:06.385+00
827	4	90	t	2026-08-11 15:01:06.385+00
839	4	92	t	2026-08-11 15:01:06.385+00
845	4	93	t	2026-08-11 15:01:06.385+00
857	4	95	t	2026-08-11 15:01:06.385+00
863	4	96	t	2026-08-11 15:01:06.385+00
869	4	97	t	2026-08-11 15:01:06.385+00
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
1	8	1	t	2026-08-11 14:58:19.95+00
2	8	2	t	2026-08-11 14:58:19.95+00
3	8	3	t	2026-08-11 14:58:19.95+00
4	8	4	t	2026-08-11 14:58:19.95+00
1591	8	119	t	2026-08-11 14:58:19.951+00
875	4	98	t	2026-08-11 15:01:06.385+00
881	4	99	t	2026-08-11 15:01:06.385+00
893	4	101	t	2026-08-11 15:01:06.385+00
899	4	102	f	2026-08-11 15:01:06.385+00
905	4	103	f	2026-08-11 15:01:06.385+00
911	4	104	f	2026-08-11 15:01:06.385+00
917	4	105	f	2026-08-11 15:01:06.385+00
923	4	106	f	2026-08-11 15:01:06.385+00
929	4	107	f	2026-08-11 15:01:06.385+00
935	4	108	f	2026-08-11 15:01:06.385+00
941	4	109	f	2026-08-11 15:01:06.385+00
947	4	110	f	2026-08-11 15:01:06.385+00
953	4	111	f	2026-08-11 15:01:06.385+00
959	4	112	f	2026-08-11 15:01:06.385+00
965	4	113	f	2026-08-11 15:01:06.385+00
971	4	114	f	2026-08-11 15:01:06.385+00
818	8	89	f	2026-08-11 14:58:19.951+00
824	8	90	t	2026-08-11 14:58:19.951+00
836	8	92	t	2026-08-11 14:58:19.951+00
842	8	93	t	2026-08-11 14:58:19.951+00
854	8	95	t	2026-08-11 14:58:19.951+00
860	8	96	t	2026-08-11 14:58:19.951+00
866	8	97	t	2026-08-11 14:58:19.951+00
872	8	98	t	2026-08-11 14:58:19.951+00
878	8	99	t	2026-08-11 14:58:19.951+00
890	8	101	t	2026-08-11 14:58:19.951+00
896	8	102	f	2026-08-11 14:58:19.951+00
902	8	103	f	2026-08-11 14:58:19.951+00
908	8	104	f	2026-08-11 14:58:19.951+00
914	8	105	f	2026-08-11 14:58:19.951+00
920	8	106	f	2026-08-11 14:58:19.951+00
926	8	107	f	2026-08-11 14:58:19.951+00
932	8	108	f	2026-08-11 14:58:19.951+00
938	8	109	f	2026-08-11 14:58:19.951+00
944	8	110	f	2026-08-11 14:58:19.951+00
950	8	111	f	2026-08-11 14:58:19.951+00
956	8	112	f	2026-08-11 14:58:19.951+00
962	8	113	f	2026-08-11 14:58:19.951+00
968	8	114	f	2026-08-11 14:58:19.951+00
974	8	115	f	2026-08-11 14:58:19.951+00
980	8	116	f	2026-08-11 14:58:19.951+00
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
366	4	6	t	2026-08-11 15:01:06.385+00
367	4	7	t	2026-08-11 15:01:06.385+00
368	4	8	t	2026-08-11 15:01:06.385+00
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
5	8	5	t	2026-08-11 14:58:19.95+00
6	8	6	t	2026-08-11 14:58:19.95+00
369	4	9	f	2026-08-11 15:01:06.385+00
653	4	55	t	2026-08-11 15:01:06.385+00
713	4	71	t	2026-08-11 15:01:06.385+00
1588	4	118	t	2026-08-11 15:01:06.385+00
1594	4	119	t	2026-08-11 15:01:06.385+00
833	4	91	t	2026-08-11 15:01:06.385+00
851	4	94	t	2026-08-11 15:01:06.385+00
887	4	100	t	2026-08-11 15:01:06.385+00
7	8	7	t	2026-08-11 14:58:19.95+00
8	8	8	t	2026-08-11 14:58:19.95+00
650	8	55	t	2026-08-11 14:58:19.95+00
710	8	71	t	2026-08-11 14:58:19.951+00
1585	8	118	t	2026-08-11 14:58:19.951+00
830	8	91	t	2026-08-11 14:58:19.951+00
848	8	94	t	2026-08-11 14:58:19.951+00
884	8	100	t	2026-08-11 14:58:19.951+00
813	1	88	t	2026-08-11 14:59:28.043+00
831	1	91	t	2026-08-11 14:59:28.043+00
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.roles (id, role_name, created_at, role_name_si, role_name_ta) FROM stdin;
6	Admin	2026-05-29 09:43:41.12734	පරිපාලක	நிர்வாகி
8	CC Officer	2026-07-18 15:40:17.77573	සම්බන්ධීකරණ නිලධාරී	ஒருங்கிணைப்பாளர்
1	Chairman	2026-05-29 07:35:01.794472	සභාපති	தலைவர்
2	Secretary	2026-05-29 07:35:01.794472	ලේකම්	செயலாளர்
4	Subject Officer	2026-05-29 07:35:01.794472	විෂය භාර නිලධාරී	விடய அதிகாரி
5	Staff	2026-05-29 07:35:01.794472	කාර්ය මණ්ඩලය	ஊழியர்
\.


--
-- Data for Name: system_privilege_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_privilege_categories (id, category_key, category_name_en, category_name_si, category_name_ta, display_order, created_at) FROM stdin;
1	dashboard_general	Dashboard	උපකරණ පුවරුව	லாஷ்போர்டு	1	2026-08-11 05:55:33.169842+00
2	staff_management	Staff Management	කාර්ය මණ්ඩල කළමනාකරණය	ஊழியர் மேலாண்மை	2	2026-08-11 05:55:33.169842+00
3	department_management	Department Management	දෙපාර්තමේන්තු කළමනාකරණය	துறை மேலாண்மை	3	2026-08-11 05:55:33.169842+00
4	designation_management	Designation Management	තනතුරු කළමනාකරණය	பதவி மேலாண்மை	4	2026-08-11 05:55:33.169842+00
5	leave_management	Leave Management	නිවාඩු කළමනාකරණය	விடுப்பு மேலாண்மை	5	2026-08-11 05:55:33.169842+00
6	profile_requests	Profile Requests	ප්‍රොෆයිල් ඉල්ලීම්	சுயவிவர கோரிக்கைகள்	6	2026-08-11 05:55:33.169842+00
7	complaints	Complaints	පැමිණිලි	முறையீடுகள்	7	2026-08-11 05:55:33.169842+00
8	task_management	Task Management	කාර්ය කළමනාකරණය	பணி மேலாண்மை	8	2026-08-11 05:55:33.169842+00
9	announcement_management	Announcement Management	නිවේදන කළමනාකරණය	அறிவிப்பு மேலாண்மை	9	2026-08-11 05:55:33.169842+00
10	notification_management	Notification Management	දැනුම්දීම් කළමනාකරණය	அறிவித்தல் மேலாண்மை	10	2026-08-11 05:55:33.169842+00
11	reports	Reports & Analytics	වාර්තා	அறிக்கைகள்	11	2026-08-11 05:55:33.169842+00
12	audit_system	Audit System	විගණන පද්ධතිය	தணிக்கை அமைப்பு	12	2026-08-11 05:55:33.169842+00
13	role_management	Role Management	භූමිකා කළමනාකරණය	பங்கு மேலாண்மை	13	2026-08-11 05:55:33.169842+00
14	system_privilege_management	System Privileges	පද්ධති වරප්‍රසාද	கட்டமைப்பு அனுமதிகள்	14	2026-08-11 05:55:33.169842+00
15	system_settings	System Settings	පද්ධති සැකසුම්	கட்டமைப்பு அமைப்புகள்	15	2026-08-11 05:55:33.169842+00
16	mobile_app_users	Mobile App Users	මොබයිල් ඇප් පරිශීලකයින්	மொபைல் பயன்பாட்டு பயனர்கள்	16	2026-08-11 05:55:33.169842+00
\.


--
-- Data for Name: system_privileges; Type: TABLE DATA; Schema: public; Owner: -
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
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tasks (id, title, description, assigned_to, assigned_by, department_id, due_date, status, created_at, updated_at, title_en, title_si, title_ta, description_en, description_si, description_ta) FROM stdin;
14	ghhh	fffff	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-11 00:00:00	Pending	2026-08-09 14:48:04.144+00	2026-08-09 14:48:04.144+00	ghhh	ghhh	ghhh	fffff	fffff	fffff
13	hjhg	hjhjh	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-11 00:00:00	Completed	2026-08-09 14:47:21.186+00	2026-08-10 08:16:10.894+00	hjhg	hjhg	hjhg	hjhjh	hjhjh	hjhjh
15	BH	BH (Base Hospital)	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-12 00:00:00	Pending	2026-08-11 15:10:19.599+00	2026-08-11 15:10:19.599+00	BH	මූලික රෝහල	ஆதார வைத்தியசாலை	BH (Base Hospital)	මූලික රෝහල (BH)	ஆதார வைத்தியசாலை (BH)
12	New Library Building Proposal	You have to bring the final proposal for new library building	c9f7a318-d3f1-4433-9511-48d0a825e31c	2ace860d-4275-49eb-b92c-4dc932dd2c45	6	2026-08-10 00:00:00	Completed	2026-08-09 14:42:12.515+00	2026-08-09 14:46:00.152+00	New Library Building Proposal	නව පුස්තකාල ගොඩනැගිලි යෝජනාව	புதிய நூலகக் கட்டிட முன்மொழிவு	You have to bring the final proposal for new library building	You have to bring the final proposal for new library building	You have to bring the final proposal for new library building
\.


--
-- Data for Name: user_leave_balances; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_leave_balances (id, user_id, leave_type_id, year, remaining_days, allocated_days, used_days) FROM stdin;
28	c9f7a318-d3f1-4433-9511-48d0a825e31c	12	2025	5.0	24	19
29	c9f7a318-d3f1-4433-9511-48d0a825e31c	11	2025	10.0	21	11
34	ac2347dd-63ef-4596-aa07-8219ce3ca093	11	2026	20.0	21	1
35	ac2347dd-63ef-4596-aa07-8219ce3ca093	13	2026	0.0	0	0
36	ac2347dd-63ef-4596-aa07-8219ce3ca093	14	2026	2.0	2	0
37	ac2347dd-63ef-4596-aa07-8219ce3ca093	12	2026	22.0	24	2
38	297e22da-ddf4-4964-8452-6fee8738b1cb	11	2026	20.0	21	1
39	297e22da-ddf4-4964-8452-6fee8738b1cb	13	2026	0.0	0	0
40	297e22da-ddf4-4964-8452-6fee8738b1cb	14	2026	2.0	2	0
41	297e22da-ddf4-4964-8452-6fee8738b1cb	12	2026	24.0	24	0
42	7f22da36-c2b9-4f8c-8c90-55e27c11543b	11	2026	18.0	21	3
43	7f22da36-c2b9-4f8c-8c90-55e27c11543b	13	2026	0.0	0	0
44	7f22da36-c2b9-4f8c-8c90-55e27c11543b	14	2026	1.0	2	1
45	7f22da36-c2b9-4f8c-8c90-55e27c11543b	12	2026	24.0	24	0
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, auth_id, full_name, email, phone, avatar_url, is_active, role_id, department_id, created_at, nic, full_name_si, full_name_ta, updated_at, staff_category, signature_url, birthday, gender, is_first_login, designation_id, title, joined_date) FROM stdin;
cf50617c-2fb4-4a31-a525-3d7164d036a5	e6eea446-2800-4328-9f59-a662a16abf41	Subject Officer	subjectofficer@pradeshiya.gov.lk	\N	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/e6eea446-2800-4328-9f59-a662a16abf41_1786458931195.jpg	t	4	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-09 18:02:51.211+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cf50617c-2fb4-4a31-a525-3d7164d036a5/signature-1786298568999.png	\N	\N	t	\N	\N	\N
18ba6a00-b287-4c42-9d84-a99f7b12ddd4	a6148a55-6a57-4213-92c0-e52b6f87f01f	Dulmini Gamlath	dulminikumari2002@gmail.com	+94705229031	\N	t	5	6	2026-08-09 13:05:04.669231	200260100646	\N	\N	\N	Staff	\N	2002-04-11	Female	f	18	Mr	2026-01-05
f23bc81d-73d8-40fc-88c9-c9d67aedca6c	612fa8f3-16f1-4d23-9186-da03fd75f126	Lakshmi Dharmarathne	lakshmidharmarathna@gmail.com	+94706209030	\N	t	5	2	2026-08-09 13:07:53.03846	708240370V	\N	\N	\N	Labour	\N	1970-11-20	Female	t	10	Ms	2014-01-10
c9f7a318-d3f1-4433-9511-48d0a825e31c	ddea66f5-de28-469c-be1b-122b570703dd	S.T.S.D Chandrakumara	dewrangashamindu17@gmail.com	+94752052510	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/avatars/1786287022299.jpg	t	5	6	2026-08-09 13:02:37.114391	200401600537	\N	\N	2026-08-09 15:05:03.855+00	Staff	\N	2004-01-15	Male	f	17	Mr	2026-01-01
ac2347dd-63ef-4596-aa07-8219ce3ca093	a50cdb87-15b2-488b-bc34-f3b178e9a040	Amavi	bbcnew16@gmail.com	+94778442568	\N	t	5	6	2026-08-09 18:51:35.862353	200062100061	\N	\N	\N	Staff	\N	2000-04-30	Female	t	17	Mr	2026-01-05
297e22da-ddf4-4964-8452-6fee8738b1cb	db77b07a-78a9-46a0-b5b7-3e2bbcb2db31	Hansika Samnathi	hansika@edu.lnbti.lk	+94713724818	\N	t	5	6	2026-08-10 08:19:03.539138	926001078V	\N	\N	\N	Staff	\N	1992-04-09	Female	f	17	Mrs	2026-08-10
d3d6bd6d-210d-477e-b877-d3c1176254e1	cd536781-f062-41e0-a30f-e043665970a3	System Administrator	admin@pradeshiya.gov.lk	\N	\N	t	6	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-10 15:09:00.394+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/d3d6bd6d-210d-477e-b877-d3c1176254e1/signature-1786374539346.png	\N	\N	t	\N	\N	\N
2ace860d-4275-49eb-b92c-4dc932dd2c45	04391a6a-549b-409b-929b-860f9b0ba271	Chairman	chairman@pradeshiya.gov.lk	\N	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/04391a6a-549b-409b-929b-860f9b0ba271_1786457651723.png	t	1	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-08-08 13:28:58.507+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/2ace860d-4275-49eb-b92c-4dc932dd2c45/signature-1786195737470.png	\N	\N	t	\N	\N	\N
7f22da36-c2b9-4f8c-8c90-55e27c11543b	1ba4b54b-1862-4296-96f6-9b0f0790e5fe	Anshya	anshyajayarathna2003@gmail.com	+94778442568	\N	t	5	10	2026-08-11 04:36:44.364814	200385610377	\N	\N	2026-08-11 14:15:55.909+00	Staff	\N	2003-12-22	Female	t	21	Ms	2026-01-11
cc3b3ba4-b678-4d45-8916-ef86f535abd0	ff539ee4-f139-44c1-9d00-3714f2c30bec	Secretary	secretary@pradeshiya.gov.lk	\N	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/ff539ee4-f139-44c1-9d00-3714f2c30bec_1786457977421.png	t	2	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-07-31 11:49:21.905+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/cc3b3ba4-b678-4d45-8916-ef86f535abd0/signature-1785498560834.png	\N	\N	t	\N	\N	\N
dfc361d0-1cb0-47a5-bf8b-cf21871c8773	9315fb98-1ca2-452d-abe0-082cb16a64fb	CC Officer	ccofficer@pradeshiya.gov.lk	\N	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/avatars/9315fb98-1ca2-452d-abe0-082cb16a64fb_1786458834094.png	t	8	\N	2026-07-25 16:12:07.817112	\N	\N	\N	2026-07-31 11:46:25.63+00	Staff	https://txbfrlckwvtqjdznxznt.supabase.co/storage/v1/object/public/signatures/dfc361d0-1cb0-47a5-bf8b-cf21871c8773/signature-1785498384243.png	\N	\N	t	\N	\N	\N
\.


--
-- Name: announcements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.announcements_id_seq', 21, true);


--
-- Name: app_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.app_settings_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 179, true);


--
-- Name: complaint_attachments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaint_attachments_id_seq', 8, true);


--
-- Name: complaint_recipients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaint_recipients_id_seq', 14, true);


--
-- Name: complaint_replies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaint_replies_id_seq', 6, true);


--
-- Name: complaints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.complaints_id_seq', 13, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.departments_id_seq', 10, true);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.designations_id_seq', 21, true);


--
-- Name: leave_forms_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_forms_id_seq', 56, true);


--
-- Name: leave_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_requests_id_seq', 56, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 15, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 489, true);


--
-- Name: profile_change_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profile_change_requests_id_seq', 29, true);


--
-- Name: role_privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.role_privileges_id_seq', 5222, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.roles_id_seq', 8, true);


--
-- Name: system_privilege_categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_privilege_categories_id_seq', 1, false);


--
-- Name: system_privileges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.system_privileges_id_seq', 124, true);


--
-- Name: tasks_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.tasks_id_seq', 15, true);


--
-- Name: user_leave_balances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_leave_balances_id_seq', 45, true);


--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: complaint_attachments complaint_attachments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_pkey PRIMARY KEY (id);


--
-- Name: complaint_recipients complaint_recipients_complaint_id_recipient_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_complaint_id_recipient_id_key UNIQUE (complaint_id, recipient_id);


--
-- Name: complaint_recipients complaint_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_pkey PRIMARY KEY (id);


--
-- Name: complaint_replies complaint_replies_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_pkey PRIMARY KEY (id);


--
-- Name: complaints complaints_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_pkey PRIMARY KEY (id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: leave_forms leave_forms_leave_request_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_leave_request_id_key UNIQUE (leave_request_id);


--
-- Name: leave_forms leave_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_pkey PRIMARY KEY (id);


--
-- Name: leave_requests leave_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: profile_change_requests profile_change_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_pkey PRIMARY KEY (id);


--
-- Name: role_privileges role_privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_pkey PRIMARY KEY (id);


--
-- Name: role_privileges role_privileges_role_id_privilege_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_role_id_privilege_id_key UNIQUE (role_id, privilege_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: system_privilege_categories system_privilege_categories_category_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privilege_categories
    ADD CONSTRAINT system_privilege_categories_category_key_key UNIQUE (category_key);


--
-- Name: system_privilege_categories system_privilege_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privilege_categories
    ADD CONSTRAINT system_privilege_categories_pkey PRIMARY KEY (id);


--
-- Name: system_privileges system_privileges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_pkey PRIMARY KEY (id);


--
-- Name: system_privileges system_privileges_privilege_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_privilege_key_key UNIQUE (privilege_key);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: user_leave_balances user_leave_balances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_pkey PRIMARY KEY (id);


--
-- Name: user_leave_balances user_leave_balances_user_id_leave_type_id_year_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_user_id_leave_type_id_year_key UNIQUE (user_id, leave_type_id, year);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_emp_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_emp_id_key UNIQUE (nic);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: complaint_attachments_complaint_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX complaint_attachments_complaint_idx ON public.complaint_attachments USING btree (complaint_id);


--
-- Name: complaint_recipients_complaint_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX complaint_recipients_complaint_idx ON public.complaint_recipients USING btree (complaint_id);


--
-- Name: complaint_recipients_recipient_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX complaint_recipients_recipient_idx ON public.complaint_recipients USING btree (recipient_id);


--
-- Name: idx_announcements_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_announcements_expires_at ON public.announcements USING btree (expires_at);


--
-- Name: idx_audit_logs_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_created ON public.audit_logs USING btree (created_at);


--
-- Name: idx_audit_logs_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_audit_logs_user ON public.audit_logs USING btree (user_id);


--
-- Name: idx_complaint_attachments_complaint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_attachments_complaint ON public.complaint_attachments USING btree (complaint_id);


--
-- Name: idx_complaint_recipients_complaint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_recipients_complaint ON public.complaint_recipients USING btree (complaint_id);


--
-- Name: idx_complaint_recipients_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_recipients_recipient ON public.complaint_recipients USING btree (recipient_id);


--
-- Name: idx_complaints_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_status ON public.complaints USING btree (status);


--
-- Name: idx_complaints_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaints_user ON public.complaints USING btree (user_id);


--
-- Name: idx_leave_requests_coverage_officer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_coverage_officer ON public.leave_requests USING btree (coverage_officer_id);


--
-- Name: idx_leave_requests_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_status ON public.leave_requests USING btree (status);


--
-- Name: idx_leave_requests_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_leave_requests_user ON public.leave_requests USING btree (user_id);


--
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, is_read);


--
-- Name: idx_users_department; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_department ON public.users USING btree (department_id);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_role ON public.users USING btree (role_id);


--
-- Name: leave_requests after_leave_request_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER after_leave_request_insert AFTER INSERT ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.notify_subject_officer_on_leave();


--
-- Name: users tr_extract_nic_details; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER tr_extract_nic_details BEFORE INSERT OR UPDATE OF nic ON public.users FOR EACH ROW WHEN ((new.nic IS NOT NULL)) EXECUTE FUNCTION public.extract_nic_details();


--
-- Name: leave_requests trg_validate_new_leave_request; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_validate_new_leave_request BEFORE INSERT ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.validate_new_leave_request();


--
-- Name: announcements announcements_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: announcements announcements_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.announcements
    ADD CONSTRAINT announcements_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaint_attachments complaint_attachments_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_attachments complaint_attachments_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_attachments
    ADD CONSTRAINT complaint_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaint_recipients complaint_recipients_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_recipients complaint_recipients_recipient_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_recipients
    ADD CONSTRAINT complaint_recipients_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaint_replies complaint_replies_complaint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_complaint_id_fkey FOREIGN KEY (complaint_id) REFERENCES public.complaints(id) ON DELETE CASCADE;


--
-- Name: complaint_replies complaint_replies_replied_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_replies
    ADD CONSTRAINT complaint_replies_replied_by_fkey FOREIGN KEY (replied_by) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: complaints complaints_assigned_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_assigned_supervisor_id_fkey FOREIGN KEY (assigned_supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: complaints complaints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaints
    ADD CONSTRAINT complaints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: designations designations_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE CASCADE;


--
-- Name: users fk_users_designation; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT fk_users_designation FOREIGN KEY (designation_id) REFERENCES public.designations(id);


--
-- Name: leave_forms leave_forms_leave_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_forms
    ADD CONSTRAINT leave_forms_leave_request_id_fkey FOREIGN KEY (leave_request_id) REFERENCES public.leave_requests(id) ON DELETE CASCADE;


--
-- Name: leave_requests leave_requests_coverage_officer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_coverage_officer_id_fkey FOREIGN KEY (coverage_officer_id) REFERENCES public.users(id);


--
-- Name: leave_requests leave_requests_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id);


--
-- Name: leave_requests leave_requests_supervisor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_supervisor_id_fkey FOREIGN KEY (supervisor_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: leave_requests leave_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.leave_requests
    ADD CONSTRAINT leave_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: profile_change_requests profile_change_requests_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: profile_change_requests profile_change_requests_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_change_requests
    ADD CONSTRAINT profile_change_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: role_privileges role_privileges_privilege_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_privilege_id_fkey FOREIGN KEY (privilege_id) REFERENCES public.system_privileges(id) ON DELETE CASCADE;


--
-- Name: role_privileges role_privileges_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.role_privileges
    ADD CONSTRAINT role_privileges_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE;


--
-- Name: system_privileges system_privileges_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_privileges
    ADD CONSTRAINT system_privileges_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.system_privilege_categories(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_by_fkey FOREIGN KEY (assigned_by) REFERENCES public.users(id);


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: user_leave_balances user_leave_balances_leave_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_leave_type_id_fkey FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT;


--
-- Name: user_leave_balances user_leave_balances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_leave_balances
    ADD CONSTRAINT user_leave_balances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: users users_auth_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_auth_id_fkey FOREIGN KEY (auth_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: users users_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE RESTRICT;


--
-- Name: users Allow users to update their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to update their own profile" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = auth_id)) WITH CHECK ((auth.uid() = auth_id));


--
-- Name: users Allow users to view their own profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Allow users to view their own profile" ON public.users FOR SELECT TO authenticated USING ((auth.uid() = auth_id));


--
-- Name: complaint_attachments Users delete own complaint attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own complaint attachments" ON public.complaint_attachments FOR DELETE TO authenticated USING ((uploaded_by IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))));


--
-- Name: complaint_recipients Users delete own complaint recipients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users delete own complaint recipients" ON public.complaint_recipients FOR DELETE TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND (u.auth_id = auth.uid())))));


--
-- Name: complaint_attachments Users insert own complaint attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own complaint attachments" ON public.complaint_attachments FOR INSERT TO authenticated WITH CHECK (((uploaded_by IN ( SELECT users.id
   FROM public.users
  WHERE (users.auth_id = auth.uid()))) AND (EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_attachments.complaint_id) AND (u.auth_id = auth.uid()))))));


--
-- Name: complaint_recipients Users insert own complaint recipients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users insert own complaint recipients" ON public.complaint_recipients FOR INSERT TO authenticated WITH CHECK ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users u ON ((u.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND (u.auth_id = auth.uid())))));


--
-- Name: complaint_attachments Users view related complaint attachments; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view related complaint attachments" ON public.complaint_attachments FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users sender ON ((sender.id = c.user_id)))
  WHERE ((c.id = complaint_attachments.complaint_id) AND ((sender.auth_id = auth.uid()) OR (EXISTS ( SELECT 1
           FROM (public.complaint_recipients cr
             JOIN public.users recipient_user ON ((recipient_user.id = cr.recipient_id)))
          WHERE ((cr.complaint_id = c.id) AND (recipient_user.auth_id = auth.uid())))))))));


--
-- Name: complaint_recipients Users view related complaint recipients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users view related complaint recipients" ON public.complaint_recipients FOR SELECT TO authenticated USING ((EXISTS ( SELECT 1
   FROM (public.complaints c
     JOIN public.users sender ON ((sender.id = c.user_id)))
  WHERE ((c.id = complaint_recipients.complaint_id) AND ((sender.auth_id = auth.uid()) OR (complaint_recipients.recipient_id IN ( SELECT users.id
           FROM public.users
          WHERE (users.auth_id = auth.uid()))))))));


--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: role_privileges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.role_privileges ENABLE ROW LEVEL SECURITY;

--
-- Name: system_privilege_categories; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_privilege_categories ENABLE ROW LEVEL SECURITY;

--
-- Name: system_privileges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.system_privileges ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--

\unrestrict GUkXUFSUMsIfWlickkjnmGDwpzRaaCXhi1COOfLRM5FVqW2gjImJrboS9E3kFoJ

