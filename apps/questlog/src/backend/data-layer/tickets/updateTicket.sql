UPDATE tickets
SET
  title = CASE WHEN :update_title THEN :title ELSE title END,
  description = CASE WHEN :update_description THEN :description ELSE description END,
  assignee_id = CASE WHEN :update_assignee_id THEN :assignee_id ELSE assignee_id END
WHERE id = :id AND workspace_id = :workspace_id
RETURNING id, title, description, assignee_id
