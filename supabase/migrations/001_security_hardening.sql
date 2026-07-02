-- Bezpečnostní vylepšení – spusťte v Supabase SQL Editoru (pro existující databázi)
-- Nové instalace: změny jsou již v schema.sql

-- 1. Částka transakce musí být kladná
ALTER TABLE transactions
  DROP CONSTRAINT IF EXISTS transactions_amount_positive;

ALTER TABLE transactions
  ADD CONSTRAINT transactions_amount_positive CHECK (amount > 0);

-- 2. Plánované výdaje kategorie nesmí být záporné
ALTER TABLE categories
  DROP CONSTRAINT IF EXISTS categories_planned_amount_non_negative;

ALTER TABLE categories
  ADD CONSTRAINT categories_planned_amount_non_negative CHECK (planned_amount >= 0);

-- 3. RLS: transakce smí odkazovat jen na vlastní účet a kategorii
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND (
      account_id IS NULL
      OR EXISTS (
        SELECT 1 FROM accounts
        WHERE accounts.id = transactions.account_id
          AND accounts.user_id = auth.uid()
      )
    )
    AND (
      category_id IS NULL
      OR EXISTS (
        SELECT 1 FROM categories
        WHERE categories.id = transactions.category_id
          AND categories.user_id = auth.uid()
      )
    )
  );
