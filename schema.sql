-- =========================================================
-- AI-Powered Intelligent MCQ Generation and Adaptive
-- LearnFlow - Supabase/PostgreSQL Schema
-- Unified single user account (no student/teacher/admin roles)
-- =========================================================

-- Supabase Auth already provides an auth.users table.
-- We extend it with a profile table for app-specific fields.

create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    created_at timestamptz not null default now()
);

-- =========================================================
-- TEXTBOOKS
-- =========================================================
create table textbooks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    title text not null,
    subject text,
    file_url text,              -- Supabase Storage path/URL
    extracted_text text,        -- raw text pulled from the PDF
    uploaded_at timestamptz not null default now()
);

create index idx_textbooks_user on textbooks(user_id);

-- =========================================================
-- QUESTIONS
-- =========================================================
create type difficulty_level as enum ('Easy', 'Medium', 'Hard');
create type bloom_level as enum ('Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate');
create type validation_status as enum ('Pending', 'Approved', 'Edited', 'Rejected');

create table questions (
    id uuid primary key default gen_random_uuid(),
    textbook_id uuid references textbooks(id) on delete set null,
    user_id uuid not null references profiles(id) on delete cascade,
    topic text not null,
    question text not null,
    option_a text not null,
    option_b text not null,
    option_c text not null,
    option_d text not null,
    correct_answer char(1) not null check (correct_answer in ('A','B','C','D')),
    explanation text,
    difficulty difficulty_level not null,
    bloom_level bloom_level,
    validation validation_status not null default 'Pending',
    source_page int,
    created_at timestamptz not null default now()
);

create index idx_questions_user on questions(user_id);
create index idx_questions_topic on questions(topic);
create index idx_questions_difficulty on questions(difficulty);
create index idx_questions_bloom on questions(bloom_level);

-- =========================================================
-- QUIZZES
-- =========================================================
create table quizzes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    title text not null,
    is_adaptive boolean not null default false,
    created_at timestamptz not null default now()
);

create table quiz_questions (
    quiz_id uuid references quizzes(id) on delete cascade,
    question_id uuid references questions(id) on delete cascade,
    position int,
    primary key (quiz_id, question_id)
);

-- =========================================================
-- QUIZ ATTEMPTS
-- =========================================================
create table quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references quizzes(id) on delete cascade,
    user_id uuid not null references profiles(id) on delete cascade,
    score numeric(5,2),
    total_questions int,
    started_at timestamptz not null default now(),
    completed_at timestamptz
);

create index idx_attempts_user on quiz_attempts(user_id);

-- =========================================================
-- ANSWERS
-- =========================================================
create table answers (
    id uuid primary key default gen_random_uuid(),
    attempt_id uuid not null references quiz_attempts(id) on delete cascade,
    question_id uuid not null references questions(id) on delete cascade,
    selected_answer char(1) check (selected_answer in ('A','B','C','D')),
    is_correct boolean,
    answered_at timestamptz not null default now()
);

create index idx_answers_attempt on answers(attempt_id);
create index idx_answers_question on answers(question_id);

-- =========================================================
-- AI TEST SOLVER LOGS (optional, for history/profile view)
-- =========================================================
create table test_solver_runs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references profiles(id) on delete cascade,
    input_text text,
    input_file_url text,
    answer_style text check (answer_style in ('Short','Detailed','Exam','Point-wise')),
    output_text text,
    created_at timestamptz not null default now()
);

-- =========================================================
-- USEFUL VIEWS FOR ANALYTICS / WEAK TOPICS / BLOOM PERFORMANCE
-- =========================================================

-- Topic-wise performance per user
create view topic_performance as
select
    a.attempt_id,
    qa.user_id,
    q.topic,
    count(*) as total_answered,
    sum(case when a.is_correct then 1 else 0 end) as correct_count,
    round(100.0 * sum(case when a.is_correct then 1 else 0 end) / count(*), 2) as accuracy_pct
from answers a
join questions q on q.id = a.question_id
join quiz_attempts qa on qa.id = a.attempt_id
group by a.attempt_id, qa.user_id, q.topic;

-- Bloom's level performance per user
create view bloom_performance as
select
    qa.user_id,
    q.bloom_level,
    count(*) as total_answered,
    sum(case when a.is_correct then 1 else 0 end) as correct_count,
    round(100.0 * sum(case when a.is_correct then 1 else 0 end) / count(*), 2) as accuracy_pct
from answers a
join questions q on q.id = a.question_id
join quiz_attempts qa on qa.id = a.attempt_id
group by qa.user_id, q.bloom_level;

-- Difficulty-wise performance per user
create view difficulty_performance as
select
    qa.user_id,
    q.difficulty,
    count(*) as total_answered,
    sum(case when a.is_correct then 1 else 0 end) as correct_count,
    round(100.0 * sum(case when a.is_correct then 1 else 0 end) / count(*), 2) as accuracy_pct
from answers a
join questions q on q.id = a.question_id
join quiz_attempts qa on qa.id = a.attempt_id
group by qa.user_id, q.difficulty;
