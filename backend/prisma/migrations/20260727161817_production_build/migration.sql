-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'LOCKED', 'SUSPENDED', 'PENDING_APPROVAL');

-- CreateEnum
CREATE TYPE "ApplicantDocCategory" AS ENUM ('CV', 'CERTIFICATE');

-- CreateEnum
CREATE TYPE "RoleStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SalaryComponentType" AS ENUM ('EARNING', 'DEDUCTION');

-- CreateEnum
CREATE TYPE "CalculationMethod" AS ENUM ('FIXED', 'PERCENTAGE', 'FORMULA', 'MANUAL');

-- CreateEnum
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "PositionStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "StandardStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EmployeeRecordStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('ACTIVE', 'PROBATION', 'ON_LEAVE', 'RESIGNED', 'TERMINATED', 'RETIRED');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'LEAVE', 'HOLIDAY', 'WEEKEND', 'INCOMPLETE');

-- CreateEnum
CREATE TYPE "AttendanceIncidentType" AS ENUM ('LATE_ARRIVAL', 'EARLY_DEPARTURE', 'MISSING_CHECK_IN', 'MISSING_CHECK_OUT', 'UNAUTHORIZED_ABSENCE', 'DEVICE_ERROR', 'MANUAL_CORRECTION');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'APPROVED', 'REJECTED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('FINGERPRINT', 'FACE_RECOGNITION', 'RFID', 'QR_CODE', 'MOBILE');

-- CreateEnum
CREATE TYPE "DeviceConnectionStatus" AS ENUM ('ONLINE', 'OFFLINE', 'SYNCHRONIZING', 'ERROR', 'MAINTENANCE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'SUCCESS', 'ERROR', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'PAYROLL_READY', 'DOCUMENT_REQUEST', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "ChangeRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ACKNOWLEDGED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollStatus" AS ENUM ('DRAFT', 'APPROVED', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PayrollPeriodStatus" AS ENUM ('DRAFT', 'OPEN', 'PROCESSING', 'CLOSED', 'LOCKED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('PUBLIC', 'COMPANY', 'REGIONAL', 'RELIGIOUS', 'SPECIAL');

-- CreateEnum
CREATE TYPE "HolidayStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "SettingValueType" AS ENUM ('STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'JSON');

-- CreateEnum
CREATE TYPE "SettingStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AuditEventType" AS ENUM ('AUTHENTICATION', 'SECURITY', 'USER_MANAGEMENT', 'EMPLOYEE', 'ATTENDANCE', 'PAYROLL', 'DOCUMENT', 'SYSTEM_CONFIGURATION', 'ROLE_PERMISSION', 'ORGANIZATION', 'OTHER');

-- CreateTable
CREATE TABLE "roles" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "status" "RoleStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(150) NOT NULL,
    "module" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "employee_id" UUID,
    "role_id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMPTZ,
    "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
    "password_changed_at" TIMESTAMPTZ,
    "locked_until" TIMESTAMPTZ,
    "password_reset_token_hash" TEXT,
    "password_reset_expires" TIMESTAMPTZ,
    "security_question" VARCHAR(500),
    "security_answer_hash" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "revoked_at" TIMESTAMPTZ,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "manager_id" UUID,
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "grade" SMALLINT,
    "status" "PositionStatus" NOT NULL DEFAULT 'ACTIVE',
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" UUID NOT NULL,
    "employee_number" VARCHAR(30) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "preferred_name" VARCHAR(100),
    "gender" "Gender",
    "date_of_birth" DATE,
    "national_id" VARCHAR(100),
    "passport_number" VARCHAR(100),
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "alternate_phone" VARCHAR(50),
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(50),
    "emergency_contact_relationship" VARCHAR(100),
    "department_id" UUID,
    "position_id" UUID,
    "manager_id" UUID,
    "employment_status" "EmploymentStatus" NOT NULL DEFAULT 'ACTIVE',
    "employment_type" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "hire_date" DATE NOT NULL,
    "termination_date" DATE,
    "status" "EmployeeRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_change_requests" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT NOT NULL,
    "status" "ChangeRequestStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "profile_change_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "start_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "end_time_minutes" INTEGER NOT NULL DEFAULT 0,
    "break_minutes" INTEGER NOT NULL DEFAULT 0,
    "grace_minutes" INTEGER NOT NULL DEFAULT 0,
    "status" "ShiftStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_shift_assignments" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "shift_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "days_of_week" TEXT[] DEFAULT ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri']::TEXT[],
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "employee_shift_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_devices" (
    "id" UUID NOT NULL,
    "device_code" VARCHAR(50) NOT NULL,
    "device_name" VARCHAR(150) NOT NULL,
    "device_type" "DeviceType" NOT NULL,
    "manufacturer" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100),
    "serial_number" VARCHAR(100) NOT NULL,
    "ip_address" VARCHAR(50) NOT NULL,
    "port" INTEGER NOT NULL,
    "location" VARCHAR(255) NOT NULL,
    "status" "StandardStatus" NOT NULL DEFAULT 'ACTIVE',
    "connection_status" "DeviceConnectionStatus" NOT NULL DEFAULT 'OFFLINE',
    "last_ping_at" TIMESTAMPTZ,
    "last_sync_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "attendance_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_records" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "shift_id" UUID,
    "check_in_time" TIMESTAMPTZ,
    "check_out_time" TIMESTAMPTZ,
    "worked_minutes" INTEGER,
    "overtime_minutes" INTEGER,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "notes" TEXT,
    "device_id" UUID,
    "is_manual_entry" BOOLEAN NOT NULL DEFAULT false,
    "check_in_latitude" DECIMAL(10,7),
    "check_in_longitude" DECIMAL(10,7),
    "check_out_latitude" DECIMAL(10,7),
    "check_out_longitude" DECIMAL(10,7),
    "correction_reason" TEXT,
    "corrected_by" UUID,
    "corrected_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_incidents" (
    "id" UUID NOT NULL,
    "record_id" UUID NOT NULL,
    "type" "AttendanceIncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'LOW',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "resolved_by" UUID,
    "resolved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "attendance_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_types" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "carry_forward" BOOLEAN NOT NULL DEFAULT false,
    "max_days_per_year" INTEGER NOT NULL DEFAULT 0,
    "status" "StandardStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "leave_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_balances" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "entitled_days" DECIMAL(5,1) NOT NULL,
    "used_days" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "carried_over_days" DECIMAL(5,1) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "leave_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "total_days" DECIMAL(5,1) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "approver_id" UUID,
    "approved_at" TIMESTAMPTZ,
    "rejection_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_approval_steps" (
    "id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "approver_order" INTEGER NOT NULL,
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "approved_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "leave_approval_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "salary_components" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "type" "SalaryComponentType" NOT NULL,
    "calculation_method" "CalculationMethod" NOT NULL,
    "default_value" DECIMAL(15,3) DEFAULT 0,
    "formula" TEXT,
    "is_taxable" BOOLEAN NOT NULL DEFAULT false,
    "is_pensionable" BOOLEAN NOT NULL DEFAULT false,
    "status" "StandardStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "salary_components_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_disbursements" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "payroll_period_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "pay_date" DATE NOT NULL,
    "basic_salary" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "overtime_amount" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "allowance_amount" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "bonus_amount" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "deduction_amount" DECIMAL(15,3) NOT NULL DEFAULT 0,
    "gross_salary" DECIMAL(15,3) NOT NULL,
    "net_salary" DECIMAL(15,3) NOT NULL,
    "status" "PayrollStatus" NOT NULL DEFAULT 'DRAFT',
    "remarks" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "payroll_disbursements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_salary_profiles" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "salary_component_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "custom_value" DECIMAL(15,3),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "employee_salary_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payslip_items" (
    "id" UUID NOT NULL,
    "payroll_disbursement_id" UUID NOT NULL,
    "salary_component_id" UUID NOT NULL,
    "amount" DECIMAL(15,3) NOT NULL,
    "calculation_detail" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "payslip_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_bank_accounts" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "account_name" VARCHAR(150) NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(150) NOT NULL,
    "branch_code" VARCHAR(30),
    "swift_code" VARCHAR(20),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "status" "StandardStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "employee_bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_periods" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "pay_date" DATE NOT NULL,
    "status" "PayrollPeriodStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "payroll_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "description" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "document_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_documents" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "stored_filename" VARCHAR(255) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "checksum" VARCHAR(128),
    "uploaded_by" UUID,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ,
    "is_confidential" BOOLEAN NOT NULL DEFAULT false,
    "status" "DocumentStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "employee_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "cycle" VARCHAR(50) NOT NULL,
    "rating" SMALLINT,
    "goals" JSONB,
    "comments" TEXT,
    "status" "ReviewStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "date" DATE NOT NULL,
    "holiday_type" "HolidayType" NOT NULL DEFAULT 'PUBLIC',
    "description" TEXT,
    "region" VARCHAR(100),
    "is_paid" BOOLEAN NOT NULL DEFAULT true,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "status" "HolidayStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "key" VARCHAR(150) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "value" TEXT NOT NULL,
    "value_type" "SettingValueType" NOT NULL,
    "description" TEXT,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "status" "SettingStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "employee_id" UUID,
    "event_type" "AuditEventType" NOT NULL,
    "entity_name" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(100),
    "action" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "correlation_id" VARCHAR(100),
    "old_values" JSONB,
    "new_values" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "middle_name" VARCHAR(100),
    "last_name" VARCHAR(100) NOT NULL,
    "preferred_name" VARCHAR(100),
    "date_of_birth" DATE,
    "gender" VARCHAR(20),
    "national_id" VARCHAR(100),
    "passport_number" VARCHAR(100),
    "phone" VARCHAR(50),
    "alternate_phone" VARCHAR(50),
    "address_line_1" VARCHAR(255),
    "address_line_2" VARCHAR(255),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "postal_code" VARCHAR(20),
    "country" VARCHAR(100),
    "emergency_contact_name" VARCHAR(150),
    "emergency_contact_phone" VARCHAR(50),
    "emergency_contact_relationship" VARCHAR(100),
    "submitted_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "applicant_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applicant_documents" (
    "id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "category" "ApplicantDocCategory" NOT NULL,
    "original_filename" VARCHAR(255) NOT NULL,
    "stored_filename" VARCHAR(255) NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" VARCHAR(100) NOT NULL,
    "file_size_bytes" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicant_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_code_key" ON "roles"("code");

-- CreateIndex
CREATE INDEX "roles_status_idx" ON "roles"("status");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE INDEX "permissions_module_idx" ON "permissions"("module");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_employee_id_key" ON "users"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_hash_key" ON "users"("password_reset_token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE INDEX "departments_status_idx" ON "departments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "positions_name_key" ON "positions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "positions_code_key" ON "positions"("code");

-- CreateIndex
CREATE INDEX "positions_status_idx" ON "positions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employees_employee_number_key" ON "employees"("employee_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_national_id_key" ON "employees"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "employees_passport_number_key" ON "employees"("passport_number");

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email");

-- CreateIndex
CREATE INDEX "employees_department_id_idx" ON "employees"("department_id");

-- CreateIndex
CREATE INDEX "employees_position_id_idx" ON "employees"("position_id");

-- CreateIndex
CREATE INDEX "employees_manager_id_idx" ON "employees"("manager_id");

-- CreateIndex
CREATE INDEX "employees_employment_status_idx" ON "employees"("employment_status");

-- CreateIndex
CREATE INDEX "employees_status_idx" ON "employees"("status");

-- CreateIndex
CREATE INDEX "employees_deleted_at_idx" ON "employees"("deleted_at");

-- CreateIndex
CREATE INDEX "profile_change_requests_employee_id_status_idx" ON "profile_change_requests"("employee_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_name_key" ON "shifts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "shifts_code_key" ON "shifts"("code");

-- CreateIndex
CREATE INDEX "shifts_status_idx" ON "shifts"("status");

-- CreateIndex
CREATE INDEX "employee_shift_assignments_employee_id_effective_from_idx" ON "employee_shift_assignments"("employee_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_devices_device_code_key" ON "attendance_devices"("device_code");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_devices_serial_number_key" ON "attendance_devices"("serial_number");

-- CreateIndex
CREATE INDEX "attendance_devices_status_idx" ON "attendance_devices"("status");

-- CreateIndex
CREATE INDEX "attendance_devices_connection_status_idx" ON "attendance_devices"("connection_status");

-- CreateIndex
CREATE INDEX "attendance_records_employee_id_date_idx" ON "attendance_records"("employee_id", "date");

-- CreateIndex
CREATE INDEX "attendance_records_employee_id_status_idx" ON "attendance_records"("employee_id", "status");

-- CreateIndex
CREATE INDEX "attendance_records_date_idx" ON "attendance_records"("date");

-- CreateIndex
CREATE INDEX "attendance_records_status_idx" ON "attendance_records"("status");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_records_employee_id_date_key" ON "attendance_records"("employee_id", "date");

-- CreateIndex
CREATE INDEX "attendance_incidents_record_id_status_idx" ON "attendance_incidents"("record_id", "status");

-- CreateIndex
CREATE INDEX "attendance_incidents_status_idx" ON "attendance_incidents"("status");

-- CreateIndex
CREATE INDEX "attendance_incidents_type_idx" ON "attendance_incidents"("type");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_name_key" ON "leave_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "leave_types_code_key" ON "leave_types"("code");

-- CreateIndex
CREATE INDEX "leave_types_status_idx" ON "leave_types"("status");

-- CreateIndex
CREATE UNIQUE INDEX "leave_balances_employee_id_leave_type_id_year_key" ON "leave_balances"("employee_id", "leave_type_id", "year");

-- CreateIndex
CREATE INDEX "leave_requests_employee_id_start_date_idx" ON "leave_requests"("employee_id", "start_date");

-- CreateIndex
CREATE INDEX "leave_requests_approver_id_status_idx" ON "leave_requests"("approver_id", "status");

-- CreateIndex
CREATE INDEX "leave_requests_status_idx" ON "leave_requests"("status");

-- CreateIndex
CREATE INDEX "leave_approval_steps_leave_request_id_approver_order_idx" ON "leave_approval_steps"("leave_request_id", "approver_order");

-- CreateIndex
CREATE UNIQUE INDEX "salary_components_code_key" ON "salary_components"("code");

-- CreateIndex
CREATE INDEX "salary_components_status_idx" ON "salary_components"("status");

-- CreateIndex
CREATE INDEX "payroll_disbursements_payroll_period_id_status_idx" ON "payroll_disbursements"("payroll_period_id", "status");

-- CreateIndex
CREATE INDEX "payroll_disbursements_year_month_idx" ON "payroll_disbursements"("year", "month");

-- CreateIndex
CREATE INDEX "payroll_disbursements_status_idx" ON "payroll_disbursements"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_disbursements_employee_id_year_month_key" ON "payroll_disbursements"("employee_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "employee_salary_profiles_employee_id_salary_component_id_ef_key" ON "employee_salary_profiles"("employee_id", "salary_component_id", "effective_from");

-- CreateIndex
CREATE INDEX "payslip_items_payroll_disbursement_id_idx" ON "payslip_items"("payroll_disbursement_id");

-- CreateIndex
CREATE INDEX "employee_bank_accounts_employee_id_idx" ON "employee_bank_accounts"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_periods_name_key" ON "payroll_periods"("name");

-- CreateIndex
CREATE INDEX "payroll_periods_status_idx" ON "payroll_periods"("status");

-- CreateIndex
CREATE INDEX "payroll_periods_start_date_end_date_idx" ON "payroll_periods"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_name_key" ON "document_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "document_categories_code_key" ON "document_categories"("code");

-- CreateIndex
CREATE INDEX "document_categories_status_idx" ON "document_categories"("status");

-- CreateIndex
CREATE UNIQUE INDEX "employee_documents_stored_filename_key" ON "employee_documents"("stored_filename");

-- CreateIndex
CREATE UNIQUE INDEX "employee_documents_storage_path_key" ON "employee_documents"("storage_path");

-- CreateIndex
CREATE INDEX "employee_documents_employee_id_idx" ON "employee_documents"("employee_id");

-- CreateIndex
CREATE INDEX "employee_documents_category_id_idx" ON "employee_documents"("category_id");

-- CreateIndex
CREATE INDEX "employee_documents_status_idx" ON "employee_documents"("status");

-- CreateIndex
CREATE INDEX "performance_reviews_employee_id_cycle_idx" ON "performance_reviews"("employee_id", "cycle");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "holidays_status_idx" ON "holidays"("status");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_date_holiday_type_region_key" ON "holidays"("date", "holiday_type", "region");

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");

-- CreateIndex
CREATE INDEX "system_settings_category_idx" ON "system_settings"("category");

-- CreateIndex
CREATE INDEX "system_settings_status_idx" ON "system_settings"("status");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_employee_id_idx" ON "audit_logs"("employee_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_name_entity_id_idx" ON "audit_logs"("entity_name", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_correlation_id_idx" ON "audit_logs"("correlation_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_entity_name_idx" ON "audit_logs"("created_at", "entity_name");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_profiles_user_id_key" ON "applicant_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_documents_stored_filename_key" ON "applicant_documents"("stored_filename");

-- CreateIndex
CREATE UNIQUE INDEX "applicant_documents_storage_path_key" ON "applicant_documents"("storage_path");

-- CreateIndex
CREATE INDEX "applicant_documents_applicant_id_idx" ON "applicant_documents"("applicant_id");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departments" ADD CONSTRAINT "departments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_manager_id_fkey" FOREIGN KEY ("manager_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_change_requests" ADD CONSTRAINT "profile_change_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shift_assignments" ADD CONSTRAINT "employee_shift_assignments_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_shift_assignments" ADD CONSTRAINT "employee_shift_assignments_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "attendance_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_incidents" ADD CONSTRAINT "attendance_incidents_record_id_fkey" FOREIGN KEY ("record_id") REFERENCES "attendance_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_balances" ADD CONSTRAINT "leave_balances_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_leave_type_id_fkey" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_approval_steps" ADD CONSTRAINT "leave_approval_steps_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_disbursements" ADD CONSTRAINT "payroll_disbursements_payroll_period_id_fkey" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_disbursements" ADD CONSTRAINT "payroll_disbursements_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_profiles" ADD CONSTRAINT "employee_salary_profiles_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_salary_profiles" ADD CONSTRAINT "employee_salary_profiles_salary_component_id_fkey" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_items" ADD CONSTRAINT "payslip_items_payroll_disbursement_id_fkey" FOREIGN KEY ("payroll_disbursement_id") REFERENCES "payroll_disbursements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payslip_items" ADD CONSTRAINT "payslip_items_salary_component_id_fkey" FOREIGN KEY ("salary_component_id") REFERENCES "salary_components"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_bank_accounts" ADD CONSTRAINT "employee_bank_accounts_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "document_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_profiles" ADD CONSTRAINT "applicant_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applicant_documents" ADD CONSTRAINT "applicant_documents_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "applicant_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
