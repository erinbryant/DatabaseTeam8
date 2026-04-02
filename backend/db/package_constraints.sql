
ALTER TABLE package
  ADD CONSTRAINT chk_package_sender_recipient_different
  CHECK (Sender_ID <> Recipient_ID);

ALTER TABLE package
  ADD CONSTRAINT chk_package_dimensions_positive
  CHECK (Dim_X > 0 AND Dim_Y > 0 AND Dim_Z > 0);
