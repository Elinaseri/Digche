# Project conventions

## Versioning the web app (icon-pack-app)

After **every** change to the web app (`icon-pack-app/`), create a git commit
and push it to the remote branch so previous versions are always recoverable.

- Commit after each completed change (new feature, fix, or edit), not just at
  the end of a session.
- Use a clear, descriptive commit message explaining what changed and why.
- Push to the working branch (`claude/icon-pack-web-app-NlduO`) right after
  committing.
- Never amend or force-push over earlier versions — always add a new commit so
  the history stays intact and any prior version can be restored.
