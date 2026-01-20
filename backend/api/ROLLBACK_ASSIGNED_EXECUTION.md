Rollback instructions: Allow assigned execution override

If this change needs to be reverted:

1. Revert the commit that added the override and the unit test:

   git revert <commit_sha>

   or, to remove locally before pushing:

   git reset --hard HEAD~1

2. Remove the generated patch if present:

   rm -f WIP_assigned_execution.patch

Notes:
- This change is minimal and only allows explicit `UserTestAccess.has_special_access=True`
  to permit execution by `patient` or `personal` users for tests configured as
  therapist-only. Rolling back reestablishes the previous stricter behavior.
