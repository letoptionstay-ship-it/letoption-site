-- =====================================================================
-- LetOption — Seed the 4 real properties + booking insert function
-- Run this in Supabase SQL Editor after 01_schema.sql
-- =====================================================================

-- Insert the 4 real apartments (safe to re-run: skips if slug already used)
insert into public.properties (id, owner_id, name, area, description, nightly_price, max_guests, bedrooms, bathrooms, image_url, is_active)
values
  (gen_random_uuid(), null, 'Skyline View Apartment', 'Canary Wharf', 'A bright, professionally managed London apartment with skyline views, hotel-quality linen and fully stocked amenities.', 180.00, 2, 1, 1, 'living-room.jpg', true),
  (gen_random_uuid(), null, 'Riverside Luxury Suite', 'South Bank', 'A calm, bright serviced apartment with hotel-style amenities and riverside views.', 165.00, 2, 1, 1, 'bedroom.jpg', true),
  (gen_random_uuid(), null, 'Designer City Loft', 'Shoreditch', 'A stylish loft with a dedicated workspace, designed for business travellers and creatives.', 150.00, 2, 1, 1, 'kitchen.jpg', true),
  (gen_random_uuid(), null, 'Elegant Garden Apartment', 'Kensington', 'A spacious two-bedroom apartment with garden access, ideal for families and longer stays.', 220.00, 4, 2, 2, 'bathroom.jpg', true)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Helper function: create_booking
-- Called from the booking form on each apartment page. Looks up the
-- property by name (simpler than wiring property_id through every
-- static HTML page), validates dates, and inserts the booking tied
-- to the currently logged-in user.
-- ---------------------------------------------------------------------
create or replace function public.create_booking(
  p_property_name text,
  p_check_in date,
  p_check_out date,
  p_guests int
)
returns public.bookings as $$
declare
  v_property_id uuid;
  v_nightly_price numeric(10,2);
  v_nights int;
  v_total numeric(10,2);
  v_booking public.bookings;
begin
  if auth.uid() is null then
    raise exception 'You must be signed in to request a booking';
  end if;

  select id, nightly_price into v_property_id, v_nightly_price
    from public.properties
    where name = p_property_name and is_active = true
    limit 1;

  if v_property_id is null then
    raise exception 'Property not found: %', p_property_name;
  end if;

  if p_check_out <= p_check_in then
    raise exception 'Check-out date must be after check-in date';
  end if;

  if p_check_in < current_date then
    raise exception 'Check-in date cannot be in the past';
  end if;

  v_nights := p_check_out - p_check_in;
  v_total := v_nights * v_nightly_price;

  insert into public.bookings (guest_id, property_id, check_in, check_out, guests, total_price, status)
  values (auth.uid(), v_property_id, p_check_in, p_check_out, p_guests, v_total, 'pending')
  returning * into v_booking;

  return v_booking;
end;
$$ language plpgsql security definer;
