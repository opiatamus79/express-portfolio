CREATE TABLE users(
  id           serial,
  email        text,
  password     text,
  user_type    int,
  user_info    int,
  projects     int[],
  qb_id        int,
  date_created timestamptz DEFAULT NOW(),
  logged_in    boolean DEFAULT FALSE
);

CREATE TABLE user_info(
  id              serial,
  first_name      text,
  last_name       text,
  phone           text,
  company_name    text,
  company_address text,
  company_city    text,
  company_state   text,
  company_zipcode text,
  date_created    timestamptz DEFAULT NOW()
);

CREATE TABLE user_types(
  id           serial,
  name         text,
  description  text,
  permissions  json,
  date_created timestamptz DEFAULT NOW()
);

CREATE TABLE projects(
  id          serial,
  name        text,
  jira_name   text,
  jira_code   text,
  jira_link   text,
  date_created timestamptz DEFAULT NOW()
);

CREATE TABLE account_setup(
  id                      serial,
  user_id                 int,
  send_sms_mms            boolean DEFAULT FALSE,
  setup_credit_card       boolean DEFAULT FALSE,
  setup_ach               boolean DEFAULT FALSE,
  terms_of_service        boolean DEFAULT TRUE,
  change_scope_approval   boolean DEFAULT FALSE,
  estimate_approval       boolean DEFAULT FALSE,
  task_in_progress        boolean DEFAULT FALSE,
  task_complete           boolean DEFAULT FALSE,
  date_created            timestamptz DEFAULT NOW()
);

CREATE TABLE requests(
  id            serial,
  user_id       int,
  project_id    int,
  title         text,
  description   text,
  priority      int,
  status        int DEFAULT 1,
  complete      boolean DEFAULT FALSE,
  reject_count  int,
  reject_reason text[],
  attachments   text[],
  last_updated  timestamptz DEFAULT NOW(),
  date_created  timestamptz DEFAULT NOW()
);

CREATE TABLE tasks(
  id            serial,
  request_id    int,
  jira_name     text,
  jira_code     text,
  jira_link     text,
  statement     text,
  solution      text,
  min_estimate  real,
  max_estimate  real,
  reject_count  int,
  reject_reason text[],
  status        int DEFAULT 5,
  last_updated  timestamptz DEFAULT NOW(),
  date_created  timestamptz DEFAULT NOW()
);

CREATE TABLE priority(
  id            serial,
  name          text,
  description   text,
  billable_rate numeric,
  color         text,
  date_created  timestamptz DEFAULT NOW()
);

CREATE TABLE status(
  id           serial,
  name         text,
  description  text,
  color        text,
  date_created timestamptz DEFAULT NOW()
);

CREATE TABLE questions(
  id              serial,
  question        text,
  answers         int[],
  request_column  text,
  date_created    timestamptz DEFAULT NOW()
);

CREATE TABLE answers(
  id               serial,
  answer           text,
  next_question_id text,
  question_id      text,
  date_created     timestamptz DEFAULT NOW()
);

CREATE TABLE communication_logs(
  id           serial,
  type         int,
  _to          text,
  _from        text,
  message      text,
  read         boolean DEFAULT false,
  read_date    timestamptz DEFAULT NOW(),
  date_created timestamptz DEFAULT NOW()
);

CREATE TABLE communication_types(
  id           serial,
  name         text,
  description  text,
  date_created timestamptz DEFAULT NOW()
);

CREATE TABLE question_set(
  id                serial,
  keyword           text,
  prompt            text,
  first_question_id int,
  date_created      timestamptz DEFAULT NOW()
);

CREATE TABLE invites(
  id                serial,
  sales_person_id   int,
  token             text,
  date_created      timestamptz DEFAULT NOW()
);

CREATE TABLE salesPerson_customer_Map(
  id                serial,
  sales_person_id   int,
  customer_id       int,
  date_created      timestamptz DEFAULT NOW()
);

CREATE TABLE planning_session(
  id                    serial,
  user_id               int,
  project_id            int,
  planning_option_id    int,
  status                int,
  title                 text,
  description           text,
  output                text,
  meeting_date          timestamptz,
  meeting_time          text,
  reject_count          int,
  reject_reason         text[],
  complete              boolean DEFAULT true,
  date_created          timestamptz DEFAULT NOW()
);

CREATE TABLE planning_option(
  id                    serial,
  option                text,
  price                 numeric,
  date_created          timestamptz DEFAULT NOW()
);
