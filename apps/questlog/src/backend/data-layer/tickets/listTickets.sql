SELECT
  t.id,
  t.title,
  t.description,
  t.assignee_id,
  u.display_name AS assignee_name,
  u.email AS assignee_email
FROM tickets t
LEFT JOIN users u ON u.id = t.assignee_id
WHERE t.workspace_id = :workspace_id
  AND (:q::text IS NULL OR t.title ILIKE :q OR t.description ILIKE :q)
  AND (:title::text IS NULL OR t.title ILIKE :title)
  AND (:description::text IS NULL OR t.description ILIKE :description)
  AND (:assignee_ids::int[] IS NULL OR t.assignee_id = ANY(:assignee_ids))
