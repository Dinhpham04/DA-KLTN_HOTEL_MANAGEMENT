-- CreateTable
CREATE TABLE "requests" (
    "request_id" SERIAL NOT NULL,
    "reserve_id" INTEGER NOT NULL,
    "usage_status_id" INTEGER,
    "to_client_id" INTEGER,
    "deadline" DATE,
    "announcement" VARCHAR(1024),
    "amount" BIGINT NOT NULL DEFAULT 0,
    "print_flag" BOOLEAN NOT NULL DEFAULT false,
    "print_date" TIMESTAMP(3),
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "requests_pkey" PRIMARY KEY ("request_id")
);

-- CreateTable
CREATE TABLE "request_details" (
    "request_detail_id" SERIAL NOT NULL,
    "request_id" INTEGER,
    "reserve_id" INTEGER NOT NULL,
    "old_reserve_id" INTEGER,
    "trunkroom_reserve_id" INTEGER,
    "parking_reserve_id" INTEGER,
    "title_prefix" VARCHAR(255),
    "occupier_name" VARCHAR(256),
    "title_suffix" VARCHAR(255),
    "stay_type_id" INTEGER,
    "advance_flag" BOOLEAN NOT NULL DEFAULT false,
    "request_type_id" SMALLINT NOT NULL,
    "tax_free_flag" BOOLEAN NOT NULL DEFAULT false,
    "refund_invoiced_flag" BOOLEAN NOT NULL DEFAULT false,
    "refund_child_reserves_flag" BOOLEAN NOT NULL DEFAULT false,
    "request_from" TIMESTAMP(3),
    "request_to" TIMESTAMP(3),
    "request_day_count" INTEGER,
    "unit_price" DECIMAL(15,3),
    "total_price" DECIMAL(15,3),
    "total_price_change" DECIMAL(15,3),
    "people_count" SMALLINT NOT NULL DEFAULT 1,
    "count" INTEGER NOT NULL DEFAULT 1,
    "count_unit" SMALLINT NOT NULL,
    "charge_staff_id" INTEGER,
    "total_price_csv" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "request_details_pkey" PRIMARY KEY ("request_detail_id")
);

-- CreateTable
CREATE TABLE "sales" (
    "sale_id" SERIAL NOT NULL,
    "request_id" INTEGER,
    "reserve_id" INTEGER NOT NULL,
    "to_client_id" INTEGER,
    "deadline" DATE,
    "announcement" VARCHAR(1024),
    "advance_flag" BOOLEAN NOT NULL DEFAULT false,
    "amount" BIGINT NOT NULL DEFAULT 0,
    "print_flag" BOOLEAN NOT NULL DEFAULT false,
    "no_tax" BOOLEAN NOT NULL DEFAULT false,
    "print_date" TIMESTAMP(3),
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("sale_id")
);

-- CreateTable
CREATE TABLE "sale_details" (
    "sale_detail_id" SERIAL NOT NULL,
    "sale_id" INTEGER,
    "reserve_id" INTEGER NOT NULL,
    "request_detail_id" INTEGER,
    "title_prefix" VARCHAR(255),
    "occupier_name" VARCHAR(256),
    "title_suffix" VARCHAR(255),
    "stay_type_id" INTEGER,
    "advance_flag" BOOLEAN NOT NULL DEFAULT false,
    "request_type_id" SMALLINT NOT NULL,
    "payment_type_id" SMALLINT,
    "payment_method_id" INTEGER,
    "tax_free_flag" BOOLEAN NOT NULL DEFAULT false,
    "is_confirmed" BOOLEAN NOT NULL DEFAULT true,
    "confirmed_date" TIMESTAMP(3),
    "request_from" TIMESTAMP(3),
    "request_to" TIMESTAMP(3),
    "request_day_count" INTEGER,
    "unit_price" DECIMAL(15,3),
    "total_price" DECIMAL(15,3),
    "count" INTEGER NOT NULL DEFAULT 1,
    "count_unit" SMALLINT NOT NULL,
    "charge_staff_id" INTEGER,
    "summary" VARCHAR(256),
    "sale_date" DATE,
    "receipt_payment_date" DATE,
    "has_exported_TKC" BOOLEAN NOT NULL DEFAULT false,
    "export_order_num" INTEGER,
    "total_price_csv" INTEGER,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "sale_details_pkey" PRIMARY KEY ("sale_detail_id")
);

-- CreateTable
CREATE TABLE "billing_categories" (
    "id" SERIAL NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "summary_format" TEXT,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "billing_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_details" (
    "id" SERIAL NOT NULL,
    "category" INTEGER,
    "request_type" SMALLINT,
    "display_order" INTEGER,
    "display_name" VARCHAR(255),
    "csv_output_name" VARCHAR(255),
    "english_name" VARCHAR(255),
    "memo" VARCHAR(255),
    "parking_no_input_type" SMALLINT,
    "parking_no_title" VARCHAR(255),
    "payment_detail_type" SMALLINT,
    "uncollected_target_flag" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "billing_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_items" (
    "id" SERIAL NOT NULL,
    "billing_detail_id" INTEGER,
    "category" VARCHAR(255),
    "item_name" VARCHAR(255),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "billing_type" SMALLINT,
    "journal_method" SMALLINT,
    "store" VARCHAR(255),
    "room" VARCHAR(255),
    "tax_category_set" SMALLINT,
    "type" VARCHAR(255),
    "tax_rate" DECIMAL(5,2),
    "tax_input" SMALLINT NOT NULL DEFAULT 0,
    "credit" BOOLEAN DEFAULT false,
    "debit" BOOLEAN DEFAULT false,
    "account_code" VARCHAR(255),
    "sub_account_code" VARCHAR(255),
    "sub_account_method" SMALLINT,
    "counterpart_account_method" SMALLINT,
    "description_setting" VARCHAR(255),
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "billing_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "id" SERIAL NOT NULL,
    "payment_type_id" SMALLINT,
    "category" TEXT,
    "display_name" VARCHAR(255),
    "account_code" INTEGER,
    "sub_account_code" VARCHAR(255),
    "memo" TEXT,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "export_histories" (
    "export_history_id" SERIAL NOT NULL,
    "reserve_id" INTEGER,
    "group_request_id" INTEGER,
    "client_tag_id" INTEGER,
    "sale_detail_ids" JSONB,
    "total_price" INTEGER,
    "to_client_id" INTEGER,
    "to_client_name" VARCHAR(256),
    "json_value" JSONB,
    "pdf_path" VARCHAR(1024) NOT NULL,
    "pdf_type" SMALLINT NOT NULL,
    "data_status" SMALLINT NOT NULL DEFAULT 1,
    "created_staff_id" INTEGER NOT NULL,
    "updated_staff_id" INTEGER,
    "deleted_staff_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "export_histories_pkey" PRIMARY KEY ("export_history_id")
);

-- CreateIndex
CREATE INDEX "requests_reserve_id_idx" ON "requests"("reserve_id");

-- CreateIndex
CREATE INDEX "requests_usage_status_id_idx" ON "requests"("usage_status_id");

-- CreateIndex
CREATE INDEX "requests_to_client_id_idx" ON "requests"("to_client_id");

-- CreateIndex
CREATE INDEX "requests_deadline_idx" ON "requests"("deadline");

-- CreateIndex
CREATE INDEX "requests_created_staff_id_idx" ON "requests"("created_staff_id");

-- CreateIndex
CREATE INDEX "requests_updated_staff_id_idx" ON "requests"("updated_staff_id");

-- CreateIndex
CREATE INDEX "requests_deleted_staff_id_idx" ON "requests"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "requests_data_status_idx" ON "requests"("data_status");

-- CreateIndex
CREATE INDEX "request_details_request_id_idx" ON "request_details"("request_id");

-- CreateIndex
CREATE INDEX "request_details_reserve_id_idx" ON "request_details"("reserve_id");

-- CreateIndex
CREATE INDEX "request_details_old_reserve_id_idx" ON "request_details"("old_reserve_id");

-- CreateIndex
CREATE INDEX "request_details_stay_type_id_idx" ON "request_details"("stay_type_id");

-- CreateIndex
CREATE INDEX "request_details_parking_reserve_id_idx" ON "request_details"("parking_reserve_id");

-- CreateIndex
CREATE INDEX "request_details_request_type_id_idx" ON "request_details"("request_type_id");

-- CreateIndex
CREATE INDEX "request_details_request_from_idx" ON "request_details"("request_from");

-- CreateIndex
CREATE INDEX "request_details_request_to_idx" ON "request_details"("request_to");

-- CreateIndex
CREATE INDEX "request_details_charge_staff_id_idx" ON "request_details"("charge_staff_id");

-- CreateIndex
CREATE INDEX "request_details_created_staff_id_idx" ON "request_details"("created_staff_id");

-- CreateIndex
CREATE INDEX "request_details_updated_staff_id_idx" ON "request_details"("updated_staff_id");

-- CreateIndex
CREATE INDEX "request_details_deleted_staff_id_idx" ON "request_details"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "request_details_data_status_idx" ON "request_details"("data_status");

-- CreateIndex
CREATE INDEX "sales_request_id_idx" ON "sales"("request_id");

-- CreateIndex
CREATE INDEX "sales_reserve_id_idx" ON "sales"("reserve_id");

-- CreateIndex
CREATE INDEX "sales_to_client_id_idx" ON "sales"("to_client_id");

-- CreateIndex
CREATE INDEX "sales_deadline_idx" ON "sales"("deadline");

-- CreateIndex
CREATE INDEX "sales_created_staff_id_idx" ON "sales"("created_staff_id");

-- CreateIndex
CREATE INDEX "sales_updated_staff_id_idx" ON "sales"("updated_staff_id");

-- CreateIndex
CREATE INDEX "sales_deleted_staff_id_idx" ON "sales"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "sales_data_status_idx" ON "sales"("data_status");

-- CreateIndex
CREATE INDEX "sale_details_sale_id_idx" ON "sale_details"("sale_id");

-- CreateIndex
CREATE INDEX "sale_details_reserve_id_idx" ON "sale_details"("reserve_id");

-- CreateIndex
CREATE INDEX "sale_details_request_detail_id_idx" ON "sale_details"("request_detail_id");

-- CreateIndex
CREATE INDEX "sale_details_stay_type_id_idx" ON "sale_details"("stay_type_id");

-- CreateIndex
CREATE INDEX "sale_details_payment_type_id_idx" ON "sale_details"("payment_type_id");

-- CreateIndex
CREATE INDEX "sale_details_payment_method_id_idx" ON "sale_details"("payment_method_id");

-- CreateIndex
CREATE INDEX "sale_details_sale_date_idx" ON "sale_details"("sale_date");

-- CreateIndex
CREATE INDEX "sale_details_request_from_idx" ON "sale_details"("request_from");

-- CreateIndex
CREATE INDEX "sale_details_request_to_idx" ON "sale_details"("request_to");

-- CreateIndex
CREATE INDEX "sale_details_is_confirmed_idx" ON "sale_details"("is_confirmed");

-- CreateIndex
CREATE INDEX "sale_details_has_exported_tkc_idx" ON "sale_details"("has_exported_TKC");

-- CreateIndex
CREATE INDEX "sale_details_charge_staff_id_idx" ON "sale_details"("charge_staff_id");

-- CreateIndex
CREATE INDEX "sale_details_created_staff_id_idx" ON "sale_details"("created_staff_id");

-- CreateIndex
CREATE INDEX "sale_details_updated_staff_id_idx" ON "sale_details"("updated_staff_id");

-- CreateIndex
CREATE INDEX "sale_details_deleted_staff_id_idx" ON "sale_details"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "sale_details_data_status_idx" ON "sale_details"("data_status");

-- CreateIndex
CREATE INDEX "billing_categories_category_idx" ON "billing_categories"("category");

-- CreateIndex
CREATE INDEX "billing_categories_created_staff_id_idx" ON "billing_categories"("created_staff_id");

-- CreateIndex
CREATE INDEX "billing_categories_updated_staff_id_idx" ON "billing_categories"("updated_staff_id");

-- CreateIndex
CREATE INDEX "billing_categories_deleted_staff_id_idx" ON "billing_categories"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "billing_categories_data_status_idx" ON "billing_categories"("data_status");

-- CreateIndex
CREATE INDEX "billing_details_category_idx" ON "billing_details"("category");

-- CreateIndex
CREATE INDEX "billing_details_request_type_idx" ON "billing_details"("request_type");

-- CreateIndex
CREATE INDEX "billing_details_payment_detail_type_idx" ON "billing_details"("payment_detail_type");

-- CreateIndex
CREATE INDEX "billing_details_uncollected_target_flag_idx" ON "billing_details"("uncollected_target_flag");

-- CreateIndex
CREATE INDEX "billing_details_is_active_idx" ON "billing_details"("is_active");

-- CreateIndex
CREATE INDEX "billing_details_created_staff_id_idx" ON "billing_details"("created_staff_id");

-- CreateIndex
CREATE INDEX "billing_details_updated_staff_id_idx" ON "billing_details"("updated_staff_id");

-- CreateIndex
CREATE INDEX "billing_details_deleted_staff_id_idx" ON "billing_details"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "billing_details_data_status_idx" ON "billing_details"("data_status");

-- CreateIndex
CREATE INDEX "billing_items_billing_detail_id_idx" ON "billing_items"("billing_detail_id");

-- CreateIndex
CREATE INDEX "billing_items_billing_type_idx" ON "billing_items"("billing_type");

-- CreateIndex
CREATE INDEX "billing_items_journal_method_idx" ON "billing_items"("journal_method");

-- CreateIndex
CREATE INDEX "billing_items_created_staff_id_idx" ON "billing_items"("created_staff_id");

-- CreateIndex
CREATE INDEX "billing_items_updated_staff_id_idx" ON "billing_items"("updated_staff_id");

-- CreateIndex
CREATE INDEX "billing_items_deleted_staff_id_idx" ON "billing_items"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "billing_items_data_status_idx" ON "billing_items"("data_status");

-- CreateIndex
CREATE INDEX "payment_methods_payment_type_id_idx" ON "payment_methods"("payment_type_id");

-- CreateIndex
CREATE INDEX "payment_methods_created_staff_id_idx" ON "payment_methods"("created_staff_id");

-- CreateIndex
CREATE INDEX "payment_methods_updated_staff_id_idx" ON "payment_methods"("updated_staff_id");

-- CreateIndex
CREATE INDEX "payment_methods_deleted_staff_id_idx" ON "payment_methods"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "payment_methods_data_status_idx" ON "payment_methods"("data_status");

-- CreateIndex
CREATE INDEX "export_histories_reserve_id_idx" ON "export_histories"("reserve_id");

-- CreateIndex
CREATE INDEX "export_histories_to_client_id_idx" ON "export_histories"("to_client_id");

-- CreateIndex
CREATE INDEX "export_histories_group_request_id_idx" ON "export_histories"("group_request_id");

-- CreateIndex
CREATE INDEX "export_histories_pdf_type_idx" ON "export_histories"("pdf_type");

-- CreateIndex
CREATE INDEX "export_histories_created_staff_id_idx" ON "export_histories"("created_staff_id");

-- CreateIndex
CREATE INDEX "export_histories_updated_staff_id_idx" ON "export_histories"("updated_staff_id");

-- CreateIndex
CREATE INDEX "export_histories_deleted_staff_id_idx" ON "export_histories"("deleted_staff_id");

-- CreateIndex
CREATE INDEX "export_histories_data_status_idx" ON "export_histories"("data_status");

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_usage_status_id_fkey" FOREIGN KEY ("usage_status_id") REFERENCES "usage_statuses"("usage_status_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_to_client_id_fkey" FOREIGN KEY ("to_client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requests" ADD CONSTRAINT "requests_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("request_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_stay_type_id_fkey" FOREIGN KEY ("stay_type_id") REFERENCES "stay_types"("stay_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_parking_reserve_id_fkey" FOREIGN KEY ("parking_reserve_id") REFERENCES "parking_reserves"("parking_reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_charge_staff_id_fkey" FOREIGN KEY ("charge_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_details" ADD CONSTRAINT "request_details_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "requests"("request_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_to_client_id_fkey" FOREIGN KEY ("to_client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("sale_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_request_detail_id_fkey" FOREIGN KEY ("request_detail_id") REFERENCES "request_details"("request_detail_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_stay_type_id_fkey" FOREIGN KEY ("stay_type_id") REFERENCES "stay_types"("stay_type_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_charge_staff_id_fkey" FOREIGN KEY ("charge_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_details" ADD CONSTRAINT "sale_details_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_categories" ADD CONSTRAINT "billing_categories_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_categories" ADD CONSTRAINT "billing_categories_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_categories" ADD CONSTRAINT "billing_categories_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_details" ADD CONSTRAINT "billing_details_category_fkey" FOREIGN KEY ("category") REFERENCES "billing_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_details" ADD CONSTRAINT "billing_details_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_details" ADD CONSTRAINT "billing_details_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_details" ADD CONSTRAINT "billing_details_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_billing_detail_id_fkey" FOREIGN KEY ("billing_detail_id") REFERENCES "billing_details"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "billing_items" ADD CONSTRAINT "billing_items_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_histories" ADD CONSTRAINT "export_histories_reserve_id_fkey" FOREIGN KEY ("reserve_id") REFERENCES "reserves"("reserve_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_histories" ADD CONSTRAINT "export_histories_to_client_id_fkey" FOREIGN KEY ("to_client_id") REFERENCES "clients"("client_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_histories" ADD CONSTRAINT "export_histories_created_staff_id_fkey" FOREIGN KEY ("created_staff_id") REFERENCES "staffs"("staff_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_histories" ADD CONSTRAINT "export_histories_updated_staff_id_fkey" FOREIGN KEY ("updated_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "export_histories" ADD CONSTRAINT "export_histories_deleted_staff_id_fkey" FOREIGN KEY ("deleted_staff_id") REFERENCES "staffs"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
