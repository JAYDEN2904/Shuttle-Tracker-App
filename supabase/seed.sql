INSERT INTO public.routes (name, code, color, operating_start, operating_end)
VALUES
  ('Main Gate Loop', 'A', '#2563EB', '07:00', '20:00'),
  ('Medical School Express', 'B', '#12B95A', '07:00', '20:00');

INSERT INTO public.stops (route_id, name, lat, lng, sequence_order)
SELECT r.id, v.name, v.lat, v.lng, v.sequence_order
FROM public.routes r
CROSS JOIN (
  VALUES
    ('Main Gate', 5.6502, -0.1862, 1),
    ('Balme Library', 5.6514, -0.1882, 2),
    ('Mensah Sarbah Hall', 5.6528, -0.1848, 3),
    ('Volta Hall', 5.6501, -0.1820, 4),
    ('Science Block', 5.6482, -0.1835, 5),
    ('Medical School', 5.6470, -0.1860, 6),
    ('Main Gate', 5.6502, -0.1862, 7)
) AS v(name, lat, lng, sequence_order)
WHERE r.code = 'A';

INSERT INTO public.stops (route_id, name, lat, lng, sequence_order)
SELECT r.id, v.name, v.lat, v.lng, v.sequence_order
FROM public.routes r
CROSS JOIN (
  VALUES
    ('Main Gate', 5.6502, -0.1862, 1),
    ('Mensah Sarbah Hall', 5.6528, -0.1848, 2),
    ('Science Block', 5.6482, -0.1835, 3),
    ('Medical School', 5.6470, -0.1860, 4),
    ('Main Gate', 5.6502, -0.1862, 5)
) AS v(name, lat, lng, sequence_order)
WHERE r.code = 'B';
