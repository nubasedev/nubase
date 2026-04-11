SELECT id, workspace_id, title, description, assignee_id
FROM tickets
WHERE id = :id
