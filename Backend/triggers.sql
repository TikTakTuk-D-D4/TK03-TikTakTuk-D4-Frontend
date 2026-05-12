-- =============================================================
-- TRIGGER 1 (WAJIB): Validasi Username pada INSERT user_account
-- =============================================================
-- Function yang dipanggil oleh trigger sebelum INSERT ke user_account.
-- Memvalidasi:
--   1. Username tidak boleh duplikat (case-insensitive).
--   2. Username hanya boleh mengandung huruf, angka, dan underscore (_).

CREATE OR REPLACE FUNCTION fn_validate_username()
RETURNS TRIGGER AS $$
BEGIN
  -- 1. Cek duplikasi username (case-insensitive)
  IF EXISTS (
    SELECT 1 FROM user_account
    WHERE LOWER(username) = LOWER(NEW.username)
  ) THEN
    RAISE EXCEPTION 'ERROR: Username "%" sudah digunakan. Pilih username lain.', NEW.username;
  END IF;

  -- 2. Cek karakter khusus (hanya huruf, angka, dan underscore yang diperbolehkan)
  IF NEW.username !~ '^[a-zA-Z0-9_]+$' THEN
    RAISE EXCEPTION 'ERROR: Username hanya boleh mengandung huruf, angka, dan underscore (_). Karakter khusus tidak diperbolehkan.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel user_account (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_validate_username ON user_account;
CREATE TRIGGER trg_validate_username
  BEFORE INSERT ON user_account
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_username();


-- =============================================================
-- TRIGGER 2: Validasi Duplikasi Artist pada Event (EVENT_ARTIST)
-- =============================================================
-- Function yang dipanggil oleh trigger sebelum INSERT ke event_artist.
-- Memvalidasi:
--   1. Artist dengan artist_id yang diberikan harus ada.
--   2. Event dengan event_id yang diberikan harus ada.
--   3. Kombinasi (artist_id, event_id) belum terdaftar di event_artist.

CREATE OR REPLACE FUNCTION fn_validate_event_artist()
RETURNS TRIGGER AS $$
DECLARE
  v_artist_name TEXT;
  v_event_title TEXT;
BEGIN
  -- 1. Cek apakah artist ada
  SELECT name INTO v_artist_name
  FROM artist
  WHERE artist_id = NEW.artist_id;

  IF v_artist_name IS NULL THEN
    RAISE EXCEPTION 'ERROR: Artist dengan ID % tidak ditemukan.', NEW.artist_id;
  END IF;

  -- 2. Cek apakah event ada
  SELECT event_title INTO v_event_title
  FROM event
  WHERE event_id = NEW.event_id;

  IF v_event_title IS NULL THEN
    RAISE EXCEPTION 'ERROR: Event dengan ID % tidak ditemukan.', NEW.event_id;
  END IF;

  -- 3. Cek duplikasi (artist_id + event_id)
  IF EXISTS (
    SELECT 1 FROM event_artist
    WHERE event_id = NEW.event_id
      AND artist_id = NEW.artist_id
  ) THEN
    RAISE EXCEPTION 'ERROR: Artist "%" sudah terdaftar pada event "%".', v_artist_name, v_event_title;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel event_artist (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_validate_event_artist ON event_artist;
CREATE TRIGGER trg_validate_event_artist
  BEFORE INSERT ON event_artist
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_event_artist();


-- =============================================================
-- TRIGGER 2: Sisa Kuota Ticket Category Berdasarkan event_id
-- =============================================================
-- Part A — Function yang dapat dipanggil langsung untuk menampilkan
--           sisa kuota semua Ticket Category milik suatu event.
--           Melempar error apabila event tidak ditemukan.

CREATE OR REPLACE FUNCTION get_ticket_quota(p_event_id UUID)
RETURNS TABLE (
  category_id   UUID,
  category_name TEXT,
  price         NUMERIC,
  quota         INTEGER,
  tiket_terjual BIGINT,
  sisa_kuota    BIGINT
) AS $$
DECLARE
  v_event_title TEXT;
BEGIN
  -- Cek apakah event ada
  SELECT event_title INTO v_event_title
  FROM event
  WHERE event_id = p_event_id;

  IF v_event_title IS NULL THEN
    RAISE EXCEPTION 'ERROR: Event dengan ID % tidak ditemukan.', p_event_id;
  END IF;

  -- Kembalikan semua kategori tiket milik event beserta sisa kuota
  RETURN QUERY
  SELECT
    tc.category_id,
    tc.category_name,
    tc.price,
    tc.quota,
    COUNT(t.ticket_id)              AS tiket_terjual,
    tc.quota - COUNT(t.ticket_id)   AS sisa_kuota
  FROM ticket_category tc
  LEFT JOIN ticket t ON tc.category_id = t.tcategory_id
  WHERE tc.tevent_id = p_event_id
  GROUP BY tc.category_id, tc.category_name, tc.price, tc.quota;
END;
$$ LANGUAGE plpgsql;

-- Part B — Trigger function yang menjaga konsistensi kuota:
--           mencegah penerbitan tiket baru apabila kuota kategori
--           sudah habis (sisa_kuota = 0).

CREATE OR REPLACE FUNCTION fn_check_ticket_quota()
RETURNS TRIGGER AS $$
DECLARE
  v_quota         INTEGER;
  v_tiket_terjual BIGINT;
  v_sisa_kuota    BIGINT;
  v_category_name TEXT;
  v_event_title   TEXT;
BEGIN
  -- Ambil kuota dan nama kategori beserta nama event
  SELECT tc.quota, tc.category_name, e.event_title
  INTO   v_quota, v_category_name, v_event_title
  FROM   ticket_category tc
  JOIN   event e ON e.event_id = tc.tevent_id
  WHERE  tc.category_id = NEW.tcategory_id;

  IF v_quota IS NULL THEN
    RAISE EXCEPTION 'ERROR: Kategori tiket dengan ID % tidak ditemukan.', NEW.tcategory_id;
  END IF;

  -- Hitung tiket yang sudah diterbitkan untuk kategori ini
  SELECT COUNT(*) INTO v_tiket_terjual
  FROM   ticket
  WHERE  tcategory_id = NEW.tcategory_id;

  v_sisa_kuota := v_quota - v_tiket_terjual;

  -- Tolak insert jika kuota sudah habis
  IF v_sisa_kuota <= 0 THEN
    RAISE EXCEPTION
      'ERROR: Kuota kategori "%" pada event "%" sudah habis (sisa kuota: 0).',
      v_category_name, v_event_title;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Pasang trigger pada tabel ticket (BEFORE INSERT)
DROP TRIGGER IF EXISTS trg_check_ticket_quota ON ticket;
CREATE TRIGGER trg_check_ticket_quota
  BEFORE INSERT ON ticket
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_ticket_quota();
