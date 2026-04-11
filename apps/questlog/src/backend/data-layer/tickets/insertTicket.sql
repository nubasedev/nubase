INSERT INTO tickets (workspace_id, title, description, assignee_id)
VALUES (:workspace_id, :title, :description, :assignee_id)
RETURNING id, title, description, assignee_id
