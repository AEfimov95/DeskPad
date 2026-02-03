ALTER TABLE pads 
ADD COLUMN icon_size TEXT DEFAULT 'small';

UPDATE pads
SET icon_size = 'small'
WHERE icon_size IS NULL;