<script lang="ts">
  import type { PageData } from './$types';

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const DEFAULT_ICON =
    'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA3MiA3MiIgZmlsbD0ibm9uZSI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjcyIiB5Mj0iNzIiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iIzBlNzk1YiIvPgogICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMxMmEzN2EiLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSI3MiIgaGVpZ2h0PSI3MiIgcng9IjE2IiBmaWxsPSJ1cmwoI2cpIi8+CiAgPHBhdGggZD0iTTIwIDQ4bDgtMjQgOCAxNiA4LTEyIDggMjAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Rya2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+';

  const app = data.app;
  const iconSrc = app.icon ?? DEFAULT_ICON;
</script>

<div class="min-h-screen bg-base-200 text-base-content">
  <div class="max-w-3xl mx-auto bg-white min-h-screen px-6 py-8 space-y-6">
    <div class="px-5 pb-4 flex items-start gap-4">
      <img
        src={iconSrc}
        alt="App icon"
        class="w-14 h-14 rounded-2xl shadow-sm bg-primary/5 p-0.5"
      />
      <div class="grid justify-items-start text-left gap-0">
        <h2 class="text-lg font-bold tracking-tight leading-none">{app.name}</h2>

        <p class="text-sm text-primary font-bold leading-tight ml-4">{app.developer}</p>
      </div>
    </div>
    <div class="card bg-base-100 shadow-sm border border-base-300 rounded-lg">
      <div class="card-body space-y-3">
        <h2 class="card-title text-lg font-bold">About this app</h2>
        <p class="text-sm opacity-70 leading-relaxed">{app.shortDesc}</p>

        <details class="group">
          <summary
            class="list-none text-sm font-bold text-primary cursor-pointer hover:underline flex items-center gap-2 select-none"
          >
            Show more
          </summary>
          <div class="pt-3 text-sm opacity-70 whitespace-pre-line leading-relaxed">
            {app.longDesc}
          </div>
        </details>
      </div>
    </div>

    <a class="btn btn-primary w-full" href="..">Back to Manage my data</a>
  </div>
</div>
