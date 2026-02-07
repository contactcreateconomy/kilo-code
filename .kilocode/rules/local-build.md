# Local Build

When performing local builds across the project, you must strictly adhere to the following procedure:

1. **App-by-App Sequential Building**: Never run builds across the entire monorepo or multiple apps simultaneously. Instead, identify all individual apps and packages in the workspace, then run the build command (e.g., `pnpm --filter @createconomy/<target> build`) on each target one at a time, in dependency order. Packages that other targets depend on (e.g., `packages/config`, `packages/convex`, `packages/ui`) must be built first, followed by apps (`apps/admin`, `apps/forum`, `apps/marketplace`, `apps/seller`). Wait for each build to fully complete before proceeding to the next.

2. **Kill All Node.js Processes Before Each Run**: Before initiating the build for each individual app or package, run `pkill -f node` (or the platform-appropriate equivalent) to terminate all running Node.js processes. This is mandatory to free up memory and prevent out-of-memory crashes or degraded performance. Confirm that the processes have been cleared before proceeding.

3. **Kill All Node.js Processes After Completion**: After the final target's build is complete, kill all remaining Node.js processes once more to leave the system in a clean, low-memory-usage state.

4. **Handle Build Failures Gracefully**: If a build for any individual target fails, log the full error output and report the failure, then continue building the remaining targets. Do not abort the entire build sequence due to a single target's failure. At the end, clearly indicate which targets succeeded and which failed.

5. **Reporting**: After each individual target's build, report the results (success or list of errors) before moving on. At the end, provide a consolidated summary of build results across all apps and packages.

6. **Never Parallelize**: Under no circumstances should you run builds for multiple targets in parallel, spawn background build processes, or use tooling that fans out builds concurrently (e.g., `pnpm build` at the root or `turbo build` without `--concurrency=1`), as this defeats the purpose of memory conservation.

This rule takes absolute priority over convenience or speed optimizations whenever local build operations are involved.
