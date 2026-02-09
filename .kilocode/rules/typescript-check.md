# TypeScript Check

When performing TypeScript type checking across the project, you must strictly adhere to the following procedure:

1. **App-by-App Sequential Type Checking**: Never run type checking across the entire monorepo or multiple apps simultaneously. Instead, identify all individual apps and packages in the workspace, then run `tsc --noEmit` (or the project-specific type-check script) on each app one at a time, in sequence. Wait for one app's type check to fully complete before moving on to the next.

2. **Kill All Node.js Processes Before Each Run**: Before initiating the type check for each individual app, run `pkill -f node` (or the platform-appropriate equivalent) to terminate all running Node.js processes. This is mandatory to free up memory and prevent out-of-memory crashes or degraded performance. Confirm that the processes have been cleared before proceeding.

3. **Kill All Node.js Processes After Completion**: After the final app's type check is complete, kill all remaining Node.js processes once more to leave the system in a clean, low-memory-usage state.

4. **Reporting**: After each individual app's type check, report the results (success or list of errors) before moving on. At the end, provide a consolidated summary of type-check results across all apps.

5. **Never Parallelize**: Under no circumstances should you run type checks for multiple apps in parallel, spawn background type-check processes, or use tooling that fans out type checks concurrently, as this defeats the purpose of memory conservation.

This rule takes absolute priority over convenience or speed optimizations whenever TypeScript type checking is involved.
