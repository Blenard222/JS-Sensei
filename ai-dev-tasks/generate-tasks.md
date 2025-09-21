Goal: Generate a SMALL, VERIFIABLE task list from the given PRD.

Rules:
- Reference exact file paths from the PRD.
- Break work into atomic tasks that can be completed and diffed in <30 minutes each.
- Include UI tasks that reference the copy strings and Tailwind classes from the PRD's UI spec.
- Include unit test tasks (score, mastery, nextQuestion).
- Include a deployment task at the end.
- Each task should have: Title, Steps, Files to edit/create, Acceptance criteria.

Output:
- A numbered list of tasks (1, 1.1, 1.2…).
