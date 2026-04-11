SELECT id, title, description, assignee_id
FROM tickets
WHERE id = :id AND workspace_id = :workspace_id
