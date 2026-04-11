DELETE FROM tickets
WHERE id = :id AND workspace_id = :workspace_id
RETURNING id
