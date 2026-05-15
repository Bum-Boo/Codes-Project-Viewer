import {
  countCompletedWork,
  getStatusTone,
  loadDashboardData,
} from "@/lib/dashboard/read-dashboard";
import type {
  AgentRunReport,
  Blocker,
  DashboardStatus,
  DashboardWarning,
  Task,
} from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

function StatusBadge({ status }: { status: DashboardStatus }) {
  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-md border px-2.5 text-xs font-semibold ${getStatusTone(
        status,
      )}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function Panel({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-[color:var(--border)] bg-[color:var(--panel)] p-5 shadow-sm">
      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
      {message}
    </div>
  );
}

function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <EmptyState message="No remaining work is recorded." />;
  }

  return (
    <ul className="space-y-3">
      {tasks.map((task, index) => (
        <li
          key={task.id || `${task.title}-${index}`}
          className="rounded-md border border-slate-200 bg-slate-50 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-950">{task.title}</p>
              {task.description ? (
                <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
              ) : null}
            </div>
            <StatusBadge status={task.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function BlockerList({ blockers }: { blockers: Blocker[] }) {
  if (blockers.length === 0) {
    return <EmptyState message="No active blockers are recorded." />;
  }

  return (
    <ul className="space-y-3">
      {blockers.map((blocker, index) => (
        <li
          key={blocker.id || `${blocker.title}-${index}`}
          className="rounded-md border border-rose-100 bg-rose-50 p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-medium text-rose-950">{blocker.title}</p>
              {blocker.details ? (
                <p className="mt-1 text-sm leading-6 text-rose-800">{blocker.details}</p>
              ) : null}
            </div>
            <StatusBadge status={blocker.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecentRuns({ runs }: { runs: AgentRunReport[] }) {
  const recentRuns = runs.slice(0, 8);

  if (recentRuns.length === 0) {
    return <EmptyState message="No run reports were found." />;
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200">
      <div className="grid grid-cols-[minmax(0,1.4fr)_120px_minmax(0,1fr)] bg-slate-100 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span>Run</span>
        <span>Status</span>
        <span>Verification</span>
      </div>
      <ul className="divide-y divide-slate-200">
        {recentRuns.map((run) => {
          const passedCount = run.verification.filter((check) => check.status === "passed").length;
          const notRunCount = run.verification.filter((check) => check.status === "not_run").length;

          return (
            <li
              key={run.source_file}
              className="grid grid-cols-[minmax(0,1.4fr)_120px_minmax(0,1fr)] items-center gap-3 px-3 py-3 text-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-950">{run.task_slug}</p>
                <p className="truncate text-xs text-slate-500">{run.source_file}</p>
              </div>
              <StatusBadge status={run.status} />
              <p className="text-slate-600">
                {run.verification.length === 0
                  ? "No checks recorded"
                  : `${passedCount} passed, ${notRunCount} not run`}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function MarkdownPreview({ markdown }: { markdown: string }) {
  if (!markdown.trim()) {
    return <EmptyState message="The latest report file is empty or missing." />;
  }

  const lines = markdown.split(/\r?\n/).slice(0, 80);

  return (
    <div className="markdown-preview max-h-[520px] overflow-auto rounded-md border border-slate-200 bg-white p-4">
      {lines.map((line, index) => {
        const key = `${index}-${line}`;
        if (!line.trim()) {
          return <div key={key} className="h-3" />;
        }

        if (line.startsWith("### ")) {
          return <h3 key={key}>{line.replace(/^###\s+/, "")}</h3>;
        }

        if (line.startsWith("## ")) {
          return <h2 key={key}>{line.replace(/^##\s+/, "")}</h2>;
        }

        if (line.startsWith("# ")) {
          return <h1 key={key}>{line.replace(/^#\s+/, "")}</h1>;
        }

        if (line.startsWith("- ")) {
          return (
            <li key={key} className="ml-5 list-disc">
              {line.replace(/^-\s+/, "")}
            </li>
          );
        }

        return (
          <p key={key} className="text-sm">
            {line}
          </p>
        );
      })}
    </div>
  );
}

function WarningList({ warnings }: { warnings: DashboardWarning[] }) {
  if (warnings.length === 0) {
    return (
      <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        All required dashboard files were parsed successfully.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {warnings.map((warning, index) => (
        <li
          key={`${warning.file}-${index}`}
          className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <span className="font-semibold">{warning.file}</span>: {warning.message}
        </li>
      ))}
    </ul>
  );
}

export default async function Home() {
  const data = await loadDashboardData();
  const status = data.currentStatus?.overall_status ?? "needs_review";
  const projectName =
    data.project?.project?.name || data.currentStatus?.project || "Codes Project Viewer";
  const currentFocus = data.currentStatus?.current_focus || "No current focus is recorded.";
  const completedCount = countCompletedWork(data.currentStatus, data.runs);
  const remainingWork = data.currentStatus?.remaining_work ?? [];
  const blockers = data.currentStatus?.blockers ?? [];
  const goalId = data.goals?.goal?.id || data.goals?.goals?.[0]?.id || "main";

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-6 sm:px-8 lg:px-10">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-[color:var(--accent)]">
            Local dashboard
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            {projectName}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Reads this repository&apos;s `.agent-dashboard` files directly and normalizes
            report status values against {data.schema.statusSource}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={status} />
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600">
            Goal {goalId}
          </span>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel title="Project Status">
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={status} />
            <span className="text-sm text-slate-500">
              Updated {data.currentStatus?.last_updated || "unknown"}
            </span>
          </div>
        </Panel>
        <Panel title="Completed Work">
          <p className="text-3xl font-bold text-slate-950">{completedCount}</p>
          <p className="mt-1 text-sm text-slate-600">Verified or recorded completed items.</p>
        </Panel>
        <Panel title="Remaining Work">
          <p className="text-3xl font-bold text-slate-950">{remainingWork.length}</p>
          <p className="mt-1 text-sm text-slate-600">Open items from current status.</p>
        </Panel>
        <Panel title="Blockers">
          <p className="text-3xl font-bold text-slate-950">{blockers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Active or historical blockers.</p>
        </Panel>
      </section>

      <Panel title="Current Focus">
        <p className="max-w-4xl text-base leading-7 text-slate-700">{currentFocus}</p>
      </Panel>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Remaining Work">
          <TaskList tasks={remainingWork} />
        </Panel>
        <Panel title="Blockers">
          <BlockerList blockers={blockers} />
        </Panel>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Panel title="Recent Runs">
          <RecentRuns runs={data.runs} />
        </Panel>
        <Panel title="Parser Warnings">
          <WarningList warnings={data.warnings} />
        </Panel>
      </section>

      <Panel title="Latest Report">
        <MarkdownPreview markdown={data.latestReportMarkdown} />
      </Panel>
    </main>
  );
}
