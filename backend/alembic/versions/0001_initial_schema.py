"""Initial schema.

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-09-05
"""
from alembic import op
import sqlalchemy as sa 
[]
revision = "0001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    category_type = sa.Enum("EXPENSE", "INCOME", name="category_type")
    payment_method = sa.Enum("CASH", "CARD", "BANK_TRANSFER", "MOBILE_PAYMENT", "OTHER", name="payment_method")
    transaction_type = sa.Enum("EXPENSE", "INCOME", name="transaction_type")
    frequency = sa.Enum("DAILY", "WEEKLY", "MONTHLY", "YEARLY", name="frequency")
    bind = op.get_bind()
    category_type.create(bind, checkfirst=True)
    payment_method.create(bind, checkfirst=True)
    transaction_type.create(bind, checkfirst=True)
    frequency.create(bind, checkfirst=True)

    op.create_table("users",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(320), nullable=False), sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table("categories",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(100), nullable=False),
        sa.Column("type", category_type, nullable=False), sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_categories_user_id", "categories", ["user_id"])
    op.create_index("ix_categories_user_name", "categories", ["user_id", "name"])

    op.create_table("expenses",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False), sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("description", sa.Text(), nullable=True), sa.Column("expense_date", sa.Date(), nullable=False),
        sa.Column("payment_method", payment_method, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.CheckConstraint("amount > 0", name="ck_expenses_amount_positive"),
    )
    op.create_index("ix_expenses_user_id", "expenses", ["user_id"])
    op.create_index("ix_expenses_category_id", "expenses", ["category_id"])
    op.create_index("ix_expenses_expense_date", "expenses", ["expense_date"])
    op.create_index("ix_expenses_user_date", "expenses", ["user_id", "expense_date"])

    op.create_table("incomes",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False), sa.Column("source", sa.String(100), nullable=False),
        sa.Column("income_date", sa.Date(), nullable=False), sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.CheckConstraint("amount > 0", name="ck_incomes_amount_positive"),
    )
    op.create_index("ix_incomes_user_id", "incomes", ["user_id"])
    op.create_index("ix_incomes_income_date", "incomes", ["income_date"])
    op.create_index("ix_incomes_user_date", "incomes", ["user_id", "income_date"])

    op.create_table("budgets",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False), sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("month", sa.Integer(), nullable=False), sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.CheckConstraint("amount > 0", name="ck_budgets_amount_positive"),
        sa.CheckConstraint("month BETWEEN 1 AND 12", name="ck_budgets_month"),
        sa.UniqueConstraint("user_id", "category_id", "year", "month", name="uq_budget_user_category_period"),
    )
    op.create_index("ix_budgets_user_id", "budgets", ["user_id"])
    op.create_index("ix_budgets_category_id", "budgets", ["category_id"])
    op.create_index("ix_budgets_user_period", "budgets", ["user_id", "year", "month"])

    op.create_table("recurring_transactions",
        sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False), sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("transaction_type", transaction_type, nullable=False), sa.Column("frequency", frequency, nullable=False),
        sa.Column("next_date", sa.Date(), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="RESTRICT"),
        sa.CheckConstraint("amount > 0", name="ck_recurring_amount_positive"),
    )
    op.create_index("ix_recurring_transactions_user_id", "recurring_transactions", ["user_id"])
    op.create_index("ix_recurring_transactions_category_id", "recurring_transactions", ["category_id"])
    op.create_index("ix_recurring_transactions_next_date", "recurring_transactions", ["next_date"])


def downgrade() -> None:
    op.drop_table("recurring_transactions")
    op.drop_table("budgets")
    op.drop_table("incomes")
    op.drop_table("expenses")
    op.drop_table("categories")
    op.drop_table("users")
    bind = op.get_bind()
    for name in ("frequency", "transaction_type", "payment_method", "category_type"):
        sa.Enum(name=name).drop(bind, checkfirst=True)
